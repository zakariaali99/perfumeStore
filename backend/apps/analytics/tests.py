from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth.models import User
from orders.models import Order
from products.models import Product, Category, Brand

class AnalyticsTests(APITestCase):
    def setUp(self):
        self.admin_user = User.objects.create_superuser(username='admin', password='password', email='admin@example.com')
        self.category = Category.objects.create(name_ar='عطور', slug='perfumes')
        self.brand = Brand.objects.create(name_ar='براند', slug='brand')
        # Create a delivered order to see stats
        Order.objects.create(
            order_number='ORD-D1',
            customer_name='John',
            customer_phone='123',
            city='Tripoli',
            subtotal=100.00,
            shipping_cost=10.00,
            total=110.00,
            status='delivered'
        )

    def test_dashboard_stats(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('dashboard-stats')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('summary', response.data)
        self.assertEqual(response.data['summary']['total_revenue'], 110.0)
        self.assertIn('mrr', response.data['summary'])

    def test_stats_with_days_param(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('dashboard-stats')
        response = self.client.get(url, {'days': 90})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('summary', response.data)

    def test_inventory_report_structure(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('inventory-report')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data['low_stock'], list)

    def test_empty_database_stats(self):
        Order.objects.all().delete()
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('dashboard-stats')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['summary']['total_revenue'], 0)
        self.assertEqual(response.data['summary']['aov'], 0)
