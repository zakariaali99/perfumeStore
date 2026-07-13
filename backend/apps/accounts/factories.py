import factory
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import User


class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User

    username = factory.Sequence(lambda n: f'user_{n}')
    email = factory.Sequence(lambda n: f'user{n}@example.com')
    password = make_password('testpass123')
    first_name = 'Test'
    last_name = 'User'

    class Params:
        admin = factory.Trait(is_staff=True, is_superuser=True)
