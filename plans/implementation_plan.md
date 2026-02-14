# 🌟 خطة تنفيذ متجر العطور الإلكتروني الفاخر
# Luxury Arabic Perfume E-commerce Store - Complete Implementation Plan

---

## 📋 نظرة عامة على المشروع

### الهدف
بناء متجر إلكتروني فاخر متخصص في العطور العربية مع:
- واجهة عملاء أنيقة (Light/Dark Mode)
- لوحة تحكم شاملة للإدارة
- نظام CRM احترافي لإدارة العملاء
- تحليلات متقدمة (MRR, Sales Analytics)
- نظام توصيات ذكي

### ⚙️ القرارات المعتمدة

| العنصر | القرار |
|--------|--------|
| **بوابة الدفع** | الدفع عند الاستلام (COD) |
| **اللغات** | العربية فقط |
| **حساب التوصيل** | إدخال يدوي من لوحة التحكم |
| **الإشعارات** | بريد إلكتروني (SendGrid مجاني) |

---

## 🛠️ Stack التقني

### Backend
| التقنية | الغرض |
|---------|-------|
| **Django 5.x** | Framework رئيسي |
| **Django REST Framework** | بناء API |
| **PostgreSQL** | قاعدة البيانات |
| **Redis** | Cache + Sessions |
| **SimpleJWT** | المصادقة |
| **Celery** | المهام المجدولة (اختياري) |
| **django-filter** | الفلاتر والبحث |
| **Pillow** | معالجة الصور |

### Frontend
| التقنية | الغرض |
|---------|-------|
| **React 18** | UI Library |
| **Vite** | Build Tool |
| **TailwindCSS** | Styling + RTL |
| **Zustand** | State Management |
| **Axios** | HTTP Client |
| **React Router** | التنقل |
| **Recharts** | الرسوم البيانية (Dashboard) |
| **Framer Motion** | Animations |

---

## 🎨 نظام الهوية البصرية

### Light Mode - راقي وكلاسيكي
```css
:root {
  /* Backgrounds */
  --bg-primary: #FDFBF7;
  --bg-secondary: #F5F0E8;
  --bg-card: #FFFFFF;
  --bg-hover: #FAF6F0;
  
  /* Gold Accents */
  --gold-primary: #C5A572;
  --gold-light: #D4B896;
  --gold-dark: #A08050;
  
  /* Text */
  --text-primary: #2C2416;
  --text-secondary: #6B5D4D;
  --text-muted: #9C8B7A;
  
  /* Status */
  --success: #4A7C59;
  --warning: #D4A574;
  --error: #B85450;
  
  /* Shadows */
  --shadow-sm: 0 2px 8px rgba(44, 36, 22, 0.06);
  --shadow-md: 0 4px 20px rgba(197, 165, 114, 0.12);
  --shadow-lg: 0 8px 40px rgba(44, 36, 22, 0.1);
}
```

### Dark Mode - فخم وعصري
```css
:root.dark {
  /* Backgrounds */
  --bg-primary: #0A0908;
  --bg-secondary: #1A1614;
  --bg-card: #252220;
  --bg-hover: #2E2A27;
  
  /* Gold Accents */
  --gold-primary: #D4AF37;
  --gold-light: #E5C76B;
  --gold-dark: #B8942D;
  
  /* Text */
  --text-primary: #F5F0E8;
  --text-secondary: #C9BFB0;
  --text-muted: #7A7067;
  
  /* Glow Effects */
  --glow-gold: 0 0 30px rgba(212, 175, 55, 0.2);
}
```

### الخطوط
| الاستخدام | الخط الرئيسي | البديل |
|-----------|--------------|--------|
| العناوين | **Tajawal Bold** | Cairo Bold |
| النصوص | **Tajawal Regular** | Cairo Regular |
| الأرقام/الأسعار | **Poppins Medium** | Inter |

---

## 📊 هيكل قاعدة البيانات

