from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

User = get_user_model()
user = User.objects.filter(is_superuser=True).first()
if user:
    client = APIClient()
    client.force_authenticate(user=user)
    response = client.get('/api/products/admin/products/?search=&categories=&page=1&page_size=10', HTTP_HOST='localhost')
    print("STATUS:", response.status_code)
    if response.status_code != 200:
        print("DATA:", response.content.decode('utf-8'))
else:
    print("NO USER")
