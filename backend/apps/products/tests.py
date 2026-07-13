import pytest
from rest_framework import status
from freezegun import freeze_time

from products.factories import (
    CategoryFactory,
    BrandFactory,
    FragranceFamilyFactory,
    ProductFactory,
    ProductVariantFactory,
)
from products.models import Product, Brand


PUBLIC_PRODUCTS_URL = "/api/products/products/"
ADMIN_PRODUCTS_URL = "/api/products/admin/products/"
ADMIN_VARIANTS_URL = "/api/products/admin/variants/"
ADMIN_CATEGORIES_URL = "/api/products/admin/categories/"
ADMIN_BRANDS_URL = "/api/products/admin/brands/"


pytestmark = pytest.mark.django_db


class TestPublicProductList:
    def test_anonymous_can_list_active_products(self, api_client):
        active = ProductFactory(is_active=True)
        inactive = ProductFactory(is_active=False)

        response = api_client.get(PUBLIC_PRODUCTS_URL)
        assert response.status_code == status.HTTP_200_OK
        results = response.data["results"]
        slugs = {item["slug"] for item in results}
        assert active.slug in slugs
        assert inactive.slug not in slugs

    def test_filter_by_category_slug(self, api_client):
        category = CategoryFactory(name_ar="فئة اختبار", slug="test-category")
        other_category = CategoryFactory(name_ar="فئة أخرى", slug="other-category")
        product = ProductFactory(categories=[category])
        ProductFactory(categories=[other_category])

        response = api_client.get(
            PUBLIC_PRODUCTS_URL, {"categories__slug": category.slug}
        )
        assert response.status_code == status.HTTP_200_OK
        results = response.data["results"]
        assert len(results) == 1
        assert results[0]["slug"] == product.slug

    def test_filter_by_brand_slug(self, api_client):
        brand = BrandFactory(name_ar="ماركة اختبار", slug="test-brand")
        other_brand = BrandFactory(name_ar="ماركة أخرى", slug="other-brand")
        product = ProductFactory(brand=brand)
        ProductFactory(brand=other_brand)

        response = api_client.get(PUBLIC_PRODUCTS_URL, {"brand__slug": brand.slug})
        assert response.status_code == status.HTTP_200_OK
        results = response.data["results"]
        assert len(results) == 1
        assert results[0]["slug"] == product.slug

    def test_search_by_name_ar_and_description(self, api_client):
        ProductFactory(name_ar="عطر خاص", description="وصف غير مطابق")
        ProductFactory(name_ar="اسم عادي", description="عطر فاخر في الوصف")
        ProductFactory(name_ar="منتج آخر", description="وصف مختلف")

        response = api_client.get(PUBLIC_PRODUCTS_URL, {"search": "عطر"})
        assert response.status_code == status.HTTP_200_OK
        results = response.data["results"]
        assert len(results) == 2

    def test_inactive_products_excluded_from_public_list(self, api_client):
        ProductFactory(is_active=False)

        response = api_client.get(PUBLIC_PRODUCTS_URL)
        assert response.status_code == status.HTTP_200_OK
        results = response.data["results"]
        assert all(item["is_active"] for item in results)


class TestPublicProductRetrieve:
    def test_retrieve_by_slug(self, api_client):
        product = ProductFactory()

        response = api_client.get(f"{PUBLIC_PRODUCTS_URL}{product.slug}/")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["slug"] == product.slug
        assert response.data["name_ar"] == product.name_ar

    def test_related_action_returns_shared_category_products(self, api_client):
        category = CategoryFactory()
        product = ProductFactory(categories=[category])
        related = ProductFactory.create_batch(3, categories=[category])
        ProductFactory(categories=[category], is_active=False)
        ProductFactory()

        response = api_client.get(f"{PUBLIC_PRODUCTS_URL}{product.slug}/related/")
        assert response.status_code == status.HTTP_200_OK
        related_slugs = {item["slug"] for item in response.data}
        assert product.slug not in related_slugs
        assert len(response.data) == 3
        for item in related:
            assert item.slug in related_slugs

    def test_related_action_returns_max_four_products(self, api_client):
        category = CategoryFactory()
        product = ProductFactory(categories=[category])
        ProductFactory.create_batch(6, categories=[category])

        response = api_client.get(f"{PUBLIC_PRODUCTS_URL}{product.slug}/related/")
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 4


