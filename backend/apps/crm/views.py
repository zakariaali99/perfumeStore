from rest_framework import viewsets, filters, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import CustomerProfile, CustomerTag, CustomerInteraction
from .serializers import (
    CustomerProfileSerializer, 
    CustomerProfileDetailSerializer,
    CustomerTagSerializer, 
    CustomerInteractionSerializer
)

class CustomerTagViewSet(viewsets.ModelViewSet):
    queryset = CustomerTag.objects.all()
    serializer_class = CustomerTagSerializer
    permission_classes = [permissions.IsAdminUser]

class CustomerInteractionViewSet(viewsets.ModelViewSet):
    queryset = CustomerInteraction.objects.all()
    serializer_class = CustomerInteractionSerializer
    permission_classes = [permissions.IsAdminUser]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['customer', 'interaction_type', 'created_by']
    ordering_fields = ['created_at']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class CustomerProfileViewSet(viewsets.ModelViewSet):
    queryset = CustomerProfile.objects.all()
    permission_classes = [permissions.IsAdminUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['segment', 'city', 'tags']
    search_fields = ['name', 'phone', 'email']
    ordering_fields = ['total_spent', 'total_orders', 'last_order_date', 'created_at']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CustomerProfileDetailSerializer
        return CustomerProfileSerializer

    @action(detail=True, methods=['post'])
    def add_interaction(self, request, pk=None):
        customer = self.get_object()
        serializer = CustomerInteractionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(customer=customer, created_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def segments_stats(self, request):
        from django.db.models import Count
        stats = list(CustomerProfile.objects.values('segment').annotate(count=Count('id')))
        return Response(stats)
