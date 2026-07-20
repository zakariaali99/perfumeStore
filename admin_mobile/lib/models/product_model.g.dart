// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'product_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

CategoryModel _$CategoryModelFromJson(Map<String, dynamic> json) =>
    CategoryModel(
      id: (json['id'] as num).toInt(),
      nameAr: json['name_ar'] as String,
      slug: json['slug'] as String,
      image: json['image'] as String?,
    );

Map<String, dynamic> _$CategoryModelToJson(CategoryModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name_ar': instance.nameAr,
      'slug': instance.slug,
      'image': instance.image,
    };

BrandModel _$BrandModelFromJson(Map<String, dynamic> json) => BrandModel(
  id: (json['id'] as num).toInt(),
  nameAr: json['name_ar'] as String,
  logo: json['logo'] as String?,
);

Map<String, dynamic> _$BrandModelToJson(BrandModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name_ar': instance.nameAr,
      'logo': instance.logo,
    };

ProductVariantModel _$ProductVariantModelFromJson(Map<String, dynamic> json) =>
    ProductVariantModel(
      id: (json['id'] as num).toInt(),
      sizeMl: (json['size_ml'] as num).toInt(),
      price: (json['price'] as num).toDouble(),
      costPrice: (json['cost_price'] as num?)?.toDouble(),
      stockQuantity: (json['stock_quantity'] as num).toInt(),
      sku: json['sku'] as String?,
    );

Map<String, dynamic> _$ProductVariantModelToJson(
  ProductVariantModel instance,
) => <String, dynamic>{
  'id': instance.id,
  'size_ml': instance.sizeMl,
  'price': instance.price,
  'cost_price': instance.costPrice,
  'stock_quantity': instance.stockQuantity,
  'sku': instance.sku,
};

ProductModel _$ProductModelFromJson(Map<String, dynamic> json) => ProductModel(
  id: (json['id'] as num).toInt(),
  nameAr: json['name_ar'] as String,
  slug: json['slug'] as String,
  category:
      json['category'] == null
          ? null
          : CategoryModel.fromJson(json['category'] as Map<String, dynamic>),
  brand:
      json['brand'] == null
          ? null
          : BrandModel.fromJson(json['brand'] as Map<String, dynamic>),
  gender: json['gender'] as String?,
  concentration: json['concentration'] as String?,
  isFeatured: json['is_featured'] as bool,
  isNew: json['is_new'] as bool,
  isActive: json['is_active'] as bool,
  variants:
      (json['variants'] as List<dynamic>?)
          ?.map((e) => ProductVariantModel.fromJson(e as Map<String, dynamic>))
          .toList(),
);

Map<String, dynamic> _$ProductModelToJson(ProductModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name_ar': instance.nameAr,
      'slug': instance.slug,
      'category': instance.category,
      'brand': instance.brand,
      'gender': instance.gender,
      'concentration': instance.concentration,
      'is_featured': instance.isFeatured,
      'is_new': instance.isNew,
      'is_active': instance.isActive,
      'variants': instance.variants,
    };
