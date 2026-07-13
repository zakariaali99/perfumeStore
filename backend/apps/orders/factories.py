import factory
from decimal import Decimal
from django.utils import timezone
from orders.models import Order, OrderItem, OrderStatusHistory


class OrderFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Order

    order_number = factory.Sequence(lambda n: f'ORD-{n:08d}')
    customer_name = factory.Sequence(lambda n: f'عميل {n}')
    customer_phone = factory.Sequence(lambda n: f'091{n:07d}')
    customer_email = factory.Sequence(lambda n: f'customer{n}@example.com')
    city = 'طرابلس'
    area = 'وسط المدينة'
    address = 'عنوان تجريبي'
    subtotal = Decimal('100.00')
    discount_amount = Decimal('0.00')
    shipping_cost = Decimal('25.00')
    total = Decimal('125.00')
    status = 'pending'
    created_at = factory.LazyFunction(timezone.now)


class OrderItemFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = OrderItem

    order = factory.SubFactory(OrderFactory)
    variant = factory.SubFactory('products.factories.ProductVariantFactory')
    product_name = factory.LazyAttribute(lambda o: o.variant.product.name_ar)
    variant_size = factory.LazyAttribute(lambda o: o.variant.size_ml)
    quantity = 1
    unit_price = Decimal('100.00')
    total_price = Decimal('100.00')


class OrderStatusHistoryFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = OrderStatusHistory

    order = factory.SubFactory(OrderFactory)
    status = 'pending'
    notes = 'تم إنشاء الطلب'
