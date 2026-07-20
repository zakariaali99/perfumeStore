import 'dart:async';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../theme/app_theme.dart';
import '../../services/api_service.dart';
import '../../widgets/card_container.dart';
import '../../widgets/page_header.dart';
import '../../widgets/search_input.dart';
import '../../widgets/pagination_widget.dart';
import '../../widgets/gold_toggle.dart';
import '../../widgets/app_button.dart';
import '../../widgets/skeleton_loader.dart';

class BrandsPage extends StatefulWidget {
  const BrandsPage({super.key});

  @override
  State<BrandsPage> createState() => _BrandsPageState();
}

class _BrandsPageState extends State<BrandsPage> {
  bool _isLoading = true;
  List<Map<String, dynamic>> _brands = [];
  final _searchController = TextEditingController();
  int _currentPage = 1;
  int _totalPages = 1;

  bool _showForm = false;
  Map<String, dynamic>? _editingBrand;
  final _formNameArController = TextEditingController();
  final _formNameEnController = TextEditingController();
  final _formSlugController = TextEditingController();
  bool _formIsActive = true;
  File? _formLogo;
  bool _formSubmitting = false;

  Timer? _debounce;

  static const int _pageSize = 10;

  @override
  void initState() {
    super.initState();
    _fetchBrands();
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _searchController.dispose();
    _formNameArController.dispose();
    _formNameEnController.dispose();
    _formSlugController.dispose();
    super.dispose();
  }

  Future<void> _fetchBrands() async {
    setState(() => _isLoading = true);
    try {
      final apiService = Get.find<ApiService>();
      final response = await apiService.brands.getAll();
      final raw = (response is Map ? (response['results'] as List? ?? []) : (response as List? ?? []));
      setState(() {
        _brands = raw.map((e) => e as Map<String, dynamic>).toList();
        _totalPages = (_brands.length / _pageSize).ceil();
        if (_totalPages < 1) _totalPages = 1;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      Get.snackbar('خطأ', 'تعذر تحميل الماركات',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: AppColors.red600,
          colorText: AppColors.white);
    }
  }

  void _onSearchChanged(String query) {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 500), () {
      setState(() => _currentPage = 1);
      _fetchBrands();
    });
  }

  void _onPageChanged(int page) {
    setState(() => _currentPage = page);
  }

  void _openCreateForm() {
    setState(() {
      _editingBrand = null;
      _formNameArController.clear();
      _formNameEnController.clear();
      _formSlugController.clear();
      _formIsActive = true;
      _formLogo = null;
      _showForm = true;
    });
  }

  void _openEditForm(Map<String, dynamic> brand) {
    setState(() {
      _editingBrand = brand;
      _formNameArController.text = brand['name_ar'] ?? '';
      _formNameEnController.text = brand['name_en'] ?? '';
      _formSlugController.text = brand['slug'] ?? '';
      _formIsActive = brand['is_active'] ?? true;
      _formLogo = null;
      _showForm = true;
    });
  }

  void _closeForm() {
    setState(() => _showForm = false);
  }

