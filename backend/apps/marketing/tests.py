from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth.models import User
from .models import Coupon

class MarketingTests(APITestCase):
    def setUp(self):
        self.admin_user = User.objects.create_superuser(username='admin', password='password', email='admin@example.com')
        self.coupon = Coupon.objects.create(
            code='TEST10',
            discount_type='percentage',
            discount_value=10.0,
            valid_from='2020-01-01',
            valid_to='2030-01-01'
        )

    def test_coupon_crud_admin(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('coupon-list')
        
        # List
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Create
        data = {
            'code': 'NEW20',
            'discount_type': 'fixed',
            'discount_value': 20.0,
            'valid_from': '2020-01-01',
            'valid_to': '2030-01-01',
            'min_order_amount': 100.0,
            'max_discount_amount': 50.0
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Update
        detail_url = reverse('coupon-detail', args=['NEW20'])
        response = self.client.patch(detail_url, {'discount_value': 25.0})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Delete
        response = self.client.delete(detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Coupon.objects.filter(code='NEW20').exists())

    def test_coupon_validation(self):
        url = reverse('coupon-validate')
        response = self.client.post(url, {'code': 'TEST10', 'cart_total': 100.0})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['discount_value'], 10.0)

    def test_coupon_min_order_validation(self):
        Coupon.objects.create(code='MIN100', discount_type='fixed', discount_value=10, min_order_amount=100, valid_from='2020-01-01', valid_to='2030-01-01')
        url = reverse('coupon-validate')
        response = self.client.post(url, {'code': 'MIN100', 'cart_total': 50.0})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_expired_coupon(self):
        Coupon.objects.create(code='OLD', discount_type='fixed', discount_value=10, valid_from='2020-01-01', valid_to='2021-01-01')
        url = reverse('coupon-validate')
        response = self.client.post(url, {'code': 'OLD', 'cart_total': 100.0})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_coupon_code(self):
        url = reverse('coupon-validate')
        response = self.client.post(url, {'code': 'NOTREAL', 'cart_total': 100.0})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
