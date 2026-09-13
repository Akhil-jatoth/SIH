import 'package:flutter/material.dart';

class AppTheme {
  // Dark Cyber & Law Enforcement Color Palette
  static const Color background = Color(0xFF030712); // slate-950
  static const Color surface = Color(0xFF0F172A); // slate-900
  static const Color surfaceCard = Color(0xFF1E293B); // slate-800
  static const Color surfaceHover = Color(0xFF334155); // slate-700
  static const Color border = Color(0xFF1E293B);
  static const Color borderSubtle = Color(0xFF334155);

  // Accents
  static const Color primaryCyan = Color(0xFF06B6D4); // cyan-500
  static const Color primaryBlue = Color(0xFF3B82F6); // blue-500
  static const Color accentAmber = Color(0xFFF59E0B); // amber-500
  static const Color accentEmerald = Color(0xFF10B981); // emerald-500
  static const Color threatRed = Color(0xFFEF4444); // red-500
  static const Color textPrimary = Color(0xFFF8FAFC); // slate-50
  static const Color textSecondary = Color(0xFF94A3B8); // slate-400
  static const Color textMuted = Color(0xFF64748B); // slate-500

  // Theme Data
  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: background,
      primaryColor: primaryCyan,
      canvasColor: background,
      colorScheme: const ColorScheme.dark(
        primary: primaryCyan,
        secondary: accentAmber,
        surface: surface,
        error: threatRed,
        onPrimary: Colors.black,
        onSecondary: Colors.black,
        onSurface: textPrimary,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: surface,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: TextStyle(
          color: textPrimary,
          fontSize: 17,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.5,
        ),
        iconTheme: IconThemeData(color: primaryCyan),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: surface,
        selectedItemColor: primaryCyan,
        unselectedItemColor: textMuted,
        type: BottomNavigationBarType.fixed,
        selectedLabelStyle: TextStyle(fontSize: 11, fontWeight: FontWeight.w600),
        unselectedLabelStyle: TextStyle(fontSize: 10),
      ),
      cardTheme: CardTheme(
        color: surfaceCard,
        elevation: 2,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: const BorderSide(color: borderSubtle, width: 0.8),
        ),
      ),
    );
  }
}
