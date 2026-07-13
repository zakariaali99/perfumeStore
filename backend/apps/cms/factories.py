import factory
from cms.models import HeroSlide, Banner, StoreSettings, HomePageSection


class HeroSlideFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = HeroSlide

    title = factory.Sequence(lambda n: f'سلايد {n}')
    subtitle = 'عنوان فرعي'
    image = factory.django.ImageField(color='green')
    button_text = 'تسوق الآن'
    button_link = '/products'
    order = factory.Sequence(lambda n: n)
    is_active = True


class BannerFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Banner

    title = factory.Sequence(lambda n: f'بانر {n}')
    image = factory.django.ImageField(color='yellow')
    link = '/products'
    position = 'home_top'
    is_active = True


class StoreSettingsFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = StoreSettings
        django_get_or_create = ('store_name',)

    store_name = "Almustafa's Perfume"
    contact_phone = '0912345678'
    shipping_cost = 25.00


class HomePageSectionFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = HomePageSection

    key = factory.Sequence(lambda n: f'section-{n}')
    title_ar = factory.Sequence(lambda n: f'قسم {n}')
    content = {}
    is_active = True
    order = factory.Sequence(lambda n: n)
