class AppConstants {
  static const String appName = 'متجر مصطفى - لوحة التحكم';
  
  // Base API URL
  // Default to localhost for development / iOS simulator
  // Can be changed to http://10.0.2.2:8000/api/ for Android emulator
  static const String defaultBaseUrl = 'http://127.0.0.1:8000/api/';
  
  // Storage Keys
  static const String tokenKey = 'access_token';
  static const String refreshTokenKey = 'refresh_token';
  static const String userKey = 'user_data';
  static const String baseUrlKey = 'custom_base_url';
}
