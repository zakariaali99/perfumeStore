import 'dart:io';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../theme/app_theme.dart';
import '../../services/api_service.dart';
import '../../widgets/card_container.dart';
import '../../widgets/gold_toggle.dart';
import '../../widgets/app_button.dart';
import '../../widgets/skeleton_loader.dart';

class ProductEditPage extends StatefulWidget {
  final Map<String, dynamic>? product;

  const ProductEditPage({super.key, this.product});

  bool get isEditing => product != null;

  @override
  State<ProductEditPage> createState() => _ProductEditPageState();
}

class _ProductEditPageState extends State<ProductEditPage> {
  bool _isInitialLoading = false;

  // Basic info
  final _nameArController = TextEditingController();
  final _nameEnController = TextEditingController();
  final _slugController = TextEditingController();
  final _concentrationController = TextEditingController();
  String? _selectedCategoryId;
  String? _selectedBrandId;
  String _selectedGender = 'unisex';
  bool _isFeatured = false;
  bool _isNew = false;
  bool _isActive = true;

  // Variants
  final List<_VariantForm> _variants = [];
  File? _mainImage;

  bool _isSubmitting = false;
  List<Map<String, dynamic>> _categories = [];
  List<Map<String, dynamic>> _brands = [];

  @override
  void initState() {
    super.initState();
    if (widget.isEditing) {
      _populateForm();
    } else {
      _addVariant();
    }
    _fetchLookups();
  }

  @override
  void dispose() {
    _nameArController.dispose();
    _nameEnController.dispose();
    _slugController.dispose();
    _concentrationController.dispose();
    for (final v in _variants) {
      v.dispose();
    }
    super.dispose();
  }

  void _populateForm() {
    final p = widget.product!;
    _nameArController.text = p['name_ar'] ?? '';
    _nameEnController.text = p['name_en'] ?? '';
    _slugController.text = p['slug'] ?? '';
    _concentrationController.text = p['concentration'] ?? '';
    _selectedCategoryId = p['category']?.toString();
    _selectedBrandId = p['brand']?.toString();
    _selectedGender = p['gender'] ?? 'unisex';
    _isFeatured = p['is_featured'] ?? false;
    _isNew = p['is_new'] ?? false;
    _isActive = p['is_active'] ?? true;

    final variants = p['variants'] as List?;
    if (variants != null && variants.isNotEmpty) {
      for (final v in variants) {
        final vf = _VariantForm();
        vf.sizeController.text = '${v['size'] ?? ''}';
        vf.priceController.text = '${v['price'] ?? ''}';
        vf.costPriceController.text = '${v['cost_price'] ?? ''}';
        vf.stockController.text = '${v['stock'] ?? ''}';
        vf.skuController.text = v['sku'] ?? '';
        _variants.add(vf);
      }
    } else {
      _addVariant();
    }
  }

  Future<void> _fetchLookups() async {
    try {
      final apiService = Get.find<ApiService>();
      final catsRes = await apiService.products.getCategories();
      final brandsRes = await apiService.products.getBrands();
      setState(() {
        _categories = (catsRes is List ? catsRes : [])
            .map((e) => e as Map<String, dynamic>).toList();
        _brands = (brandsRes is List ? brandsRes : [])
            .map((e) => e as Map<String, dynamic>).toList();
      });
    } catch (_) {}
  }

  void _addVariant() {
    setState(() => _variants.add(_VariantForm()));
  }

  void _removeVariant(int index) {
    if (_variants.length <= 1) return;
    setState(() {
      _variants[index].dispose();
      _variants.removeAt(index);
    });
  }

