import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Brand Colors
  static const Color goldPrimary = Color(0xFFC5A572);
  static const Color goldDark = Color(0xFFA9804B);
  static const Color goldLight = Color(0xFFDBBF8C);
  
  static const Color creamBg = Color(0xFFFDFBF7);
  static const Color creamCard = Color(0xFFFFFFFF);
  
  static const Color dark900 = Color(0xFF0A0908);
  static const Color dark800 = Color(0xFF12100C);
  static const Color dark700 = Color(0xFF1A150D);
  static const Color dark600 = Color(0xFF2C2416);

  static const Color textPrimaryLight = Color(0xFF2C2416);
  static const Color textSecondaryLight = Color(0xFF6B5D4D);
  
  static const Color textPrimaryDark = Color(0xFFFDFBF7);
  static const Color textSecondaryDark = Color(0xFFDBBF8C);

  static ThemeData get lightTheme {
    final baseTextTheme = GoogleFonts.tajawalTextTheme();
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      primaryColor: goldPrimary,
      scaffoldBackgroundColor: creamBg,
      colorScheme: ColorScheme.light(
        primary: goldPrimary,
        secondary: goldDark,
        surface: creamCard,
        background: creamBg,
        error: Colors.redAccent,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: creamBg,
        elevation: 0,
        centerTitle: true,
        iconTheme: const IconThemeData(color: textPrimaryLight),
        titleTextStyle: GoogleFonts.tajawal(
          color: textPrimaryLight,
          fontSize: 20,
          fontWeight: FontWeight.bold,
        ),
      ),
      cardTheme: CardTheme(
        color: creamCard,
        elevation: 2,
        shadowColor: goldPrimary.withOpacity(0.1),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: Color(0xFFF5EEDB), width: 1),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: goldPrimary,
          foregroundColor: Colors.white,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          textStyle: GoogleFonts.tajawal(
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFF5EEDB)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFF5EEDB)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: goldPrimary, width: 1.5),
        ),
      ),
      textTheme: baseTextTheme.apply(
        bodyColor: textPrimaryLight,
        displayColor: textPrimaryLight,
      ),
    );
  }

  static ThemeData get darkTheme {
    final baseTextTheme = GoogleFonts.tajawalTextTheme();
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      primaryColor: goldPrimary,
      scaffoldBackgroundColor: dark900,
      colorScheme: ColorScheme.dark(
        primary: goldPrimary,
        secondary: goldLight,
        surface: dark700,
        background: dark900,
        error: Colors.redAccent,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: dark900,
        elevation: 0,
        centerTitle: true,
        iconTheme: const IconThemeData(color: textPrimaryDark),
        titleTextStyle: GoogleFonts.tajawal(
          color: textPrimaryDark,
          fontSize: 20,
          fontWeight: FontWeight.bold,
        ),
      ),
      cardTheme: CardTheme(
        color: dark700,
        elevation: 4,
        shadowColor: Colors.black45,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: dark600, width: 1),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: goldPrimary,
          foregroundColor: dark900,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          textStyle: GoogleFonts.tajawal(
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: dark800,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: dark600),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: dark600),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: goldPrimary, width: 1.5),
        ),
      ),
      textTheme: baseTextTheme.apply(
        bodyColor: textPrimaryDark,
        displayColor: textPrimaryDark,
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