### Products App
```python
class Category(models.Model):
    name_ar = CharField(max_length=100)
    slug = SlugField(unique=True)
    image = ImageField()
    description = TextField(blank=True)
    order = PositiveIntegerField(default=0)
    is_active = BooleanField(default=True)

class Brand(models.Model):
    name_ar = CharField(max_length=100)
    logo = ImageField()
    description = TextField(blank=True)
    is_active = BooleanField(default=True)

class FragranceFamily(models.Model):
    # شرقي، خشبي، زهري، فواكه، بحري...
    name_ar = CharField(max_length=100)
    icon = CharField(max_length=50)
    color = CharField(max_length=7)

class Product(models.Model):
    GENDER_CHOICES = [('M', 'رجالي'), ('F', 'نسائي'), ('U', 'للجنسين')]
    CONCENTRATION = [('EDT', 'Eau de Toilette'), ('EDP', 'Eau de Parfum'), ('P', 'Parfum')]
    
    name_ar = CharField(max_length=200)
    slug = SlugField(unique=True)
    description = TextField()
    story = TextField(help_text="القصة العطرية")
    
    category = ForeignKey(Category)
    brand = ForeignKey(Brand)
    fragrance_families = ManyToManyField(FragranceFamily)
    
    gender = CharField(choices=GENDER_CHOICES)
    concentration = CharField(choices=CONCENTRATION)
    
    main_image = ImageField()
    longevity_rating = PositiveIntegerField(1-10)
    sillage_rating = PositiveIntegerField(1-10)
    
    is_featured = BooleanField(default=False)
    is_bestseller = BooleanField(default=False)
    is_new = BooleanField(default=False)
    is_active = BooleanField(default=True)
    
    view_count = PositiveIntegerField(default=0)
    sales_count = PositiveIntegerField(default=0)
    
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)

class ProductVariant(models.Model):
    """العبوات - نقطة محورية في النظام"""
    product = ForeignKey(Product, related_name='variants')
    size_ml = PositiveIntegerField()
    price = DecimalField(max_digits=10, decimal_places=2)
    sale_price = DecimalField(null=True, blank=True)
    cost_price = DecimalField(help_text="للتقارير الداخلية")
    
    stock_quantity = PositiveIntegerField(default=0)
    low_stock_threshold = PositiveIntegerField(default=5)
    
    sku = CharField(unique=True)
    barcode = CharField(blank=True)
    image = ImageField(blank=True)
    
    is_active = BooleanField(default=True)
    
    @property
    def current_price(self):
        return self.sale_price or self.price
    
    @property
    def discount_percentage(self):
        if self.sale_price:
            return int((1 - self.sale_price/self.price) * 100)
        return 0
    
    @property
    def is_low_stock(self):
        return self.stock_quantity <= self.low_stock_threshold
    
    @property
    def is_out_of_stock(self):
        return self.stock_quantity == 0

class ProductNote(models.Model):
    NOTE_TYPES = [('top', 'افتتاحية'), ('heart', 'قلب'), ('base', 'قاعدية')]
    product = ForeignKey(Product, related_name='notes')
    note_type = CharField(choices=NOTE_TYPES)
    name_ar = CharField(max_length=100)
    icon = CharField(max_length=50, blank=True)

class ProductImage(models.Model):
    product = ForeignKey(Product, related_name='images')
    image = ImageField()
    alt_text = CharField(max_length=200)
    order = PositiveIntegerField(default=0)
```

### Orders App
```python
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
    
    order_number = CharField(unique=True)  # ORD-20260131-XXXX
    customer = ForeignKey(CustomerProfile, null=True)
    
    # بيانات العميل (للشراء كضيف)
    customer_name = CharField(max_length=100)
    customer_phone = CharField(max_length=20)
    customer_email = EmailField(blank=True)
    
    # العنوان
    city = CharField(max_length=100)
    area = CharField(max_length=100)
    address = TextField()
    
    # المبالغ
    subtotal = DecimalField()
    discount_amount = DecimalField(default=0)
    shipping_cost = DecimalField()
    total = DecimalField()
    
    # الكوبون
    coupon = ForeignKey('Coupon', null=True, blank=True)
    
    # الحالة
    status = CharField(choices=STATUS_CHOICES, default='pending')
    notes = TextField(blank=True)
    admin_notes = TextField(blank=True)
    
    # التتبع
    assigned_to = ForeignKey(User, null=True)
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)

class OrderItem(models.Model):
    order = ForeignKey(Order, related_name='items')
    variant = ForeignKey(ProductVariant)
    product_name = CharField()  # نسخة من الاسم وقت الشراء
    variant_size = PositiveIntegerField()
    quantity = PositiveIntegerField()
    unit_price = DecimalField()
    total_price = DecimalField()

class OrderStatusHistory(models.Model):
    order = ForeignKey(Order, related_name='status_history')
    status = CharField()
    notes = TextField(blank=True)
    changed_by = ForeignKey(User)
    created_at = DateTimeField(auto_now_add=True)
```

### CRM App
```python
class CustomerProfile(models.Model):
    SEGMENT_CHOICES = [
        ('new', 'جديد'),
        ('regular', 'متكرر'),
        ('vip', 'VIP'),
        ('inactive', 'خامل'),
    ]
    
    user = OneToOneField(User, null=True)  # اختياري للضيوف
    
    # المعلومات الأساسية
    name = CharField(max_length=100)
    phone = CharField(max_length=20, unique=True)
    email = EmailField(blank=True)
    whatsapp = CharField(max_length=20, blank=True)
    birth_date = DateField(null=True)
    
    # العنوان الافتراضي
    city = CharField(max_length=100, blank=True)
    area = CharField(max_length=100, blank=True)
    address = TextField(blank=True)
    
    # الإحصائيات (تُحدث تلقائياً)
    total_orders = PositiveIntegerField(default=0)
    total_spent = DecimalField(default=0)
    avg_order_value = DecimalField(default=0)
    last_order_date = DateTimeField(null=True)
    
    # التصنيف
    segment = CharField(choices=SEGMENT_CHOICES, default='new')
    tags = ManyToManyField('CustomerTag', blank=True)
    
    # التفضيلات (تُستنتج تلقائياً)
    preferred_gender = CharField(blank=True)
    favorite_brands = ManyToManyField(Brand, blank=True)
    favorite_families = ManyToManyField(FragranceFamily, blank=True)
    
    created_at = DateTimeField(auto_now_add=True)
    last_activity = DateTimeField(auto_now=True)

class CustomerTag(models.Model):
    name = CharField(max_length=50)
    color = CharField(max_length=7, default='#C5A572')

class CustomerInteraction(models.Model):
    TYPE_CHOICES = [
        ('call', 'مكالمة'),
        ('whatsapp', 'واتساب'),
        ('email', 'بريد'),
        ('note', 'ملاحظة'),
        ('complaint', 'شكوى'),
        ('followup', 'متابعة'),
    ]
    customer = ForeignKey(CustomerProfile)
    interaction_type = CharField(choices=TYPE_CHOICES)
    subject = CharField(max_length=200)
    content = TextField()
    created_by = ForeignKey(User)
    created_at = DateTimeField(auto_now_add=True)
```

