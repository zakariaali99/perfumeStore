from rest_framework import serializers
from .models import CustomerProfile, CustomerTag, CustomerInteraction


class CustomerTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerTag
        fields = '__all__'


class CustomerInteractionSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()
    customer = serializers.PrimaryKeyRelatedField(
        queryset=CustomerProfile.objects.all(), required=False
    )

    class Meta:
        model = CustomerInteraction
        fields = '__all__'

    def get_created_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.get_full_name() or obj.created_by.username
        return None


class CustomerProfileSerializer(serializers.ModelSerializer):
    tags_display = CustomerTagSerializer(source='tags', many=True, read_only=True)
    interactions_count = serializers.IntegerField(read_only=True)

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
        return OrderSerializer(obj.orders.all().prefetch_related('items', 'status_history'), many=True).data
