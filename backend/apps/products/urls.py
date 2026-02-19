from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, BrandViewSet, ProductViewSet, AdminProductViewSet, AdminVariantViewSet, AdminCategoryViewSet, AdminBrandViewSet

router = DefaultRouter()
router.register('categories', CategoryViewSet)
router.register('brands', BrandViewSet)
router.register('products', ProductViewSet, basename='product-public')
router.register('admin/products', AdminProductViewSet, basename='product-admin')
router.register('admin/variants', AdminVariantViewSet, basename='variant-admin')
router.register('admin/categories', AdminCategoryViewSet, basename='category-admin')
router.register('admin/brands', AdminBrandViewSet, basename='brand-admin')

urlpatterns = [
    path('', include(router.urls)),
]
