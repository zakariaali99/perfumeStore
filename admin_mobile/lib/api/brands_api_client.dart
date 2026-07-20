import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';

part 'brands_api_client.g.dart';

@RestApi()
abstract class BrandsApiClient {
  factory BrandsApiClient(Dio dio, {String baseUrl}) = _BrandsApiClient;

  @GET('products/admin/brands/')
  Future<dynamic> getAll();

  @GET('products/admin/brands/{id}/')
  Future<dynamic> get(@Path('id') int id);

  @POST('products/admin/brands/')
  Future<dynamic> create(@Body() Map<String, dynamic> body);

  @PATCH('products/admin/brands/{id}/')
  Future<dynamic> update(@Path('id') int id, @Body() Map<String, dynamic> body);

  @DELETE('products/admin/brands/{id}/')
  Future<void> delete(@Path('id') int id);
}
