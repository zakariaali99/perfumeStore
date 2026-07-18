from django.test import Client
from django.contrib.auth import get_user_model

User = get_user_model()
user = User.objects.filter(is_superuser=True).first()
if user:
    c = Client()
    c.force_login(user)
    try:
        response = c.get('/api/products/admin/products/', HTTP_HOST='localhost')
        print("STATUS:", response.status_code)
        if response.status_code != 200:
            print("RESPONSE:", response.content.decode('utf-8'))
        else:
            print("KEYS:", response.json().keys() if hasattr(response, 'json') else 'No json')
    except Exception as e:
        import traceback
        traceback.print_exc()
else:
    print("NO USER")
