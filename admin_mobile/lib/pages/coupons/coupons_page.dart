import 'dart:async';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../theme/app_theme.dart';
import '../../services/api_service.dart';
import '../../widgets/card_container.dart';
import '../../widgets/page_header.dart';
import '../../widgets/pagination_widget.dart';
import '../../widgets/gold_toggle.dart';
import '../../widgets/app_button.dart';
import '../../widgets/skeleton_loader.dart';

class CouponsPage extends StatefulWidget {
  const CouponsPage({super.key});

  @override
  State<CouponsPage> createState() => _CouponsPageState();
}

class _CouponsPageState extends State<CouponsPage> {
  bool _isLoading = true;
  List<Map<String, dynamic>> _coupons = [];
  int _currentPage = 1;
  int _totalPages = 1;

  bool _showForm = false;
  Map<String, dynamic>? _editingCoupon;
  final _formCodeController = TextEditingController();
  final _formValueController = TextEditingController();
  final _formMinPurchaseController = TextEditingController();
  final _formUsageLimitController = TextEditingController();
  String _formDiscountType = 'percentage';
  DateTime _formStartDate = DateTime.now();
  DateTime _formExpiryDate = DateTime.now().add(const Duration(days: 30));
  bool _formSubmitting = false;

  Timer? _debounce;

  static const int _pageSize = 10;

  @override
  void initState() {
    super.initState();
    _fetchCoupons();
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _formCodeController.dispose();
    _formValueController.dispose();
    _formMinPurchaseController.dispose();
    _formUsageLimitController.dispose();
    super.dispose();
  }

