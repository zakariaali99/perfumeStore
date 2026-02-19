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
    slug = models.SlugField(unique=True, allow_unicode=True, blank=True)
    logo = models.ImageField(upload_to='brands/', blank=True, verbose_name="الشعار")
    description = models.TextField(blank=True, verbose_name="الوصف")
    is_active = models.BooleanField(default=True, verbose_name="نشط")

    class Meta:
        verbose_name = "الماركة"
        verbose_name_plural = "الماركات"
        ordering = ['name_ar']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name_ar, allow_unicode=True)
        super().save(*args, **kwargs)

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
    GENDER_CHOICES = [('men', 'رجالي'), ('women', 'نسائي'), ('unisex', 'للجنسين')]
    CONCENTRATION = [
        ('EDT', 'Eau de Toilette'),
        ('EDP', 'Eau de Parfum'),
        ('P', 'Parfum')
    ]
    
    name_ar = models.CharField(max_length=200, verbose_name="الاسم بالعربية")
    slug = models.SlugField(unique=True, allow_unicode=True)
    description = models.TextField(blank=True, default='', verbose_name="الوصف")
    story = models.TextField(blank=True, default='', help_text="القصة العطرية", verbose_name="القصة العطرية")
    
    categories = models.ManyToManyField(Category, verbose_name="الفئات")
    brand = models.ForeignKey(Brand, on_delete=models.CASCADE, verbose_name="الماركة")
    fragrance_families = models.ManyToManyField(FragranceFamily, blank=True, verbose_name="العائلات العطرية")
    
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, verbose_name="الجنس")
    occasion = models.TextField(blank=True, verbose_name="مناسب لـ", help_text="ex: ليلي, حفلات, كلاسيكي")
    vibe = models.TextField(blank=True, verbose_name="مزاج العطر", help_text="ex: قوي, دافئ, رجولي")
    
    main_image = models.ImageField(upload_to='products/', verbose_name="الصورة الرئيسية")
    
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
    size_ml = models.PositiveIntegerField(verbose_name="الحجم (مل)", null=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="السعر الأصلي")
    sale_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name="سعر العرض")
    cost_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="للتقارير الداخلية", verbose_name="سعر التكلفة")
    
    stock_quantity = models.PositiveIntegerField(default=0, verbose_name="الكمية في المخزن")
    low_stock_threshold = models.PositiveIntegerField(default=5, verbose_name="حد المخزون المنخفض")
    
    sku = models.CharField(max_length=50, unique=True, verbose_name="رمز SKU")
    barcode = models.CharField(max_length=100, blank=True, verbose_name="الباركود")
    image = models.ImageField(upload_to='variants/', blank=True, verbose_name="صورة خاصة للعبوة")
    
    is_active = models.BooleanField(default=True, verbose_name="نشط")

    class Meta:
        verbose_name = "عبوة المنتج"
        verbose_name_plural = "عبوات المنتجات"

    def save(self, *args, **kwargs):
        # Ensure sale_price is None if 0
        if self.sale_price == 0:
            self.sale_price = None
        super().save(*args, **kwargs)

    def __str__(self):
        if self.name:
            return f"{self.product.name_ar} - {self.name}"
        size_str = f"{self.size_ml}ml" if self.size_ml else "Standard"
        return f"{self.product.name_ar} - {size_str}"

    @property
    def current_price(self):
        return self.sale_price if self.sale_price else self.price

    @property
    def discount_percentage(self):
        if self.sale_price and self.price > 0:
            discount = ((self.price - self.sale_price) / self.price) * 100
            return int(discount)
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

class ProductImage(models.Model):
    product = models.ForeignKey(Product, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='products/gallery/', verbose_name="الصورة")
    alt_text = models.CharField(max_length=200, blank=True, verbose_name="نص بديل")
    order = models.PositiveIntegerField(default=0, verbose_name="الترتيب")

    class Meta:
        verbose_name = "صورة إضافية"
        verbose_name_plural = "صور إضافية"
        ordering = ['order']
