from django.db.models import Min, Case, When, F, DecimalField
from rest_framework import viewsets, filters, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category, Brand, FragranceFamily, Product, ProductVariant
from .serializers import (
    CategorySerializer, BrandSerializer, FragranceFamilySerializer,
    ProductListSerializer, ProductDetailSerializer, ProductVariantSerializer
)

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

class BrandViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Brand.objects.filter(is_active=True)
    serializer_class = BrandSerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = {
        'category': ['exact'],
        'brand': ['exact'],
        'gender': ['exact'],
        'is_featured': ['exact'],
        'is_new': ['exact'],
    }
    search_fields = ['name_ar', 'description']
    ordering_fields = ['created_at', 'sales_count', 'view_count', 'min_price']
    lookup_field = 'slug'

    def get_queryset(self):
        # Annotate min_price for sorting
        return Product.objects.filter(is_active=True).annotate(
            min_price=Min(
                Case(
                    When(variants__sale_price__isnull=False, then=F('variants__sale_price')),
                    default=F('variants__price'),
                    output_field=DecimalField()
                )
            )
        ).select_related('category', 'brand').prefetch_related('variants')

    @action(detail=True, methods=['get'])
    def related(self, request, slug=None):
        product = self.get_object()
        related = Product.objects.filter(
            category=product.category,
            is_active=True
        ).exclude(id=product.id)[:4]
        serializer = ProductListSerializer(related, many=True)
        return Response(serializer.data)

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductListSerializer

class AdminProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    permission_classes = [permissions.IsAdminUser]
    serializer_class = ProductDetailSerializer

class AdminVariantViewSet(viewsets.ModelViewSet):
    queryset = ProductVariant.objects.all()
    permission_classes = [permissions.IsAdminUser]
    serializer_class = ProductVariantSerializer
