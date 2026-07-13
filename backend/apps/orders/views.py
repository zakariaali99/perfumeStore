import datetime
import random
from decimal import Decimal
from django.db import transaction, IntegrityError
from django.db.models import F
from django.utils import timezone
from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Order, OrderItem, OrderStatusHistory
from .serializers import OrderSerializer, OrderCreateSerializer
from cart.models import Cart
from products.models import ProductVariant
from crm.models import CustomerProfile
from cms.models import StoreSettings
from marketing.models import Coupon


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.select_related(
        'customer', 'coupon', 'assigned_to'
    ).prefetch_related(
        'items__variant__product',
        'status_history__changed_by'
    )
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

    def _get_shipping_cost(self):
        settings = StoreSettings.objects.first()
        if settings and settings.shipping_cost is not None:
            return settings.shipping_cost
        return Decimal('25.00')

    def _apply_coupon(self, coupon_code, subtotal):
        if not coupon_code:
            return None, Decimal('0.00')
        try:
            coupon = Coupon.objects.get(code=coupon_code, is_active=True)
        except Coupon.DoesNotExist:
            return None, Decimal('0.00')

        if not coupon.is_valid:
            return None, Decimal('0.00')
        if coupon.min_order_amount and subtotal < coupon.min_order_amount:
            return None, Decimal('0.00')

        if coupon.discount_type == 'percentage':
            discount = (subtotal * coupon.discount_value) / Decimal('100')
            if coupon.max_discount_amount and discount > coupon.max_discount_amount:
                discount = coupon.max_discount_amount
        else:
            discount = coupon.discount_value

        return coupon, discount

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        serializer = OrderCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        # Customer profile
        defaults = {
            'phone': data.get('customer_phone', ''),
            'email': data.get('customer_email', ''),
            'city': data.get('city', ''),
            'area': data.get('area', ''),
            'address': data.get('address', ''),
            'location_details': data.get('location_details', ''),
        }
        customer_profile, created = CustomerProfile.objects.get_or_create(
            name=data['customer_name'],
            phone=data['customer_phone'],
            defaults=defaults
        )
        if not created:
            for key, value in defaults.items():
                if value:
                    setattr(customer_profile, key, value)
            customer_profile.save()

        # Resolve variants with locking
        items_data = data['items']
        variant_ids = [item['variant_id'] for item in items_data]
        variants = {
            v.id: v for v in ProductVariant.objects.select_for_update().filter(id__in=variant_ids)
        }

        order_items = []
        subtotal = Decimal('0.00')

        for item in items_data:
            variant_id = item['variant_id']
            if variant_id not in variants:
                return Response(
                    {'error': f'Variant {variant_id} not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            variant = variants[variant_id]
            qty = item['quantity']

            if variant.stock_quantity < qty:
                return Response(
                    {'error': f'Stock insufficient for {variant.product.name_ar}'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            unit_price = variant.current_price
            item_total = unit_price * qty
            subtotal += item_total

            order_items.append({
                'variant': variant,
                'quantity': qty,
                'unit_price': unit_price,
                'total_price': item_total,
            })

        # Coupon & totals
        coupon, discount_amount = self._apply_coupon(data.get('coupon_code', ''), subtotal)
        shipping_cost = self._get_shipping_cost()
        total = subtotal + shipping_cost - discount_amount
        if total < 0:
            total = Decimal('0.00')

        # Generate unique order number
        order = None
        for _ in range(5):
            try:
                order = Order.objects.create(
                    order_number=self.generate_order_number(),
                    customer=customer_profile,
                    customer_name=data['customer_name'],
                    customer_phone=data['customer_phone'],
                    customer_email=data.get('customer_email', ''),
                    birth_day=data.get('birth_day'),
                    birth_month=data.get('birth_month'),
                    birth_year=data.get('birth_year'),
                    city=data['city'],
                    area=data.get('area', ''),
                    address=data['address'],
                    location_details=data.get('location_details', ''),
                    subtotal=subtotal,
                    discount_amount=discount_amount,
                    shipping_cost=shipping_cost,
                    total=total,
                    coupon=coupon,
                    notes=data.get('notes', '')
                )
                break
            except IntegrityError:
                continue

        if order is None:
            return Response(
                {'error': 'Unable to generate unique order number'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # Create order items and decrement stock atomically
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
            ProductVariant.objects.filter(id=item['variant'].id).update(
                stock_quantity=F('stock_quantity') - item['quantity']
            )

        # Increment coupon usage
        if coupon:
            Coupon.objects.filter(id=coupon.id).update(used_count=F('used_count') + 1)

        # Update customer stats atomically
        CustomerProfile.objects.filter(id=customer_profile.id).update(
            total_orders=F('total_orders') + 1,
            total_spent=F('total_spent') + total,
            last_order_date=timezone.now()
        )
        # avg_order_value computed via DB expression
        CustomerProfile.objects.filter(id=customer_profile.id).update(
            avg_order_value=F('total_spent') / F('total_orders')
        )

        # Initial status history
        OrderStatusHistory.objects.create(
            order=order,
            status='pending',
            notes='تم إنشاء الطلب بنجاح',
            changed_by=request.user if request.user.is_authenticated else None
        )

        # Clear cart best-effort
        try:
            if request.user.is_authenticated:
                cart_obj = Cart.objects.filter(user=request.user).first()
            else:
                session_key = request.session.session_key
                cart_obj = Cart.objects.filter(session_key=session_key).first() if session_key else None
            if cart_obj:
                cart_obj.items.all().delete()
        except Exception:
            pass

        response_serializer = self.get_serializer(order)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        order = self.get_object()
        new_status = request.data.get('status')

        if not new_status or new_status not in dict(Order.STATUS_CHOICES):
            return Response(
                {'error': 'حالة غير صالحة'},
                status=status.HTTP_400_BAD_REQUEST
            )

        old_status = order.status

        with transaction.atomic():
            order.status = new_status
            order.save()

            OrderStatusHistory.objects.create(
                order=order,
                status=new_status,
                notes=request.data.get('notes', f'تم تغيير الحالة إلى {new_status}'),
                changed_by=request.user if request.user.is_authenticated else None
            )

            # Restore stock on cancel/return
            if new_status in ('cancelled', 'returned') and old_status not in ('cancelled', 'returned'):
                for item in order.items.select_related('variant'):
                    ProductVariant.objects.filter(id=item.variant_id).update(
                        stock_quantity=F('stock_quantity') + item.quantity
                    )

        serializer = self.get_serializer(order)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def track(self, request):
        order_number = request.query_params.get('order_number')
        phone = request.query_params.get('phone')

        if not order_number:
            return Response(
                {'error': 'رقم الطلب مطلوب'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if not phone:
            return Response(
                {'error': 'رقم الهاتف مطلوب للتتبع'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            order = Order.objects.get(order_number=order_number, customer_phone=phone)
            serializer = self.get_serializer(order)
            return Response(serializer.data)
        except Order.DoesNotExist:
            return Response(
                {'error': 'الطلب غير موجود'},
                status=status.HTTP_404_NOT_FOUND
            )
