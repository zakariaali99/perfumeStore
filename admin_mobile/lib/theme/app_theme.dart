import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';

class AppColors {
  AppColors._();

  static const Color gold50 = Color(0xFFFBF8F1);
  static const Color gold100 = Color(0xFFF5EEDB);
  static const Color gold200 = Color(0xFFEADCB9);
  static const Color gold300 = Color(0xFFDBBF8C);
  static const Color gold400 = Color(0xFFC9A364);
  static const Color gold500 = Color(0xFFC5A572);
  static const Color gold600 = Color(0xFFA9804B);
  static const Color gold700 = Color(0xFF8D663E);

  static const Color cream50 = Color(0xFFFDFBF7);
  static const Color cream100 = Color(0xFFF5F0E8);

  static const Color dark900 = Color(0xFF0A0908);
  static const Color dark800 = Color(0xFF12100C);
  static const Color dark700 = Color(0xFF1A150D);
  static const Color dark600 = Color(0xFF2C2416);
  static const Color dark500 = Color(0xFF45351E);

  static const Color textPrimary = Color(0xFF2C2416);
  static const Color textSecondary = Color(0xFF6B5D4D);
  static const Color textMuted = Color(0xFF9B8B7A);
  static const Color textPrimaryDark = Color(0xFFFDFBF7);
  static const Color textSecondaryDark = Color(0xFFA9804B);

  static const Color white = Color(0xFFFFFFFF);
  static const Color black = Color(0xFF000000);

  static const Color amber50 = Color(0xFFFFFBEB);
  static const Color amber600 = Color(0xFFD97706);
  static const Color blue50 = Color(0xFFEFF6FF);
  static const Color blue600 = Color(0xFF2563EB);
  static const Color purple50 = Color(0xFFFAF5FF);
  static const Color purple600 = Color(0xFF7C3AED);
  static const Color indigo50 = Color(0xFFEEF2FF);
  static const Color indigo600 = Color(0xFF4F46E5);
  static const Color green50 = Color(0xFFF0FDF4);
  static const Color green600 = Color(0xFF16A34A);
  static const Color red50 = Color(0xFFFEF2F2);
  static const Color red600 = Color(0xFFDC2626);
  static const Color gray50 = Color(0xFFF9FAFB);
  static const Color gray600 = Color(0xFF4B5563);

  static const Color emerald50 = Color(0xFFECFDF5);
  static const Color emerald600 = Color(0xFF059669);
  static const Color rose50 = Color(0xFFFFF1F2);
  static const Color rose600 = Color(0xFFE11D48);
}

class AppTheme {
  static ThemeData get lightTheme {
    final textTheme = GoogleFonts.tajawalTextTheme();
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      primaryColor: AppColors.gold500,
      scaffoldBackgroundColor: AppColors.cream50,
      colorScheme: const ColorScheme.light(
        primary: AppColors.gold500,
        secondary: AppColors.gold600,
        surface: AppColors.white,
        error: AppColors.red600,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: AppColors.cream50,
        elevation: 0,
        centerTitle: true,
        iconTheme: const IconThemeData(color: AppColors.textPrimary),
        titleTextStyle: GoogleFonts.tajawal(
          color: AppColors.textPrimary,
          fontSize: 20,
          fontWeight: FontWeight.w900,
        ),
      ),
      cardTheme: CardTheme(
        color: AppColors.white,
        elevation: 0,
        shadowColor: AppColors.gold500.withValues(alpha: 0.05),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(32),
          side: const BorderSide(color: AppColors.gold200, width: 1),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.gold600,
          foregroundColor: AppColors.white,
          elevation: 0,
          shadowColor: AppColors.gold600.withValues(alpha: 0.2),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          textStyle: GoogleFonts.tajawal(
            fontSize: 16,
            fontWeight: FontWeight.w900,
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.cream50,
        contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: AppColors.gold100),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: AppColors.gold100),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: AppColors.gold500, width: 1.5),
        ),
        hintStyle: GoogleFonts.tajawal(
          color: AppColors.textMuted,
          fontSize: 14,
        ),
      ),
      textTheme: textTheme.apply(
        bodyColor: AppColors.textPrimary,
        displayColor: AppColors.textPrimary,
      ),
      dividerTheme: const DividerThemeData(
        color: AppColors.gold100,
        thickness: 1,
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: AppColors.white,
        selectedItemColor: AppColors.gold500,
        unselectedItemColor: AppColors.textMuted,
        type: BottomNavigationBarType.fixed,
        elevation: 0,
      ),
    );
  }

  static ThemeData get darkTheme {
    final textTheme = GoogleFonts.tajawalTextTheme();
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      primaryColor: AppColors.gold500,
      scaffoldBackgroundColor: AppColors.dark900,
      colorScheme: const ColorScheme.dark(
        primary: AppColors.gold500,
        secondary: AppColors.gold400,
        surface: AppColors.dark700,
        error: AppColors.red600,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: AppColors.dark900,
        elevation: 0,
        centerTitle: true,
        iconTheme: const IconThemeData(color: AppColors.textPrimaryDark),
        titleTextStyle: GoogleFonts.tajawal(
          color: AppColors.textPrimaryDark,
          fontSize: 20,
          fontWeight: FontWeight.w900,
        ),
      ),
      cardTheme: CardTheme(
        color: AppColors.dark700,
        elevation: 0,
        shadowColor: Colors.black45,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(32),
          side: const BorderSide(color: AppColors.dark600, width: 1),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.gold600,
          foregroundColor: AppColors.white,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          textStyle: GoogleFonts.tajawal(
            fontSize: 16,
            fontWeight: FontWeight.w900,
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.dark800,
        contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: AppColors.dark600),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: AppColors.dark600),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: AppColors.gold500, width: 1.5),
        ),
        hintStyle: GoogleFonts.tajawal(
          color: AppColors.textMuted,
          fontSize: 14,
        ),
      ),
      textTheme: textTheme.apply(
        bodyColor: AppColors.textPrimaryDark,
        displayColor: AppColors.textPrimaryDark,
      ),
      dividerTheme: const DividerThemeData(
        color: AppColors.dark600,
        thickness: 1,
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: AppColors.dark800,
        selectedItemColor: AppColors.gold500,
        unselectedItemColor: AppColors.textMuted,
        type: BottomNavigationBarType.fixed,
        elevation: 0,
      ),
    );
  }

  static SystemUiOverlayStyle getOverlayStyle(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: isDark ? Brightness.light : Brightness.dark,
      statusBarBrightness: isDark ? Brightness.dark : Brightness.light,
    );
  }
}
