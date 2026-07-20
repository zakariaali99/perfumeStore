import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTextStyles {
  AppTextStyles._();

  static TextStyle get _tajawal => GoogleFonts.tajawal();
  static TextStyle get _poppins => GoogleFonts.poppins();

  static TextStyle tsPrice(double size, {FontWeight w = FontWeight.w700}) =>
      _poppins.copyWith(fontSize: size, fontWeight: w);

  static TextStyle tsCode(double size, {FontWeight w = FontWeight.w900}) =>
      _poppins.copyWith(fontSize: size, fontWeight: w, letterSpacing: 1);

  static TextStyle tsBody(double size,
          {FontWeight w = FontWeight.w700, Color? color}) =>
      _tajawal.copyWith(fontSize: size, fontWeight: w, color: color);

  static TextStyle tsBlack(double size,
          {FontWeight w = FontWeight.w900, Color? color}) =>
      _tajawal.copyWith(fontSize: size, fontWeight: w, color: color);

  static TextStyle tsLabel(double size,
          {FontWeight w = FontWeight.w700}) =>
      _tajawal.copyWith(fontSize: size, fontWeight: w);

  static const double size8 = 8;
  static const double size9 = 9;
  static const double size10 = 10;
  static const double size11 = 11;
  static const double sizeXs = 12;
  static const double sizeSm = 14;
  static const double sizeBase = 16;
  static const double sizeLg = 18;
  static const double sizeXl = 20;
  static const double size2xl = 24;
  static const double size3xl = 30;
  static const double size4xl = 36;
}
