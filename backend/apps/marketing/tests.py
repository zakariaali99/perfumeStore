from datetime import timedelta

import pytest
from django.utils import timezone
from rest_framework import status

from marketing.factories import CouponFactory
from marketing.models import Coupon


pytestmark = pytest.mark.django_db


class TestCouponValidate:
    def test_validate_action_is_public(self, api_client):
        coupon = CouponFactory()

        response = api_client.post(
            '/api/marketing/coupons/validate/',
            {'code': coupon.code, 'cart_total': '100.00'},
            format='json',
        )

        assert response.status_code == status.HTTP_200_OK

    def test_validate_returns_valid_true_for_valid_percentage_coupon(self, api_client):
        coupon = CouponFactory(discount_type='percentage', discount_value=10.00)

        response = api_client.post(
            '/api/marketing/coupons/validate/',
            {'code': coupon.code, 'cart_total': '100.00'},
            format='json',
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data['valid'] is True
        assert response.data['discount_amount'] == '10.00'

    def test_validate_returns_valid_false_for_expired_coupon(self, api_client):
        coupon = CouponFactory(expired=True)

        response = api_client.post(
            '/api/marketing/coupons/validate/',
            {'code': coupon.code, 'cart_total': '100.00'},
            format='json',
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data['valid'] is False

    def test_validate_returns_valid_false_for_exhausted_coupon(self, api_client):
        coupon = CouponFactory(exhausted=True)

        response = api_client.post(
            '/api/marketing/coupons/validate/',
            {'code': coupon.code, 'cart_total': '100.00'},
            format='json',
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data['valid'] is False

    def test_validate_returns_valid_false_when_cart_total_below_min_order(self, api_client):
        coupon = CouponFactory(min_order_amount=100.00)

        response = api_client.post(
            '/api/marketing/coupons/validate/',
            {'code': coupon.code, 'cart_total': '50.00'},
            format='json',
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data['valid'] is False

    def test_fixed_coupon_discount_amount_equals_discount_value(self, api_client):
        coupon = CouponFactory(fixed=True)

        response = api_client.post(
            '/api/marketing/coupons/validate/',
            {'code': coupon.code, 'cart_total': '100.00'},
            format='json',
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data['valid'] is True
        assert response.data['discount_amount'] == '20.00'

    def test_max_discount_amount_caps_percentage_coupon(self, api_client):
        coupon = CouponFactory(
            discount_type='percentage',
            discount_value=50.00,
            max_discount_amount=100.00,
        )

        response = api_client.post(
            '/api/marketing/coupons/validate/',
            {'code': coupon.code, 'cart_total': '1000.00'},
            format='json',
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data['valid'] is True
        assert response.data['discount_amount'] == '100.00'


class TestCouponAdminEndpoints:
    def test_list_requires_admin(self, api_client, admin_client):
        CouponFactory()

        anonymous_response = api_client.get('/api/marketing/coupons/')
        admin_response = admin_client.get('/api/marketing/coupons/')

        assert anonymous_response.status_code == status.HTTP_401_UNAUTHORIZED
        assert admin_response.status_code == status.HTTP_200_OK

    def test_create_requires_admin(self, api_client, admin_client):
        payload = {
            'code': 'NEWCODE',
            'discount_type': 'percentage',
            'discount_value': '15.00',
            'valid_from': timezone.now().isoformat(),
            'valid_to': (timezone.now() + timedelta(days=30)).isoformat(),
        }

        anonymous_response = api_client.post(
            '/api/marketing/coupons/', payload, format='json'
        )
        admin_response = admin_client.post(
            '/api/marketing/coupons/', payload, format='json'
        )

        assert anonymous_response.status_code == status.HTTP_401_UNAUTHORIZED
        assert admin_response.status_code == status.HTTP_201_CREATED

    def test_update_requires_admin(self, api_client, admin_client):
        coupon = CouponFactory()
        payload = {'discount_value': '99.00'}

        anonymous_response = api_client.patch(
            f'/api/marketing/coupons/{coupon.code}/', payload, format='json'
        )
        admin_response = admin_client.patch(
            f'/api/marketing/coupons/{coupon.code}/', payload, format='json'
        )

        assert anonymous_response.status_code == status.HTTP_401_UNAUTHORIZED
        assert admin_response.status_code == status.HTTP_200_OK

        coupon.refresh_from_db()
        assert coupon.discount_value == 99.00

    def test_delete_requires_admin(self, api_client, admin_client):
        coupon = CouponFactory()

        anonymous_response = api_client.delete(
            f'/api/marketing/coupons/{coupon.code}/'
        )
        admin_response = admin_client.delete(
            f'/api/marketing/coupons/{coupon.code}/'
        )

        assert anonymous_response.status_code == status.HTTP_401_UNAUTHORIZED
        assert admin_response.status_code == status.HTTP_204_NO_CONTENT
        assert not Coupon.objects.filter(code=coupon.code).exists()
