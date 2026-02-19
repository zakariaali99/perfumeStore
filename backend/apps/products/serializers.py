from rest_framework import serializers
from .models import Category, Brand, FragranceFamily, Product, ProductVariant, ProductNote, ProductImage

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = '__all__'

class FragranceFamilySerializer(serializers.ModelSerializer):
    class Meta:
        model = FragranceFamily
        fields = '__all__'

class ProductNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductNote
        fields = ['note_type', 'name_ar', 'icon']

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['image', 'alt_text', 'order']

class ProductVariantSerializer(serializers.ModelSerializer):
    discount_percentage = serializers.ReadOnlyField()
    product_name_ar = serializers.ReadOnlyField(source='product.name_ar')
    product_main_image = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductVariant
        fields = ['id', 'product', 'name', 'size_ml', 'price', 'sale_price', 'current_price', 'discount_percentage', 'stock_quantity', 'sku', 'image', 'is_active', 'product_name_ar', 'product_main_image']

    def get_product_main_image(self, obj):
        if obj.image:
            return obj.image.url
        if obj.product.main_image:
            return obj.product.main_image.url
        return None

class ProductListSerializer(serializers.ModelSerializer):
    categories = CategorySerializer(many=True, read_only=True)
    brand = BrandSerializer(read_only=True)
    min_price = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = ['id', 'name_ar', 'slug', 'categories', 'brand', 'main_image', 'min_price', 'gender', 'occasion', 'vibe', 'is_featured', 'is_new', 'is_active']

    def get_min_price(self, obj):
        variants = obj.variants.filter(is_active=True)
        if variants.exists():
            return min([v.current_price for v in variants])
        return None

class ProductDetailSerializer(serializers.ModelSerializer):
    fragrance_families = FragranceFamilySerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    notes = ProductNoteSerializer(many=True, read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = '__all__'
        extra_kwargs = {
            'description': {'required': False, 'allow_blank': True},
            'story': {'required': False, 'allow_blank': True},
            'main_image': {'required': False},
        }

    def to_representation(self, instance):
        """Return nested category/brand on read."""
        data = super().to_representation(instance)
        data['categories'] = CategorySerializer(instance.categories.all(), many=True).data
        data['brand'] = BrandSerializer(instance.brand).data if instance.brand else None
        return data
