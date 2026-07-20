// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'analytics_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AnalyticsStatsModel _$AnalyticsStatsModelFromJson(Map<String, dynamic> json) =>
    AnalyticsStatsModel(
      totalRevenue: (json['total_revenue'] as num).toDouble(),
      revenueGrowth: (json['revenue_growth'] as num?)?.toDouble(),
      totalOrders: (json['total_orders'] as num).toInt(),
      ordersGrowth: (json['orders_growth'] as num?)?.toDouble(),
      totalCustomers: (json['total_customers'] as num).toInt(),
      customersGrowth: (json['customers_growth'] as num?)?.toDouble(),
      averageOrderValue: (json['average_order_value'] as num).toDouble(),
      lowStockCount: (json['low_stock_count'] as num).toInt(),
    );

Map<String, dynamic> _$AnalyticsStatsModelToJson(
  AnalyticsStatsModel instance,
) => <String, dynamic>{
  'total_revenue': instance.totalRevenue,
  'revenue_growth': instance.revenueGrowth,
  'total_orders': instance.totalOrders,
  'orders_growth': instance.ordersGrowth,
  'total_customers': instance.totalCustomers,
  'customers_growth': instance.customersGrowth,
  'average_order_value': instance.averageOrderValue,
  'low_stock_count': instance.lowStockCount,
};
