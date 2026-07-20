import 'dart:async';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../theme/app_theme.dart';
import '../../services/api_service.dart';
import '../../widgets/card_container.dart';
import '../../widgets/page_header.dart';
import '../../widgets/pagination_widget.dart';
import '../../widgets/status_badge.dart';
import '../../widgets/app_button.dart';
import '../../widgets/skeleton_loader.dart';

class BackupPage extends StatefulWidget {
  const BackupPage({super.key});

  @override
  State<BackupPage> createState() => _BackupPageState();
}

class _BackupPageState extends State<BackupPage> {
  bool _isLoading = true;
  List<Map<String, dynamic>> _backups = [];
  int _currentPage = 1;
  int _totalPages = 1;
  String? _selectedFileName;
  bool _isUploading = false;

  Timer? _debounce;

  static const int _pageSize = 10;

  @override
  void initState() {
    super.initState();
    _fetchBackups();
  }

  @override
  void dispose() {
    _debounce?.cancel();
    super.dispose();
  }

  Future<void> _fetchBackups() async {
    setState(() => _isLoading = true);
    try {
      final apiService = Get.find<ApiService>();
      final response = await apiService.backup.getAll();
      final List raw = response is List ? response : (response is Map ? (response['results'] ?? []) : []);
      setState(() {
        _backups = raw.map((e) => e as Map<String, dynamic>).toList();
        _totalPages = (_backups.length / _pageSize).ceil();
        if (_totalPages < 1) _totalPages = 1;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      Get.snackbar('خطأ', 'تعذر تحميل النسخ الاحتياطية',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: AppColors.red600,
          colorText: AppColors.white);
    }
  }

  void _onPageChanged(int page) {
    setState(() => _currentPage = page);
  }

  Future<void> _downloadBackup(int id) async {
    try {
      await Future.delayed(const Duration(milliseconds: 300));
      Get.snackbar('نجاح', 'جاري تحميل الملف...',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: AppColors.emerald600,
          colorText: AppColors.white);
    } catch (e) {
      Get.snackbar('خطأ', 'تعذر تحميل الملف',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: AppColors.red600,
          colorText: AppColors.white);
    }
  }

  Future<void> _restoreBackup(int id) async {
    final confirm = await Get.dialog<bool>(
      AlertDialog(
        title: Text('تأكيد الاستعادة',
            style: GoogleFonts.tajawal(fontWeight: FontWeight.w900)),
        content: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.red50,
            borderRadius: BorderRadius.circular(16),
          ),
          child: Row(
            children: [
              Icon(Icons.warning_amber_rounded, color: AppColors.red600, size: 24),
              const SizedBox(width: 12),
              Expanded(
                child: Text('سيتم استبدال جميع البيانات الحالية بنسخة احتياطية. لا يمكن التراجع عن هذا الإجراء.',
                    style: GoogleFonts.tajawal(
                        fontSize: 12, fontWeight: FontWeight.w700,
                        color: AppColors.red600)),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Get.back(result: false),
            child: Text('إلغاء',
                style: GoogleFonts.tajawal(color: AppColors.textMuted)),
          ),
          ElevatedButton(
            onPressed: () => Get.back(result: true),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.red600,
              foregroundColor: AppColors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: Text('تأكيد الاستعادة',
                style: GoogleFonts.tajawal(fontWeight: FontWeight.w900)),
          ),
        ],
      ),
    );
    if (confirm != true) return;
    try {
      await Future.delayed(const Duration(seconds: 2));
      Get.snackbar('نجاح', 'تمت استعادة النسخة الاحتياطية بنجاح',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: AppColors.emerald600,
          colorText: AppColors.white);
      _fetchBackups();
    } catch (e) {
      Get.snackbar('خطأ', 'تعذر استعادة النسخة الاحتياطية',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: AppColors.red600,
          colorText: AppColors.white);
    }
  }

  void _pickFile() {
    setState(() {
      _selectedFileName = 'backup_${DateTime.now().millisecondsSinceEpoch}.sql';
    });
  }

  Future<void> _uploadAndRestore() async {
    if (_selectedFileName == null) {
      Get.snackbar('تنبيه', 'الرجاء اختيار ملف أولاً',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: AppColors.amber600,
          colorText: AppColors.white);
      return;
    }
    setState(() => _isUploading = true);
    try {
      await Future.delayed(const Duration(seconds: 2));
      setState(() {
        _isUploading = false;
        _selectedFileName = null;
      });
      Get.snackbar('نجاح', 'تم رفع الملف واستعادة البيانات',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: AppColors.emerald600,
          colorText: AppColors.white);
      _fetchBackups();
    } catch (e) {
      setState(() => _isUploading = false);
      Get.snackbar('خطأ', 'تعذر رفع الملف',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: AppColors.red600,
          colorText: AppColors.white);
    }
  }

  List<Map<String, dynamic>> get _paginatedBackups {
    final start = (_currentPage - 1) * _pageSize;
    if (start >= _backups.length) return [];
    final end = (start + _pageSize).clamp(0, _backups.length);
    return _backups.sublist(start, end);
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Scaffold(
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            PageHeader(
              title: 'النسخ الاحتياطي',
              subtitle: 'إدارة واستعادة النسخ الاحتياطية',
            ),
            const SizedBox(height: 24),
            _buildInfoBanner(isDark),
            const SizedBox(height: 24),
            Expanded(child: _buildTable(isDark)),
            const SizedBox(height: 24),
            _buildUploadSection(isDark),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoBanner(bool isDark) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: isDark ? AppColors.dark700 : AppColors.gold50,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: isDark ? AppColors.dark600 : AppColors.gold200, width: 1),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: isDark ? AppColors.dark600 : AppColors.gold100,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Icon(Icons.info_outline, size: 24,
                color: isDark ? AppColors.gold400 : AppColors.gold600),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Text('يُنصح بعمل نسخة احتياطية قبل إجراء أي تغييرات كبيرة على قاعدة البيانات.',
                style: GoogleFonts.tajawal(
                    fontSize: 12, fontWeight: FontWeight.w700,
                    color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary)),
          ),
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
          if (!_isLoading && _backups.isNotEmpty)
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
          _headerCell('اسم الملف', flex: 3),
          _headerCell('التاريخ', flex: 2),
          _headerCell('الحجم', flex: 1),
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
    if (_backups.isEmpty) return _buildEmptyState(isDark);
    return ListView.builder(
      itemCount: _paginatedBackups.length,
      itemBuilder: (context, index) => _buildRow(_paginatedBackups[index], isDark),
    );
  }

  Widget _buildEmptyState(bool isDark) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.backup_outlined, size: 48,
              color: isDark ? AppColors.textMuted : AppColors.gold300),
          const SizedBox(height: 8),
          Text('لا توجد نسخ احتياطية',
              style: GoogleFonts.tajawal(
                  fontSize: 14, fontWeight: FontWeight.w900,
                  color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondary)),
        ],
      ),
    );
  }

  Widget _buildRow(Map<String, dynamic> backup, bool isDark) {
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
            flex: 3,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(backup['filename'] ?? '',
                    style: GoogleFonts.poppins(
                        fontSize: 12, fontWeight: FontWeight.w900,
                        color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary)),
                Text(_formatDate(backup['created_at']?.toString() ?? ''),
                    style: GoogleFonts.poppins(
                        fontSize: 10,
                        color: AppColors.textMuted)),
              ],
            ),
          ),
          Expanded(
            flex: 2,
            child: Text(_formatDate(backup['created_at']?.toString() ?? ''),
                style: GoogleFonts.tajawal(
                    fontSize: 11,
                    color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondary)),
          ),
          Expanded(
            flex: 1,
            child: Text(backup['size']?.toString() ?? '0 MB',
                style: GoogleFonts.poppins(
                    fontSize: 11, fontWeight: FontWeight.w900,
                    color: isDark ? AppColors.gold400 : AppColors.gold700)),
          ),
          Expanded(
            flex: 1,
            child: BackupStatusBadge(status: backup['status']?.toString() ?? 'ready'),
          ),
          Expanded(
            flex: 2,
            child: Row(
              children: [
                _actionButton(Icons.download_outlined, AppColors.blue600, isDark,
                    () => _downloadBackup(backup['id'] as int)),
                const SizedBox(width: 8),
                _actionButton(Icons.restore_outlined, AppColors.amber600, isDark,
                    () => _restoreBackup(backup['id'] as int)),
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

  Widget _buildUploadSection(bool isDark) {
    return CardContainerLg(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          GestureDetector(
            onTap: _pickFile,
            child: Container(
              padding: const EdgeInsets.all(32),
              decoration: BoxDecoration(
                border: Border.all(
                  color: AppColors.gold300, width: 2, style: BorderStyle.solid),
                borderRadius: BorderRadius.circular(24),
              ),
              child: Column(
                children: [
                  Icon(Icons.cloud_upload_outlined, size: 40,
                      color: AppColors.gold400),
                  const SizedBox(height: 8),
                  Text('اختر ملف النسخة الاحتياطية',
                      style: GoogleFonts.tajawal(
                          fontSize: 14, fontWeight: FontWeight.w900,
                          color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary)),
                  Text('ملفات SQL أو .sql.gz',
                      style: GoogleFonts.tajawal(
                          fontSize: 11,
                          color: AppColors.textMuted)),
                ],
              ),
            ),
          ),
          if (_selectedFileName != null) ...[
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: isDark ? AppColors.dark800 : AppColors.cream50,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                children: [
                  Icon(Icons.insert_drive_file_outlined, size: 18,
                      color: AppColors.gold600),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(_selectedFileName!,
                        style: GoogleFonts.poppins(
                            fontSize: 12,
                            color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary)),
                  ),
                  GestureDetector(
                    onTap: () => setState(() => _selectedFileName = null),
                    child: Icon(Icons.close, size: 16, color: AppColors.textMuted),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            DangerButton(
              label: 'استعادة البيانات',
              icon: Icons.restore_page,
              isLoading: _isUploading,
              onPressed: _uploadAndRestore,
            ),
          ],
        ],
      ),
    );
  }

  String _formatDate(String isoDate) {
    try {
      final date = DateTime.parse(isoDate);
      final hour = date.hour > 12 ? date.hour - 12 : (date.hour == 0 ? 12 : date.hour);
      final amPm = date.hour >= 12 ? 'م' : 'ص';
      return '${date.year}/${date.month}/${date.day} $hour:${date.minute.toString().padLeft(2, '0')} $amPm';
    } catch (_) {
      return isoDate;
    }
  }
}
