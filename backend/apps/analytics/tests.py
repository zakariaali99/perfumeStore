from datetime import timedelta
from decimal import Decimal

import pytest
from django.utils import timezone
from rest_framework import status

from crm.factories import CustomerProfileFactory
from orders.factories import OrderFactory, OrderItemFactory
from products.factories import ProductVariantFactory


ANALYTICS_URL = '/api/analytics/'


def _make_delivered_order(created_at, total, city='طرابلس'):
    """Create a delivered order with one item at the given created_at time."""
    customer = CustomerProfileFactory(city=city)
    variant = ProductVariantFactory()
    order = OrderFactory(
        customer=customer,
        status='delivered',
        subtotal=total,
        discount_amount=Decimal('0.00'),
        shipping_cost=Decimal('0.00'),
        total=total,
        city=city,
    )
    # Override auto_now_add by updating after creation
    order.created_at = created_at
    order.save(update_fields=['created_at'])
    OrderItemFactory(
        order=order,
        variant=variant,
        product_name=variant.product.name_ar,
        variant_size=variant.size_ml,
        quantity=1,
        unit_price=total,
        total_price=total,
    )
    return order


@pytest.mark.django_db
class TestDashboardStatsPermissions:
    def test_stats_anonymous_returns_401(self, api_client):
        response = api_client.get(f'{ANALYTICS_URL}stats/')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_stats_non_admin_returns_403(self, authenticated_client):
        response = authenticated_client.get(f'{ANALYTICS_URL}stats/')
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_stats_admin_returns_200(self, admin_client):
        response = admin_client.get(f'{ANALYTICS_URL}stats/')
        assert response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
