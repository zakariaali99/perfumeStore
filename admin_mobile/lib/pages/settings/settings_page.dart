import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../services/auth_service.dart';
import '../../theme/app_theme.dart';
import '../../widgets/app_button.dart';
import '../../widgets/card_container.dart';
import '../../widgets/gold_toggle.dart';

class SettingsPage extends StatefulWidget {
  const SettingsPage({super.key});

  @override
  State<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  final _storeNameController = TextEditingController();
  final _storeEmailController = TextEditingController();
  final _storePhoneController = TextEditingController();
  final _addressController = TextEditingController();
  final _shippingCostController = TextEditingController();
  final _freeShippingThresholdController = TextEditingController();
  final _facebookController = TextEditingController();
  final _instagramController = TextEditingController();
  final _tiktokController = TextEditingController();
  final _whatsappController = TextEditingController();
  final _emailController = TextEditingController();

  final _isSaving = false.obs;
  final _storeActive = true.obs;
  final _showPrices = true.obs;
  final _directOrder = false.obs;

  @override
  void dispose() {
    _storeNameController.dispose();
    _storeEmailController.dispose();
    _storePhoneController.dispose();
    _addressController.dispose();
    _shippingCostController.dispose();
    _freeShippingThresholdController.dispose();
    _facebookController.dispose();
    _instagramController.dispose();
    _tiktokController.dispose();
    _whatsappController.dispose();
    _emailController.dispose();
    super.dispose();
  }

  Future<void> _saveSettings() async {
    _isSaving.value = true;
    await Future.delayed(const Duration(seconds: 1));
    _isSaving.value = false;
    if (mounted) {
      Get.snackbar(
        'تم الحفظ',
        'تم حفظ الإعدادات بنجاح',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: AppColors.green600,
        colorText: AppColors.white,
      );
    }
  }

