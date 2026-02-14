from django.db import models
from django.contrib.auth.models import User
from products.models import ProductVariant

class Cart(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True, verbose_name="المستخدم")
    session_key = models.CharField(max_length=40, null=True, blank=True, unique=True, verbose_name="متاح للجلسة")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "سلة التسوق"
        verbose_name_plural = "سلات التسوق"

    def __str__(self):
        if self.user:
            return f"سلة {self.user.username}"
        return f"سلة جلسة {self.session_key}"

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items', verbose_name="السلة")
    variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE, verbose_name="العبوة")
    quantity = models.PositiveIntegerField(default=1, verbose_name="الكمية")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "عنصر في السلة"
        verbose_name_plural = "عناصر السلة"
