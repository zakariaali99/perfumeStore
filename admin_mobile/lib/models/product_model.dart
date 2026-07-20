import 'package:json_annotation/json_annotation.dart';

part 'product_model.g.dart';

@JsonSerializable()
class CategoryModel {
  final int id;
  @JsonKey(name: 'name_ar')
  final String nameAr;
  final String slug;
  final String? image;

  CategoryModel({
    required this.id,
    required this.nameAr,
    required this.slug,
    this.image,
  });

  factory CategoryModel.fromJson(Map<String, dynamic> json) => _$CategoryModelFromJson(json);
  Map<String, dynamic> toJson() => _$CategoryModelToJson(this);
}

@JsonSerializable()
class BrandModel {
  final int id;
  @JsonKey(name: 'name_ar')
  final String nameAr;
  final String? logo;

  BrandModel({
    required this.id,
    required this.nameAr,
    this.logo,
  });

  factory BrandModel.fromJson(Map<String, dynamic> json) => _$BrandModelFromJson(json);
  Map<String, dynamic> toJson() => _$BrandModelToJson(this);
}

@JsonSerializable()
class ProductVariantModel {
  final int id;
  @JsonKey(name: 'size_ml')
  final int sizeMl;
  final double price;
  @JsonKey(name: 'cost_price')
  final double? costPrice;
  @JsonKey(name: 'stock_quantity')
  final int stockQuantity;
  final String? sku;

  ProductVariantModel({
    required this.id,
    required this.sizeMl,
    required this.price,
    this.costPrice,
    required this.stockQuantity,
    this.sku,
  });

  factory ProductVariantModel.fromJson(Map<String, dynamic> json) => _$ProductVariantModelFromJson(json);
  Map<String, dynamic> toJson() => _$ProductVariantModelToJson(this);
}

@JsonSerializable()
class ProductModel {
  final int id;
  @JsonKey(name: 'name_ar')
  final String nameAr;
  final String slug;
  final CategoryModel? category;
  final BrandModel? brand;
  final String? gender;
  final String? concentration;
  @JsonKey(name: 'main_image')
  final String? mainImage;
  @JsonKey(name: 'min_price')
  final double? minPrice;
  @JsonKey(name: 'is_featured')
  final bool isFeatured;
  @JsonKey(name: 'is_new')
  final bool isNew;
  @JsonKey(name: 'is_active')
  final bool isActive;
  final List<ProductVariantModel>? variants;

  ProductModel({
    required this.id,
    required this.nameAr,
    required this.slug,
    this.category,
    this.brand,
    this.gender,
    this.concentration,
    this.mainImage,
    this.minPrice,
    required this.isFeatured,
    required this.isNew,
    required this.isActive,
    this.variants,
  });

  factory ProductModel.fromJson(Map<String, dynamic> json) => _$ProductModelFromJson(json);
  Map<String, dynamic> toJson() => _$ProductModelToJson(this);

  double get displayPrice {
    if (variants != null && variants!.isNotEmpty) {
      return variants!.first.price;
    }
    return 0.0;
  }

  int get totalStock {
    if (variants == null || variants!.isEmpty) return 0;
    return variants!.fold(0, (sum, v) => sum + v.stockQuantity);
  }
}
