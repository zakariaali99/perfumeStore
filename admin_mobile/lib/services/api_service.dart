import 'package:get/get.dart';
import '../api/dio_client.dart';
import '../api/auth_api_client.dart';
import '../api/analytics_api_client.dart';
import '../api/orders_api_client.dart';
import '../api/products_api_client.dart';
import '../api/crm_api_client.dart';
import '../api/categories_api_client.dart';
import '../api/brands_api_client.dart';
import '../api/coupons_api_client.dart';
import '../api/cms_api_client.dart';
import '../api/backup_api_client.dart';
import 'auth_service.dart';

class ApiService extends GetxService {
  late final DioClient _dioClient;
  late final AuthApiClient _authClient;
  late final AnalyticsApiClient _analyticsClient;
  late final OrdersApiClient _ordersClient;
  late final ProductsApiClient _productsClient;
  late final CrmApiClient _crmClient;
  late final CategoriesApiClient _categoriesClient;
  late final BrandsApiClient _brandsClient;
  late final CouponsApiClient _couponsClient;
  late final CmsApiClient _cmsClient;
  late final BackupApiClient _backupClient;

  Future<ApiService> init() async {
    final authService = Get.find<AuthService>();
    _dioClient = DioClient(authService);
    
    final dio = _dioClient.dio;
    _authClient = AuthApiClient(dio);
    _analyticsClient = AnalyticsApiClient(dio);
    _ordersClient = OrdersApiClient(dio);
    _productsClient = ProductsApiClient(dio);
    _crmClient = CrmApiClient(dio);
    _categoriesClient = CategoriesApiClient(dio);
    _brandsClient = BrandsApiClient(dio);
    _couponsClient = CouponsApiClient(dio);
    _cmsClient = CmsApiClient(dio);
    _backupClient = BackupApiClient(dio);

    return this;
  }

  AuthApiClient get auth => _authClient;
  AnalyticsApiClient get analytics => _analyticsClient;
  OrdersApiClient get orders => _ordersClient;
  ProductsApiClient get products => _productsClient;
  CrmApiClient get crm => _crmClient;
  CategoriesApiClient get categories => _categoriesClient;
  BrandsApiClient get brands => _brandsClient;
  CouponsApiClient get coupons => _couponsClient;
  CmsApiClient get cms => _cmsClient;
  BackupApiClient get backup => _backupClient;
  
  DioClient get dioClient => _dioClient;
}
