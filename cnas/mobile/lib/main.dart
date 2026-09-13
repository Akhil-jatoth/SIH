import 'package:flutter/material.dart';
import 'core/theme/app_theme.dart';
import 'screens/login_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const CnasApp());
}

class CnasApp extends StatelessWidget {
  const CnasApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'CNAS Mobile — CBI Law Enforcement Intelligence',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      home: const LoginScreen(),
    );
  }
}
