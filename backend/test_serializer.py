from apps.products.models import Product
from apps.products.serializers import ProductDetailSerializer
from django.test import RequestFactory
from apps.products.views import AdminProductViewSet
from django.contrib.auth import get_user_model

print("Testing Model")
product = Product.objects.first()
if product:
    try:
        serializer = ProductDetailSerializer(product)
        print("KEYS:", serializer.data.keys())
        print("SUCCESS SERIALIZER")
    except Exception as e:
        import traceback
        traceback.print_exc()
else:
    print("NO PRODUCT FOUND")

print("Testing API Request")
request = RequestFactory().get('/api/products/admin/products/')
User = get_user_model()
user = User.objects.filter(is_superuser=True).first()
if user:
    request.user = user
    try:
        response = AdminProductViewSet.as_view({'get': 'list'})(request)
        response.render()
        print("STATUS:", response.status_code)
    except Exception as e:
        import traceback
        traceback.print_exc()
else:
    print("NO SUPERUSER")
