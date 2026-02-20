import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.base')
django.setup()

from products.models import Product, Category, Brand, FragranceFamily
from cms.models import HeroSlide, Banner

def cleanup():
    print("Deleting HeroSlides...")
    HeroSlide.objects.all().delete()
    
    print("Deleting Banners...")
    Banner.objects.all().delete()
    
    print("Deleting Products...")
    Product.objects.all().delete()
    
    print("Deleting Categories...")
    Category.objects.all().delete()
    
    print("Deleting Brands...")
    Brand.objects.all().delete()
    
    print("Deleting FragranceFamilies...")
    FragranceFamily.objects.all().delete()
    
    print("Cleanup complete!")

if __name__ == "__main__":
    cleanup()
