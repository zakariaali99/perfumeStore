from django.db import models
from django.utils import timezone

class Coupon(models.Model):
    TYPE_CHOICES = [
        ('percentage', 'نسبة مئوية'),
        ('fixed', 'مبلغ ثابت'),
    ]
    code = models.CharField(max_length=20, unique=True, verbose_name="كود الخصم")
    discount_type = models.CharField(max_length=15, choices=TYPE_CHOICES, verbose_name="نوع الخصم")
    discount_value = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="قيمة الخصم")
    
    min_order_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name="الحد الأدنى للطلب")
    max_discount_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name="أقصى قيمة للخصم")
    
    usage_limit = models.PositiveIntegerField(null=True, blank=True, verbose_name="حد الاستخدام")
    used_count = models.PositiveIntegerField(default=0, verbose_name="مرات الاستخدام")
    
    valid_from = models.DateTimeField(verbose_name="صالح من")
    valid_to = models.DateTimeField(verbose_name="صالح إلى")
    
    is_active = models.BooleanField(default=True, verbose_name="نشط")

    class Meta:
        verbose_name = "كوبون الخصم"
        verbose_name_plural = "كوبونات الخصم"

    def __str__(self):
        return self.code

    @property
    def is_valid(self):
        now = timezone.now()
        return (
            self.is_active and 
            self.valid_from <= now <= self.valid_to and
            (self.usage_limit is None or self.used_count < self.usage_limit)
        )
