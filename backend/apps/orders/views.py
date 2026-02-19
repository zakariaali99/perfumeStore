import datetime
import random
import logging
from django.db import transaction
from django.utils import timezone
from rest_framework import viewsets, status, permissions, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from .models import Order, OrderItem, OrderStatusHistory
from .serializers import OrderSerializer
from cart.models import Cart
from products.models import ProductVariant

from crm.models import CustomerProfile

logger = logging.getLogger(__name__)

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['order_number', 'customer_name', 'customer_phone']
    filterset_fields = ['status']

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.AllowAny()]
        if self.request.method == 'GET' and 'track' in self.request.path:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def generate_order_number(self):
        date_str = datetime.datetime.now().strftime('%Y%m%d')
        random_str = ''.join(random.choices('0123456789', k=6))
        return f"ORD-{date_str}-{random_str}"

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        from decimal import Decimal
        from marketing.models import Coupon
        
        data = request.data
        items_data = data.get('items', [])
        coupon_code = data.get('coupon_code')
        
        if not items_data:
            return Response({'error': 'السلة فارغة، لا يمكن إتمام الطلب'}, status=status.HTTP_400_BAD_REQUEST)

        # 1. CRM Integration: Create or Update Customer Profile
        cust_name = data.get('customer_name')
        if not cust_name:
            return Response({'error': 'اسم العميل مطلوب'}, status=status.HTTP_400_BAD_REQUEST)

        b_day = data.get('birth_day') or None
        b_month = data.get('birth_month') or None
        b_year = data.get('birth_year') or None
        
        try:
            phone = data.get('customer_phone')
            # Try to find exactly matching name and phone
            customer_profile = CustomerProfile.objects.filter(phone=phone, name=cust_name).first()
            
            if not customer_profile:
                # Try to find any profile with this phone
                customer_profile = CustomerProfile.objects.filter(phone=phone).first()
            
            if not customer_profile:
                customer_profile = CustomerProfile.objects.create(
                    phone=phone,
                    name=cust_name,
                    birth_day=b_day,
                    birth_month=b_month,
                    birth_year=b_year,
                    email=data.get('customer_email', ''),
                    city=data.get('city', ''),
                    area=data.get('area', ''),
                    address=data.get('address', ''),
                    location_details=data.get('location_details', ''),
                )
                created = True
            else:
                created = False
                # Update existing profile
                customer_profile.name = cust_name # Update name if changed
                customer_profile.email = data.get('customer_email', customer_profile.email)
                customer_profile.city = data.get('city', customer_profile.city)
                customer_profile.area = data.get('area', customer_profile.area)
                customer_profile.address = data.get('address', customer_profile.address)
                customer_profile.location_details = data.get('location_details', customer_profile.location_details)
                customer_profile.save()

        except Exception as e:
            logger.error(f"CRM Error: {e}")
            return Response({'error': 'حدث خطأ في معالجة بيانات العميل'}, status=status.HTTP_400_BAD_REQUEST)

        # Calculate totals
        subtotal = Decimal('0.00')
        order_items = []
        
        for item in items_data:
            try:
                variant = ProductVariant.objects.get(id=item['variant_id'])
                qty = int(item['quantity'])
                
                # Check Stock
                if variant.stock_quantity < qty:
                    return Response({'error': f'عذراً، الكمية المطلوبة من {variant.product.name_ar} ({variant.size_ml}مل) غير متوفرة حالياً. المتاح: {variant.stock_quantity}'}, status=status.HTTP_400_BAD_REQUEST)
                
                # Variant price - ensure it's Decimal
                price = variant.current_price 
                if not isinstance(price, Decimal):
                    price = Decimal(str(price))
                    
                item_total = price * Decimal(qty)
                subtotal += item_total
                
                order_items.append({
                    'variant': variant,
                    'quantity': qty,
                    'unit_price': price,
                    'total_price': item_total
                })
            except ProductVariant.DoesNotExist:
                return Response({'error': f'المنتج المحدد غير موجود'}, status=status.HTTP_404_NOT_FOUND)
            except Exception as e:
                logger.error(f"Item Error: {e}")
                return Response({'error': 'حدث خطأ في معالجة المنتجات'}, status=status.HTTP_400_BAD_REQUEST)

        # Handle Coupon
        discount_amount = Decimal('0.00')
        applied_coupon = None
        if coupon_code:
            try:
                coupon = Coupon.objects.get(code=coupon_code)
                if coupon.is_valid and subtotal >= coupon.min_order_amount:
                    if coupon.discount_type == 'percentage':
                        discount_amount = (subtotal * Decimal(str(coupon.discount_value))) / Decimal('100.00')
                        if coupon.max_discount_amount:
                            discount_amount = min(discount_amount, coupon.max_discount_amount)
                    else:
                        discount_amount = Decimal(str(coupon.discount_value))
                    
                    applied_coupon = coupon
                    coupon.used_count += 1
                    coupon.save()
            except Coupon.DoesNotExist:
                pass # Or return error if strict

        shipping_cost = Decimal('0.00') # Shipping removed per user request
        total = subtotal + shipping_cost - discount_amount
        if total < 0: total = Decimal('0.00')

        try:
            order = Order.objects.create(
                order_number=self.generate_order_number(),
                customer=customer_profile,
                customer_name=cust_name,
                customer_phone=data.get('customer_phone'),
                customer_email=data.get('customer_email', ''),
                birth_day=b_day,
                birth_month=b_month,
                birth_year=b_year,
                city=data.get('city'),
                area=data.get('area', ''),
                address=data.get('address'),
                location_details=data.get('location_details', ''),
                subtotal=subtotal,
                discount_amount=discount_amount,
                shipping_cost=shipping_cost,
                total=total,
                coupon=applied_coupon,
                notes=data.get('notes', '')
            )

            for item in order_items:
                OrderItem.objects.create(
                    order=order,
                    variant=item['variant'],
                    product_name=item['variant'].product.name_ar,
                    variant_size=item['variant'].size_ml,
                    quantity=item['quantity'],
                    unit_price=item['unit_price'],
                    total_price=item['total_price']
                )
                # Update stock
                item['variant'].stock_quantity -= item['quantity']
                item['variant'].save()

            # Update customer stats
            customer_profile.total_orders += 1
            customer_profile.total_spent += total
            customer_profile.avg_order_value = customer_profile.total_spent / customer_profile.total_orders
            customer_profile.last_order_date = timezone.now()
            customer_profile.save()

            # Initial history
            OrderStatusHistory.objects.create(
                order=order,
                status='pending',
                notes='تم إنشاء الطلب بنجاح'
            )

            # Clear the customer's cart after successful order
            try:
                if request.user.is_authenticated:
                    cart_obj = Cart.objects.filter(user=request.user).first()
                else:
                    session_key = request.session.session_key
                    if session_key:
                        cart_obj = Cart.objects.filter(session_key=session_key).first()
                    else:
                        cart_obj = None
                        
                if cart_obj:
                    cart_obj.items.all().delete()
            except Exception as e:
                logger.warning(f"Cart clear error: {e}")
 
            serializer = self.get_serializer(order)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Order Creation Error: {e}", exc_info=True)
            return Response({'error': 'فشل إنشاء الطلب في النظام. يرجى المحاولة مرة أخرى.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        order = self.get_object()
        new_status = request.data.get('status')
        if not new_status:
            return Response({'error': 'الحالة مطلوبة'}, status=status.HTTP_400_BAD_REQUEST)
        
        order.status = new_status
        order.save()
        
        # Create history
        OrderStatusHistory.objects.create(
            order=order,
            status=new_status,
            notes=request.data.get('notes', f'تم تغيير الحالة إلى {new_status}')
        )
        
        serializer = self.get_serializer(order)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def track(self, request):
        order_number = request.query_params.get('order_number')
        phone = request.query_params.get('phone')
        
        if not order_number:
            return Response({'error': 'رقم الطلب مطلوب'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            # If phone is provided, verify it
            if phone:
                order = Order.objects.get(order_number=order_number, customer_phone=phone)
            else:
                order = Order.objects.get(order_number=order_number)
                
            serializer = self.get_serializer(order)
            return Response(serializer.data)
        except Order.DoesNotExist:
            return Response({'error': 'الطلب غير موجود'}, status=status.HTTP_404_NOT_FOUND)
