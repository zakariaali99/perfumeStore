import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status

from cms.factories import (
    HeroSlideFactory,
    BannerFactory,
    StoreSettingsFactory,
    HomePageSectionFactory,
)
from cms.models import HeroSlide, Banner, StoreSettings, HomePageSection


CMS_URL = '/api/cms/'


def _image_file(name='test.gif'):
    return SimpleUploadedFile(
        name,
        b'GIF89a\x01\x00\x01\x00\x00\x00\x00!\xf9\x04\x00\x00\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;',
        content_type='image/gif',
    )


@pytest.mark.django_db
class TestHeroSlideViewSet:
    def test_anonymous_get_slides_returns_active_only(self, api_client):
        HeroSlideFactory(is_active=True)
        HeroSlideFactory(is_active=False)
        response = api_client.get(f'{CMS_URL}slides/')
        assert response.status_code == status.HTTP_200_OK
        results = response.data['results']
        assert all(slide['is_active'] for slide in results)

    def test_admin_can_create_update_delete_slide(self, admin_client):
        create_payload = {
            'title': 'New Slide',
            'subtitle': 'Subtitle',
            'button_text': 'Shop',
            'button_link': '/products',
            'order': 1,
            'is_active': True,
            'image': _image_file('slide_create.gif'),
        }
        response = admin_client.post(
            f'{CMS_URL}slides/',
            create_payload,
            format='multipart',
        )
        assert response.status_code == status.HTTP_201_CREATED
        slide_id = response.data['id']

        update_response = admin_client.patch(
            f'{CMS_URL}slides/{slide_id}/',
            {'title': 'Updated Slide'},
            format='multipart',
        )
        assert update_response.status_code == status.HTTP_200_OK
        assert update_response.data['title'] == 'Updated Slide'

        delete_response = admin_client.delete(f'{CMS_URL}slides/{slide_id}/')
        assert delete_response.status_code == status.HTTP_204_NO_CONTENT
        assert not HeroSlide.objects.filter(id=slide_id).exists()

    def test_anonymous_cannot_create_slide(self, api_client):
        payload = {
            'title': 'New Slide',
            'subtitle': 'Subtitle',
            'button_text': 'Shop',
            'button_link': '/products',
            'image': _image_file('slide_forbidden.gif'),
        }
        response = api_client.post(
            f'{CMS_URL}slides/',
            payload,
            format='multipart',
        )
        assert response.status_code in (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN)


@pytest.mark.django_db
class TestBannerViewSet:
    def test_anonymous_get_banners_returns_active_only(self, api_client):
        BannerFactory(is_active=True)
        BannerFactory(is_active=False)
        response = api_client.get(f'{CMS_URL}banners/')
        assert response.status_code == status.HTTP_200_OK
        results = response.data['results']
        assert all(banner['is_active'] for banner in results)


@pytest.mark.django_db
class TestStoreSettingsViewSet:
    def test_settings_list_returns_singleton_via_get_or_create(self, api_client):
        assert StoreSettings.objects.count() == 0
        response = api_client.get(f'{CMS_URL}settings/')
        assert response.status_code == status.HTTP_200_OK
        assert StoreSettings.objects.count() == 1

    def test_creating_second_settings_is_not_allowed(self, admin_client):
        StoreSettingsFactory()
        payload = {
            'store_name': 'Another Store',
            'shipping_cost': 30.00,
        }
        response = admin_client.post(f'{CMS_URL}settings/', payload)
        assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED

    def test_settings_destroy_is_not_allowed(self, admin_client):
        StoreSettingsFactory()
        settings = StoreSettings.objects.first()
        response = admin_client.delete(f'{CMS_URL}settings/{settings.pk}/')
        assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED

    def test_admin_can_patch_settings(self, admin_client):
        StoreSettingsFactory()
        settings = StoreSettings.objects.first()
        response = admin_client.patch(
            f'{CMS_URL}settings/{settings.pk}/',
            {'store_name': 'Updated Store'},
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.data['store_name'] == 'Updated Store'


@pytest.mark.django_db
class TestHomePageSectionViewSet:
    def test_anonymous_get_sections_returns_active_only(self, api_client):
        HomePageSectionFactory(is_active=True)
        HomePageSectionFactory(is_active=False)
        response = api_client.get(f'{CMS_URL}sections/')
        assert response.status_code == status.HTTP_200_OK
        results = response.data['results']
        assert all(section['is_active'] for section in results)

    def test_staff_get_sections_returns_all(self, admin_client):
        HomePageSectionFactory(is_active=True)
        HomePageSectionFactory(is_active=False)
        response = admin_client.get(f'{CMS_URL}sections/')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['count'] == HomePageSection.objects.count()
        assert len(response.data['results']) == HomePageSection.objects.count()

    def test_admin_can_create_update_delete_section(self, admin_client):
        create_payload = {
            'key': 'new-section',
            'title_ar': 'قسم جديد',
            'content': {},
            'order': 1,
            'is_active': True,
        }
        response = admin_client.post(f'{CMS_URL}sections/', create_payload, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        section_id = response.data['id']

        update_response = admin_client.patch(
            f'{CMS_URL}sections/{section_id}/',
            {'title_ar': 'قسم محدث'},
            format='json',
        )
        assert update_response.status_code == status.HTTP_200_OK
        assert update_response.data['title_ar'] == 'قسم محدث'

        delete_response = admin_client.delete(f'{CMS_URL}sections/{section_id}/')
        assert delete_response.status_code == status.HTTP_204_NO_CONTENT
        assert not HomePageSection.objects.filter(id=section_id).exists()
