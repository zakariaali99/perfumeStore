import factory
from crm.models import CustomerTag, CustomerProfile, CustomerInteraction


class CustomerTagFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = CustomerTag

    name = factory.Sequence(lambda n: f'تاج {n}')
    color = '#C5A572'


class CustomerProfileFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = CustomerProfile

    name = factory.Sequence(lambda n: f'عميل {n}')
    phone = factory.Sequence(lambda n: f'091{n:07d}')
    email = factory.Sequence(lambda n: f'customer{n}@example.com')
    city = 'طرابلس'
    segment = 'new'


class CustomerInteractionFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = CustomerInteraction

    customer = factory.SubFactory(CustomerProfileFactory)
    interaction_type = 'call'
    subject = 'متابعة'
    content = 'محتوى التواصل'
