import os
import django
import sys

# add backend dir to sys.path
sys.path.append(os.path.abspath('backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.products.views import AdminProductViewSet
from django.test import RequestFactory
from apps.users.models import CustomUser

request = RequestFactory().get('/api/products/admin/products/')
user = CustomUser.objects.filter(is_superuser=True).first()
request.user = user

try:
    response = AdminProductViewSet.as_view({'get': 'list'})(request)
    print("STATUS", response.status_code)
except Exception as e:
    import traceback
    traceback.print_exc()
