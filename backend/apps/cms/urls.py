from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    HeroSlideViewSet, BannerViewSet, StoreSettingsViewSet,
    HomePageSectionViewSet
)

router = DefaultRouter()
router.register('slides', HeroSlideViewSet)
router.register('banners', BannerViewSet)
router.register('settings', StoreSettingsViewSet, basename='settings')
router.register('sections', HomePageSectionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
