import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import '../models/product_model.dart';

part 'products_api_client.g.dart';

@RestApi()
abstract class ProductsApiClient {
  factory ProductsApiClient(Dio dio, {String baseUrl}) = _ProductsApiClient;

  @GET('products/admin/products/')
  Future<dynamic> getAdminProducts({
    @Query('search') String? search,
    @Query('category') int? categoryId,
    @Query('page') int? page,
  });

  @GET('products/admin/products/{id}/')
  Future<ProductModel> getAdminProductDetail(@Path('id') int id);

  @POST('products/admin/products/')
  Future<ProductModel> createProduct(@Body() Map<String, dynamic> body);

  @PATCH('products/admin/products/{id}/')
  Future<ProductModel> updateProduct(
    @Path('id') int id,
    @Body() Map<String, dynamic> body,
  );

  @DELETE('products/admin/products/{id}/')
  Future<void> deleteProduct(@Path('id') int id);

  @GET('products/admin/categories/')
  Future<List<CategoryModel>> getCategories();

  @GET('products/admin/brands/')
  Future<List<BrandModel>> getBrands();
}
