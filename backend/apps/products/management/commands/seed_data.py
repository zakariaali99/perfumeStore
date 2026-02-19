import os
import random
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from products.models import Category, Brand, FragranceFamily, Product, ProductVariant, ProductNote
from orders.models import Order, OrderItem
from django.utils import timezone

class Command(BaseCommand):
    help = 'Seeds initial data for the perfume store'

    def handle(self, *args, **kwargs):
        self.stdout.write("Seeding data...")

        # 1. Categories
        cat_oriental, _ = Category.objects.get_or_create(name_ar="عطور شرقية", slug="oriental")
        cat_floral, _ = Category.objects.get_or_create(name_ar="عطور زهرية", slug="floral")
        cat_oud, _ = Category.objects.get_or_create(name_ar="العود والبخور", slug="oud-incense")

        # 2. Brands
        brand_alrehab, _ = Brand.objects.get_or_create(name_ar="العربية للعود")
        brand_asq, _ = Brand.objects.get_or_create(name_ar="عبدالصمد القرشي")

        # 3. Families
        fam_musk, _ = FragranceFamily.objects.get_or_create(name_ar="مسك", icon="musk", color="#f0f0f0")
        fam_amber, _ = FragranceFamily.objects.get_or_create(name_ar="عنبر", icon="amber", color="#ffd700")

        # 4. Products
        p1, _ = Product.objects.get_or_create(
            name_ar="عطر العود الملكي",
            slug="royal-oud",
            category=cat_oriental,
            brand=brand_alrehab,
            gender='U',
            concentration='EDP',
            is_featured=True,
            is_new=True,
            story="قصة من أعماق الشرق تحكي عبق العود العتيق..."
        )
        p1.fragrance_families.add(fam_amber)

        p2, _ = Product.objects.get_or_create(
            name_ar="مسك الختام",
            slug="misk-al-khitam",
            category=cat_floral,
            brand=brand_asq,
            gender='U',
            concentration='P',
            is_featured=True,
            story="أنقى أنواع المسك الأبيض يجمع بين النعومة والجاذبية."
        )
        p2.fragrance_families.add(fam_musk)

        # 5. Variants
        ProductVariant.objects.get_or_create(
            product=p1, size_ml=50, price=350, cost_price=150, stock_quantity=20, sku="ROYAL-50"
        )
        ProductVariant.objects.get_or_create(
            product=p1, size_ml=100, price=550, cost_price=250, stock_quantity=15, sku="ROYAL-100"
        )
        ProductVariant.objects.get_or_create(
            product=p2, size_ml=30, price=120, cost_price=40, stock_quantity=50, sku="MISK-30"
        )

        # 6. Orders (Seed some for analytics)
        if Order.objects.count() < 10:
            for i in range(10):
                o = Order.objects.create(
                    order_number=f"ORD-SEED-{i}",
                    customer_name=f"زبون {i}",
                    customer_phone="050000000",
                    city="الرياض",
                    area="الوسطى",
                    address="شارع التحلية",
                    subtotal=300,
                    shipping_cost=0,
                    total=300,
                    status='delivered'
                )
                o.created_at = timezone.now() - timezone.timedelta(days=random.randint(0, 60))
                o.save()

        self.stdout.write(self.style.SUCCESS("Successfully seeded data!"))
