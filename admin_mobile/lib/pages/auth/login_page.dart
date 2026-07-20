import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../services/api_service.dart';
import '../../services/auth_service.dart';
import '../../theme/app_theme.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _formKey = GlobalKey<FormState>();
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  final _urlController = TextEditingController();
  
  bool _isLoading = false;
  bool _obscurePassword = true;
  bool _showUrlConfig = false;

  @override
  void initState() {
    super.initState();
    final authService = Get.find<AuthService>();
    _urlController.text = authService.baseUrl.value;
  }

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    _urlController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      final authService = Get.find<AuthService>();
      
      // Update base URL if changed
      if (_urlController.text.trim().isNotEmpty) {
        await authService.saveBaseUrl(_urlController.text.trim());
      }
      
      final apiService = Get.find<ApiService>();
      final response = await apiService.auth.login({
        'username': _usernameController.text.trim(),
        'password': _passwordController.text,
      });

      if (!response.user.isStaff) {
        Get.snackbar(
          'خطأ في الصلاحيات',
          'هذا التطبيق مخصص للإدارة فقط.',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: Colors.redAccent,
          colorText: Colors.white,
        );
        setState(() => _isLoading = false);
        return;
      }

      await authService.saveTokens(
        access: response.access,
        refresh: response.refresh,
      );
      await authService.saveUser(response.user.toJson());

      Get.offAllNamed('/main-nav');
    } catch (e) {
      Get.snackbar(
        'فشل التسجيل',
        'اسم المستخدم أو كلمة المرور غير صحيحة.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.redAccent,
        colorText: Colors.white,
      );
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24.0),
            child: Form(
              key: _formKey,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Image.asset(
                    'assets/images/logo.png',
                    height: 100,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'تسجيل الدخول للإدارة',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: isDark ? AppTheme.goldPrimary : AppTheme.textPrimaryLight,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'مرحباً بك في لوحة تحكم متجر مصطفى',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 14,
                      color: isDark ? AppTheme.goldLight.withOpacity(0.7) : AppTheme.textSecondaryLight,
                    ),
                  ),
                  const SizedBox(height: 36),

                  // Username Field
                  TextFormField(
                    controller: _usernameController,
                    decoration: const InputDecoration(
                      labelText: 'اسم المستخدم',
                      prefixIcon: Icon(Icons.person_outline),
                    ),
                    validator: (v) => (v == null || v.trim().isEmpty) ? 'الرجاء أدخل اسم المستخدم' : null,
                  ),
                  const SizedBox(height: 16),

                  // Password Field
                  TextFormField(
                    controller: _passwordController,
                    obscureText: _obscurePassword,
                    decoration: InputDecoration(
                      labelText: 'كلمة المرور',
                      prefixIcon: const Icon(Icons.lock_outline),
                      suffixIcon: IconButton(
                        icon: Icon(_obscurePassword ? Icons.visibility_off : Icons.visibility),
                        onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                      ),
                    ),
                    validator: (v) => (v == null || v.isEmpty) ? 'الرجاء أدخل كلمة المرور' : null,
                  ),
                  const SizedBox(height: 24),

                  // Login Button
                  ElevatedButton(
                    onPressed: _isLoading ? null : _handleLogin,
                    child: _isLoading
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                          )
                        : const Text('دخول'),
                  ),

                  const SizedBox(height: 20),

                  // Expandable API Settings for Server URL
                  TextButton.icon(
                    onPressed: () => setState(() => _showUrlConfig = !_showUrlConfig),
                    icon: const Icon(Icons.settings, size: 18),
                    label: const Text('إعدادات الاتصال بالسيرفر'),
                  ),

                  if (_showUrlConfig) ...[
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _urlController,
                      decoration: const InputDecoration(
                        labelText: 'رابط الـ API (Base URL)',
                        hintText: 'http://127.0.0.1:8000/api/',
                        prefixIcon: Icon(Icons.link),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
