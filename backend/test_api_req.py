import os
import django
import sys
sys.path.append(os.path.abspath('.'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from django.test import Client

User = get_user_model()
user = User.objects.filter(is_superuser=True).first()
if user:
    refresh = RefreshToken.for_user(user)
    token = str(refresh.access_token)
    print("GOT TOKEN:", token[:10])

    import requests
    headers = {'Authorization': f'Bearer {token}'}
    res = requests.get('http://localhost:8000/api/products/admin/products/', headers=headers)
    print("STATUS", res.status_code)
    print("RESPONSE", res.text[:500])
else:
    print("No user")