  Future<void> _submitForm() async {
    if (_formNameArController.text.trim().isEmpty) {
      Get.snackbar('تنبيه', 'الرجاء إدخال اسم الماركة بالعربية',
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
      Get.snackbar('نجاح', _editingBrand != null ? 'تم تحديث الماركة' : 'تم إضافة الماركة',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: AppColors.emerald600,
          colorText: AppColors.white);
      _fetchBrands();
    } catch (e) {
      setState(() => _formSubmitting = false);
      Get.snackbar('خطأ', 'تعذر حفظ الماركة',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: AppColors.red600,
          colorText: AppColors.white);
    }
  }

  Future<void> _deleteBrand(int id) async {
    final confirm = await Get.dialog<bool>(
      AlertDialog(
        title: Text('تأكيد الحذف',
            style: GoogleFonts.tajawal(fontWeight: FontWeight.w900)),
        content: Text('هل أنت متأكد من حذف هذه الماركة؟',
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
      Get.snackbar('نجاح', 'تم حذف الماركة',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: AppColors.emerald600,
          colorText: AppColors.white);
      _fetchBrands();
    } catch (e) {
      Get.snackbar('خطأ', 'تعذر حذف الماركة',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: AppColors.red600,
          colorText: AppColors.white);
    }
  }

  List<Map<String, dynamic>> get _paginatedBrands {
    final start = (_currentPage - 1) * _pageSize;
    if (start >= _brands.length) return [];
    final end = (start + _pageSize).clamp(0, _brands.length);
    return _brands.sublist(start, end);
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
                  title: 'الماركات',
                  subtitle: 'إدارة ماركات المنتجات',
                  action: GoldButton(
                    label: 'إضافة ماركة',
                    icon: Icons.add,
                    isSmall: true,
                    onPressed: _openCreateForm,
                  ),
                ),
                const SizedBox(height: 24),
                CardContainer(
                  padding: const EdgeInsets.all(16),
                  child: SearchInput(
                    hintText: 'ابحث عن ماركة...',
                    controller: _searchController,
                    onChanged: _onSearchChanged,
                  ),
                ),
                const SizedBox(height: 24),
                Expanded(child: _buildTable(isDark)),
              ],
            ),
          ),
          if (_showForm) _buildFormOverlay(isDark),
        ],
      ),
    );
  }

  Widget _buildTable(bool isDark) {
    return CardTableContainer(
      child: Column(
        children: [
          _buildTableHeader(isDark),
          Container(height: 1, color: isDark ? AppColors.dark600 : AppColors.gold50),
          Expanded(child: _buildTableBody(isDark)),
          if (!_isLoading && _brands.isNotEmpty)
            PaginationWidget(
              currentPage: _currentPage,
              totalPages: _totalPages,
              onPageChanged: _onPageChanged,
            ),
        ],
      ),
    );
  }

  Widget _buildTableHeader(bool isDark) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 20),
      color: isDark ? AppColors.dark800 : AppColors.cream50,
      child: Row(
        children: [
          _headerCell('الشعار', flex: 1),
          _headerCell('الاسم', flex: 3),
          _headerCell('الرابط', flex: 2),
          _headerCell('الحالة', flex: 1),
          _headerCell('إجراءات', flex: 2),
        ],
      ),
    );
  }

  Widget _headerCell(String text, {int flex = 1}) {
    return Expanded(
      flex: flex,
      child: Text(text,
          style: GoogleFonts.tajawal(
              fontSize: 10, fontWeight: FontWeight.w900, color: AppColors.textSecondary)),
    );
  }

  Widget _buildTableBody(bool isDark) {
    if (_isLoading) return const TableSkeleton(rows: 5, columns: 5);
    if (_brands.isEmpty) return _buildEmptyState(isDark);
    return ListView.builder(
      itemCount: _paginatedBrands.length,
      itemBuilder: (context, index) => _buildRow(_paginatedBrands[index], isDark),
    );
  }

  Widget _buildEmptyState(bool isDark) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.branding_watermark_outlined, size: 48,
              color: isDark ? AppColors.textMuted : AppColors.gold300),
          const SizedBox(height: 8),
          Text('لا توجد ماركات',
              style: GoogleFonts.tajawal(
                  fontSize: 14, fontWeight: FontWeight.w900,
                  color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondary)),
        ],
      ),
    );
  }

  Widget _buildRow(Map<String, dynamic> brand, bool isDark) {
    final logoUrl = brand['logo'] as String?;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 20),
      decoration: BoxDecoration(
        border: Border(
          bottom: BorderSide(
            color: isDark ? AppColors.dark600 : AppColors.gold50, width: 1),
        ),
      ),
      child: Row(
        children: [
          Expanded(
            flex: 1,
            child: ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Container(
                width: 40, height: 40,
                color: isDark ? AppColors.dark600 : AppColors.cream50,
                child: logoUrl != null && logoUrl.isNotEmpty
                    ? Image.network(logoUrl, fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => _logoPlaceholder(isDark))
                    : _logoPlaceholder(isDark),
              ),
            ),
          ),
          Expanded(
            flex: 3,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(brand['name_ar'] ?? '',
                    style: GoogleFonts.tajawal(
                        fontSize: 13, fontWeight: FontWeight.w900,
                        color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary)),
                Text(brand['slug'] ?? '',
                    style: GoogleFonts.poppins(
                        fontSize: 10,
                        color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondary)),
              ],
            ),
          ),
          Expanded(
            flex: 2,
            child: Text(brand['slug'] ?? '',
                style: GoogleFonts.poppins(
                    fontSize: 11,
                    color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondary)),
          ),
          Expanded(
            flex: 1,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: (brand['is_active'] == true ? AppColors.emerald50 : AppColors.rose50),
                borderRadius: BorderRadius.circular(100),
              ),
              child: Text(brand['is_active'] == true ? 'نشط' : 'غير نشط',
                  style: GoogleFonts.tajawal(
                      fontSize: 10, fontWeight: FontWeight.w900,
                      color: brand['is_active'] == true ? AppColors.emerald600 : AppColors.rose600)),
            ),
          ),
          Expanded(
            flex: 2,
            child: Row(
              children: [
                _actionButton(Icons.edit_outlined, AppColors.blue600, isDark,
                    () => _openEditForm(brand)),
                const SizedBox(width: 8),
                _actionButton(Icons.delete_outline, AppColors.red600, isDark,
                    () => _deleteBrand(brand['id'] as int)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _logoPlaceholder(bool isDark) {
    return Center(
      child: Icon(Icons.business, size: 20,
          color: isDark ? AppColors.gold400 : AppColors.gold300),
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
                        Text(_editingBrand != null ? 'تعديل الماركة' : 'إضافة ماركة',
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
                          _buildFormField('الاسم (عربي)', _formNameArController, isDark),
                          const SizedBox(height: 16),
                          _buildFormField('الاسم (إنجليزي)', _formNameEnController, isDark),
                          const SizedBox(height: 16),
                          _buildFormField('الرابط (Slug)', _formSlugController, isDark),
                          const SizedBox(height: 16),
                          GestureDetector(
                            onTap: () {},
                            child: Container(
                              height: 128,
                              decoration: BoxDecoration(
                                border: Border.all(
                                  color: AppColors.gold300, width: 2, style: BorderStyle.solid),
                                borderRadius: BorderRadius.circular(16),
                              ),
                              child: Center(
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(Icons.cloud_upload_outlined, size: 32,
                                        color: AppColors.gold400),
                                    const SizedBox(height: 4),
                                    Text('اضغط لرفع الشعار',
                                        style: GoogleFonts.tajawal(
                                            fontSize: 12, fontWeight: FontWeight.w700,
                                            color: AppColors.textMuted)),
                                  ],
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(height: 24),
                          Row(
                            children: [
                              Text('نشط',
                                  style: GoogleFonts.tajawal(
                                      fontSize: 14, fontWeight: FontWeight.w900,
                                      color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary)),
                              const Spacer(),
                              GoldToggle(value: _formIsActive, onChanged: (v) => setState(() => _formIsActive = v)),
                            ],
                          ),
                          const SizedBox(height: 32),
                          GoldButton(
                            label: _editingBrand != null ? 'تحديث الماركة' : 'إضافة الماركة',
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

  Widget _buildFormField(String label, TextEditingController controller, bool isDark) {
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
          textDirection: TextDirection.rtl,
          style: GoogleFonts.tajawal(
              color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary,
              fontSize: 14, fontWeight: FontWeight.w700),
          decoration: InputDecoration(
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
}