@pytest.mark.freeze_time('2025-07-13T12:00:00Z')
class TestDashboardStatsRanges:
    @pytest.fixture(autouse=True)
    def setup_orders(self):
        now = timezone.now()
        self.order_40d = _make_delivered_order(
            created_at=now - timedelta(days=40),
            total=Decimal('100.00'),
            city='طرابلس',
        )
        self.order_20d = _make_delivered_order(
            created_at=now - timedelta(days=20),
            total=Decimal('200.00'),
            city='بنغازي',
        )
        self.order_5d = _make_delivered_order(
            created_at=now - timedelta(days=5),
            total=Decimal('300.00'),
            city='مصراتة',
        )

    def test_default_range_all_returns_lifetime_totals(self, admin_client):
        response = admin_client.get(f'{ANALYTICS_URL}stats/')
        assert response.status_code == status.HTTP_200_OK

        summary = response.data['summary']
        assert summary['range'] == 'all'
        assert summary['total_revenue'] == 600.00
        assert summary['total_orders'] == 3
        assert summary['total_customers'] == 3
        assert summary['aov'] == 200.00

    def test_range_30d_filters_summary_to_last_30_days(self, admin_client):
        response = admin_client.get(f'{ANALYTICS_URL}stats/?range=30d')
        assert response.status_code == status.HTTP_200_OK

        summary = response.data['summary']
        assert summary['range'] == '30d'
        assert summary['total_revenue'] == 500.00
        assert summary['total_orders'] == 2
        assert summary['total_customers'] == 2
        assert summary['aov'] == 250.00

    def test_range_90d_filters_summary_to_last_90_days(self, admin_client):
        response = admin_client.get(f'{ANALYTICS_URL}stats/?range=90d')
        assert response.status_code == status.HTTP_200_OK

        summary = response.data['summary']
        assert summary['range'] == '90d'
        assert summary['total_revenue'] == 600.00
        assert summary['total_orders'] == 3
        assert summary['total_customers'] == 3
        assert summary['aov'] == 200.00

    def test_monthly_sales_only_includes_months_within_window(self, admin_client):
        response_30d = admin_client.get(f'{ANALYTICS_URL}stats/?range=30d')
        response_90d = admin_client.get(f'{ANALYTICS_URL}stats/?range=90d')

        months_30d = {entry['month'].strftime('%Y-%m') for entry in response_30d.data['monthly_sales']}
        months_90d = {entry['month'].strftime('%Y-%m') for entry in response_90d.data['monthly_sales']}

        assert months_30d == {'2025-06', '2025-07'}
        assert months_90d == {'2025-06', '2025-07'}

        # June revenue in 30d excludes the now-40d order.
        june_30d = next(
            entry for entry in response_30d.data['monthly_sales']
            if entry['month'].strftime('%Y-%m') == '2025-06'
        )
        june_90d = next(
            entry for entry in response_90d.data['monthly_sales']
            if entry['month'].strftime('%Y-%m') == '2025-06'
        )
        assert june_30d['revenue'] == 200.00
        assert june_90d['revenue'] == 300.00

    def test_top_products_only_includes_items_within_window(self, admin_client):
        response_30d = admin_client.get(f'{ANALYTICS_URL}stats/?range=30d')
        response_90d = admin_client.get(f'{ANALYTICS_URL}stats/?range=90d')

        product_ids_30d = {
            entry['variant__product_id'] for entry in response_30d.data['top_products']
        }
        product_ids_90d = {
            entry['variant__product_id'] for entry in response_90d.data['top_products']
        }

        assert self.order_20d.items.first().variant.product_id in product_ids_30d
        assert self.order_5d.items.first().variant.product_id in product_ids_30d
        assert self.order_40d.items.first().variant.product_id not in product_ids_30d
        assert self.order_40d.items.first().variant.product_id in product_ids_90d

        revenue_30d = sum(entry['revenue'] for entry in response_30d.data['top_products'])
        revenue_90d = sum(entry['revenue'] for entry in response_90d.data['top_products'])
        assert revenue_30d == 500.00
        assert revenue_90d == 600.00

    def test_city_sales_only_includes_orders_within_window(self, admin_client):
        response_30d = admin_client.get(f'{ANALYTICS_URL}stats/?range=30d')
        response_90d = admin_client.get(f'{ANALYTICS_URL}stats/?range=90d')

        cities_30d = {entry['city'] for entry in response_30d.data['city_sales']}
        cities_90d = {entry['city'] for entry in response_90d.data['city_sales']}

        assert cities_30d == {'بنغازي', 'مصراتة'}
        assert cities_90d == {'طرابلس', 'بنغازي', 'مصراتة'}

    def test_revenue_trend_for_30d_compares_current_and_previous_window(self, admin_client):
        response = admin_client.get(f'{ANALYTICS_URL}stats/?range=30d')
        assert response.status_code == status.HTTP_200_OK

        # current window = 200 + 300 = 500, previous window = 100
        # trend = ((500 - 100) / 100) * 100 = 400.0
        assert response.data['summary']['revenue_trend'] == 400.0

    def test_revenue_trend_for_90d_is_zero_without_previous_window_orders(self, admin_client):
        response = admin_client.get(f'{ANALYTICS_URL}stats/?range=90d')
        assert response.status_code == status.HTTP_200_OK

        assert response.data['summary']['revenue_trend'] == 0

    def test_decimal_values_in_response_are_json_numbers(self, admin_client):
        response = admin_client.get(f'{ANALYTICS_URL}stats/?range=30d')
        assert response.status_code == status.HTTP_200_OK

        import json
        data = json.loads(response.content)

        summary = data['summary']
        numeric_fields = [
            summary['total_revenue'],
            summary['aov'],
            summary['monthly_revenue'],
            summary['revenue_trend'],
        ]
        for value in numeric_fields:
            assert isinstance(value, (int, float)), f'Expected JSON number, got {type(value)}: {value}'

        for entry in data['monthly_sales']:
            assert isinstance(entry['revenue'], (int, float))
        for entry in data['top_products']:
            assert isinstance(entry['revenue'], (int, float))
        for entry in data['city_sales']:
            assert isinstance(entry['revenue'], (int, float))


@pytest.mark.django_db
class TestInventoryReportPermissions:
    def test_inventory_anonymous_returns_401(self, api_client):
        response = api_client.get(f'{ANALYTICS_URL}inventory/')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_inventory_non_admin_returns_403(self, authenticated_client):
        response = authenticated_client.get(f'{ANALYTICS_URL}inventory/')
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_inventory_admin_returns_200(self, admin_client):
        response = admin_client.get(f'{ANALYTICS_URL}inventory/')
        assert response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
class TestInventoryReportData:
    def test_inventory_returns_low_stock_variants(self, admin_client):
        low_variant = ProductVariantFactory(
            stock_quantity=3,
            low_stock_threshold=5,
        )
        ProductVariantFactory(
            stock_quantity=10,
            low_stock_threshold=5,
        )

        response = admin_client.get(f'{ANALYTICS_URL}inventory/')
        assert response.status_code == status.HTTP_200_OK

        low_stock = response.data['low_stock']
        assert len(low_stock) == 1
        assert low_stock[0]['product'] == low_variant.product.name_ar
        assert low_stock[0]['stock'] == 3
        assert low_stock[0]['threshold'] == 5

    def test_inventory_includes_variants_at_exact_threshold(self, admin_client):
        variant = ProductVariantFactory(
            stock_quantity=5,
            low_stock_threshold=5,
        )

        response = admin_client.get(f'{ANALYTICS_URL}inventory/')
        assert response.status_code == status.HTTP_200_OK

        assert len(response.data['low_stock']) == 1
        assert response.data['low_stock'][0]['product'] == variant.product.name_ar
