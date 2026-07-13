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
        fields = [
            'id', 'name', 'size_ml', 'price', 'sale_price', 'current_price',
            'discount_percentage', 'stock_quantity', 'low_stock_threshold',
            'cost_price', 'sku', 'barcode', 'image', 'is_active',
            'product_name_ar', 'product_main_image'
        ]

    def get_product_main_image(self, obj):
        if obj.image:
            return obj.image.url
        if obj.product.main_image:
            return obj.product.main_image.url
        return None


class ProductListSerializer(serializers.ModelSerializer):
    categories = CategorySerializer(read_only=True, many=True)
    brand = BrandSerializer(read_only=True)
    min_price = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name_ar', 'slug', 'categories', 'brand', 'main_image',
            'min_price', 'is_featured', 'is_new', 'is_active', 'occasion', 'vibe'
        ]

    def get_min_price(self, obj):
        return getattr(obj, 'min_price', None)


class ProductDetailSerializer(serializers.ModelSerializer):
    categories = CategorySerializer(read_only=True, many=True)
    brand = BrandSerializer(read_only=True)
    fragrance_families = FragranceFamilySerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    notes = ProductNoteSerializer(many=True, read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = '__all__'


class AdminProductCreateSerializer(serializers.ModelSerializer):
    categories = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Category.objects.all(), required=False
    )
    brand = serializers.PrimaryKeyRelatedField(
        queryset=Brand.objects.all(), required=False, allow_null=True
    )
    fragrance_families = serializers.PrimaryKeyRelatedField(
        many=True, queryset=FragranceFamily.objects.all(), required=False
    )
    variants = ProductVariantSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name_ar', 'slug', 'description', 'story',
            'categories', 'brand', 'fragrance_families',
            'gender', 'occasion', 'vibe', 'main_image',
            'is_featured', 'is_bestseller', 'is_new', 'is_active',
            'variants'
        ]
