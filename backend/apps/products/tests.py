from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth.models import User
from .models import Category, Brand, Product, ProductVariant

class ProductTests(APITestCase):
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
            sku='TEST-SKU-1'
        )

    def test_list_products_public(self):
        url = reverse('product-public-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Verify product is in list (depending on serializer structure)
        self.assertTrue(len(response.data['results']) >= 1)

    def test_admin_product_crud(self):
        # Authenticate as admin
        self.client.force_authenticate(user=self.admin_user)
        
        # Test creation
        url = reverse('product-admin-list')
        data = {
            'name_ar': 'منتج جديد',
            'slug': 'new-product',
            'category': self.category.id,
            'brand': self.brand.id,
            'gender': 'unisex',
            'concentration': 'EDP'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Test edit
        product_id = response.data['id']
        edit_url = reverse('product-admin-detail', args=[product_id])
        edit_data = {'name_ar': 'منتج معدل'}
        response = self.client.patch(edit_url, edit_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name_ar'], 'منتج معدل')

    def test_admin_variant_crud(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('variant-admin-list')
        data = {
            'product': self.product.id,
            'size_ml': 50,
            'price': 75.00,
            'stock_quantity': 20,
            'sku': 'TEST-SKU-2'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_unauthorized_access(self):
        url = reverse('product-admin-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_product_delete(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('product-admin-detail', args=[self.product.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Product.objects.filter(id=self.product.id).exists())

    def test_variant_delete(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('variant-admin-detail', args=[self.variant.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(ProductVariant.objects.filter(id=self.variant.id).exists())

    def test_categories_list(self):
        url = reverse('category-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Category list is public
        self.assertTrue(len(response.data) >= 1)

    def test_brands_list(self):
        url = reverse('brand-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Brand list is public
        self.assertTrue(len(response.data) >= 1)

    def test_product_detail_public(self):
        url = reverse('product-public-detail', args=[self.product.slug])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name_ar'], self.product.name_ar)

    def test_inactive_product_exclusion_public(self):
        self.product.is_active = False
        self.product.save()
        url = reverse('product-public-list')
        response = self.client.get(url)
        # Check if product is NOT in results
        results = [p['id'] for p in response.data['results']]
        self.assertNotIn(self.product.id, results)
