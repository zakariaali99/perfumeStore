from django.db import models
from django.utils.text import slugify

class Category(models.Model):
    name_ar = models.CharField(max_length=100, verbose_name="الاسم بالعربية")
    slug = models.SlugField(unique=True, allow_unicode=True)
    image = models.ImageField(upload_to='categories/', verbose_name="الصورة")
    description = models.TextField(blank=True, verbose_name="الوصف")
    order = models.PositiveIntegerField(default=0, verbose_name="الترتيب")
    is_active = models.BooleanField(default=True, verbose_name="نشط")

    class Meta:
        verbose_name = "الفئة"
        verbose_name_plural = "الفئات"
        ordering = ['order']

    def __str__(self):
        return self.name_ar


class Brand(models.Model):
    name_ar = models.CharField(max_length=100, verbose_name="الاسم بالعربية")
    slug = models.SlugField(unique=True, allow_unicode=True, blank=True, verbose_name="المعرف")
    logo = models.ImageField(upload_to='brands/', blank=True, verbose_name="الشعار")
    description = models.TextField(blank=True, verbose_name="الوصف")
    is_active = models.BooleanField(default=True, verbose_name="نشط")

    class Meta:
        verbose_name = "الماركة"
        verbose_name_plural = "الماركات"
        ordering = ['name_ar']

    def __str__(self):
        return self.name_ar


class FragranceFamily(models.Model):
    name_ar = models.CharField(max_length=100, verbose_name="الاسم بالعربية")
    icon = models.CharField(max_length=50, verbose_name="الأيقونة")
    color = models.CharField(max_length=7, verbose_name="اللون")

    class Meta:
        verbose_name = "العائلة العطرية"
        verbose_name_plural = "العائلات العطرية"

    def __str__(self):
        return self.name_ar


class Product(models.Model):
    GENDER_CHOICES = [
        ('men', 'رجالي'),
        ('women', 'نسائي'),
        ('unisex', 'للجنسين')
    ]

    STOCK_TYPE_CHOICES = [
        ('unit', 'بالقطع'),
        ('bulk_ml', 'بالسائل - مل')
    ]

    name_ar = models.CharField(max_length=200, verbose_name="الاسم بالعربية")
    description = models.TextField(blank=True, default="", verbose_name="الوصف")
    story = models.TextField(blank=True, default="", help_text="القصة العطرية", verbose_name="القصة العطرية")

    @property
    def product_number(self):
        return f"PRD-{self.id:04d}" if self.id else ""

    categories = models.ManyToManyField(Category, blank=True, verbose_name="الفئات")
    brand = models.ForeignKey(Brand, null=True, blank=True, on_delete=models.SET_NULL, verbose_name="الماركة")
    fragrance_families = models.ManyToManyField(FragranceFamily, blank=True, verbose_name="العائلات العطرية")

    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, default='unisex', verbose_name="الجنس")
    stock_type = models.CharField(max_length=10, choices=STOCK_TYPE_CHOICES, default='unit', verbose_name="نوع إدارة المخزون")
    bulk_ml_stock = models.PositiveIntegerField(default=0, verbose_name="مخزون السائل الإجمالي (مل)")

    occasion = models.TextField(blank=True, help_text="ex: ليلي, حفلات, كلاسيكي", verbose_name="مناسب لـ")
    vibe = models.TextField(blank=True, help_text="ex: قوي, دافئ, رجولي", verbose_name="مزاج العطر")

    main_image = models.ImageField(upload_to='products/', null=True, blank=True, verbose_name="الصورة الرئيسية")

    is_featured = models.BooleanField(default=False, verbose_name="مميز")
    is_bestseller = models.BooleanField(default=False, verbose_name="الأكثر مبيعاً")
    is_new = models.BooleanField(default=False, verbose_name="جديد")
    is_active = models.BooleanField(default=True, verbose_name="نشط")

    view_count = models.PositiveIntegerField(default=0, verbose_name="عدد المشاهدات")
    sales_count = models.PositiveIntegerField(default=0, verbose_name="عدد المبيعات")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "المنتج"
        verbose_name_plural = "المنتجات"
        ordering = ['-created_at']

    def __str__(self):
        return self.name_ar


class ProductVariant(models.Model):
    product = models.ForeignKey(Product, related_name='variants', on_delete=models.CASCADE)
    name = models.CharField(max_length=100, blank=True, verbose_name="اسم العبوة")
    size_ml = models.PositiveIntegerField(null=True, blank=True, verbose_name="الحجم (مل)")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="السعر الأصلي")
    sale_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name="سعر العرض")
    cost_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="للتقارير الداخلية", verbose_name="سعر التكلفة")

    stock_quantity = models.PositiveIntegerField(default=0, verbose_name="الكمية في المخزن")
    low_stock_threshold = models.PositiveIntegerField(default=5, verbose_name="حد المخزون المنخفض")

    sku = models.CharField(max_length=50, unique=True, blank=True, verbose_name="رمز SKU")
    barcode = models.CharField(max_length=100, blank=True, verbose_name="الباركود")
    image = models.ImageField(upload_to='variants/', blank=True, verbose_name="صورة خاصة للعبوة")

    is_active = models.BooleanField(default=True, verbose_name="نشط")
    is_calculated_from_ml = models.BooleanField(default=True, verbose_name="حساب تلقائي من مخزون السائل")

    @property
    def available_stock(self):
        if self.is_calculated_from_ml and self.product.bulk_ml_stock and self.size_ml and self.size_ml > 0:
            return self.product.bulk_ml_stock // self.size_ml
        return self.stock_quantity

    class Meta:
        verbose_name = "عبوة المنتج"
        verbose_name_plural = "عبوات المنتجات"

    def save(self, *args, **kwargs):
        if not self.sku:
            import uuid
            self.sku = f"SKU-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.product.name_ar} - {self.name or f'{self.size_ml}ml'}"

    @property
    def current_price(self):
        return self.sale_price if self.sale_price else self.price

    @property
    def discount_percentage(self):
        if self.sale_price and self.price and self.price > 0:
            return round((self.price - self.sale_price) / self.price * 100, 0)
        return 0


class ProductNote(models.Model):
    NOTE_TYPES = [('top', 'افتتاحية'), ('heart', 'قلب'), ('base', 'قاعدية')]
    product = models.ForeignKey(Product, related_name='notes', on_delete=models.CASCADE)
    note_type = models.CharField(max_length=10, choices=NOTE_TYPES, verbose_name="نوع النوتة")
    name_ar = models.CharField(max_length=100, verbose_name="اسم المكون بالعربية")
    icon = models.CharField(max_length=50, blank=True, verbose_name="الأيقونة")

    class Meta:
        verbose_name = "نوتة العطر"
        verbose_name_plural = "نوتات العطور"

    def __str__(self):
        return f"{self.name_ar} ({self.note_type})"


class ProductImage(models.Model):
    product = models.ForeignKey(Product, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='products/gallery/', verbose_name="الصورة")
    alt_text = models.CharField(max_length=200, blank=True, verbose_name="نص بديل")
    order = models.PositiveIntegerField(default=0, verbose_name="الترتيب")

    class Meta:
        verbose_name = "صورة إضافية"
        verbose_name_plural = "صور إضافية"
        ordering = ['order']

    def __str__(self):
        return f"{self.product.name_ar} - {self.order}"
