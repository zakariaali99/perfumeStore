from django.db import models
from django.core.exceptions import ValidationError
from products.models import Product


class HeroSlide(models.Model):
    title = models.CharField(max_length=100, verbose_name="العنوان")
    subtitle = models.TextField(max_length=200, verbose_name="العنوان الفرعي")
    description_ar = models.CharField(max_length=500, blank=True, null=True, verbose_name="الوصف بالعربية")
    image = models.ImageField(upload_to='cms/slides/', verbose_name="صورة العرض")
    image_mobile = models.ImageField(upload_to='cms/slides/mobile/', blank=True, verbose_name="صورة الجوال (اختياري)")

    button_text = models.CharField(max_length=50, verbose_name="نص الزر")
    button_link = models.CharField(max_length=200, verbose_name="رابط الزر")

    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="ارتباط بمنتج")

    order = models.PositiveIntegerField(default=0, verbose_name="الترتيب")
    is_active = models.BooleanField(default=True, verbose_name="نشط")

    start_date = models.DateTimeField(null=True, blank=True, verbose_name="بداية العرض")
    end_date = models.DateTimeField(null=True, blank=True, verbose_name="نهاية العرض")

    class Meta:
        verbose_name = "سلايدر العرض"
        verbose_name_plural = "سلايدرات العرض"
        ordering = ['order']

    def __str__(self):
        return self.title


class Banner(models.Model):
    POSITION_CHOICES = [
        ('home_top', 'الرئيسية - أعلى'),
        ('home_middle', 'الرئيسية - وسط'),
        ('products_top', 'المنتجات - أعلى'),
        ('sidebar', 'الشريط الجانبي'),
    ]
    title = models.CharField(max_length=100, verbose_name="العنوان")
    image = models.ImageField(upload_to='cms/banners/', verbose_name="الصورة")
    link = models.CharField(max_length=200, blank=True, verbose_name="الرابط")
    position = models.CharField(max_length=20, choices=POSITION_CHOICES, verbose_name="المكان")
    is_active = models.BooleanField(default=True, verbose_name="نشط")

    class Meta:
        verbose_name = "بانر"
        verbose_name_plural = "البانرات"
        ordering = ['id']

    def __str__(self):
        return self.title


class StoreSettings(models.Model):
    store_name = models.CharField(max_length=100, default="Almustafa's Perfume", verbose_name="اسم المتجر")
    contact_phone = models.CharField(max_length=20, default="0917359191", blank=True, verbose_name="هاتف التواصل")
    whatsapp = models.CharField(max_length=20, default="0917359191", blank=True, verbose_name="رقم الواتساب")
    email = models.EmailField(blank=True, default="info@mostafastore.ly", verbose_name="البريد الإلكتروني")
    address = models.TextField(blank=True, default="مصراتة، ليبيا", verbose_name="العنوان")

    facebook_link = models.URLField(blank=True, verbose_name="رابط فيسبوك")
    instagram_link = models.URLField(blank=True, verbose_name="رابط انستغرام")
    tiktok_link = models.URLField(blank=True, verbose_name="رابط تيك توك")

    top_banner_is_active = models.BooleanField(default=True, verbose_name="تفعيل البانر العلوي")
    top_banner_text = models.CharField(max_length=255, blank=True, verbose_name="نص البانر العلوي")
    shipping_cost = models.DecimalField(max_digits=10, decimal_places=2, default=25.0, verbose_name="تكلفة الشحن")

    class Meta:
        verbose_name = "إعدادات المتجر"
        verbose_name_plural = "إعدادات المتجر"

    def __str__(self):
        return "إعدادات المتجر العامة"

    def save(self, *args, **kwargs):
        if not self.pk and StoreSettings.objects.exists():
            raise ValidationError("لا يمكن إنشاء أكثر من إعداد واحد للمتجر")
        return super().save(*args, **kwargs)


class HomePageSection(models.Model):
    key = models.CharField(max_length=50, unique=True, verbose_name="المعرف")
    title_ar = models.CharField(max_length=200, verbose_name="العنوان بالعربية")
    content = models.JSONField(blank=True, null=True, verbose_name="المحتوى")
    is_active = models.BooleanField(default=True, verbose_name="نشط")
    order = models.PositiveIntegerField(default=0, verbose_name="الترتيب")

    class Meta:
        verbose_name = "قسم الصفحة الرئيسية"
        verbose_name_plural = "أقسام الصفحة الرئيسية"
        ordering = ['order']

    def __str__(self):
        return self.title_ar
