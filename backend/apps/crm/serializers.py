from rest_framework import serializers
from .models import CustomerProfile, CustomerTag, CustomerInteraction
from products.models import Brand, FragranceFamily

class CustomerTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerTag
        fields = '__all__'

class CustomerInteractionSerializer(serializers.ModelSerializer):
    created_by_name = serializers.ReadOnlyField(source='created_by.get_full_name')
    
    class Meta:
        model = CustomerInteraction
        fields = '__all__'

class CustomerProfileSerializer(serializers.ModelSerializer):
    tags_display = CustomerTagSerializer(source='tags', many=True, read_only=True)
    interactions_count = serializers.IntegerField(source='interactions.count', read_only=True)
    
    class Meta:
        model = CustomerProfile
        fields = '__all__'

class CustomerProfileDetailSerializer(CustomerProfileSerializer):
    interactions = CustomerInteractionSerializer(many=True, read_only=True)
    orders = serializers.SerializerMethodField()
    favorite_brands_display = serializers.StringRelatedField(source='favorite_brands', many=True)
    favorite_families_display = serializers.StringRelatedField(source='favorite_families', many=True)
    
    class Meta(CustomerProfileSerializer.Meta):
        fields = '__all__'

    def get_orders(self, obj):
        from orders.serializers import OrderSerializer
        from orders.models import Order
        orders = Order.objects.filter(customer=obj).order_by('-created_at')
        return OrderSerializer(orders, many=True).data
