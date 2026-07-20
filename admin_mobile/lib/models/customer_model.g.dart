// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'customer_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

CustomerProfileModel _$CustomerProfileModelFromJson(
  Map<String, dynamic> json,
) => CustomerProfileModel(
  id: (json['id'] as num).toInt(),
  fullName: json['full_name'] as String,
  phone: json['phone'] as String,
  email: json['email'] as String?,
  city: json['city'] as String?,
  totalSpent: (json['total_spent'] as num).toDouble(),
  totalOrders: (json['total_orders'] as num).toInt(),
  segment: json['segment'] as String,
  lastOrderDate: json['last_order_date'] as String?,
);

Map<String, dynamic> _$CustomerProfileModelToJson(
  CustomerProfileModel instance,
) => <String, dynamic>{
  'id': instance.id,
  'full_name': instance.fullName,
  'phone': instance.phone,
  'email': instance.email,
  'city': instance.city,
  'total_spent': instance.totalSpent,
  'total_orders': instance.totalOrders,
  'segment': instance.segment,
  'last_order_date': instance.lastOrderDate,
};
