from decimal import Decimal
from rest_framework import viewsets, permissions, status, serializers
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Coupon
from .serializers import CouponSerializer


class CouponValidateSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=20)
    cart_total = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=0)


class CouponViewSet(viewsets.ModelViewSet):
    queryset = Coupon.objects.all()
    serializer_class = CouponSerializer
    lookup_field = 'code'

    def get_permissions(self):
        if self.action == 'validate':
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def validate(self, request):
        serializer = CouponValidateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        code = serializer.validated_data['code']
        cart_total = serializer.validated_data['cart_total']

        try:
            coupon = Coupon.objects.get(code=code)
        except Coupon.DoesNotExist:
            return Response({'valid': False, 'message': 'كوبون غير صالح'}, status=status.HTTP_200_OK)

        if not coupon.is_valid:
            return Response({'valid': False, 'message': 'الكوبون غير صالح حالياً'}, status=status.HTTP_200_OK)

        if coupon.min_order_amount and cart_total < coupon.min_order_amount:
            return Response({
                'valid': False,
                'message': f'الحد الأدنى للطلب {coupon.min_order_amount}'
            }, status=status.HTTP_200_OK)

        discount = cart_total * (coupon.discount_value / 100) if coupon.discount_type == 'percentage' else coupon.discount_value
        if coupon.max_discount_amount and discount > coupon.max_discount_amount:
            discount = coupon.max_discount_amount

        discount = discount.quantize(Decimal('0.01'))

        return Response({
            'valid': True,
            'discount_type': coupon.discount_type,
            'discount_value': str(coupon.discount_value),
            'max_discount': str(coupon.max_discount_amount) if coupon.max_discount_amount else None,
            'discount_amount': str(discount),
        })
