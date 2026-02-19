from django.db import models
from django.contrib.auth.models import User
from crm.models import CustomerProfile
from products.models import ProductVariant
from marketing.models import Coupon

class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'في الانتظار'),
        ('confirmed', 'مؤكد'),
        ('processing', 'قيد التجهيز'),
        ('shipped', 'تم الشحن'),
        ('delivered', 'تم التوصيل'),
        ('cancelled', 'ملغي'),
        ('returned', 'مرتجع'),
    ]
    
    order_number = models.CharField(max_length=50, unique=True, verbose_name="رقم الطلب")
    customer = models.ForeignKey(CustomerProfile, on_delete=models.SET_NULL, null=True, related_name='orders', verbose_name="العميل")
    
    # بيانات العميل وقت الطلب (للحفظ وضمان عدم تغيرها في السجلات التاريخية)
    customer_name = models.CharField(max_length=100, verbose_name="اسم العميل")
    customer_phone = models.CharField(max_length=20, verbose_name="رقم الهاتف")
    customer_email = models.EmailField(blank=True, verbose_name="البريد الإلكتروني")
    
    # تاريخ الميلاد وقت الطلب
    birth_day = models.PositiveSmallIntegerField(null=True, blank=True, verbose_name="يوم الميلاد")
    birth_month = models.PositiveSmallIntegerField(null=True, blank=True, verbose_name="شهر الميلاد")
    birth_year = models.PositiveSmallIntegerField(null=True, blank=True, verbose_name="سنة الميلاد")
    
    # العنوان
    city = models.CharField(max_length=100, verbose_name="المدينة")
    area = models.CharField(max_length=100, verbose_name="المنطقة")
    address = models.TextField(verbose_name="العنوان بالتفصيل")
    location_details = models.TextField(blank=True, verbose_name="تفاصيل المكان أو أقرب علامة")
    
    # المبالغ
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="المجموع الفرعي")
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0, verbose_name="قيمة الخصم")
    shipping_cost = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="تكلفة التوصيل")
    total = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="الإجمالي")
    
    # الكوبون
    coupon = models.ForeignKey(Coupon, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="الكوبون")
    
    # الحالة
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name="حالة الطلب")
    notes = models.TextField(blank=True, verbose_name="ملاحظات العميل")
    admin_notes = models.TextField(blank=True, verbose_name="ملاحظات الإدارة")
    
    # الإدارة
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_orders', verbose_name="الموظف المسؤول")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "الطلب"
        verbose_name_plural = "الطلبات"
        ordering = ['-created_at']

    def __str__(self):
        return self.order_number

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items', verbose_name="الطلب")
    variant = models.ForeignKey(ProductVariant, on_delete=models.PROTECT, verbose_name="العبوة")
    
    # بيانات المنتج وقت الشراء
    product_name = models.CharField(max_length=200, verbose_name="اسم المنتج")
    variant_size = models.PositiveIntegerField(verbose_name="الحجم (مل)", null=True, blank=True)
    
    quantity = models.PositiveIntegerField(default=1, verbose_name="الكمية")
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="سعر الوحدة")
    total_price = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="الإجمالي")

    class Meta:
        verbose_name = "عنصر الطلب"
        verbose_name_plural = "عناصر الطلب"

class OrderStatusHistory(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='status_history', verbose_name="الطلب")
    status = models.CharField(max_length=20, choices=Order.STATUS_CHOICES, verbose_name="الحالة")
    notes = models.TextField(blank=True, verbose_name="ملاحظات")
    changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name="تغيير بواسطة")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "تاريخ حالة الطلب"
        verbose_name_plural = "تاريخ حالات الطلب"
