import 'dart:convert';
import 'package:get/get.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/constants.dart';

class AuthService extends GetxService {
  late final SharedPreferences _prefs;
  
  final RxBool isLoggedIn = false.obs;
  final RxString accessToken = ''.obs;
  final RxString refreshToken = ''.obs;
  final RxString baseUrl = AppConstants.defaultBaseUrl.obs;
  final RxMap<String, dynamic> currentUser = <String, dynamic>{}.obs;

  Future<AuthService> init() async {
    _prefs = await SharedPreferences.getInstance();
    
    // Load stored base URL or default
    baseUrl.value = _prefs.getString(AppConstants.baseUrlKey) ?? AppConstants.defaultBaseUrl;
    
    // Load tokens
    accessToken.value = _prefs.getString(AppConstants.tokenKey) ?? '';
    refreshToken.value = _prefs.getString(AppConstants.refreshTokenKey) ?? '';
    
    // Load user data
    final userStr = _prefs.getString(AppConstants.userKey);
    if (userStr != null && userStr.isNotEmpty) {
      try {
        currentUser.value = jsonDecode(userStr);
      } catch (_) {}
    }
    
    if (accessToken.value.isNotEmpty) {
      isLoggedIn.value = true;
    }
    
    return this;
  }

  Future<void> saveTokens({required String access, required String refresh}) async {
    accessToken.value = access;
    refreshToken.value = refresh;
    isLoggedIn.value = true;
    
    await _prefs.setString(AppConstants.tokenKey, access);
    await _prefs.setString(AppConstants.refreshTokenKey, refresh);
  }

  Future<void> saveUser(Map<String, dynamic> user) async {
    currentUser.value = user;
    await _prefs.setString(AppConstants.userKey, jsonEncode(user));
  }

  Future<void> saveBaseUrl(String newUrl) async {
    if (!newUrl.endsWith('/')) {
      newUrl = '$newUrl/';
    }
    baseUrl.value = newUrl;
    await _prefs.setString(AppConstants.baseUrlKey, newUrl);
  }

  Future<void> logout() async {
    accessToken.value = '';
    refreshToken.value = '';
    currentUser.clear();
    isLoggedIn.value = false;
    
    await _prefs.remove(AppConstants.tokenKey);
    await _prefs.remove(AppConstants.refreshTokenKey);
    await _prefs.remove(AppConstants.userKey);
    
    Get.offAllNamed('/login');
  }

  bool get isStaff => currentUser['is_staff'] == true;
}