  Future<void> _submit() async {
    if (_nameArController.text.trim().isEmpty) {
      Get.snackbar('تنبيه', 'الرجاء إدخال اسم المنتج بالعربية',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: AppColors.amber600,
          colorText: AppColors.white);
      return;
    }
    setState(() => _isSubmitting = true);
    try {
      await Future.delayed(const Duration(seconds: 1));
      setState(() => _isSubmitting = false);
      Get.snackbar('نجاح', widget.isEditing ? 'تم تحديث المنتج' : 'تم إضافة المنتج',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: AppColors.emerald600,
          colorText: AppColors.white);
      Get.back(result: true);
    } catch (e) {
      setState(() => _isSubmitting = false);
      Get.snackbar('خطأ', 'تعذر حفظ المنتج',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: AppColors.red600,
          colorText: AppColors.white);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.isEditing ? 'تعديل المنتج' : 'إضافة منتج جديد'),
        leading: GestureDetector(
          onTap: () => Get.back(),
          child: Container(
            margin: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: isDark ? AppColors.dark600 : AppColors.gray50,
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.arrow_back_ios_new, size: 18),
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _buildBasicInfoSection(isDark),
            const SizedBox(height: 24),
            _buildImageSection(isDark),
            const SizedBox(height: 24),
            _buildVariantsSection(isDark),
            const SizedBox(height: 32),
            _buildSubmitSection(isDark),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  // -------- SECTION 1: BASIC INFO --------

  Widget _buildBasicInfoSection(bool isDark) {
    return CardContainerLg(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text('معلومات أساسية',
              style: GoogleFonts.tajawal(
                  fontSize: 16, fontWeight: FontWeight.w900,
                  color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary)),
          const SizedBox(height: 24),
          _buildField('الاسم (عربي)', _nameArController, isDark),
          const SizedBox(height: 16),
          _buildField('الاسم (إنجليزي)', _nameEnController, isDark),
          const SizedBox(height: 16),
          _buildField('الرابط (Slug)', _slugController, isDark),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(child: _buildDropdown('التصنيف', _selectedCategoryId, isDark,
                  _categories.map((c) => DropdownMenuItem<String>(
                    value: c['id'].toString(),
                    child: Text(c['name_ar'] ?? '',
                        style: GoogleFonts.tajawal(
                            fontSize: 14, fontWeight: FontWeight.w700)),
                  )).toList(),
                  (v) => setState(() => _selectedCategoryId = v))),
              const SizedBox(width: 12),
              Expanded(child: _buildDropdown('الماركة', _selectedBrandId, isDark,
                  _brands.map((b) => DropdownMenuItem<String>(
                    value: b['id'].toString(),
                    child: Text(b['name_ar'] ?? '',
                        style: GoogleFonts.tajawal(
                            fontSize: 14, fontWeight: FontWeight.w700)),
                  )).toList(),
                  (v) => setState(() => _selectedBrandId = v))),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: _buildDropdown('الجنس', _selectedGender, isDark,
                    const [
                      DropdownMenuItem(value: 'male', child: Text('ذكر')),
                      DropdownMenuItem(value: 'female', child: Text('أنثى')),
                      DropdownMenuItem(value: 'unisex', child: Text('للجنسين')),
                    ],
                    (v) => setState(() => _selectedGender = v ?? 'unisex')),
              ),
              const SizedBox(width: 12),
              Expanded(child: _buildField('التركيز (مل)', _concentrationController, isDark)),
            ],
          ),
          const SizedBox(height: 24),
          Row(
            children: [
              _buildToggle('مميز', _isFeatured, (v) => setState(() => _isFeatured = v), isDark),
              const SizedBox(width: 24),
              _buildToggle('جديد', _isNew, (v) => setState(() => _isNew = v), isDark),
              const SizedBox(width: 24),
              _buildToggle('نشط', _isActive, (v) => setState(() => _isActive = v), isDark),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildToggle(String label, bool value, ValueChanged<bool> onChanged, bool isDark) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(label,
            style: GoogleFonts.tajawal(
                fontSize: 12, fontWeight: FontWeight.w900,
                color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary)),
        const SizedBox(width: 8),
        GoldToggle(value: value, onChanged: onChanged),
      ],
    );
  }

  // -------- SECTION 2: IMAGES --------

