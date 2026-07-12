from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import HeroSlideViewSet, BannerViewSet, StoreSettingsViewSet

router = DefaultRouter()
router.register('slides', HeroSlideViewSet)
router.register('banners', BannerViewSet)
router.register('settings', StoreSettingsViewSet, basename='settings')

urlpatterns = [
    path('', include(router.urls)),
]
