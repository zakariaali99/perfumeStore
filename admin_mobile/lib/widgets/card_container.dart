import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class CardContainer extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;
  final double? borderRadius;
  final VoidCallback? onTap;

  const CardContainer({
    super.key,
    required this.child,
    this.padding,
    this.borderRadius,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final container = Container(
      padding: padding ?? const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: isDark ? AppColors.dark700 : AppColors.white,
        borderRadius: BorderRadius.circular(borderRadius ?? 32),
        border: Border.all(
          color: isDark ? AppColors.dark600 : AppColors.gold200,
          width: 1,
        ),
      ),
      child: child,
    );
    if (onTap != null) {
      return Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(borderRadius ?? 32),
          child: container,
        ),
      );
    }
    return container;
  }
}

class CardContainerLg extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;
  final double? borderRadius;

  const CardContainerLg({
    super.key,
    required this.child,
    this.padding,
    this.borderRadius,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      padding: padding ?? const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: isDark ? AppColors.dark700 : AppColors.white,
        borderRadius: BorderRadius.circular(borderRadius ?? 40),
        border: Border.all(
          color: isDark ? AppColors.dark600 : AppColors.gold200,
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: AppColors.gold500.withValues(alpha: 0.03),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: child,
    );
  }
}

class CardTableContainer extends StatelessWidget {
  final Widget child;

  const CardTableContainer({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      decoration: BoxDecoration(
        color: isDark ? AppColors.dark700 : AppColors.white,
        borderRadius: BorderRadius.circular(32),
        border: Border.all(
          color: isDark ? AppColors.dark600 : AppColors.gold200,
          width: 1,
        ),
      ),
      child: child,
    );
  }
}