  Widget _buildImageSection(bool isDark) {
    return CardContainerLg(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text('صور المنتج',
              style: GoogleFonts.tajawal(
                  fontSize: 16, fontWeight: FontWeight.w900,
                  color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary)),
          const SizedBox(height: 24),
          GestureDetector(
            onTap: () {},
            child: AspectRatio(
              aspectRatio: 4 / 3,
              child: Container(
                decoration: BoxDecoration(
                  border: Border.all(
                    color: AppColors.gold300, width: 2, style: BorderStyle.solid),
                  borderRadius: BorderRadius.circular(16),
                  color: isDark ? AppColors.dark800 : AppColors.cream50,
                ),
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.cloud_upload_outlined, size: 40,
                          color: AppColors.gold400),
                      const SizedBox(height: 8),
                      Text('الصورة الرئيسية',
                          style: GoogleFonts.tajawal(
                              fontSize: 14, fontWeight: FontWeight.w900,
                              color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary)),
                      Text('نسبة 4:3',
                          style: GoogleFonts.tajawal(
                              fontSize: 11, color: AppColors.textMuted)),
                    ],
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            height: 80,
            child: ListView(
              scrollDirection: Axis.horizontal,
              children: List.generate(4, (i) {
                return Container(
                  width: 80, height: 80,
                  margin: const EdgeInsets.only(left: 12),
                  decoration: BoxDecoration(
                    border: Border.all(
                      color: AppColors.gold300, width: 2, style: BorderStyle.solid),
                    borderRadius: BorderRadius.circular(16),
                    color: isDark ? AppColors.dark800 : AppColors.cream50,
                  ),
                  child: Center(
                    child: Icon(Icons.add, size: 24, color: AppColors.gold400),
                  ),
                );
              }),
            ),
          ),
        ],
      ),
    );
  }

  // -------- SECTION 3: VARIANTS --------

  Widget _buildVariantsSection(bool isDark) {
    return CardContainerLg(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Text('الخيارات (Variants)',
                  style: GoogleFonts.tajawal(
                      fontSize: 16, fontWeight: FontWeight.w900,
                      color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary)),
              const Spacer(),
              GestureDetector(
                onTap: _addVariant,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppColors.gold500,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.add, size: 14, color: AppColors.white),
                      const SizedBox(width: 4),
                      Text('إضافة خيار',
                          style: GoogleFonts.tajawal(
                              fontSize: 12, fontWeight: FontWeight.w900,
                              color: AppColors.white)),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          ...List.generate(_variants.length, (i) {
            return Padding(
              padding: const EdgeInsets.only(bottom: 16),
              child: _buildVariantCard(i, isDark),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildVariantCard(int index, bool isDark) {
    final v = _variants[index];
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: isDark ? AppColors.dark800 : AppColors.cream50,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isDark ? AppColors.dark600 : AppColors.gold100),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Text('خيار #${index + 1}',
                  style: GoogleFonts.tajawal(
                      fontSize: 13, fontWeight: FontWeight.w900,
                      color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary)),
              const Spacer(),
              if (_variants.length > 1)
                GestureDetector(
                  onTap: () => _removeVariant(index),
                  child: Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: AppColors.rose50,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(Icons.delete_outline, size: 16, color: AppColors.rose600),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(child: _buildField('الحجم (مل)', v.sizeController, isDark)),
              const SizedBox(width: 12),
              Expanded(child: _buildField('السعر', v.priceController, isDark)),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(child: _buildField('سعر التكلفة', v.costPriceController, isDark)),
              const SizedBox(width: 12),
              Expanded(child: _buildField('المخزون', v.stockController, isDark)),
            ],
          ),
          const SizedBox(height: 12),
          _buildField('SKU', v.skuController, isDark),
        ],
      ),
    );
  }

  // -------- SECTION 4: SUBMIT --------

  Widget _buildSubmitSection(bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        GoldButton(
          label: widget.isEditing ? 'حفظ التعديلات' : 'حفظ المنتج',
          isLoading: _isSubmitting,
          onPressed: _submit,
        ),
        const SizedBox(height: 12),
        SizedBox(
          width: double.infinity,
          child: OutlinedButton(
            onPressed: () => Get.back(),
            style: OutlinedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              side: BorderSide(color: isDark ? AppColors.dark600 : AppColors.gold200),
            ),
            child: Text('إلغاء',
                style: GoogleFonts.tajawal(
                    fontSize: 15, fontWeight: FontWeight.w900,
                    color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondary)),
          ),
        ),
      ],
    );
  }

  // -------- SHARED WIDGETS --------

  Widget _buildField(String label, TextEditingController controller, bool isDark) {
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

  Widget _buildDropdown(String label, String? value, bool isDark,
      List<DropdownMenuItem<String>> items, ValueChanged<String?>? onChanged) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label,
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
              value: value,
              isExpanded: true,
              dropdownColor: isDark ? AppColors.dark700 : AppColors.white,
              hint: Text('اختر $label',
                  style: GoogleFonts.tajawal(
                      color: AppColors.textMuted,
                      fontSize: 14, fontWeight: FontWeight.w700)),
              items: items,
              onChanged: onChanged,
            ),
          ),
        ),
      ],
    );
  }
}

class _VariantForm {
  final sizeController = TextEditingController();
  final priceController = TextEditingController();
  final costPriceController = TextEditingController();
  final stockController = TextEditingController();
  final skuController = TextEditingController();

  void dispose() {
    sizeController.dispose();
    priceController.dispose();
    costPriceController.dispose();
    stockController.dispose();
    skuController.dispose();
  }
}