### CMS App
```python
class HeroSlide(models.Model):
    title = CharField(max_length=100)
    subtitle = TextField(max_length=200)
    image = ImageField()
    image_mobile = ImageField(blank=True)
    
    button_text = CharField(max_length=50)
    button_link = CharField(max_length=200)
    
    product = ForeignKey(Product, null=True, blank=True)
    
    order = PositiveIntegerField(default=0)
    is_active = BooleanField(default=True)
    
    start_date = DateTimeField(null=True, blank=True)
    end_date = DateTimeField(null=True, blank=True)

class Banner(models.Model):
    POSITION_CHOICES = [
        ('home_top', 'الرئيسية - أعلى'),
        ('home_middle', 'الرئيسية - وسط'),
        ('products_top', 'المنتجات - أعلى'),
        ('sidebar', 'الشريط الجانبي'),
    ]
    title = CharField(max_length=100)
    image = ImageField()
    link = CharField(max_length=200)
    position = CharField(choices=POSITION_CHOICES)
    is_active = BooleanField(default=True)
```

### Marketing App
```python
class Coupon(models.Model):
    TYPE_CHOICES = [
        ('percentage', 'نسبة مئوية'),
        ('fixed', 'مبلغ ثابت'),
    ]
    code = CharField(max_length=20, unique=True)
    discount_type = CharField(choices=TYPE_CHOICES)
    discount_value = DecimalField()
    
    min_order_amount = DecimalField(default=0)
    max_discount_amount = DecimalField(null=True)
    
    usage_limit = PositiveIntegerField(null=True)
    used_count = PositiveIntegerField(default=0)
    
    valid_from = DateTimeField()
    valid_to = DateTimeField()
    
    is_active = BooleanField(default=True)
    
    @property
    def is_valid(self):
        from django.utils import timezone
        now = timezone.now()
        return (
            self.is_active and 
            self.valid_from <= now <= self.valid_to and
            (self.usage_limit is None or self.used_count < self.usage_limit)
        )
```

---

## 🔌 API Endpoints

### Public API
```
GET    /api/products/                     # قائمة + فلاتر + pagination
GET    /api/products/{slug}/              # تفاصيل منتج
GET    /api/products/featured/            # المميزة
GET    /api/products/bestsellers/         # الأكثر مبيعاً
GET    /api/products/new-arrivals/        # الجديدة
GET    /api/products/{id}/similar/        # مشابهة
GET    /api/products/{id}/bought-together/ # اشتروا معاً

GET    /api/categories/
GET    /api/brands/
GET    /api/fragrance-families/

GET    /api/cart/
POST   /api/cart/add/
PATCH  /api/cart/update/{item_id}/
DELETE /api/cart/remove/{item_id}/
DELETE /api/cart/clear/
POST   /api/cart/apply-coupon/

POST   /api/orders/
GET    /api/orders/{number}/track/

GET    /api/hero-slides/
GET    /api/banners/
```

### Admin API (Protected)
```
# Products
GET/POST      /api/admin/products/
GET/PUT/DEL   /api/admin/products/{id}/
POST          /api/admin/products/{id}/variants/
PUT/DEL       /api/admin/variants/{id}/
POST          /api/admin/products/{id}/images/

# Orders
GET           /api/admin/orders/
GET           /api/admin/orders/{id}/
PATCH         /api/admin/orders/{id}/status/
POST          /api/admin/orders/{id}/notes/

# Customers (CRM)
GET           /api/admin/customers/
GET           /api/admin/customers/{id}/
PATCH         /api/admin/customers/{id}/segment/
POST          /api/admin/customers/{id}/tags/
POST          /api/admin/customers/{id}/interactions/
GET           /api/admin/customers/{id}/orders/

# Analytics
GET           /api/admin/analytics/dashboard/
GET           /api/admin/analytics/mrr/
GET           /api/admin/analytics/sales/
GET           /api/admin/analytics/products/
GET           /api/admin/analytics/customers/
GET           /api/admin/analytics/cities/

# CMS
CRUD          /api/admin/hero-slides/
CRUD          /api/admin/banners/

# Coupons
CRUD          /api/admin/coupons/

# Settings
GET/PUT       /api/admin/settings/
```

---

انظر الملف التالي: [implementation_plan_part2.md](./implementation_plan_part2.md)
