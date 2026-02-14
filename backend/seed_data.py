import os
import django
from django.utils.text import slugify
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from products.models import Category, Brand, Product, ProductVariant, FragranceFamily, ProductNote
from cms.models import HeroSlide
from orders.models import Order, OrderItem
# ... (rest of imports)
from crm.models import CustomerProfile

def seed():
    print("Seeding data...")

    # Hero Slides
    HeroSlide.objects.all().delete()
    HeroSlide.objects.create(
        title="مجموعة العود الملكي",
        subtitle="فخامة تدوم طويلاً مع أنقى أنواع العود",
        button_text="تسوق الآن",
        button_link="/products?category=oriental",
        order=1,
        is_active=True
    )
    HeroSlide.objects.create(
        title="عطور الربيع الجديدة",
        subtitle="انتعاش الزهور الفرنسية في زجاجة",
        button_text="اكتشف المجموعة",
        button_link="/products?category=floral",
        order=2,
        is_active=True
    )
    oriental, _ = Category.objects.get_or_create(slug="oriental", defaults={"name_ar": "عطور شرقية", "description": "روائح دافئة وبخورية"})
    floral, _ = Category.objects.get_or_create(slug="floral", defaults={"name_ar": "عطور زهرية", "description": "روائح الزهور المنعشة"})
    woody, _ = Category.objects.get_or_create(slug="woody", defaults={"name_ar": "عطور خشبية", "description": "روائح الأخشاب والعود"})
    fresh, _ = Category.objects.get_or_create(slug="fresh", defaults={"name_ar": "عطور منعشة", "description": "روائح الحمضيات والبحار"})

    # Brands
    asq, _ = Brand.objects.get_or_create(name_ar="عبدالصمد القرشي", defaults={"is_active": True})
    arabian, _ = Brand.objects.get_or_create(name_ar="العربية للعود", defaults={"is_active": True})
    ajmal, _ = Brand.objects.get_or_create(name_ar="أجمل للعطور", defaults={"is_active": True})
    rasasi, _ = Brand.objects.get_or_create(name_ar="الرصاصي", defaults={"is_active": True})

    # Fragrance Families
    oud, _ = FragranceFamily.objects.get_or_create(name_ar="عود", icon="sparkles", color="#8B4513")
    musk, _ = FragranceFamily.objects.get_or_create(name_ar="مسك", icon="wind", color="#F5F5DC")
    amber, _ = FragranceFamily.objects.get_or_create(name_ar="عنبر", icon="sun", color="#FFBF00")

    # Products
    products_data = [
        {
            "name_ar": "العود الملكي المعتق",
            "slug": "royal-oud-aged",
            "desc": "مزيج ملكي من أجود أنواع العود الكمبودي والماليزي.",
            "category": woody,
            "brand": arabian,
            "gender": "U",
            "variants": [(50, 450, 380), (100, 800, 720)],
            "notes": [('top', 'زعفران'), ('heart', 'خشب الصندل'), ('base', 'عود ملكي')]
        },
        {
            "name_ar": "مسك إبراهيم القرشي",
            "slug": "misk-ibrahim",
            "desc": "عبق المسك الأبيض الصافي لرائحة تدوم طويلاً.",
            "category": fresh,
            "brand": asq,
            "gender": "U",
            "variants": [(50, 250, 180)],
            "notes": [('top', 'أزهار بيضاء'), ('heart', 'مسك'), ('base', 'العنبر الأبيض')]
        },
        {
            "name_ar": "عطر السلطان",
            "slug": "sultan-perfume",
            "desc": "فخامة السلطان في زجاجة، عطر شرقي بامتياز.",
            "category": oriental,
            "brand": ajmal,
            "gender": "M",
            "variants": [(100, 350, 290)],
            "notes": [('top', 'هيل'), ('heart', 'ورد'), ('base', 'باتشولي')]
        },
        {
            "name_ar": "زهور الريف",
            "slug": "reefs-floral",
            "desc": "باقة من أجمل زهور الريف الفرنسي المنعشة.",
            "category": floral,
            "brand": rasasi,
            "gender": "F",
            "variants": [(30, 120, 95), (60, 210, 180)],
            "notes": [('top', 'ياسمين'), ('heart', 'توليب'), ('base', 'فانيليا')]
        }
    ]

    for p_data in products_data:
        p, created = Product.objects.get_or_create(
            slug=p_data['slug'],
            defaults={
                'name_ar': p_data['name_ar'],
                'description': p_data['desc'],
                'story': p_data['desc'],
                'category': p_data['category'],
                'brand': p_data['brand'],
                'gender': p_data['gender'],
                'concentration': 'EDP',
                'is_active': True,
                'is_featured': True
            }
        )
        if created:
            for size, price, sale in p_data['variants']:
                ProductVariant.objects.create(
                    product=p,
                    size_ml=size,
                    price=price,
                    sale_price=sale,
                    cost_price=price * 0.6,
                    stock_quantity=50,
                    sku=f"{p.slug}-{size}",
                    is_active=True
                )
            for n_type, n_name in p_data['notes']:
                ProductNote.objects.create(
                    product=p,
                    note_type=n_type,
                    name_ar=n_name
                )

    # Customers
    c1, _ = CustomerProfile.objects.get_or_create(
        phone="0911111111",
        defaults={
            'name': "أحمد محمد",
            'email': "ahmed@example.ly",
            'city': "طرابلس",
            'segment': 'vip'
        }
    )
    c2, _ = CustomerProfile.objects.get_or_create(
        phone="0922222222",
        defaults={
            'name': "سارة علي",
            'email': "sara@example.ly",
            'city': "بنغازي",
            'segment': 'regular'
        }
    )

    # Orders (simulated - Clear existing first for fresh data)
    Order.objects.all().delete()
    
    for i in range(1, 11):
        o = Order.objects.create(
            order_number=f"ORD-2026-{i:04d}",
            customer_name=random.choice(["أحمد محمد", "سارة علي", "محمود كمال", "فاطمة الزهراء", "عمر الخطاب"]),
            customer_phone=f"09123456{i:02d}",
            city=random.choice(["طرابلس", "بنغازي", "مصراتة", "سبها", "طبرق"]),
            area="وسط المدينة",
            address="شارع التحرير - مبنى 4",
            subtotal=0,
            shipping_cost=20,
            total=20,
            status=random.choice(['pending', 'processing', 'shipped', 'delivered'])
        )
        # Add 1-3 items per order
        subtotal = 0
        for _ in range(random.randint(1, 3)):
            v = ProductVariant.objects.all().order_by('?').first()
            qty = random.randint(1, 2)
            item_total = v.current_price * qty
            subtotal += item_total
            
            OrderItem.objects.create(
                order=o,
                variant=v,
                product_name=v.product.name_ar,
                variant_size=v.size_ml,
                quantity=qty,
                unit_price=v.current_price,
                total_price=item_total
            )
        
        o.subtotal = subtotal
        o.total = subtotal + o.shipping_cost
        o.save()

    print("Success: Data seeded!")

if __name__ == "__main__":
    seed()
