from django.db import models
from products.models import Product

class HeroSlide(models.Model):
    title = models.CharField(max_length=100, verbose_name="العنوان")
    subtitle = models.TextField(max_length=200, blank=True, verbose_name="العنوان الفرعي")
    image = models.ImageField(upload_to='cms/slides/', verbose_name="صورة العرض")
    image_mobile = models.ImageField(upload_to='cms/slides/mobile/', blank=True, verbose_name="صورة الجوال (اختياري)")
    
    button_text = models.CharField(max_length=50, blank=True, verbose_name="نص الزر")
    button_link = models.CharField(max_length=200, blank=True, verbose_name="رابط الزر")
    
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
    link = models.CharField(max_length=200, verbose_name="الرابط")
    position = models.CharField(max_length=20, choices=POSITION_CHOICES, verbose_name="المكان")
    is_active = models.BooleanField(default=True, verbose_name="نشط")

    class Meta:
        verbose_name = "بانر"
        verbose_name_plural = "البانرات"

    def __str__(self):
        return self.title

class StoreSettings(models.Model):
    store_name = models.CharField(max_length=100, default="Almustafa's Perfume", verbose_name="اسم المتجر")
    contact_phone = models.CharField(max_length=20, blank=True, verbose_name="هاتف التواصل")
    whatsapp = models.CharField(max_length=20, blank=True, verbose_name="رقم الواتساب")
    email = models.EmailField(blank=True, verbose_name="البريد الإلكتروني")
    address = models.TextField(blank=True, verbose_name="العنوان")
    
    facebook_link = models.URLField(blank=True, verbose_name="رابط فيسبوك")
    instagram_link = models.URLField(blank=True, verbose_name="رابط انستغرام")
    tiktok_link = models.URLField(blank=True, verbose_name="رابط تيك توك")
    
    class Meta:
        verbose_name = "إعدادات المتجر"
        verbose_name_plural = "إعدادات المتجر"

    def __str__(self):
        return "إعدادات المتجر العامة"

    def save(self, *args, **kwargs):
        # Ensure only one instance exists
        if not self.pk and StoreSettings.objects.exists():
            return
        return super().save(*args, **kwargs)

