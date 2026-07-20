import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';

class PaginationWidget extends StatelessWidget {
  final int currentPage;
  final int totalPages;
  final ValueChanged<int> onPageChanged;

  const PaginationWidget({
    super.key,
    required this.currentPage,
    required this.totalPages,
    required this.onPageChanged,
  });

  @override
  Widget build(BuildContext context) {
    if (totalPages <= 1) return const SizedBox.shrink();

    final isDark = Theme.of(context).brightness == Brightness.dark;
    final pages = _getVisiblePages();

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      decoration: BoxDecoration(
        color: isDark ? AppColors.dark800 : AppColors.white,
        border: Border(
          top: BorderSide(
            color: isDark ? AppColors.dark500 : AppColors.gold100,
            width: 1,
          ),
        ),
      ),
      child: Row(
        children: [
          Text(
            'الصفحة $currentPage من $totalPages',
            style: GoogleFonts.tajawal(
              color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondary,
              fontSize: 11,
              fontWeight: FontWeight.w700,
            ),
          ),
          const Spacer(),
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              _buildArrowButton(
                context,
                Icons.chevron_right,
                currentPage > 1,
                () => onPageChanged(currentPage - 1),
              ),
              const SizedBox(width: 4),
              ...pages.map((p) => _buildPageButton(context, p, isDark)),
              const SizedBox(width: 4),
              _buildArrowButton(
                context,
                Icons.chevron_left,
                currentPage < totalPages,
                () => onPageChanged(currentPage + 1),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPageButton(BuildContext context, dynamic page, bool isDark) {
    if (page == '...') {
      return Padding(
        padding: const EdgeInsets.symmetric(horizontal: 4),
        child: Text(
          '•••',
          style: GoogleFonts.poppins(
            color: isDark ? AppColors.textSecondaryDark : AppColors.textMuted,
            fontSize: 10,
          ),
        ),
      );
    }

    final active = page == currentPage;
    return GestureDetector(
      onTap: active ? null : () => onPageChanged(page as int),
      child: Container(
        width: 34,
        height: 34,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: active ? AppColors.gold500 : (isDark ? AppColors.dark600 : AppColors.gold50),
          borderRadius: BorderRadius.circular(12),
          boxShadow: active
              ? [BoxShadow(color: AppColors.gold500.withValues(alpha: 0.2), blurRadius: 8)]
              : null,
        ),
        child: Text(
          '$page',
          style: GoogleFonts.poppins(
            color: active ? AppColors.white : (isDark ? AppColors.gold400 : AppColors.gold600),
            fontSize: 11,
            fontWeight: FontWeight.w900,
          ),
        ),
      ),
    );
  }

  Widget _buildArrowButton(
      BuildContext context, IconData icon, bool enabled, VoidCallback onTap) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return GestureDetector(
      onTap: enabled ? onTap : null,
      child: Container(
        width: 34,
        height: 34,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: isDark ? AppColors.dark600 : AppColors.gold50,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Icon(
          icon,
          size: 16,
          color: enabled
              ? AppColors.gold600
              : (isDark ? AppColors.dark500 : AppColors.gold200),
        ),
      ),
    );
  }

  List<dynamic> _getVisiblePages() {
    if (totalPages <= 7) {
      return List.generate(totalPages, (i) => i + 1);
    }

    final pages = <dynamic>[];
    pages.add(1);

    if (currentPage > 3) pages.add('...');

    final start = (currentPage - 1).clamp(2, totalPages - 4);
    final end = (currentPage + 1).clamp(4, totalPages - 1);

    for (var i = start; i <= end; i++) {
      pages.add(i);
    }

    if (currentPage < totalPages - 2) pages.add('...');
    pages.add(totalPages);

    return pages;
  }
}
