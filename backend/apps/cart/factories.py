import factory
from cart.models import Cart, CartItem


class CartFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Cart

    session_key = factory.Sequence(lambda n: f'session{n:032d}')


class CartItemFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = CartItem

    cart = factory.SubFactory(CartFactory)
    variant = factory.SubFactory('products.factories.ProductVariantFactory')
    quantity = 1
