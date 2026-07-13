from django.db import models
from django.contrib.auth.models import User
from products.models import Brand, FragranceFamily

class CustomerTag(models.Model):
    name = models.CharField(max_length=50, verbose_name="اسم التاج")
    color = models.CharField(max_length=7, default='#C5A572', verbose_name="اللون")

    class Meta:
        verbose_name = "تاجات العملاء"
        verbose_name_plural = "تاجات العملاء"

    def __str__(self):
        return self.name

class CustomerProfile(models.Model):
    SEGMENT_CHOICES = [
        ('new', 'جديد'),
        ('regular', 'متكرر'),
        ('vip', 'VIP'),
        ('inactive', 'خامل'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="المستخدم")
    
    # المعلومات الأساسية
    name = models.CharField(max_length=100, verbose_name="اسم العميل")
    phone = models.CharField(max_length=20, verbose_name="رقم الهاتف")
    email = models.EmailField(blank=True, verbose_name="البريد الإلكتروني")
    whatsapp = models.CharField(max_length=20, blank=True, verbose_name="رقم الواتساب")
    
    # تاريخ الميلاد بالتفصيل
    birth_day = models.PositiveSmallIntegerField(null=True, blank=True, verbose_name="يوم الميلاد")
    birth_month = models.PositiveSmallIntegerField(null=True, blank=True, verbose_name="شهر الميلاد")
    birth_year = models.PositiveSmallIntegerField(null=True, blank=True, verbose_name="سنة الميلاد")
    
    # العنوان
    city = models.CharField(max_length=100, blank=True, verbose_name="المدينة")
    area = models.CharField(max_length=100, blank=True, verbose_name="المنطقة")
    address = models.TextField(blank=True, verbose_name="العنوان بالتفصيل")
    location_details = models.TextField(blank=True, verbose_name="تفاصيل المكان أو أقرب علامة")
    
    # الإحصائيات 
    total_orders = models.PositiveIntegerField(default=0, verbose_name="إجمالي الطلبات")
    total_spent = models.DecimalField(max_digits=12, decimal_places=2, default=0, verbose_name="إجمالي الإنفاق")
    avg_order_value = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name="متوسط قيمة الطلب")
    last_order_date = models.DateTimeField(null=True, blank=True, verbose_name="تاريخ آخر طلب")
    
    # التصنيف
    segment = models.CharField(max_length=10, choices=SEGMENT_CHOICES, default='new', verbose_name="التصنيف")
    tags = models.ManyToManyField(CustomerTag, blank=True, verbose_name="التاجات")
    
    # التفضيلات 
    preferred_gender = models.CharField(max_length=1, blank=True, choices=[('M', 'رجالي'), ('F', 'نسائي'), ('U', 'للجنسين')], verbose_name="النوع المفضل")
    favorite_brands = models.ManyToManyField(Brand, blank=True, verbose_name="الماركات المفضلة")
    favorite_families = models.ManyToManyField(FragranceFamily, blank=True, verbose_name="العائلات الوعطرية المفضلة")
    
    created_at = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "ملف العميل"
        verbose_name_plural = "ملفات العملاء"
        unique_together = ('name', 'phone')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.phone}"

class CustomerInteraction(models.Model):
    TYPE_CHOICES = [
        ('call', 'مكالمة'),
        ('whatsapp', 'واتساب'),
        ('email', 'بريد إلكتروني'),
        ('note', 'ملاحظة'),
        ('complaint', 'شكوى'),
        ('followup', 'متابعة'),
    ]
    customer = models.ForeignKey(CustomerProfile, on_delete=models.CASCADE, related_name='interactions', verbose_name="العميل")
    interaction_type = models.CharField(max_length=15, choices=TYPE_CHOICES, verbose_name="نوع التواصل")
    subject = models.CharField(max_length=200, verbose_name="الموضوع")
    content = models.TextField(verbose_name="المحتوى")
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name="بواسطة")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "تواصل مع عميل"
        verbose_name_plural = "سجل التواصل مع العملاء"
