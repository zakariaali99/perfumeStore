import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from cms.models import HeroSlide
from django.core.files.uploadedfile import SimpleUploadedFile

desktop = SimpleUploadedFile("desktop.jpg", b"file_content", content_type="image/jpeg")
mobile = SimpleUploadedFile("mobile.jpg", b"file_content_mob", content_type="image/jpeg")

try:
    slide = HeroSlide.objects.create(
        title="Dual Test",
        order=99,
        image=desktop,
        image_mobile=mobile
    )
    print("Slide created with ID:", slide.id)
except Exception as e:
    print("Error:", str(e))
