from django.test import RequestFactory
from products.views import AdminProductViewSet
from users.models import CustomUser

request = RequestFactory().get('/api/products/admin/products/')
user = CustomUser.objects.filter(is_superuser=True).first()
if user:
    request.user = user
    try:
        response = AdminProductViewSet.as_view({'get': 'list'})(request)
        print("STATUS:", response.status_code)
        print("DATA:", getattr(response, 'data', 'No data'))
    except Exception as e:
        import traceback
        traceback.print_exc()
else:
    print("NO SUPERUSER")
