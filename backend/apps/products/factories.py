import factory
from products.models import (
    Category, Brand, FragranceFamily, Product, ProductVariant,
    ProductImage, ProductNote,
)


class CategoryFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Category

    name_ar = factory.Sequence(lambda n: f'فئة {n}')
    slug = factory.Sequence(lambda n: f'category-{n}')
    image = factory.django.ImageField(color='blue')
    description = 'وصف الفئة'
    order = factory.Sequence(lambda n: n)
    is_active = True


class BrandFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Brand

    name_ar = factory.Sequence(lambda n: f'ماركة {n}')
    slug = factory.Sequence(lambda n: f'brand-{n}')
    description = 'وصف الماركة'
    is_active = True


class FragranceFamilyFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = FragranceFamily

    name_ar = factory.Sequence(lambda n: f'عائلة {n}')
    icon = 'flame'
    color = '#D4AF37'


class ProductFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Product
        skip_postgeneration_save = True

    name_ar = factory.Sequence(lambda n: f'عطر {n}')
    slug = factory.Sequence(lambda n: f'perfume-{n}')
    description = 'وصف العطر'
    story = 'قصة العطر'
    gender = 'unisex'
    occasion = 'ليلي'
    vibe = 'قوي'
    is_active = True
    is_featured = False
    is_new = True
    is_bestseller = False

    @factory.post_generation
    def categories(self, create, extracted, **kwargs):
        if not create:
            return
        if extracted:
            for cat in extracted:
                self.categories.add(cat)

    @factory.post_generation
    def fragrance_families(self, create, extracted, **kwargs):
        if not create:
            return
        if extracted:
            for ff in extracted:
                self.fragrance_families.add(ff)


class ProductVariantFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = ProductVariant

    product = factory.SubFactory(ProductFactory)
    name = factory.Sequence(lambda n: f'عبوة {n}')
    size_ml = 100
    price = factory.Sequence(lambda n: 100 + n * 10)
    sale_price = None
    cost_price = 50.00
    stock_quantity = 100
    low_stock_threshold = 5
    sku = factory.Sequence(lambda n: f'SKU-{n:05d}')
    barcode = factory.Sequence(lambda n: f'BAR{n:05d}')
    is_active = True


class ProductImageFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = ProductImage

    product = factory.SubFactory(ProductFactory)
    image = factory.django.ImageField(color='red')
    alt_text = 'صورة المنتج'
    order = 0


class ProductNoteFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = ProductNote

    product = factory.SubFactory(ProductFactory)
    note_type = 'top'
    name_ar = factory.Sequence(lambda n: f'نوتة {n}')
    icon = 'leaf'
