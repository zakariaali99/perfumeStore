import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';

part 'categories_api_client.g.dart';

@RestApi()
abstract class CategoriesApiClient {
  factory CategoriesApiClient(Dio dio, {String baseUrl}) = _CategoriesApiClient;

  @GET('products/admin/categories/')
  Future<dynamic> getAll();

  @GET('products/admin/categories/{id}/')
  Future<dynamic> get(@Path('id') int id);

  @POST('products/admin/categories/')
  Future<dynamic> create(@Body() Map<String, dynamic> body);

  @PATCH('products/admin/categories/{id}/')
  Future<dynamic> update(@Path('id') int id, @Body() Map<String, dynamic> body);

  @DELETE('products/admin/categories/{id}/')
  Future<void> delete(@Path('id') int id);
}
