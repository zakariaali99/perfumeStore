import 'package:json_annotation/json_annotation.dart';

part 'customer_model.g.dart';

@JsonSerializable()
class CustomerProfileModel {
  final int id;
  @JsonKey(name: 'full_name')
  final String fullName;
  final String phone;
  final String? email;
  final String? city;
  @JsonKey(name: 'total_spent')
  final double totalSpent;
  @JsonKey(name: 'total_orders')
  final int totalOrders;
  final String segment;
  @JsonKey(name: 'last_order_date')
  final String? lastOrderDate;

  CustomerProfileModel({
    required this.id,
    required this.fullName,
    required this.phone,
    this.email,
    this.city,
    required this.totalSpent,
    required this.totalOrders,
    required this.segment,
    this.lastOrderDate,
  });

  factory CustomerProfileModel.fromJson(Map<String, dynamic> json) => _$CustomerProfileModelFromJson(json);
  Map<String, dynamic> toJson() => _$CustomerProfileModelToJson(this);

  String get segmentArabic {
    switch (segment) {
      case 'VIP':
        return 'عميل مميز (VIP)';
      case 'Regular':
        return 'عميل منتظم';
      case 'New':
        return 'عميل جديد';
      case 'Inactive':
        return 'عميل غير نشط';
      default:
        return segment;
    }
  }
}
