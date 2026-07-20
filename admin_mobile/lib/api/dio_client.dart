import 'package:dio/dio.dart';
import 'package:logger/logger.dart';
import '../services/auth_service.dart';

class DioClient {
  late final Dio dio;
  final AuthService _authService;
  final Logger _logger = Logger(
    printer: PrettyPrinter(methodCount: 0, errorMethodCount: 5, lineLength: 50),
  );

  DioClient(this._authService) {
    dio = Dio(
      BaseOptions(
        baseUrl: _authService.baseUrl.value,
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 15),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          // Update baseUrl dynamically if changed
          options.baseUrl = _authService.baseUrl.value;
          
          final token = _authService.accessToken.value;
          if (token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          _logger.d('REQUEST[${options.method}] => PATH: ${options.path}');
          return handler.next(options);
        },
        onResponse: (response, handler) {
          _logger.d('RESPONSE[${response.statusCode}] => PATH: ${response.requestOptions.path}');
          return handler.next(response);
        },
        onError: (DioException err, handler) async {
          _logger.e('ERROR[${err.response?.statusCode}] => PATH: ${err.requestOptions.path}');
          
          // Token refresh logic on 401 Unauthorized
          if (err.response?.statusCode == 401 && err.requestOptions.path != 'accounts/login/' && err.requestOptions.path != 'accounts/token/refresh/') {
            final refreshToken = _authService.refreshToken.value;
            if (refreshToken.isNotEmpty) {
              try {
                _logger.i('Attempting token refresh...');
                final refreshResponse = await Dio().post(
                  '${_authService.baseUrl.value}accounts/token/refresh/',
                  data: {'refresh': refreshToken},
                );
                
                final newAccess = refreshResponse.data['access'];
                if (newAccess != null) {
                  await _authService.saveTokens(
                    access: newAccess,
                    refresh: refreshToken,
                  );
                  
                  // Retry original request with new token
                  final opts = err.requestOptions;
                  opts.headers['Authorization'] = 'Bearer $newAccess';
                  final cloneReq = await dio.request(
                    opts.path,
                    options: Options(
                      method: opts.method,
                      headers: opts.headers,
                    ),
                    data: opts.data,
                    queryParameters: opts.queryParameters,
                  );
                  return handler.resolve(cloneReq);
                }
              } catch (refreshErr) {
                _logger.e('Token refresh failed, logging out...');
                await _authService.logout();
              }
            } else {
              await _authService.logout();
            }
          }
          return handler.next(err);
        },
      ),
    );
  }
}
