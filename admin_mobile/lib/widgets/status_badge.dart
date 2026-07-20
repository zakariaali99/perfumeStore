import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';

class StatusBadge extends StatelessWidget {
  final String status;
  final double fontSize;

  const StatusBadge({super.key, required this.status, this.fontSize = 10});

  static const _statuses = {
    'pending':     {'label': 'في الانتظار', 'bg': AppColors.amber50,  'fg': AppColors.amber600},
    'confirmed':   {'label': 'مؤكد',        'bg': AppColors.blue50,   'fg': AppColors.blue600},
    'processing':  {'label': 'قيد التجهيز', 'bg': AppColors.purple50, 'fg': AppColors.purple600},
    'shipped':     {'label': 'تم الشحن',    'bg': AppColors.indigo50, 'fg': AppColors.indigo600},
    'delivered':   {'label': 'تم التوصيل',  'bg': AppColors.green50,  'fg': AppColors.green600},
    'cancelled':   {'label': 'ملغي',        'bg': AppColors.red50,    'fg': AppColors.red600},
    'returned':    {'label': 'مرتجع',       'bg': AppColors.gray50,   'fg': AppColors.gray600},
  };

  static String labelFor(String status) =>
      _statuses[status]?['label'] as String? ?? status;

  @override
  Widget build(BuildContext context) {
    final data = _statuses[status] ??
        {'label': status, 'bg': AppColors.gray50, 'fg': AppColors.gray600};
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: data['bg'] as Color,
        borderRadius: BorderRadius.circular(100),
      ),
      child: Text(
        data['label'] as String,
        style: GoogleFonts.tajawal(
          color: data['fg'] as Color,
          fontSize: fontSize,
          fontWeight: FontWeight.w900,
        ),
      ),
    );
  }
}

class BackupStatusBadge extends StatelessWidget {
  final String status;

  const BackupStatusBadge({super.key, required this.status});

  static const _statuses = {
    'creating':  {'label': 'جاري الإنشاء',   'bg': AppColors.amber50,  'fg': AppColors.amber600},
    'ready':     {'label': 'جاهز',            'bg': AppColors.green50,  'fg': AppColors.green600},
    'failed':    {'label': 'فشل',             'bg': AppColors.red50,    'fg': AppColors.red600},
    'restoring': {'label': 'جاري الاستعادة',  'bg': AppColors.blue50,   'fg': AppColors.blue600},
  };

  @override
  Widget build(BuildContext context) {
    final data = _statuses[status] ??
        {'label': status, 'bg': AppColors.gray50, 'fg': AppColors.gray600};
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: data['bg'] as Color,
        borderRadius: BorderRadius.circular(100),
      ),
      child: Text(
        data['label'] as String,
        style: GoogleFonts.tajawal(
          color: data['fg'] as Color,
          fontSize: 10,
          fontWeight: FontWeight.w900,
        ),
      ),
    );
  }
}
