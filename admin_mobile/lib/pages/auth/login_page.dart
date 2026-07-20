import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../config/dimensions.dart';
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
          backgroundColor: AppColors.red600,
          colorText: AppColors.white,
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
        backgroundColor: AppColors.red600,
        colorText: AppColors.white,
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
      backgroundColor: isDark ? AppColors.dark900 : AppColors.cream50,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(Dimens.pagePadding),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 400),
              child: Card(
                color: isDark ? AppColors.dark700 : AppColors.white,
                elevation: 0,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(Dimens.radius32),
                  side: BorderSide(
                    color: isDark ? AppColors.dark600 : AppColors.gold200,
                    width: 1,
                  ),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(Dimens.pagePadding),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Center(
                          child: Image.asset(
                            'assets/images/logo.png',
                            width: 100,
                            height: 100,
                          ),
                        ),
                        const SizedBox(height: 20),
                        Text(
                          'تسجيل الدخول',
                          textAlign: TextAlign.center,
                          style: GoogleFonts.tajawal(
                            fontSize: 24,
                            fontWeight: FontWeight.w900,
                            color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'لوحة تحكم متجر مصطفى',
                          textAlign: TextAlign.center,
                          style: GoogleFonts.tajawal(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: isDark
                                ? AppColors.textSecondaryDark.withValues(alpha: 0.7)
                                : AppColors.textSecondary,
                          ),
                        ),
                        const SizedBox(height: 32),

                        // Username Field
                        TextFormField(
                          controller: _usernameController,
                          textDirection: TextDirection.rtl,
                          style: GoogleFonts.tajawal(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary,
                          ),
                          decoration: InputDecoration(
                            hintText: 'اسم المستخدم',
                            hintTextDirection: TextDirection.rtl,
                            filled: true,
                            fillColor: isDark ? AppColors.dark800 : AppColors.cream50,
                            contentPadding: const EdgeInsets.symmetric(
                              horizontal: Dimens.inputPaddingH,
                              vertical: Dimens.inputPaddingV,
                            ),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(Dimens.radius2xl),
                              borderSide: BorderSide(
                                color: isDark ? AppColors.dark600 : AppColors.gold100,
                              ),
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(Dimens.radius2xl),
                              borderSide: BorderSide(
                                color: isDark ? AppColors.dark600 : AppColors.gold100,
                              ),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(Dimens.radius2xl),
                              borderSide: const BorderSide(
                                color: AppColors.gold500,
                                width: 1.5,
                              ),
                            ),
                          ),
                          validator: (v) =>
                              (v == null || v.trim().isEmpty) ? 'الرجاء أدخل اسم المستخدم' : null,
                        ),
                        const SizedBox(height: 16),

                        // Password Field
                        TextFormField(
                          controller: _passwordController,
                          obscureText: _obscurePassword,
                          textDirection: TextDirection.rtl,
                          style: GoogleFonts.tajawal(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary,
                          ),
                          decoration: InputDecoration(
                            hintText: 'كلمة المرور',
                            hintTextDirection: TextDirection.rtl,
                            filled: true,
                            fillColor: isDark ? AppColors.dark800 : AppColors.cream50,
                            contentPadding: const EdgeInsets.symmetric(
                              horizontal: Dimens.inputPaddingH,
                              vertical: Dimens.inputPaddingV,
                            ),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(Dimens.radius2xl),
                              borderSide: BorderSide(
                                color: isDark ? AppColors.dark600 : AppColors.gold100,
                              ),
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(Dimens.radius2xl),
                              borderSide: BorderSide(
                                color: isDark ? AppColors.dark600 : AppColors.gold100,
                              ),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(Dimens.radius2xl),
                              borderSide: const BorderSide(
                                color: AppColors.gold500,
                                width: 1.5,
                              ),
                            ),
                            suffixIcon: IconButton(
                              icon: Icon(
                                _obscurePassword ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                                color: AppColors.textMuted,
                                size: 20,
                              ),
                              onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                            ),
                          ),
                          validator: (v) =>
                              (v == null || v.isEmpty) ? 'الرجاء أدخل كلمة المرور' : null,
                        ),
                        const SizedBox(height: 28),

                        // Login Button
                        SizedBox(
                          height: 56,
                          child: ElevatedButton(
                            onPressed: _isLoading ? null : _handleLogin,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.gold600,
                              foregroundColor: AppColors.white,
                              elevation: 0,
                              disabledBackgroundColor: AppColors.gold600.withValues(alpha: 0.5),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(Dimens.radius2xl),
                              ),
                              padding: const EdgeInsets.symmetric(vertical: 16),
                            ),
                            child: _isLoading
                                ? const SizedBox(
                                    height: 22,
                                    width: 22,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2.5,
                                      color: AppColors.white,
                                    ),
                                  )
                                : Text(
                                    'دخول',
                                    style: GoogleFonts.tajawal(
                                      fontSize: 16,
                                      fontWeight: FontWeight.w900,
                                    ),
                                  ),
                          ),
                        ),
                        const SizedBox(height: 24),

                        // URL Config Toggle
                        Center(
                          child: TextButton.icon(
                            onPressed: () => setState(() => _showUrlConfig = !_showUrlConfig),
                            icon: Icon(
                              Icons.settings_outlined,
                              size: 18,
                              color: AppColors.textMuted,
                            ),
                            label: Text(
                              'إعدادات الاتصال بالسيرفر',
                              style: GoogleFonts.tajawal(
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
                                color: AppColors.textMuted,
                              ),
                            ),
                          ),
                        ),

                        if (_showUrlConfig) ...[
                          const SizedBox(height: 12),
                          TextFormField(
                            controller: _urlController,
                            textDirection: TextDirection.ltr,
                            style: GoogleFonts.poppins(
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary,
                            ),
                            decoration: InputDecoration(
                              hintText: 'http://127.0.0.1:8000/api/',
                              hintTextDirection: TextDirection.ltr,
                              filled: true,
                              fillColor: isDark ? AppColors.dark800 : AppColors.cream50,
                              contentPadding: const EdgeInsets.symmetric(
                                horizontal: Dimens.inputPaddingH,
                                vertical: Dimens.inputPaddingV,
                              ),
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(Dimens.radius2xl),
                                borderSide: BorderSide(
                                  color: isDark ? AppColors.dark600 : AppColors.gold100,
                                ),
                              ),
                              enabledBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(Dimens.radius2xl),
                                borderSide: BorderSide(
                                  color: isDark ? AppColors.dark600 : AppColors.gold100,
                                ),
                              ),
                              focusedBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(Dimens.radius2xl),
                                borderSide: const BorderSide(
                                  color: AppColors.gold500,
                                  width: 1.5,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
