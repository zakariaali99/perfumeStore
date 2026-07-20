import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';

part 'coupons_api_client.g.dart';

@RestApi()
abstract class CouponsApiClient {
  factory CouponsApiClient(Dio dio, {String baseUrl}) = _CouponsApiClient;

  @GET('marketing/coupons/')
  Future<dynamic> getAll({@Query('page') int? page});

  @GET('marketing/coupons/{id}/')
  Future<dynamic> get(@Path('id') int id);

  @POST('marketing/coupons/')
  Future<dynamic> create(@Body() Map<String, dynamic> body);

  @PATCH('marketing/coupons/{id}/')
  Future<dynamic> update(@Path('id') int id, @Body() Map<String, dynamic> body);

  @DELETE('marketing/coupons/{id}/')
  Future<void> delete(@Path('id') int id);
}