class TestAdminProductPermissions:
    def test_admin_list_requires_admin_user(self, api_client, authenticated_client):
        response = api_client.get(ADMIN_PRODUCTS_URL)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

        response = authenticated_client.get(ADMIN_PRODUCTS_URL)
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_admin_client_can_list_products(self, admin_client):
        ProductFactory()

        response = admin_client.get(ADMIN_PRODUCTS_URL)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] >= 1


class TestAdminProductCRUD:
    def test_admin_can_create_product_with_categories_and_brand(self, admin_client):
        category = CategoryFactory()
        brand = BrandFactory()

        payload = {
            "name_ar": "عطر جديد",
            "slug": "new-perfume",
            "description": "وصف العطر الجديد",
            "categories": [category.id],
            "brand": brand.id,
            "gender": "unisex",
            "is_active": True,
        }

        response = admin_client.post(ADMIN_PRODUCTS_URL, payload, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["name_ar"] == payload["name_ar"]
        assert category.id in response.data["categories"]
        assert response.data["brand"] == brand.id

    def test_admin_product_detail_uses_numeric_id(self, admin_client):
        product = ProductFactory()

        response = admin_client.get(f"{ADMIN_PRODUCTS_URL}{product.id}/")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["id"] == product.id

    def test_admin_product_update_uses_numeric_id(self, admin_client):
        product = ProductFactory(name_ar="اسم قديم")

        response = admin_client.patch(
            f"{ADMIN_PRODUCTS_URL}{product.id}/",
            {"name_ar": "اسم جديد"},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.data["name_ar"] == "اسم جديد"

    def test_admin_product_delete_uses_numeric_id(self, admin_client):
        product = ProductFactory()

        response = admin_client.delete(f"{ADMIN_PRODUCTS_URL}{product.id}/")
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Product.objects.filter(pk=product.pk).exists()

    def test_admin_product_list_filter_by_category_id(self, admin_client):
        category = CategoryFactory()
        other_category = CategoryFactory()
        product = ProductFactory(categories=[category])
        ProductFactory(categories=[other_category])

        response = admin_client.get(ADMIN_PRODUCTS_URL, {"categories": category.id})
        assert response.status_code == status.HTTP_200_OK
        results = response.data["results"]
        assert len(results) == 1
        assert results[0]["id"] == product.id


class TestProductVariant:
    def test_discount_percentage_zero_when_no_sale_price(self):
        variant = ProductVariantFactory(sale_price=None)
        assert variant.discount_percentage == 0

    def test_discount_percentage_greater_than_zero_when_sale_price_lt_price(self):
        variant = ProductVariantFactory(price=200, sale_price=150)
        assert variant.discount_percentage == 25


class TestModelOrdering:
    def test_product_meta_ordering_is_most_recent_first(self, api_client):
        with freeze_time("2026-01-01"):
            oldest = ProductFactory(slug="oldest")
        with freeze_time("2026-01-03"):
            newest = ProductFactory(slug="newest")
        with freeze_time("2026-01-02"):
            middle = ProductFactory(slug="middle")

        response = api_client.get(PUBLIC_PRODUCTS_URL)
        assert response.status_code == status.HTTP_200_OK
        slugs = [item["slug"] for item in response.data["results"]]
        assert slugs == ["newest", "middle", "oldest"]

    def test_brand_meta_ordering_is_name_ar(self, api_client):
        BrandFactory(name_ar="ماركة ب")
        BrandFactory(name_ar="ماركة أ")
        BrandFactory(name_ar="ماركة ت")

        response = api_client.get("/api/products/brands/")
        assert response.status_code == status.HTTP_200_OK
        names = [item["name_ar"] for item in response.data["results"]]
        assert names == ["ماركة أ", "ماركة ب", "ماركة ت"]
