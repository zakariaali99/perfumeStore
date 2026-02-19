from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth.models import User
from products.models import Product, ProductVariant, Category, Brand
from .models import Cart, CartItem

class CartTests(APITestCase):
    def setUp(self):
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
            sku='CART-SKU-1'
        )
        self.url_list = reverse('cart-list')
        self.url_add = reverse('cart-add-item')
        self.url_update = reverse('cart-update-item')
        self.url_remove = reverse('cart-remove-item')
        self.url_clear = reverse('cart-clear')

    def test_get_empty_cart(self):
        response = self.client.get(self.url_list)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['items']), 0)

    def test_add_item_to_cart(self):
        data = {'variant_id': self.variant.id, 'quantity': 2}
        response = self.client.post(self.url_add, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['items']), 1)
        self.assertEqual(response.data['items'][0]['quantity'], 2)

    def test_update_item_quantity(self):
        # First add
        self.client.post(self.url_add, {'variant_id': self.variant.id, 'quantity': 1})
        cart_item = CartItem.objects.first()
        
        # Then update
        data = {'item_id': cart_item.id, 'quantity': 5}
        response = self.client.patch(self.url_update, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['items'][0]['quantity'], 5)

    def test_remove_item(self):
        # First add
        self.client.post(self.url_add, {'variant_id': self.variant.id, 'quantity': 1})
        cart_item = CartItem.objects.first()
        
        # Then remove
        response = self.client.delete(self.url_remove, {'item_id': cart_item.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['items']), 0)

    def test_clear_cart(self):
        # First add
        self.client.post(self.url_add, {'variant_id': self.variant.id, 'quantity': 1})
        
        # Then clear
        response = self.client.delete(self.url_clear)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['items']), 0)
