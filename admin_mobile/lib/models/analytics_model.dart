import 'package:json_annotation/json_annotation.dart';

part 'analytics_model.g.dart';

@JsonSerializable()
class AnalyticsStatsModel {
  @JsonKey(name: 'total_revenue')
  final double totalRevenue;
  @JsonKey(name: 'revenue_growth')
  final double? revenueGrowth;
  @JsonKey(name: 'total_orders')
  final int totalOrders;
  @JsonKey(name: 'orders_growth')
  final double? ordersGrowth;
  @JsonKey(name: 'total_customers')
  final int totalCustomers;
  @JsonKey(name: 'customers_growth')
  final double? customersGrowth;
  @JsonKey(name: 'average_order_value')
  final double averageOrderValue;
  @JsonKey(name: 'low_stock_count')
  final int lowStockCount;

  AnalyticsStatsModel({
    required this.totalRevenue,
    this.revenueGrowth,
    required this.totalOrders,
    this.ordersGrowth,
    required this.totalCustomers,
    this.customersGrowth,
    required this.averageOrderValue,
    required this.lowStockCount,
  });

  factory AnalyticsStatsModel.fromJson(Map<String, dynamic> json) => _$AnalyticsStatsModelFromJson(json);
  Map<String, dynamic> toJson() => _$AnalyticsStatsModelToJson(this);
}
