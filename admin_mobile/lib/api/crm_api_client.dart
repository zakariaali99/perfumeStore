import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import '../models/customer_model.dart';

part 'crm_api_client.g.dart';

@RestApi()
abstract class CrmApiClient {
  factory CrmApiClient(Dio dio, {String baseUrl}) = _CrmApiClient;

  @GET('crm/customers/')
  Future<dynamic> getCustomers({
    @Query('search') String? search,
    @Query('segment') String? segment,
    @Query('page') int? page,
  });

  @GET('crm/customers/{id}/')
  Future<CustomerProfileModel> getCustomerDetail(@Path('id') int id);
}
