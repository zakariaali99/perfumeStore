from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth.models import User
from .models import Order, OrderItem, OrderStatusHistory
from products.models import Product, ProductVariant, Category, Brand
from crm.models import CustomerProfile

class OrderTests(APITestCase):
    def setUp(self):
        self.admin_user = User.objects.create_superuser(username='admin', password='password', email='admin@example.com')
        self.category = Category.objects.create(name_ar='عطور', slug='perfumes')
        self.brand = Brand.objects.create(name_ar='براند', slug='brand')
        self.product = Product.objects.create(
            name_ar='منتج تجريبي',
            slug='test-product',
            category=self.category,
            brand=self.brand,
            gender='unisex',
            concentration='EDP'
        )
        self.variant = ProductVariant.objects.create(
            product=self.product,
            size_ml=100,
            price=100.00,
            stock_quantity=10,
            sku='TEST-SKU-O1'
        )
        self.customer = CustomerProfile.objects.create(
            name='عميل تجريبي',
            phone='0912345678'
        )
        self.order = Order.objects.create(
            order_number='ORD-001',
            customer=self.customer,
            customer_name='عميل تجريبي',
            customer_phone='0912345678',
            city='Tripoli',
            area='Center',
            address='Street 1',
            subtotal=100.00,
            shipping_cost=10.00,
            total=110.00,
            status='pending'
        )

    def test_list_orders_admin(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('order-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data['results']) >= 1)

    def test_order_status_update(self):
        self.client.force_authenticate(user=self.admin_user)
        # Use the specific update_status action
        url = reverse('order-update-status', args=[self.order.id])
        response = self.client.patch(url, {'status': 'confirmed'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Order.objects.get(id=self.order.id).status, 'confirmed')

    def test_unauthorized_access(self):
        url = reverse('order-list')
        response = self.client.get(url)
        # DRF returns 401 if authentication is missing and required
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_order_creation_public(self):
        url = reverse('order-list')
        data = {
            'customer_name': 'New Customer',
            'customer_phone': '0922222222',
            'city': 'Benghazi',
            'area': 'Downtown',
            'address': 'Street 10',
            'items': [
                {'variant_id': self.variant.id, 'quantity': 1}
            ]
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Order.objects.count(), 2)
        # Verify history was created
        order = Order.objects.get(order_number=response.data['order_number'])
        self.assertTrue(OrderStatusHistory.objects.filter(order=order).exists())

    def test_order_track(self):
        url = reverse('order-track')
        # Correct number
        response = self.client.get(url, {'order_number': 'ORD-001', 'phone': '0912345678'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['order_number'], 'ORD-001')
        
        # Wrong number
        response = self.client.get(url, {'order_number': 'ORD-999'})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_order_status_history_on_update(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('order-update-status', args=[self.order.id])
        self.client.patch(url, {'status': 'shipped', 'notes': 'Handed to courier'})
        
        history = OrderStatusHistory.objects.filter(order=self.order, status='shipped').first()
        self.assertIsNotNone(history)
        self.assertEqual(history.notes, 'Handed to courier')
