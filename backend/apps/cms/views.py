from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import HeroSlide, Banner, StoreSettings, HomePageSection
from .serializers import (
    HeroSlideSerializer, BannerSerializer, StoreSettingsSerializer,
    HomePageSectionSerializer
)


class HeroSlideViewSet(viewsets.ModelViewSet):
    queryset = HeroSlide.objects.all()
    serializer_class = HeroSlideSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def get_queryset(self):
        if self.request.user.is_staff:
            return HeroSlide.objects.all()
        return HeroSlide.objects.filter(is_active=True)


class BannerViewSet(viewsets.ModelViewSet):
    queryset = Banner.objects.all()
    serializer_class = BannerSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Banner.objects.all()
        return Banner.objects.filter(is_active=True)


class StoreSettingsViewSet(viewsets.ModelViewSet):
    queryset = StoreSettings.objects.all()
    serializer_class = StoreSettingsSerializer
    http_method_names = ['get', 'post', 'patch']

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def list(self, request, *args, **kwargs):
        settings, created = StoreSettings.objects.get_or_create(pk=1)
        serializer = self.get_serializer(settings)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        return Response(
            {'error': 'Method not allowed'},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )


class HomePageSectionViewSet(viewsets.ModelViewSet):
    queryset = HomePageSection.objects.all()
    serializer_class = HomePageSectionSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def get_queryset(self):
        if self.request.user.is_staff:
            return HomePageSection.objects.all()
        return HomePageSection.objects.filter(is_active=True)
