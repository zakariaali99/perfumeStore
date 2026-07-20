import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';

class SegmentBadge extends StatelessWidget {
  final String segment;

  const SegmentBadge({super.key, required this.segment});

  static const _segments = {
    'vip':     {'label': 'VIP',     'bg': AppColors.purple50, 'fg': AppColors.purple600},
    'regular': {'label': 'منتظم',   'bg': AppColors.blue50,   'fg': AppColors.blue600},
    'new':     {'label': 'جديد',    'bg': AppColors.green50,  'fg': AppColors.green600},
    'inactive':{'label': 'غير نشط', 'bg': AppColors.gray50,   'fg': AppColors.gray600},
  };

  @override
  Widget build(BuildContext context) {
    final data = _segments[segment.toLowerCase()] ??
        {'label': segment, 'bg': AppColors.green50, 'fg': AppColors.green600};
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
          letterSpacing: 0.5,
        ),
      ),
    );
  }
}
