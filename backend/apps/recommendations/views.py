from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from products.models import Product
from products.serializers import ProductListSerializer
from .engine import RecommendationEngine

class RecommendationViewSet(viewsets.ViewSet):
    """
    ViewSet for product recommendations.
    Provides logic for:
    - similar (by product slug)
    - bought-together (by product slug)
    - personalized (for user)
    """
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['get'], url_path='similar/(?P<slug>[-\w]+)')
    def similar(self, request, slug=None):
        try:
            product = Product.objects.get(slug=slug)
            qs = RecommendationEngine.get_similar_products(product)
            serializer = ProductListSerializer(qs, many=True)
            return Response(serializer.data)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'], url_path='bought-together/(?P<slug>[-\w]+)')
    def bought_together(self, request, slug=None):
        try:
            product = Product.objects.get(slug=slug)
            qs = RecommendationEngine.get_bought_together(product)
            serializer = ProductListSerializer(qs, many=True)
            return Response(serializer.data)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'])
    def curated(self, request):
        """
        Curated list of New Arrivals + Featured + Bestsellers
        """
        new_arrivals = RecommendationEngine.get_new_arrivals(4)
        bestsellers = RecommendationEngine.get_bestsellers(4)
        
        return Response({
            'new_arrivals': ProductListSerializer(new_arrivals, many=True).data,
            'bestsellers': ProductListSerializer(bestsellers, many=True).data,
        })
