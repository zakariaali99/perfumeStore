from rest_framework import serializers
from .models import Coupon

class CouponSerializer(serializers.ModelSerializer):
    is_valid_now = serializers.ReadOnlyField(source='is_valid')
    
    class Meta:
        model = Coupon
        fields = '__all__'
