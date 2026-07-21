from rest_framework import serializers
from .models import Order, OrderItem, OrderStatusHistory


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = '__all__'


class OrderStatusHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderStatusHistory
        fields = '__all__'


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    status_history = OrderStatusHistorySerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ['order_number', 'status', 'subtotal', 'discount_amount', 'shipping_cost', 'total']


class OrderItemInputSerializer(serializers.Serializer):
    variant_id = serializers.IntegerField(min_value=1)
    quantity = serializers.IntegerField(min_value=1)


class OrderCreateSerializer(serializers.Serializer):
    customer_name = serializers.CharField(max_length=100)
    customer_phone = serializers.CharField(max_length=20)
    customer_email = serializers.EmailField(required=False, allow_blank=True, allow_null=True)
    birth_day = serializers.IntegerField(required=False, allow_null=True)
    birth_month = serializers.IntegerField(required=False, allow_null=True)
    birth_year = serializers.IntegerField(required=False, allow_null=True)
    city = serializers.CharField(max_length=100)
    area = serializers.CharField(required=False, allow_blank=True)
    address = serializers.CharField()
    location_details = serializers.CharField(required=False, allow_blank=True)
    notes = serializers.CharField(required=False, allow_blank=True)
    coupon_code = serializers.CharField(required=False, allow_blank=True)
    items = OrderItemInputSerializer(many=True, min_length=1)

    def to_internal_value(self, data):
        if isinstance(data, dict):
            data = data.copy()
            for field in ['birth_day', 'birth_month', 'birth_year']:
                val = data.get(field)
                if val == '' or val is None:
                    data[field] = None
                else:
                    try:
                        data[field] = int(val)
                    except (ValueError, TypeError):
                        data[field] = None
        return super().to_internal_value(data)
