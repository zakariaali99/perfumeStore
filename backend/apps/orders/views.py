import datetime
import random
from django.db import transaction
from django.utils import timezone
from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Order, OrderItem, OrderStatusHistory
from .serializers import OrderSerializer
from cart.models import Cart
from products.models import ProductVariant

from crm.models import CustomerProfile

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.AllowAny()]
        if self.request.method == 'GET' and 'track' in self.request.path:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def generate_order_number(self):
        date_str = datetime.datetime.now().strftime('%Y%m%d')
        random_str = ''.join(random.choices('0123456789', k=4))
        return f"ORD-{date_str}-{random_str}"

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        data = request.data
        items_data = data.get('items', [])
        
        if not items_data:
            return Response({'error': 'No items in order'}, status=status.HTTP_400_BAD_REQUEST)

        # 1. CRM Integration: Create or Update Customer Profile
        # Primary keys for deduplication: name + birth date
        cust_name = data.get('customer_name')
        b_day = data.get('birth_day')
        b_month = data.get('birth_month')
        b_year = data.get('birth_year')
        
        customer_profile, created = CustomerProfile.objects.get_or_create(
            name=cust_name,
            birth_day=b_day,
            birth_month=b_month,
            birth_year=b_year,
            defaults={
                'phone': data.get('customer_phone'),
                'email': data.get('customer_email', ''),
                'city': data.get('city', ''),
                'area': data.get('area', ''),
                'address': data.get('address', ''),
                'location_details': data.get('location_details', ''),
            }
        )
        
        # If profile exists but data is updated
        if not created:
            customer_profile.phone = data.get('customer_phone', customer_profile.phone)
            customer_profile.email = data.get('customer_email', customer_profile.email)
            customer_profile.city = data.get('city', customer_profile.city)
            customer_profile.area = data.get('area', customer_profile.area)
            customer_profile.address = data.get('address', customer_profile.address)
            customer_profile.location_details = data.get('location_details', customer_profile.location_details)
            customer_profile.save()

        # Calculate totals
        subtotal = 0
        order_items = []
        
        for item in items_data:
            try:
                variant = ProductVariant.objects.get(id=item['variant_id'])
                qty = int(item['quantity'])
                if variant.stock_quantity < qty:
                    return Response({'error': f'Stock insufficient for {variant.product.name_ar}'}, status=status.HTTP_400_BAD_REQUEST)
                
                item_total = variant.current_price * qty
                subtotal += item_total
                
                order_items.append({
                    'variant': variant,
                    'quantity': qty,
                    'unit_price': variant.current_price,
                    'total_price': item_total
                })
            except ProductVariant.DoesNotExist:
                return Response({'error': f'Variant {item["variant_id"]} not found'}, status=status.HTTP_404_NOT_FOUND)

        shipping_cost = 25 # Standard shipping for now
        total = float(subtotal) + shipping_cost

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
            shipping_cost=shipping_cost,
            total=total,
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
                cart_obj = Cart.objects.filter(session_key=session_key).first() if session_key else None
            if cart_obj:
                cart_obj.items.all().delete()
        except Exception:
            pass  # Cart clearing is non-critical, don't fail the order

        serializer = self.get_serializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

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
