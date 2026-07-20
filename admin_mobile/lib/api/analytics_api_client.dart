import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import '../models/analytics_model.dart';
import '../models/product_model.dart';

part 'analytics_api_client.g.dart';

@RestApi()
abstract class AnalyticsApiClient {
  factory AnalyticsApiClient(Dio dio, {String baseUrl}) = _AnalyticsApiClient;

  @GET('analytics/stats/')
  Future<AnalyticsStatsModel> getStats();

  @GET('analytics/inventory/')
  Future<List<ProductVariantModel>> getLowStockInventory();
}
