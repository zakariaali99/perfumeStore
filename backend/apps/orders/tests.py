import pytest
from decimal import Decimal
from django.db import IntegrityError
from rest_framework import status

from products.factories import ProductFactory, ProductVariantFactory
from marketing.factories import CouponFactory
from crm.factories import CustomerProfileFactory
from orders.factories import OrderFactory, OrderItemFactory
from orders.models import Order, OrderItem, OrderStatusHistory
from products.models import ProductVariant
from crm.models import CustomerProfile
from marketing.models import Coupon


pytestmark = pytest.mark.django_db


ORDERS_URL = "/api/orders/"


def order_payload(variant, quantity=2, **overrides):
    return {
        "customer_name": "Mostafa",
        "customer_phone": "0911234567",
        "customer_email": "test@example.com",
        "city": "Tripoli",
        "area": "Center",
        "address": "123 Main St",
        "location_details": "Near mosque",
        "items": [{"variant_id": variant.id, "quantity": quantity}],
        **overrides,
    }


def test_create_order_happy_path(api_client):
    variant = ProductVariantFactory(stock_quantity=10)
    payload = order_payload(variant, quantity=2)

    response = api_client.post(ORDERS_URL, payload, format="json")

    assert response.status_code == status.HTTP_201_CREATED

    variant.refresh_from_db()
    assert variant.stock_quantity == 8

    order = Order.objects.get(id=response.data["id"])
    item = order.items.first()
    assert item.product_name == variant.product.name_ar
    assert item.variant_size == variant.size_ml
    assert item.quantity == 2

    history = order.status_history.first()
    assert history is not None
    assert history.status == "pending"

    customer = CustomerProfile.objects.get(
        name=payload["customer_name"], phone=payload["customer_phone"]
    )
    assert customer.total_orders == 1
    assert customer.total_spent == order.total
    assert customer.last_order_date is not None


def test_create_order_with_coupon_increments_used_count(api_client):
    variant = ProductVariantFactory(stock_quantity=10)
    coupon = CouponFactory(used_count=0)
    payload = order_payload(variant, quantity=2, coupon_code=coupon.code)

    response = api_client.post(ORDERS_URL, payload, format="json")

    assert response.status_code == status.HTTP_201_CREATED
    coupon.refresh_from_db()
    assert coupon.used_count == 1


def test_create_order_insufficient_stock(api_client):
    variant = ProductVariantFactory(stock_quantity=3)
    payload = order_payload(variant, quantity=5)
    order_count_before = Order.objects.count()

    response = api_client.post(ORDERS_URL, payload, format="json")

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert Order.objects.count() == order_count_before
    variant.refresh_from_db()
    assert variant.stock_quantity == 3


def test_create_order_invalid_variant_id(api_client):
    variant = ProductVariantFactory(stock_quantity=10)
    payload = order_payload(variant, quantity=1)
    payload["items"][0]["variant_id"] = 999999

    response = api_client.post(ORDERS_URL, payload, format="json")

    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_create_order_stock_leak_regression(monkeypatch, api_client):
    variant = ProductVariantFactory(stock_quantity=10)
    payload = order_payload(variant, quantity=2)

    call_count = 0
    original_create = Order.objects.create

    def failing_create(*args, **kwargs):
        nonlocal call_count
        call_count += 1
        if call_count <= 5:
            raise IntegrityError("duplicate order number")
        return original_create(*args, **kwargs)

    monkeypatch.setattr(Order.objects, "create", failing_create)

    response = api_client.post(ORDERS_URL, payload, format="json")

    assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
    assert call_count == 5
    variant.refresh_from_db()
    assert variant.stock_quantity == 10


def test_anonymous_can_post_and_unauthenticated_get_rejected(api_client):
    variant = ProductVariantFactory(stock_quantity=10)
    payload = order_payload(variant, quantity=1)

    post_response = api_client.post(ORDERS_URL, payload, format="json")
    assert post_response.status_code == status.HTTP_201_CREATED

    get_response = api_client.get(ORDERS_URL)
    assert get_response.status_code == status.HTTP_401_UNAUTHORIZED


def test_admin_can_list_all_orders(admin_client):
    OrderFactory.create_batch(2)

    response = admin_client.get(ORDERS_URL)

    assert response.status_code == status.HTTP_200_OK
    assert response.data["count"] == 2


def test_update_status_changes_order_status_and_creates_history(admin_client):
    order = OrderFactory(status="pending")

    response = admin_client.patch(
        f"{ORDERS_URL}{order.id}/update_status/",
        {"status": "confirmed"},
        format="json",
    )

    assert response.status_code == status.HTTP_200_OK
    order.refresh_from_db()
    assert order.status == "confirmed"
    assert order.status_history.filter(status="confirmed").exists()


def test_update_status_cancelled_restores_stock_and_no_double_restore(admin_client):
    variant = ProductVariantFactory(stock_quantity=10)
    create_response = admin_client.post(ORDERS_URL, order_payload(variant, quantity=2), format="json")
    assert create_response.status_code == status.HTTP_201_CREATED

    order_id = create_response.data["id"]
    variant.refresh_from_db()
    assert variant.stock_quantity == 8

    # First cancel restores stock
    response = admin_client.patch(
        f"{ORDERS_URL}{order_id}/update_status/",
        {"status": "cancelled"},
        format="json",
    )
    assert response.status_code == status.HTTP_200_OK
    variant.refresh_from_db()
    assert variant.stock_quantity == 10

    # Cancelling again must not double-restore
    response = admin_client.patch(
        f"{ORDERS_URL}{order_id}/update_status/",
        {"status": "cancelled"},
        format="json",
    )
    assert response.status_code == status.HTTP_200_OK
    variant.refresh_from_db()
    assert variant.stock_quantity == 10


def test_update_status_delivered_then_returned_restores_stock(admin_client):
    variant = ProductVariantFactory(stock_quantity=10)
    create_response = admin_client.post(ORDERS_URL, order_payload(variant, quantity=2), format="json")
    assert create_response.status_code == status.HTTP_201_CREATED

    order_id = create_response.data["id"]
    variant.refresh_from_db()
    assert variant.stock_quantity == 8

    response = admin_client.patch(
        f"{ORDERS_URL}{order_id}/update_status/",
        {"status": "delivered"},
        format="json",
    )
    assert response.status_code == status.HTTP_200_OK
    variant.refresh_from_db()
    assert variant.stock_quantity == 8

    response = admin_client.patch(
        f"{ORDERS_URL}{order_id}/update_status/",
        {"status": "returned"},
        format="json",
    )
    assert response.status_code == status.HTTP_200_OK
    variant.refresh_from_db()
    assert variant.stock_quantity == 10


def test_track_order_requires_phone_and_order_number(api_client):
    response = api_client.get(f"{ORDERS_URL}track/?order_number=ORD-123")
    assert response.status_code == status.HTTP_400_BAD_REQUEST

    response = api_client.get(f"{ORDERS_URL}track/?phone=0911234567")
    assert response.status_code == status.HTTP_400_BAD_REQUEST


def test_track_order_returns_order_when_matches(api_client):
    order = OrderFactory(customer_phone="0911234567")

    response = api_client.get(
        f"{ORDERS_URL}track/?order_number={order.order_number}&phone={order.customer_phone}"
    )

    assert response.status_code == status.HTTP_200_OK
    assert response.data["id"] == order.id
    assert response.data["order_number"] == order.order_number
