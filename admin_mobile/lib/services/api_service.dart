import 'package:get/get.dart';
import '../api/dio_client.dart';
import '../api/auth_api_client.dart';
import '../api/analytics_api_client.dart';
import '../api/orders_api_client.dart';
import '../api/products_api_client.dart';
import '../api/crm_api_client.dart';
import 'auth_service.dart';

class ApiService extends GetxService {
  late final DioClient _dioClient;
  late final AuthApiClient _authClient;
  late final AnalyticsApiClient _analyticsClient;
  late final OrdersApiClient _ordersClient;
  late final ProductsApiClient _productsClient;
  late final CrmApiClient _crmClient;

  Future<ApiService> init() async {
    final authService = Get.find<AuthService>();
    _dioClient = DioClient(authService);
    
    final dio = _dioClient.dio;
    _authClient = AuthApiClient(dio);
    _analyticsClient = AnalyticsApiClient(dio);
    _ordersClient = OrdersApiClient(dio);
    _productsClient = ProductsApiClient(dio);
    _crmClient = CrmApiClient(dio);

    return this;
  }

  AuthApiClient get auth => _authClient;
  AnalyticsApiClient get analytics => _analyticsClient;
  OrdersApiClient get orders => _ordersClient;
  ProductsApiClient get products => _productsClient;
  CrmApiClient get crm => _crmClient;
  
  DioClient get dioClient => _dioClient;
}
