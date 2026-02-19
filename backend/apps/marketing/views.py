from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Coupon
from .serializers import CouponSerializer
from django.utils import timezone

class CouponViewSet(viewsets.ModelViewSet):
    queryset = Coupon.objects.all()
    serializer_class = CouponSerializer
    lookup_field = 'code'
    def get_permissions(self):
        if self.action == 'validate' or (self.request.method == 'POST' and 'validate' in self.request.path):
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    @action(detail=False, methods=['post'])
    def validate(self, request):
        code = request.data.get('code')
        cart_total = float(request.data.get('cart_total', 0))
        
        try:
            coupon = Coupon.objects.get(code=code)
            if not coupon.is_valid:
                return Response({'valid': False, 'message': 'الكوبون منتهي الصلاحية أو غير نشط'}, status=status.HTTP_400_BAD_REQUEST)
            
            if cart_total < coupon.min_order_amount:
                return Response({
                    'valid': False, 
                    'message': f'الحد الأدنى للطلب لاستخدام هذا الكوبون هو {coupon.min_order_amount}'
                }, status=status.HTTP_400_BAD_REQUEST)
                
            return Response({
                'valid': True,
                'discount_type': coupon.discount_type,
                'discount_value': coupon.discount_value,
                'max_discount': coupon.max_discount_amount
            })
            
        except Coupon.DoesNotExist:
            return Response({'valid': False, 'message': 'الكوبون غير صحيح'}, status=status.HTTP_404_NOT_FOUND)
