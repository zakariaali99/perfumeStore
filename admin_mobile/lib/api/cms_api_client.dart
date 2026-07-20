import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';

part 'cms_api_client.g.dart';

@RestApi()
abstract class CmsApiClient {
  factory CmsApiClient(Dio dio, {String baseUrl}) = _CmsApiClient;

  @GET('cms/slides/')
  Future<dynamic> getSlides();

  @POST('cms/slides/')
  Future<dynamic> createSlide(@Body() Map<String, dynamic> body);

  @PATCH('cms/slides/{id}/')
  Future<dynamic> updateSlide(@Path('id') int id, @Body() Map<String, dynamic> body);

  @DELETE('cms/slides/{id}/')
  Future<void> deleteSlide(@Path('id') int id);

  @GET('cms/banners/')
  Future<dynamic> getBanners();

  @POST('cms/banners/')
  Future<dynamic> createBanner(@Body() Map<String, dynamic> body);

  @PATCH('cms/banners/{id}/')
  Future<dynamic> updateBanner(@Path('id') int id, @Body() Map<String, dynamic> body);

  @DELETE('cms/banners/{id}/')
  Future<void> deleteBanner(@Path('id') int id);

  @GET('cms/settings/')
  Future<dynamic> getSettings();

  @PATCH('cms/settings/{id}/')
  Future<dynamic> updateSettings(@Path('id') int id, @Body() Map<String, dynamic> body);

  @GET('cms/sections/')
  Future<dynamic> getSections();

  @PATCH('cms/sections/{id}/')
  Future<dynamic> updateSection(@Path('id') int id, @Body() Map<String, dynamic> body);
}