  Future<void> _fetchCoupons() async {
    setState(() => _isLoading = true);
    try {
      final apiService = Get.find<ApiService>();
      final response = await apiService.coupons.getAll();
      final List raw = response is List ? response : (response is Map ? (response['results'] ?? []) : []);
      setState(() {
        _coupons = raw.map((e) => e as Map<String, dynamic>).toList();
        _totalPages = (_coupons.length / _pageSize).ceil();
        if (_totalPages < 1) _totalPages = 1;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      Get.snackbar('خطأ', 'تعذر تحميل الكوبونات',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: AppColors.red600,
          colorText: AppColors.white);
    }
  }

  void _onPageChanged(int page) {
    setState(() => _currentPage = page);
  }

  void _openCreateForm() {
    setState(() {
      _editingCoupon = null;
      _formCodeController.clear();
      _formValueController.clear();
      _formMinPurchaseController.clear();
      _formUsageLimitController.clear();
      _formDiscountType = 'percentage';
      _formStartDate = DateTime.now();
      _formExpiryDate = DateTime.now().add(const Duration(days: 30));
      _showForm = true;
    });
  }

  void _openEditForm(Map<String, dynamic> coupon) {
    setState(() {
      _editingCoupon = coupon;
      _formCodeController.text = coupon['code'] ?? '';
      _formValueController.text = '${coupon['discount_value'] ?? ''}';
      _formMinPurchaseController.text = '${coupon['min_purchase'] ?? ''}';
      _formUsageLimitController.text = '${coupon['usage_limit'] ?? ''}';
      _formDiscountType = coupon['discount_type'] ?? 'percentage';
      _formStartDate = DateTime.tryParse(coupon['start_date'] ?? '') ?? DateTime.now();
      _formExpiryDate = DateTime.tryParse(coupon['expiry_date'] ?? '') ?? DateTime.now();
      _showForm = true;
    });
  }

  void _closeForm() {
    setState(() => _showForm = false);
  }

  Future<void> _submitForm() async {
    if (_formCodeController.text.trim().isEmpty) {
      Get.snackbar('تنبيه', 'الرجاء إدخال كود الكوبون',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: AppColors.amber600,
          colorText: AppColors.white);
      return;
    }
    setState(() => _formSubmitting = true);
    try {
      await Future.delayed(const Duration(milliseconds: 500));
      setState(() {
        _formSubmitting = false;
        _showForm = false;
      });
      Get.snackbar('نجاح', _editingCoupon != null ? 'تم تحديث الكوبون' : 'تم إضافة الكوبون',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: AppColors.emerald600,
          colorText: AppColors.white);
      _fetchCoupons();
    } catch (e) {
      setState(() => _formSubmitting = false);
      Get.snackbar('خطأ', 'تعذر حفظ الكوبون',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: AppColors.red600,
          colorText: AppColors.white);
    }
  }

  Future<void> _toggleActive(Map<String, dynamic> coupon) async {
    try {
      await Future.delayed(const Duration(milliseconds: 200));
      Get.snackbar('نجاح', 'تم تحديث حالة الكوبون',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: AppColors.emerald600,
          colorText: AppColors.white);
      _fetchCoupons();
    } catch (e) {
      Get.snackbar('خطأ', 'تعذر تحديث حالة الكوبون',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: AppColors.red600,
          colorText: AppColors.white);
    }
  }

  Future<void> _deleteCoupon(int id) async {
    final confirm = await Get.dialog<bool>(
      AlertDialog(
        title: Text('تأكيد الحذف',
            style: GoogleFonts.tajawal(fontWeight: FontWeight.w900)),
        content: Text('هل أنت متأكد من حذف هذا الكوبون؟',
            style: GoogleFonts.tajawal()),
        actions: [
          TextButton(
            onPressed: () => Get.back(result: false),
            child: Text('إلغاء',
                style: GoogleFonts.tajawal(color: AppColors.textMuted)),
          ),
          TextButton(
            onPressed: () => Get.back(result: true),
            child: Text('حذف',
                style: GoogleFonts.tajawal(
                    color: AppColors.red600, fontWeight: FontWeight.w900)),
          ),
        ],
      ),
    );
    if (confirm != true) return;
    try {
      await Future.delayed(const Duration(milliseconds: 300));
      Get.snackbar('نجاح', 'تم حذف الكوبون',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: AppColors.emerald600,
          colorText: AppColors.white);
      _fetchCoupons();
    } catch (e) {
      Get.snackbar('خطأ', 'تعذر حذف الكوبون',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: AppColors.red600,
          colorText: AppColors.white);
    }
  }

  List<Map<String, dynamic>> get _paginatedCoupons {
    final start = (_currentPage - 1) * _pageSize;
    if (start >= _coupons.length) return [];
    final end = (start + _pageSize).clamp(0, _coupons.length);
    return _coupons.sublist(start, end);
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Scaffold(
      body: Stack(
        children: [
          Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                PageHeader(
                  title: 'كوبونات الخصم',
                  subtitle: 'إدارة عروض وكوبونات التخفيض',
                  action: GoldButton(
                    label: 'إضافة كوبون',
                    icon: Icons.add,
                    isSmall: true,
                    onPressed: _openCreateForm,
                  ),
                ),
                const SizedBox(height: 24),
                Expanded(child: _buildGrid(isDark)),
                if (!_isLoading && _coupons.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.only(top: 24),
                    child: PaginationWidget(
                      currentPage: _currentPage,
                      totalPages: _totalPages,
                      onPageChanged: _onPageChanged,
                    ),
                  ),
              ],
            ),
          ),
          if (_showForm) _buildFormOverlay(isDark),
        ],
      ),
    );
  }

  Widget _buildGrid(bool isDark) {
    if (_isLoading) return const CardSkeleton(height: 200);
    if (_coupons.isEmpty) return _buildEmptyState(isDark);
    return GridView.builder(
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 0.75,
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
      ),
      itemCount: _paginatedCoupons.length,
      itemBuilder: (context, index) => _buildCouponCard(_paginatedCoupons[index], isDark),
    );
  }

  Widget _buildEmptyState(bool isDark) {
    return Center(
      child: Container(
        constraints: const BoxConstraints(maxWidth: 300),
        padding: const EdgeInsets.all(40),
        decoration: BoxDecoration(
          border: Border.all(color: AppColors.gold300, width: 2, style: BorderStyle.solid),
          borderRadius: BorderRadius.circular(40),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.local_offer_outlined, size: 48,
                color: isDark ? AppColors.textMuted : AppColors.gold300),
            const SizedBox(height: 12),
            Text('لا توجد كوبونات',
                style: GoogleFonts.tajawal(
                    fontSize: 16, fontWeight: FontWeight.w900,
                    color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondary)),
            const SizedBox(height: 4),
            Text('أضف كوبون خصم جديد لبدء العروض',
                style: GoogleFonts.tajawal(
                    fontSize: 12,
                    color: isDark ? AppColors.textSecondaryDark : AppColors.textMuted)),
          ],
        ),
      ),
    );
  }

  Widget _buildCouponCard(Map<String, dynamic> coupon, bool isDark) {
    final isActive = coupon['is_active'] == true;
    return Container(
      decoration: BoxDecoration(
        color: isDark ? AppColors.dark700 : AppColors.white,
        borderRadius: BorderRadius.circular(40),
        border: Border.all(color: AppColors.gold200, width: 1),
      ),
      clipBehavior: Clip.antiAlias,
      child: Stack(
        children: [
          Positioned(
            top: 0, right: 0,
            child: Container(
              width: 128, height: 128,
              decoration: BoxDecoration(
                color: isDark ? AppColors.dark600 : AppColors.gold50,
                borderRadius: const BorderRadius.only(
                  bottomLeft: Radius.circular(100),
                ),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    border: Border.all(color: AppColors.gold300, width: 2, style: BorderStyle.solid),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    coupon['code']?.toString().toUpperCase() ?? '',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.poppins(
                      fontSize: 13,
                      fontWeight: FontWeight.w900,
                      color: isDark ? AppColors.gold400 : AppColors.gold700,
                      letterSpacing: 2,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  coupon['discount_type'] == 'percentage'
                      ? '${coupon['discount_value'] ?? 0}%'
                      : '${coupon['discount_value'] ?? 0} ر.س',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.poppins(
                    fontSize: 28,
                    fontWeight: FontWeight.w900,
                    color: isDark ? AppColors.gold400 : AppColors.gold600,
                  ),
                ),
                const SizedBox(height: 8),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (coupon['min_purchase'] != null && (coupon['min_purchase'] as num) > 0)
                        Text('أقل طلب: ${coupon['min_purchase']} ر.س',
                            style: GoogleFonts.tajawal(
                                fontSize: 10,
                                color: isDark ? AppColors.textSecondaryDark : AppColors.textMuted)),
                      if (coupon['usage_limit'] != null)
                        Text('الحد الأقصى: ${coupon['usage_limit']}',
                            style: GoogleFonts.tajawal(
                                fontSize: 10,
                                color: isDark ? AppColors.textSecondaryDark : AppColors.textMuted)),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.only(top: 12),
                  decoration: BoxDecoration(
                    border: Border(
                      top: BorderSide(
                        color: isDark ? AppColors.dark600 : AppColors.gold100, width: 1),
                    ),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      GoldToggle(value: isActive, onChanged: (_) => _toggleActive(coupon)),
                      _actionButton(Icons.delete_outline, AppColors.red600, isDark,
                          () => _deleteCoupon(coupon['id'] as int)),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _actionButton(IconData icon, Color color, bool isDark, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: isDark ? AppColors.dark600 : AppColors.gray50,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Icon(icon, size: 18, color: color),
      ),
    );
  }

  Widget _buildFormOverlay(bool isDark) {
    return Stack(
      children: [
        GestureDetector(onTap: _closeForm, child: Container(color: Colors.black26)),
        Align(
          alignment: Alignment.centerLeft,
          child: GestureDetector(
            onTap: () {},
            child: Container(
              width: MediaQuery.of(context).size.width * 0.85,
              height: double.infinity,
              decoration: BoxDecoration(
                color: isDark ? AppColors.dark700 : AppColors.white,
                border: Border(
                  left: BorderSide(
                    color: isDark ? AppColors.dark600 : AppColors.gold200, width: 1),
                ),
              ),
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.dark800 : AppColors.cream50,
                      border: Border(
                        bottom: BorderSide(
                          color: isDark ? AppColors.dark600 : AppColors.gold100),
                      ),
                    ),
                    child: Row(
                      children: [
                        GestureDetector(
                          onTap: _closeForm,
                          child: Container(
                            width: 40, height: 40,
                            decoration: BoxDecoration(
                              color: isDark ? AppColors.dark600 : AppColors.gray50,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Icon(Icons.close, size: 18,
                                color: isDark ? AppColors.gold400 : AppColors.textSecondary),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Text(_editingCoupon != null ? 'تعديل الكوبون' : 'إضافة كوبون',
                            style: GoogleFonts.tajawal(
                                fontSize: 16, fontWeight: FontWeight.w900,
                                color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary)),
                      ],
                    ),
                  ),
                  Expanded(
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          _buildFormField('كود الكوبون', _formCodeController, isDark,
                              hint: 'أدخل كود الخصم',
                              style: GoogleFonts.poppins(
                                  color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary,
                                  fontSize: 16, fontWeight: FontWeight.w900, letterSpacing: 4)),
                          const SizedBox(height: 16),
                          Text('نوع الخصم',
                              style: GoogleFonts.tajawal(
                                  fontSize: 12, fontWeight: FontWeight.w900,
                                  color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary)),
                          const SizedBox(height: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            decoration: BoxDecoration(
                              color: isDark ? AppColors.dark800 : AppColors.cream50,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: isDark ? AppColors.dark600 : AppColors.gold100),
                            ),
                            child: DropdownButtonHideUnderline(
                              child: DropdownButton<String>(
                                value: _formDiscountType,
                                isExpanded: true,
                                dropdownColor: isDark ? AppColors.dark700 : AppColors.white,
                                items: const [
                                  DropdownMenuItem(value: 'percentage', child: Text('نسبة مئوية')),
                                  DropdownMenuItem(value: 'fixed', child: Text('قيمة ثابتة')),
                                ],
                                onChanged: (v) => setState(() => _formDiscountType = v ?? 'percentage'),
                              ),
                            ),
                          ),
                          const SizedBox(height: 16),
                          _buildFormField('قيمة الخصم', _formValueController, isDark,
                              hint: _formDiscountType == 'percentage' ? 'مثال: 20' : 'مثال: 50'),
                          const SizedBox(height: 16),
                          _buildFormField('أقل قيمة للطلب', _formMinPurchaseController, isDark,
                              hint: '0 بدون حد أدنى'),
                          const SizedBox(height: 16),
                          _buildFormField('حد الاستخدام', _formUsageLimitController, isDark,
                              hint: 'عدد مرات الاستخدام القصوى'),
                          const SizedBox(height: 24),
                          _buildDatePicker('تاريخ البدء', _formStartDate, isDark, (d) {
                            setState(() => _formStartDate = d);
                          }),
                          const SizedBox(height: 16),
                          _buildDatePicker('تاريخ الانتهاء', _formExpiryDate, isDark, (d) {
                            setState(() => _formExpiryDate = d);
                          }),
                          const SizedBox(height: 32),
                          GoldButton(
                            label: _editingCoupon != null ? 'تحديث الكوبون' : 'إضافة الكوبون',
                            isLoading: _formSubmitting,
                            onPressed: _submitForm,
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildFormField(String label, TextEditingController controller, bool isDark,
      {String? hint, TextStyle? style}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label,
            style: GoogleFonts.tajawal(
                fontSize: 12, fontWeight: FontWeight.w900,
                color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary)),
        const SizedBox(height: 8),
        TextField(
          controller: controller,
          textDirection: TextDirection.ltr,
          style: style ?? GoogleFonts.tajawal(
              color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary,
              fontSize: 14, fontWeight: FontWeight.w700),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: GoogleFonts.tajawal(
                color: AppColors.textMuted, fontSize: 14, fontWeight: FontWeight.w700),
            filled: true,
            fillColor: isDark ? AppColors.dark800 : AppColors.cream50,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: BorderSide(color: isDark ? AppColors.dark600 : AppColors.gold100),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: BorderSide(color: isDark ? AppColors.dark600 : AppColors.gold100),
            ),
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          ),
        ),
      ],
    );
  }

  Widget _buildDatePicker(String label, DateTime date, bool isDark, ValueChanged<DateTime> onChanged) {
    return GestureDetector(
      onTap: () async {
        final picked = await showDatePicker(
          context: context,
          initialDate: date,
          firstDate: DateTime(2020),
          lastDate: DateTime(2030),
          locale: const Locale('ar'),
        );
        if (picked != null) onChanged(picked);
      },
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label,
              style: GoogleFonts.tajawal(
                  fontSize: 12, fontWeight: FontWeight.w900,
                  color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary)),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            decoration: BoxDecoration(
              color: isDark ? AppColors.dark800 : AppColors.cream50,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: isDark ? AppColors.dark600 : AppColors.gold100),
            ),
            child: Row(
              children: [
                Icon(Icons.calendar_today, size: 18,
                    color: isDark ? AppColors.gold400 : AppColors.textMuted),
                const SizedBox(width: 12),
                Text(
                  '${date.year}/${date.month.toString().padLeft(2, '0')}/${date.day.toString().padLeft(2, '0')}',
                  style: GoogleFonts.tajawal(
                      fontSize: 14, fontWeight: FontWeight.w700,
                      color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
