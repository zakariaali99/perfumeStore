// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'order_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

OrderItemModel _$OrderItemModelFromJson(Map<String, dynamic> json) =>
    OrderItemModel(
      id: (json['id'] as num).toInt(),
      productName: json['product_name'] as String,
      variantSize: (json['variant_size'] as num).toInt(),
      quantity: (json['quantity'] as num).toInt(),
      price: (json['price'] as num).toDouble(),
      totalPrice: (json['total_price'] as num).toDouble(),
    );

Map<String, dynamic> _$OrderItemModelToJson(OrderItemModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'product_name': instance.productName,
      'variant_size': instance.variantSize,
      'quantity': instance.quantity,
      'price': instance.price,
      'total_price': instance.totalPrice,
    };

OrderModel _$OrderModelFromJson(Map<String, dynamic> json) => OrderModel(
  id: (json['id'] as num).toInt(),
  orderNumber: json['order_number'] as String,
  customerName: json['customer_name'] as String,
  customerPhone: json['customer_phone'] as String,
  customerEmail: json['customer_email'] as String?,
  city: json['city'] as String,
  area: json['area'] as String,
  address: json['address'] as String,
  subtotal: (json['subtotal'] as num).toDouble(),
  shippingCost: (json['shipping_cost'] as num).toDouble(),
  discountAmount: (json['discount_amount'] as num).toDouble(),
  total: (json['total'] as num).toDouble(),
  status: json['status'] as String,
  notes: json['notes'] as String?,
  createdAt: json['created_at'] as String,
  items:
      (json['items'] as List<dynamic>?)
          ?.map((e) => OrderItemModel.fromJson(e as Map<String, dynamic>))
          .toList(),
);

Map<String, dynamic> _$OrderModelToJson(OrderModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'order_number': instance.orderNumber,
      'customer_name': instance.customerName,
      'customer_phone': instance.customerPhone,
      'customer_email': instance.customerEmail,
      'city': instance.city,
      'area': instance.area,
      'address': instance.address,
      'subtotal': instance.subtotal,
      'shipping_cost': instance.shippingCost,
      'discount_amount': instance.discountAmount,
      'total': instance.total,
      'status': instance.status,
      'notes': instance.notes,
      'created_at': instance.createdAt,
      'items': instance.items,
    };
