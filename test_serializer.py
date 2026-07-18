from products.models import Product
from products.serializers import ProductDetailSerializer

product = Product.objects.first()
if product:
    try:
        serializer = ProductDetailSerializer(product)
        print("KEYS:", serializer.data.keys())
        print("SUCCESS")
    except Exception as e:
        import traceback
        traceback.print_exc()
else:
    print("NO PRODUCT FOUND")
