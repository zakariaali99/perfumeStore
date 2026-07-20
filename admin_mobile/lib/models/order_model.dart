import 'package:json_annotation/json_annotation.dart';

part 'order_model.g.dart';

@JsonSerializable()
class OrderItemModel {
  final int id;
  @JsonKey(name: 'product_name')
  final String productName;
  @JsonKey(name: 'variant_size')
  final int variantSize;
  final int quantity;
  final double price;
  @JsonKey(name: 'total_price')
  final double totalPrice;

  OrderItemModel({
    required this.id,
    required this.productName,
    required this.variantSize,
    required this.quantity,
    required this.price,
    required this.totalPrice,
  });

  factory OrderItemModel.fromJson(Map<String, dynamic> json) => _$OrderItemModelFromJson(json);
  Map<String, dynamic> toJson() => _$OrderItemModelToJson(this);
}

@JsonSerializable()
class OrderModel {
  final int id;
  @JsonKey(name: 'order_number')
  final String orderNumber;
  @JsonKey(name: 'customer_name')
  final String customerName;
  @JsonKey(name: 'customer_phone')
  final String customerPhone;
  @JsonKey(name: 'customer_email')
  final String? customerEmail;
  final String city;
  final String area;
  final String address;
  final double subtotal;
  @JsonKey(name: 'shipping_cost')
  final double shippingCost;
  @JsonKey(name: 'discount_amount')
  final double discountAmount;
  final double total;
  final String status;
  final String? notes;
  @JsonKey(name: 'created_at')
  final String createdAt;
  final List<OrderItemModel>? items;

  OrderModel({
    required this.id,
    required this.orderNumber,
    required this.customerName,
    required this.customerPhone,
    this.customerEmail,
    required this.city,
    required this.area,
    required this.address,
    required this.subtotal,
    required this.shippingCost,
    required this.discountAmount,
    required this.total,
    required this.status,
    this.notes,
    required this.createdAt,
    this.items,
  });

  factory OrderModel.fromJson(Map<String, dynamic> json) => _$OrderModelFromJson(json);
  Map<String, dynamic> toJson() => _$OrderModelToJson(this);

  String get statusArabic {
    switch (status) {
      case 'pending':
        return 'قيد الانتظار';
      case 'processing':
        return 'قيد المعالجة';
      case 'shipped':
        return 'تم الشحن';
      case 'delivered':
        return 'تم التسليم';
      case 'cancelled':
        return 'ملغي';
      default:
        return status;
    }
  }
}
