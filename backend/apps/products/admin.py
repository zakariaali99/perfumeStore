from django.contrib import admin
from .models import Category, Brand, FragranceFamily, Product, ProductVariant, ProductNote, ProductImage


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1


class ProductNoteInline(admin.TabularInline):
    model = ProductNote
    extra = 1


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name_ar', 'slug', 'order', 'is_active']
    list_editable = ['order', 'is_active']
    search_fields = ['name_ar', 'slug']


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ['name_ar', 'slug', 'is_active']
    list_editable = ['is_active']
    search_fields = ['name_ar', 'slug']


@admin.register(FragranceFamily)
class FragranceFamilyAdmin(admin.ModelAdmin):
    list_display = ['name_ar', 'icon', 'color']
    search_fields = ['name_ar']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name_ar', 'slug', 'brand', 'gender', 'is_active', 'is_featured', 'is_new', 'created_at']
    list_filter = ['is_active', 'is_featured', 'is_new', 'gender', 'categories', 'brand']
    search_fields = ['name_ar', 'slug', 'description']
    filter_horizontal = ['categories', 'fragrance_families']
    inlines = [ProductVariantInline, ProductNoteInline, ProductImageInline]


@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    list_display = ['product', 'name', 'size_ml', 'price', 'sale_price', 'stock_quantity', 'is_active']
    list_filter = ['is_active']
    search_fields = ['product__name_ar', 'sku', 'barcode']
