from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CustomerProfileViewSet, CustomerTagViewSet, CustomerInteractionViewSet

router = DefaultRouter()
router.register(r'customers', CustomerProfileViewSet)
router.register(r'tags', CustomerTagViewSet)
router.register(r'interactions', CustomerInteractionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
