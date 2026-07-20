import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import '../models/order_model.dart';

part 'orders_api_client.g.dart';

@RestApi()
abstract class OrdersApiClient {
  factory OrdersApiClient(Dio dio, {String baseUrl}) = _OrdersApiClient;

  @GET('orders/')
  Future<dynamic> getOrders({
    @Query('status') String? status,
    @Query('search') String? search,
    @Query('page') int? page,
  });

  @GET('orders/{number}/')
  Future<OrderModel> getOrderDetail(@Path('number') String orderNumber);

  @PATCH('orders/{id}/update_status/')
  Future<OrderModel> updateOrderStatus(
    @Path('id') int id,
    @Body() Map<String, dynamic> body,
  );
}