  void _confirmLogout() {
    Get.dialog(
      AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(32)),
        title: const Text('تسجيل الخروج'),
        content: const Text('هل أنت متأكد من رغبتك في تسجيل الخروج؟'),
        actions: [
          TextButton(
            onPressed: () => Get.back(),
            child: Text(
              'إلغاء',
              style: GoogleFonts.tajawal(
                color: AppColors.textSecondary,
                fontWeight: FontWeight.w900,
              ),
            ),
          ),
          TextButton(
            onPressed: () {
              Get.back();
              Get.find<AuthService>().logout();
            },
            child: Text(
              'تسجيل الخروج',
              style: GoogleFonts.tajawal(
                color: AppColors.red600,
                fontWeight: FontWeight.w900,
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final authService = Get.find<AuthService>();
    final user = authService.currentUser;

    return Scaffold(
      appBar: AppBar(
        title: const Text('إعدادات النظام'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // ── User Card ──
            CardContainerLg(
              padding: const EdgeInsets.all(24),
              borderRadius: 48,
              child: Row(
                children: [
                  Container(
                    width: 64,
                    height: 64,
                    decoration: const BoxDecoration(
                      color: AppColors.gold50,
                      shape: BoxShape.circle,
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      (user['username'] as String? ?? 'مدير').substring(0, 2).toUpperCase(),
                      style: GoogleFonts.tajawal(
                        fontSize: 20,
                        fontWeight: FontWeight.w900,
                        color: AppColors.gold600,
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          user['username'] ?? 'مدير النظام',
                          style: GoogleFonts.tajawal(
                            fontSize: 18,
                            fontWeight: FontWeight.w900,
                            color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          user['email'] ?? 'admin@almostafas.com',
                          style: GoogleFonts.tajawal(
                            fontSize: 13,
                            color: isDark ? AppColors.gold400 : AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // ── Section 1: Store Info ──
            CardContainerLg(
              padding: const EdgeInsets.all(40),
              borderRadius: 48,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.store, size: 22, color: AppColors.gold500),
                      const SizedBox(width: 12),
                      Text(
                        'معلومات المتجر',
                        style: GoogleFonts.tajawal(
                          fontSize: 20,
                          fontWeight: FontWeight.w900,
                          color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 32),
                  _buildLabel('اسم المتجر', isDark),
                  const SizedBox(height: 8),
                  _buildInput(controller: _storeNameController, isDark: isDark),
                  const SizedBox(height: 24),
                  _buildLabel('البريد الإلكتروني', isDark),
                  const SizedBox(height: 8),
                  _buildInput(controller: _storeEmailController, isDark: isDark),
                  const SizedBox(height: 24),
                  _buildLabel('هاتف التواصل', isDark),
                  const SizedBox(height: 8),
                  _buildInput(
                    controller: _storePhoneController,
                    isDark: isDark,
                    prefixIcon: Icons.phone,
                    prefixIconColor: AppColors.gold500,
                  ),
                  const SizedBox(height: 24),
                  _buildLabel('العنوان الفعلي', isDark),
                  const SizedBox(height: 8),
                  _buildInput(
                    controller: _addressController,
                    isDark: isDark,
                    maxLines: 4,
                    prefixIcon: Icons.location_on,
                    prefixIconColor: AppColors.gold500,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // ── Section 2: Delivery Settings ──
            CardContainerLg(
              padding: const EdgeInsets.all(40),
              borderRadius: 48,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.local_shipping, size: 22, color: AppColors.gold500),
                      const SizedBox(width: 12),
                      Text(
                        'إعدادات التوصيل',
                        style: GoogleFonts.tajawal(
                          fontSize: 20,
                          fontWeight: FontWeight.w900,
                          color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 32),
                  _buildLabel('تكلفة الشحن الثابتة', isDark),
                  const SizedBox(height: 8),
                  _buildInput(
                    controller: _shippingCostController,
                    isDark: isDark,
                    isNumber: true,
                    suffix: _buildSuffixLabel('د.ل', isDark),
                  ),
                  const SizedBox(height: 24),
                  _buildLabel('الطلب المجاني عند', isDark),
                  const SizedBox(height: 8),
                  _buildInput(
                    controller: _freeShippingThresholdController,
                    isDark: isDark,
                    isNumber: true,
                    suffix: _buildSuffixLabel('د.ل', isDark),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // ── Section 3: Social Links ──
            CardContainerLg(
              padding: const EdgeInsets.all(40),
              borderRadius: 48,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.language, size: 22, color: AppColors.gold500),
                      const SizedBox(width: 12),
                      Text(
                        'قنوات التواصل الاجتماعي',
                        style: GoogleFonts.tajawal(
                          fontSize: 20,
                          fontWeight: FontWeight.w900,
                          color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 32),
                  _buildLabelWithIcon('فيسبوك', Icons.facebook, AppColors.blue600, isDark),
                  const SizedBox(height: 8),
                  _buildInput(controller: _facebookController, isDark: isDark),
                  const SizedBox(height: 24),
                  _buildLabelWithIcon('انستغرام', Icons.camera_alt, AppColors.rose600, isDark),
                  const SizedBox(height: 8),
                  _buildInput(controller: _instagramController, isDark: isDark),
                  const SizedBox(height: 24),
                  _buildLabelWithIcon('تيك توك', Icons.music_note, isDark ? AppColors.white : AppColors.black, isDark),
                  const SizedBox(height: 8),
                  _buildInput(controller: _tiktokController, isDark: isDark),
                  const SizedBox(height: 24),
                  _buildLabelWithIcon('واتساب', Icons.chat, AppColors.green600, isDark),
                  const SizedBox(height: 8),
                  _buildInput(controller: _whatsappController, isDark: isDark),
                  const SizedBox(height: 24),
                  _buildLabelWithIcon('البريد الإلكتروني للإدارة', Icons.email, AppColors.red600, isDark),
                  const SizedBox(height: 8),
                  _buildInput(controller: _emailController, isDark: isDark),
                  const SizedBox(height: 32),
                  Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.dark900.withValues(alpha: 0.25) : AppColors.gold50,
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(
                        color: isDark ? AppColors.dark600 : AppColors.gold200,
                      ),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: isDark ? AppColors.dark700 : AppColors.white,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: isDark ? AppColors.dark600 : AppColors.gold200,
                            ),
                          ),
                          child: Icon(Icons.verified_user, size: 24, color: AppColors.gold600),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Text(
                            'تأكد من صحة الروابط المدخلة حيث سيتم عرضها لعملاء المتجر في الفوتر وصفحة تواصل معنا.',
                            style: GoogleFonts.tajawal(
                              fontSize: 12,
                              fontWeight: FontWeight.w900,
                              color: isDark ? AppColors.gold400 : AppColors.textSecondary,
                              height: 1.5,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // ── Section 4: General Settings ──
            CardContainerLg(
              padding: const EdgeInsets.all(40),
              borderRadius: 48,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.settings, size: 22, color: AppColors.gold500),
                      const SizedBox(width: 12),
                      Text(
                        'الإعدادات العامة',
                        style: GoogleFonts.tajawal(
                          fontSize: 20,
                          fontWeight: FontWeight.w900,
                          color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 32),
                  _buildToggleRow('تفعيل المتجر', _storeActive, isDark),
                  const SizedBox(height: 12),
                  _buildToggleRow('إظهار الأسعار', _showPrices, isDark),
                  const SizedBox(height: 12),
                  _buildToggleRow('الطلب المباشر', _directOrder, isDark),
                ],
              ),
            ),
            const SizedBox(height: 32),

            // ── Save Button ──
            Obx(() => GoldButton(
              label: 'حفظ الإعدادات',
              icon: Icons.save,
              onPressed: _saveSettings,
              isLoading: _isSaving.value,
              width: double.infinity,
            )),
            const SizedBox(height: 32),

            // ── App Info ──
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: isDark ? AppColors.dark700 : AppColors.white,
                borderRadius: BorderRadius.circular(32),
                border: Border.all(
                  color: isDark ? AppColors.dark600 : AppColors.gold200,
                  width: 1,
                ),
              ),
              child: Column(
                children: [
                  _buildInfoRow('إصدار التطبيق', '1.0.0+1', isDark),
                  const Divider(height: 24, color: AppColors.gold100),
                  _buildInfoRow('اسم الحزمة', 'com.mostafasstore.admin', isDark),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // ── Logout Button ──
            DangerButton(
              label: 'تسجيل الخروج',
              icon: Icons.logout,
              onPressed: _confirmLogout,
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildLabel(String text, bool isDark) {
    return Padding(
      padding: const EdgeInsets.only(right: 4),
      child: Text(
        text,
        style: GoogleFonts.tajawal(
          fontSize: 13,
          fontWeight: FontWeight.w900,
          color: isDark ? AppColors.gold400 : AppColors.textSecondary,
        ),
      ),
    );
  }

  Widget _buildLabelWithIcon(String text, IconData icon, Color iconColor, bool isDark) {
    return Padding(
      padding: const EdgeInsets.only(right: 4),
      child: Row(
        children: [
          Icon(icon, size: 18, color: iconColor),
          const SizedBox(width: 8),
          Text(
            text,
            style: GoogleFonts.tajawal(
              fontSize: 13,
              fontWeight: FontWeight.w900,
              color: isDark ? AppColors.gold400 : AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInput({
    required TextEditingController controller,
    required bool isDark,
    IconData? prefixIcon,
    Color? prefixIconColor,
    Widget? suffix,
    int? maxLines,
    bool isNumber = false,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: isDark ? AppColors.dark800 : AppColors.cream50,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isDark ? AppColors.dark600 : AppColors.gold100,
        ),
      ),
      child: TextField(
        controller: controller,
        maxLines: maxLines ?? 1,
        minLines: maxLines != null ? 1 : null,
        keyboardType: isNumber ? TextInputType.number : TextInputType.text,
        textDirection: TextDirection.ltr,
        style: GoogleFonts.tajawal(
          fontSize: 14,
          fontWeight: FontWeight.w900,
          color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary,
        ),
        decoration: InputDecoration(
          border: InputBorder.none,
          contentPadding: EdgeInsets.only(
            right: prefixIcon != null ? 44 : 20,
            left: suffix != null ? 44 : 20,
            top: 16,
            bottom: 16,
          ),
          prefixIcon: prefixIcon != null
              ? Padding(
                  padding: const EdgeInsets.only(right: 16, left: 8),
                  child: Icon(prefixIcon, size: 18, color: prefixIconColor ?? AppColors.gold500),
                )
              : null,
          suffixIcon: suffix != null
              ? Padding(
                  padding: const EdgeInsets.only(left: 16, right: 8),
                  child: suffix,
                )
              : null,
          hintStyle: GoogleFonts.tajawal(
            color: AppColors.textMuted,
            fontSize: 14,
          ),
        ),
      ),
    );
  }

  Widget _buildSuffixLabel(String text, bool isDark) {
    return Text(
      text,
      style: GoogleFonts.tajawal(
        fontSize: 11,
        fontWeight: FontWeight.w900,
        color: AppColors.gold600,
      ),
    );
  }

  Widget _buildToggleRow(String label, RxBool value, bool isDark) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      decoration: BoxDecoration(
        color: isDark ? AppColors.dark800 : AppColors.cream50,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isDark ? AppColors.dark600 : AppColors.gold100,
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: GoogleFonts.tajawal(
              fontSize: 14,
              fontWeight: FontWeight.w900,
              color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary,
            ),
          ),
          Obx(() => GoldToggle(
            value: value.value,
            onChanged: (v) => value.value = v,
          )),
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value, bool isDark) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: GoogleFonts.tajawal(
            fontSize: 13,
            color: isDark ? AppColors.gold400 : AppColors.textSecondary,
          ),
        ),
        Text(
          value,
          style: GoogleFonts.tajawal(
            fontSize: 13,
            fontWeight: FontWeight.w900,
            color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary,
          ),
        ),
      ],
    );
  }
}
