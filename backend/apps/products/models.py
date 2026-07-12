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
    logo = models.ImageField(upload_to='brands/', verbose_name="الشعار")
    description = models.TextField(blank=True, verbose_name="الوصف")
    is_active = models.BooleanField(default=True, verbose_name="نشط")

    class Meta:
        verbose_name = "الماركة"
        verbose_name_plural = "الماركات"

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
    GENDER_CHOICES = [('M', 'رجالي'), ('F', 'نسائي'), ('U', 'للجنسين')]
    CONCENTRATION = [
        ('EDT', 'Eau de Toilette'),
        ('EDP', 'Eau de Parfum'),
        ('P', 'Parfum')
    ]
    
    name_ar = models.CharField(max_length=200, verbose_name="الاسم بالعربية")
    slug = models.SlugField(unique=True, allow_unicode=True)
    description = models.TextField(verbose_name="الوصف")
    story = models.TextField(help_text="القصة العطرية", verbose_name="القصة العطرية")
    
    category = models.ForeignKey(Category, on_delete=models.CASCADE, verbose_name="الفئة")
    brand = models.ForeignKey(Brand, on_delete=models.CASCADE, verbose_name="الماركة")
    fragrance_families = models.ManyToManyField(FragranceFamily, verbose_name="العائلات العطرية")
    
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, verbose_name="الجنس")
    concentration = models.CharField(max_length=3, choices=CONCENTRATION, verbose_name="التركيز")
    
    main_image = models.ImageField(upload_to='products/', verbose_name="الصورة الرئيسية")
    longevity_rating = models.PositiveIntegerField(default=5, verbose_name="تقييم الثبات") # 1-10
    sillage_rating = models.PositiveIntegerField(default=5, verbose_name="تقييم الفوحان") # 1-10
    
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

    def __str__(self):
        return self.name_ar

class ProductVariant(models.Model):
    product = models.ForeignKey(Product, related_name='variants', on_delete=models.CASCADE)
    size_ml = models.PositiveIntegerField(verbose_name="الحجم (مل)")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="السعر الأصلي")
    sale_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name="سعر العرض")
    cost_price = models.DecimalField(max_digits=10, decimal_places=2, help_text="للتقارير الداخلية", verbose_name="سعر التكلفة")
    
    stock_quantity = models.PositiveIntegerField(default=0, verbose_name="الكمية في المخزن")
    low_stock_threshold = models.PositiveIntegerField(default=5, verbose_name="حد المخزون المنخفض")
    
    sku = models.CharField(max_length=50, unique=True, verbose_name="رمز SKU")
    barcode = models.CharField(max_length=100, blank=True, verbose_name="الباركود")
    image = models.ImageField(upload_to='variants/', blank=True, verbose_name="صورة خاصة للعبوة")
    
    is_active = models.BooleanField(default=True, verbose_name="نشط")

    class Meta:
        verbose_name = "عبوة المنتج"
        verbose_name_plural = "عبوات المنتجات"

    def __str__(self):
        return f"{self.product.name_ar} - {self.size_ml}ml"

    @property
    def current_price(self):
        return self.sale_price if self.sale_price else self.price

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
