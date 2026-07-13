from unittest.mock import patch

import pytest
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APIClient

from cart.factories import CartFactory, CartItemFactory
from cart.views import CartViewSet
from products.factories import ProductVariantFactory


pytestmark = pytest.mark.django_db


@pytest.fixture
def user_a(db):
    return User.objects.create_user(username='user_a', password='testpass123')


@pytest.fixture
def user_b(db):
    return User.objects.create_user(username='user_b', password='testpass123')


@pytest.fixture
def auth_client_a(user_a):
    client = APIClient()
    client.force_authenticate(user=user_a)
    return client


@pytest.fixture
def auth_client_b(user_b):
    client = APIClient()
    client.force_authenticate(user=user_b)
    return client


class TestCartAddItem:
    def test_add_item_creates_cart_item_and_returns_updated_cart(self, api_client):
        variant = ProductVariantFactory(stock_quantity=10)

        response = api_client.post(
            '/api/cart/add_item/',
            {'variant_id': variant.id, 'quantity': 2},
            format='json',
        )

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['items']) == 1
        assert response.data['items'][0]['quantity'] == 2

    def test_add_item_rejects_quantity_less_than_or_equal_to_zero(self, api_client):
        variant = ProductVariantFactory(stock_quantity=10)

        response_zero = api_client.post(
            '/api/cart/add_item/',
            {'variant_id': variant.id, 'quantity': 0},
            format='json',
        )
        response_negative = api_client.post(
            '/api/cart/add_item/',
            {'variant_id': variant.id, 'quantity': -1},
            format='json',
        )

        assert response_zero.status_code == status.HTTP_400_BAD_REQUEST
        assert response_negative.status_code == status.HTTP_400_BAD_REQUEST

    def test_add_item_rejects_quantity_greater_than_stock(self, api_client):
        variant = ProductVariantFactory(stock_quantity=5)

        response = api_client.post(
            '/api/cart/add_item/',
            {'variant_id': variant.id, 'quantity': 6},
            format='json',
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_adding_same_variant_increments_quantity_respecting_stock(self, api_client):
        variant = ProductVariantFactory(stock_quantity=5)

        api_client.post(
            '/api/cart/add_item/',
            {'variant_id': variant.id, 'quantity': 3},
            format='json',
        )
        response = api_client.post(
            '/api/cart/add_item/',
            {'variant_id': variant.id, 'quantity': 2},
            format='json',
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data['items'][0]['quantity'] == 5

        overflow_response = api_client.post(
            '/api/cart/add_item/',
            {'variant_id': variant.id, 'quantity': 1},
            format='json',
        )
        assert overflow_response.status_code == status.HTTP_400_BAD_REQUEST


class TestCartUpdateItem:
    def test_update_item_changes_quantity_and_calls_get_cart_once(self, auth_client_a, user_a):
        cart = CartFactory(user=user_a)
        variant = ProductVariantFactory(stock_quantity=10)
        item = CartItemFactory(cart=cart, variant=variant, quantity=2)

        call_count = 0
        original_get_cart = CartViewSet.get_cart

        def counting_get_cart(self):
            nonlocal call_count
            call_count += 1
            return original_get_cart(self)

        with patch.object(CartViewSet, 'get_cart', counting_get_cart):
            response = auth_client_a.patch(
                '/api/cart/update_item/',
                {'item_id': item.id, 'quantity': 5},
                format='json',
            )

        assert response.status_code == status.HTTP_200_OK
        assert response.data['items'][0]['quantity'] == 5
        assert call_count == 1

    def test_update_item_rejects_insufficient_stock(self, auth_client_a, user_a):
        cart = CartFactory(user=user_a)
        variant = ProductVariantFactory(stock_quantity=5)
        item = CartItemFactory(cart=cart, variant=variant, quantity=1)

        response = auth_client_a.patch(
            '/api/cart/update_item/',
            {'item_id': item.id, 'quantity': 6},
            format='json',
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST


class TestCartRemoveItem:
    def test_remove_item_deletes_item_from_cart(self, auth_client_a, user_a):
        cart = CartFactory(user=user_a)
        variant = ProductVariantFactory(stock_quantity=10)
        item = CartItemFactory(cart=cart, variant=variant, quantity=1)

        response = auth_client_a.delete(
            '/api/cart/remove_item/',
            {'item_id': item.id},
            format='json',
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data['items'] == []

    def test_idor_user_cannot_remove_another_users_cart_item(
        self, auth_client_a, user_b
    ):
        cart_b = CartFactory(user=user_b)
        variant = ProductVariantFactory(stock_quantity=10)
        item_b = CartItemFactory(cart=cart_b, variant=variant, quantity=1)

        response = auth_client_a.delete(
            '/api/cart/remove_item/',
            {'item_id': item_b.id},
            format='json',
        )

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_idor_session_cannot_remove_another_sessions_cart_item(self, api_client):
        client_a = APIClient()
        client_b = APIClient()

        variant = ProductVariantFactory(stock_quantity=10)
        client_a.post(
            '/api/cart/add_item/',
            {'variant_id': variant.id, 'quantity': 1},
            format='json',
        )
        client_b.post(
            '/api/cart/add_item/',
            {'variant_id': variant.id, 'quantity': 1},
            format='json',
        )

        cart_a = client_a.get('/api/cart/').data
        item_a_id = cart_a['items'][0]['id']

        response = client_b.delete(
            '/api/cart/remove_item/',
            {'item_id': item_a_id},
            format='json',
        )

        assert response.status_code == status.HTTP_404_NOT_FOUND


class TestCartViewSetDisallowedMethods:
    def test_retrieve_update_destroy_partial_update_return_405(self, auth_client_a, user_a):
        cart = CartFactory(user=user_a)

        retrieve_response = auth_client_a.get(f'/api/cart/{cart.id}/')
        update_response = auth_client_a.put(f'/api/cart/{cart.id}/', {}, format='json')
        partial_update_response = auth_client_a.patch(
            f'/api/cart/{cart.id}/', {}, format='json'
        )
        destroy_response = auth_client_a.delete(f'/api/cart/{cart.id}/')

        assert retrieve_response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED
        assert update_response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED
        assert partial_update_response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED
        assert destroy_response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED
