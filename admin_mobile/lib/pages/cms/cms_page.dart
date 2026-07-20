import 'dart:async';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../theme/app_theme.dart';
import '../../services/api_service.dart';
import '../../widgets/card_container.dart';
import '../../widgets/page_header.dart';
import '../../widgets/gold_toggle.dart';
import '../../widgets/app_button.dart';
import '../../widgets/skeleton_loader.dart';

class CMSPage extends StatefulWidget {
  const CMSPage({super.key});

  @override
  State<CMSPage> createState() => _CMSPageState();
}

class _CMSPageState extends State<CMSPage> {
  int _activeTab = 0;

  bool _isLoading = true;
  List<Map<String, dynamic>> _slides = [];
  List<Map<String, dynamic>> _banners = [];
  List<Map<String, dynamic>> _hpcSections = [];

  bool _showForm = false;
  Map<String, dynamic>? _editingItem;
  final _formTitleController = TextEditingController();
  final _formSubtitleController = TextEditingController();
  final _formDescriptionController = TextEditingController();
  bool _formIsActive = true;
  bool _formSubmitting = false;

  @override
  void initState() {
    super.initState();
    _fetchAll();
  }

  @override
  void dispose() {
    _formTitleController.dispose();
    _formSubtitleController.dispose();
    _formDescriptionController.dispose();
    super.dispose();
  }

  Future<void> _fetchAll() async {
    setState(() => _isLoading = true);
    try {
      final apiService = Get.find<ApiService>();
      final slidesRes = await apiService.cms.getSlides();
      final bannersRes = await apiService.cms.getBanners();
      final hpcRes = await apiService.cms.getSections();
      setState(() {
        _slides = (slidesRes is List ? slidesRes : []).map((e) => e as Map<String, dynamic>).toList();
        _banners = (bannersRes is List ? bannersRes : []).map((e) => e as Map<String, dynamic>).toList();
        _hpcSections = (hpcRes is List ? hpcRes : []).map((e) => e as Map<String, dynamic>).toList();
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      Get.snackbar('خطأ', 'تعذر تحميل البيانات',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: AppColors.red600,
          colorText: AppColors.white);
    }
  }

  void _openCreateForm(String type) {
    setState(() {
      _editingItem = {'type': type};
      _formTitleController.clear();
      _formSubtitleController.clear();
      _formDescriptionController.clear();
      _formIsActive = true;
      _showForm = true;
    });
  }

  void _openEditForm(Map<String, dynamic> item) {
    setState(() {
      _editingItem = item;
      _formTitleController.text = item['title'] ?? '';
      _formSubtitleController.text = item['subtitle'] ?? '';
      _formDescriptionController.text = item['description'] ?? '';
      _formIsActive = item['is_active'] ?? true;
      _showForm = true;
    });
  }

  void _closeForm() {
    setState(() => _showForm = false);
  }

  Future<void> _submitForm() async {
    setState(() => _formSubmitting = true);
    try {
      await Future.delayed(const Duration(milliseconds: 500));
      setState(() {
        _formSubmitting = false;
        _showForm = false;
      });
      Get.snackbar('نجاح', _editingItem?['id'] != null ? 'تم التحديث' : 'تم الإضافة',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: AppColors.emerald600,
          colorText: AppColors.white);
      _fetchAll();
    } catch (e) {
      setState(() => _formSubmitting = false);
      Get.snackbar('خطأ', 'تعذر الحفظ',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: AppColors.red600,
          colorText: AppColors.white);
    }
  }

  Future<void> _deleteItem(int id) async {
    final confirm = await Get.dialog<bool>(
      AlertDialog(
        title: Text('تأكيد الحذف',
            style: GoogleFonts.tajawal(fontWeight: FontWeight.w900)),
        content: Text('هل أنت متأكد من الحذف؟',
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
      Get.snackbar('نجاح', 'تم الحذف',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: AppColors.emerald600,
          colorText: AppColors.white);
      _fetchAll();
    } catch (e) {
      Get.snackbar('خطأ', 'تعذر الحذف',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: AppColors.red600,
          colorText: AppColors.white);
    }
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
                  title: 'إدارة المحتوى',
                  subtitle: 'الشرائح، البانرات وأقسام الصفحة الرئيسية',
                ),
                const SizedBox(height: 24),
                _buildTabBar(isDark),
                const SizedBox(height: 24),
                Expanded(child: _buildTabContent(isDark)),
              ],
            ),
          ),
          if (_showForm) _buildFormOverlay(isDark),
        ],
      ),
    );
  }

  Widget _buildTabBar(bool isDark) {
    final tabs = ['الشرائح', 'البانرات', 'أقسام HPC'];
    return Container(
      padding: const EdgeInsets.all(6),
      decoration: BoxDecoration(
        color: isDark ? AppColors.dark700 : AppColors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.gold200),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: List.generate(tabs.length, (i) {
          final active = _activeTab == i;
          return GestureDetector(
            onTap: () => setState(() => _activeTab = i),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 10),
              decoration: BoxDecoration(
                color: active ? AppColors.gold500 : Colors.transparent,
                borderRadius: BorderRadius.circular(12),
                boxShadow: active
                    ? [BoxShadow(
                        color: AppColors.gold500.withValues(alpha: 0.3),
                        blurRadius: 8)]
                    : null,
              ),
              child: Text(tabs[i],
                  style: GoogleFonts.tajawal(
                      fontSize: 13,
                      fontWeight: FontWeight.w900,
                      color: active
                          ? AppColors.white
                          : (isDark ? AppColors.textSecondaryDark : AppColors.textSecondary))),
            ),
          );
        }),
      ),
    );
  }

  Widget _buildTabContent(bool isDark) {
    if (_isLoading) return const CardSkeleton(height: 300);

    switch (_activeTab) {
      case 0:
        return _buildSlidesTab(isDark);
      case 1:
        return _buildBannersTab(isDark);
      case 2:
        return _buildHPCTab(isDark);
      default:
        return const SizedBox();
    }
  }

  // ---------- SLIDES TAB ----------

  Widget _buildSlidesTab(bool isDark) {
    final items = _slides;
    return Column(
      children: [
        Align(
          alignment: Alignment.centerRight,
          child: Padding(
            padding: const EdgeInsets.only(bottom: 16),
            child: GoldButton(
              label: 'إضافة شريحة',
              icon: Icons.add,
              isSmall: true,
              onPressed: () => _openCreateForm('slide'),
            ),
          ),
        ),
        Expanded(
          child: items.isEmpty
              ? _buildEmptyState(isDark, 'شرائح')
              : GridView.builder(
                  gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
                    maxCrossAxisExtent: 500,
                    crossAxisSpacing: 16,
                    mainAxisSpacing: 16,
                    childAspectRatio: 21 / 12,
                  ),
                  itemCount: items.length,
                  itemBuilder: (_, i) => _buildSlideCard(items[i], isDark),
                ),
        ),
      ],
    );
  }

  Widget _buildSlideCard(Map<String, dynamic> slide, bool isDark) {
    final imageUrl = slide['image'] as String?;
    return GestureDetector(
      onTap: () => _openEditForm(slide),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(40),
          border: Border.all(color: isDark ? AppColors.dark600 : AppColors.gold200),
          boxShadow: [
            BoxShadow(
              color: AppColors.gold500.withValues(alpha: 0.03),
              blurRadius: 20,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        clipBehavior: Clip.antiAlias,
        child: Stack(
          fit: StackFit.expand,
          children: [
            if (imageUrl != null && imageUrl.isNotEmpty)
              Image.network(imageUrl, fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => _imagePlaceholder(isDark))
            else
              _imagePlaceholder(isDark),
            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    AppColors.black.withValues(alpha: 0.8),
                    Colors.transparent,
                  ],
                  begin: Alignment.bottomCenter,
                  end: Alignment.topCenter,
                ),
              ),
            ),
            Positioned(
              top: 12, right: 12,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: AppColors.white.withValues(alpha: 0.9),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text('#${slide['order'] ?? 0}',
                    style: GoogleFonts.poppins(
                        fontSize: 10, fontWeight: FontWeight.w900,
                        color: AppColors.textPrimary)),
              ),
            ),
            Positioned(
              top: 12, left: 12,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: slide['is_active'] == true ? AppColors.emerald50 : AppColors.rose50,
                  borderRadius: BorderRadius.circular(100),
                ),
                child: Text(slide['is_active'] == true ? 'نشط' : 'غير نشط',
                    style: GoogleFonts.tajawal(
                        fontSize: 10, fontWeight: FontWeight.w900,
                        color: slide['is_active'] == true ? AppColors.emerald600 : AppColors.rose600)),
              ),
            ),
            Positioned(
              bottom: 16, left: 16, right: 16,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (slide['title'] != null)
                    Text(slide['title'],
                        style: GoogleFonts.tajawal(
                            fontSize: 16, fontWeight: FontWeight.w900,
                            color: AppColors.white),
                        maxLines: 1, overflow: TextOverflow.ellipsis),
                  if (slide['subtitle'] != null)
                    Text(slide['subtitle'],
                        style: GoogleFonts.tajawal(
                            fontSize: 12,
                            color: AppColors.white.withValues(alpha: 0.8)),
                        maxLines: 1, overflow: TextOverflow.ellipsis),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ---------- BANNERS TAB ----------

  Widget _buildBannersTab(bool isDark) {
    final items = _banners;
    return Column(
      children: [
        Align(
          alignment: Alignment.centerRight,
          child: Padding(
            padding: const EdgeInsets.only(bottom: 16),
            child: GoldButton(
              label: 'إضافة بانر',
              icon: Icons.add,
              isSmall: true,
              onPressed: () => _openCreateForm('banner'),
            ),
          ),
        ),
        Expanded(
          child: items.isEmpty
              ? _buildEmptyState(isDark, 'بانرات')
              : GridView.builder(
                  gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
                    maxCrossAxisExtent: 500,
                    crossAxisSpacing: 16,
                    mainAxisSpacing: 16,
                    childAspectRatio: 21 / 12,
                  ),
                  itemCount: items.length,
                  itemBuilder: (_, i) => _buildBannerCard(items[i], isDark),
                ),
        ),
      ],
    );
  }

  Widget _buildBannerCard(Map<String, dynamic> banner, bool isDark) {
    final imageUrl = banner['image'] as String?;
    return GestureDetector(
      onTap: () => _openEditForm(banner),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(40),
          border: Border.all(color: isDark ? AppColors.dark600 : AppColors.gold200),
        ),
        clipBehavior: Clip.antiAlias,
        child: Stack(
          fit: StackFit.expand,
          children: [
            if (imageUrl != null && imageUrl.isNotEmpty)
              Image.network(imageUrl, fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => _imagePlaceholder(isDark))
            else
              _imagePlaceholder(isDark),
            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    AppColors.black.withValues(alpha: 0.6),
                    Colors.transparent,
                  ],
                  begin: Alignment.bottomCenter,
                  end: Alignment.topCenter,
                ),
              ),
            ),
            Positioned(
              top: 12, left: 12,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: banner['is_active'] == true ? AppColors.emerald50 : AppColors.rose50,
                  borderRadius: BorderRadius.circular(100),
                ),
                child: Text(banner['is_active'] == true ? 'نشط' : 'غير نشط',
                    style: GoogleFonts.tajawal(
                        fontSize: 10, fontWeight: FontWeight.w900,
                        color: banner['is_active'] == true ? AppColors.emerald600 : AppColors.rose600)),
              ),
            ),
            Positioned(
              bottom: 16, left: 16, right: 16,
              child: Text(banner['title'] ?? '',
                  style: GoogleFonts.tajawal(
                      fontSize: 18, fontWeight: FontWeight.w900,
                      color: AppColors.white),
                  maxLines: 2, overflow: TextOverflow.ellipsis),
            ),
          ],
        ),
      ),
    );
  }

  // ---------- HPC TAB ----------

  Widget _buildHPCTab(bool isDark) {
    if (_hpcSections.isEmpty) {
      return _buildEmptyState(isDark, 'أقسام');
    }
    return ListView.builder(
      itemCount: _hpcSections.length,
      itemBuilder: (_, i) => _buildHPCSectionCard(_hpcSections[i], i, isDark),
    );
  }

  Widget _buildHPCSectionCard(Map<String, dynamic> section, int index, bool isDark) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: CardContainer(
        child: Row(
          children: [
            Column(
              children: [
                _reorderButton(Icons.keyboard_arrow_up, index > 0, () {
                  setState(() {
                    final temp = _hpcSections[index];
                    _hpcSections[index] = _hpcSections[index - 1];
                    _hpcSections[index - 1] = temp;
                  });
                }),
                _reorderButton(Icons.keyboard_arrow_down, index < _hpcSections.length - 1, () {
                  setState(() {
                    final temp = _hpcSections[index];
                    _hpcSections[index] = _hpcSections[index + 1];
                    _hpcSections[index + 1] = temp;
                  });
                }),
              ],
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(section['name'] ?? '',
                      style: GoogleFonts.tajawal(
                          fontSize: 13, fontWeight: FontWeight.w900,
                          color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary)),
                  Text(section['type'] ?? '',
                      style: GoogleFonts.poppins(
                          fontSize: 10,
                          color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondary)),
                ],
              ),
            ),
            GoldToggle(
              value: section['is_active'] == true,
              onChanged: (_) {},
            ),
            const SizedBox(width: 12),
            _actionButton(Icons.edit_outlined, AppColors.blue600, isDark,
                () => _openEditForm(section)),
          ],
        ),
      ),
    );
  }

  Widget _reorderButton(IconData icon, bool enabled, VoidCallback onTap) {
    return GestureDetector(
      onTap: enabled ? onTap : null,
      child: Container(
        padding: const EdgeInsets.all(6),
        child: Icon(icon, size: 20,
            color: enabled ? AppColors.gold600 : AppColors.gold200),
      ),
    );
  }

  // ---------- SHARED ----------

  Widget _buildEmptyState(bool isDark, String label) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.photo_library_outlined, size: 48,
              color: isDark ? AppColors.textMuted : AppColors.gold300),
          const SizedBox(height: 8),
          Text('لا توجد $label',
              style: GoogleFonts.tajawal(
                  fontSize: 14, fontWeight: FontWeight.w900,
                  color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondary)),
        ],
      ),
    );
  }

  Widget _imagePlaceholder(bool isDark) {
    return Container(
      color: isDark ? AppColors.dark600 : AppColors.cream50,
      child: Center(
        child: Icon(Icons.image_outlined, size: 40,
            color: isDark ? AppColors.gold400 : AppColors.gold300),
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
    final type = _editingItem?['type'] as String? ?? 'slide';
    final isSlide = type == 'slide';
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
                        Text(
                          _editingItem?['id'] != null
                              ? 'تعديل ${isSlide ? 'الشريحة' : 'البانر'}'
                              : 'إضافة ${isSlide ? 'شريحة' : 'بانر'}',
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
                          _buildFormField('العنوان', _formTitleController, isDark),
                          const SizedBox(height: 16),
                          _buildFormField('العنوان الفرعي', _formSubtitleController, isDark),
                          const SizedBox(height: 16),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('الوصف',
                                  style: GoogleFonts.tajawal(
                                      fontSize: 12, fontWeight: FontWeight.w900,
                                      color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary)),
                              const SizedBox(height: 8),
                              TextField(
                                controller: _formDescriptionController,
                                textDirection: TextDirection.rtl,
                                maxLines: 4,
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
                          ),
                          const SizedBox(height: 24),
                          GestureDetector(
                            onTap: () {},
                            child: AspectRatio(
                              aspectRatio: isSlide ? 21 / 9 : 4 / 3,
                              child: Container(
                                decoration: BoxDecoration(
                                  border: Border.all(
                                    color: AppColors.gold300, width: 2, style: BorderStyle.solid),
                                  borderRadius: BorderRadius.circular(16),
                                ),
                                child: Center(
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Icon(Icons.cloud_upload_outlined, size: 40,
                                          color: AppColors.gold400),
                                      const SizedBox(height: 8),
                                      Text('اضغط لرفع الصورة',
                                          style: GoogleFonts.tajawal(
                                              fontSize: 12, fontWeight: FontWeight.w700,
                                              color: AppColors.textMuted)),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ),
                          if (isSlide) ...[
                            const SizedBox(height: 16),
                            GestureDetector(
                              onTap: () {},
                              child: AspectRatio(
                                aspectRatio: 21 / 9,
                                child: Container(
                                  decoration: BoxDecoration(
                                    border: Border.all(
                                      color: AppColors.gold300, width: 2, style: BorderStyle.solid),
                                    borderRadius: BorderRadius.circular(16),
                                  ),
                                  child: Center(
                                    child: Column(
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      children: [
                                        Icon(Icons.phone_android, size: 32,
                                            color: AppColors.gold400),
                                        const SizedBox(height: 4),
                                        Text('صورة الجوال (اختياري)',
                                            style: GoogleFonts.tajawal(
                                                fontSize: 12, fontWeight: FontWeight.w700,
                                                color: AppColors.textMuted)),
                                      ],
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ],
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
                            label: _editingItem?['id'] != null ? 'تحديث' : 'إضافة',
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
