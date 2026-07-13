import factory
from datetime import timedelta
from django.utils import timezone
from marketing.models import Coupon


class CouponFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Coupon

    code = factory.Sequence(lambda n: f'COUPON{n:03d}')
    discount_type = 'percentage'
    discount_value = 10.00
    min_order_amount = 0
    max_discount_amount = None
    usage_limit = None
    used_count = 0
    valid_from = factory.LazyFunction(timezone.now)
    valid_to = factory.LazyFunction(lambda: timezone.now() + timedelta(days=30))
    is_active = True

    class Params:
        expired = factory.Trait(valid_to=timezone.now() - timedelta(days=1))
        fixed = factory.Trait(discount_type='fixed', discount_value=20.00)
        exhausted = factory.Trait(usage_limit=5, used_count=5)
