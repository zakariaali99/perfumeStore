from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth.models import User
from .models import HeroSlide, Banner, StoreSettings
from django.core.files.uploadedfile import SimpleUploadedFile

class CMSTests(APITestCase):
    def setUp(self):
        self.admin_user = User.objects.create_superuser(username='admin', password='password', email='admin@example.com')
        self.settings = StoreSettings.objects.create(store_name='المصطفى')

    def test_settings_admin(self):
        self.client.force_authenticate(user=self.admin_user)
        # Basename is 'settings' in urls.py
        url = reverse('settings-detail', args=[self.settings.id])
        response = self.client.patch(url, {'store_name': 'المصطفى للعطور'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(StoreSettings.objects.get(id=self.settings.id).store_name, 'المصطفى للعطور')

    def test_slides_admin_crud(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('heroslide-list')
        
        # Create image placeholder
        image_content = b'\x47\x49\x46\x38\x39\x61\x01\x00\x01\x00\x80\x00\x00\xff\xff\xff\x00\x00\x00\x21\xf9\x04\x01\x00\x00\x00\x00\x2c\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02\x44\x01\x00\x3b'
        image = SimpleUploadedFile("test_slide.gif", image_content, content_type="image/gif")
        
        # Create
        data = {
            'title': 'عرض جديد',
            'subtitle': 'تخفيضات تصل لـ 50%',
            'image': image,
            'button_text': 'اشتر الآن',
            'button_link': '/',
            'order': 1,
            'is_active': True
        }
        response = self.client.post(url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_banner_crud(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('banner-list')
        image_content = b'\x47\x49\x46\x38\x39\x61\x01\x00\x01\x00\x80\x00\x00\xff\xff\xff\x00\x00\x00\x21\xf9\x04\x01\x00\x00\x00\x00\x2c\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02\x44\x01\x00\x3b'
        image = SimpleUploadedFile("test_banner.gif", image_content, content_type="image/gif")
        
        # Create
        data = {
            'title': 'بنر تجريبي',
            'image': image,
            'link': '/',
            'position': 'home_top'
        }
        response = self.client.post(url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        banner_id = response.data['id']
        
        # Delete
        detail_url = reverse('banner-detail', args=[banner_id])
        response = self.client.delete(detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_unauthorized_cms(self):
        url = reverse('heroslide-list')
        response = self.client.post(url, {}) # POST should be protected
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
