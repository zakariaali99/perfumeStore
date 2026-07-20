import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import '../models/user_model.dart';

part 'auth_api_client.g.dart';

@RestApi()
abstract class AuthApiClient {
  factory AuthApiClient(Dio dio, {String baseUrl}) = _AuthApiClient;

  @POST('accounts/login/')
  Future<LoginResponse> login(@Body() Map<String, dynamic> credentials);

  @GET('accounts/me/')
  Future<UserModel> getMe();
}
