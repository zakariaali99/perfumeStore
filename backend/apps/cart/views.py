from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Cart, CartItem
from .serializers import CartSerializer, CartItemSerializer
from products.models import ProductVariant


class CartViewSet(viewsets.ModelViewSet):
    serializer_class = CartSerializer
    queryset = Cart.objects.all()
    permission_classes = [permissions.AllowAny]
    authentication_classes = []
    http_method_names = ['get', 'post', 'patch', 'delete']

    def retrieve(self, request, *args, **kwargs):
        return Response({'detail': 'Not allowed'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

    def update(self, request, *args, **kwargs):
        return Response({'detail': 'Not allowed'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

    def partial_update(self, request, *args, **kwargs):
        return Response({'detail': 'Not allowed'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

    def destroy(self, request, *args, **kwargs):
        return Response({'detail': 'Not allowed'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

    def get_cart(self):
        if self.request.user.is_authenticated:
            cart, created = Cart.objects.get_or_create(user=self.request.user)
            return cart
        else:
            session_key = self.request.headers.get('X-Cart-Session')
            if session_key:
                session_key = session_key[:40]
            else:
                session_key = self.request.session.session_key
                if not session_key:
                    self.request.session.create()
                    session_key = self.request.session.session_key
            cart, created = Cart.objects.get_or_create(session_key=session_key)
            return cart

    def list(self, request, *args, **kwargs):
        cart = self.get_cart()
        serializer = self.get_serializer(cart)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def add_item(self, request):
        cart = self.get_cart()
        variant_id = request.data.get('variant_id')
        quantity_raw = request.data.get('quantity', 1)

        try:
            quantity = int(quantity_raw)
            if quantity < 1:
                raise ValueError
        except (ValueError, TypeError):
            return Response(
                {'error': 'Quantity must be a positive integer'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            variant = ProductVariant.objects.get(id=variant_id)
        except ProductVariant.DoesNotExist:
            return Response({'error': 'Variant not found'}, status=status.HTTP_404_NOT_FOUND)

        if quantity > variant.available_stock:
            return Response(
                {'error': f'Insufficient stock for {variant.product.name_ar}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        item, created = CartItem.objects.get_or_create(cart=cart, variant=variant)
        if not created:
            new_quantity = item.quantity + quantity
            if new_quantity > variant.available_stock:
                return Response(
                    {'error': f'Insufficient stock for {variant.product.name_ar}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            item.quantity = new_quantity
        else:
            item.quantity = quantity
        item.save()

        return Response(self.get_serializer(cart).data)

    @action(detail=False, methods=['patch'])
    def update_item(self, request):
        item_id = request.data.get('item_id')
        quantity_raw = request.data.get('quantity')

        if quantity_raw is None:
            return Response(
                {'error': 'Quantity is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            quantity = int(quantity_raw)
            if quantity < 1:
                raise ValueError
        except (ValueError, TypeError):
            return Response(
                {'error': 'Quantity must be a positive integer'},
                status=status.HTTP_400_BAD_REQUEST
            )

        cart = self.get_cart()
        try:
            item = CartItem.objects.select_related('variant').get(id=item_id, cart=cart)
            if quantity > item.variant.available_stock:
                return Response(
                    {'error': f'Insufficient stock for {item.variant.product.name_ar}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            item.quantity = quantity
            item.save()
        except CartItem.DoesNotExist:
            return Response({'error': 'Item not found'}, status=status.HTTP_404_NOT_FOUND)

        return Response(self.get_serializer(cart).data)

    @action(detail=False, methods=['delete', 'post'])
    def remove_item(self, request):
        item_id = request.data.get('item_id') or request.query_params.get('item_id')
        if not item_id:
            return Response({'error': 'Item ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            item = CartItem.objects.get(id=item_id, cart=self.get_cart())
            item.delete()
        except CartItem.DoesNotExist:
            return Response({'error': 'Item not found'}, status=status.HTTP_404_NOT_FOUND)

        return Response(self.get_serializer(self.get_cart()).data)

    @action(detail=False, methods=['delete'])
    def clear(self, request):
        cart = self.get_cart()
        cart.items.all().delete()
        return Response(self.get_serializer(cart).data)
