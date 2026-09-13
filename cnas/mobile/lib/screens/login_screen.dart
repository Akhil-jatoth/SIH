import 'package:flutter/material.dart';
import '../core/theme/app_theme.dart';
import '../widgets/cyber_container.dart';
import 'main_navigation_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> with SingleTickerProviderStateMixin {
  final TextEditingController _passcodeController = TextEditingController(text: '7739');
  bool _isScanning = false;
  bool _scanComplete = false;
  late AnimationController _animController;
  late Animation<double> _scanAnimation;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);
    _scanAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(_animController);
  }

  @override
  void dispose() {
    _animController.dispose();
    _passcodeController.dispose();
    super.dispose();
  }

  void _handleAuthentication() async {
    setState(() {
      _isScanning = true;
    });

    await Future.delayed(const Duration(milliseconds: 1200));

    if (mounted) {
      setState(() {
        _isScanning = false;
        _scanComplete = true;
      });

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('⚡ CBI Biometric Clearance Level-4 Granted!'),
          backgroundColor: AppTheme.accentEmerald,
          duration: Duration(seconds: 1),
        ),
      );

      await Future.delayed(const Duration(milliseconds: 600));

      if (mounted) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const MainNavigationScreen()),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      body: Stack(
        children: [
          // Background Glows
          Positioned(
            top: -60,
            right: -60,
            child: Container(
              width: 240,
              height: 240,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppTheme.primaryCyan.withOpacity(0.12),
              ),
            ),
          ),
          Positioned(
            bottom: -60,
            left: -60,
            child: Container(
              width: 240,
              height: 240,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppTheme.accentAmber.withOpacity(0.08),
              ),
            ),
          ),

          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  const SizedBox(height: 12),

                  // Top Republic & CBI Banner
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppTheme.surfaceCard,
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: AppTheme.accentAmber.withOpacity(0.5), width: 0.8),
                        ),
                        child: const Row(
                          children: [
                            Icon(Icons.shield_outlined, color: AppTheme.accentAmber, size: 14),
                            SizedBox(width: 6),
                            Text(
                              'CENTRAL BUREAU OF INVESTIGATION',
                              style: TextStyle(
                                color: AppTheme.accentAmber,
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                                letterSpacing: 0.8,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),

                  const Text(
                    'CRIMINAL NETWORK ANALYSIS SYSTEM',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: AppTheme.textPrimary,
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 0.5,
                    ),
                  ),
                  const SizedBox(height: 2),
                  const Text(
                    'SIH-2026 • AI-POWERED LAW ENFORCEMENT INTELLIGENCE',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: AppTheme.textMuted,
                      fontSize: 9.5,
                      fontWeight: FontWeight.w600,
                    ),
                  ),

                  const SizedBox(height: 28),

                  // Official CBI Holographic Smart ID Card
                  CyberContainer(
                    padding: const EdgeInsets.all(18),
                    borderColor: AppTheme.primaryCyan.withOpacity(0.4),
                    child: Column(
                      children: [
                        // Card Header
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                Container(
                                  width: 32,
                                  height: 32,
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    gradient: const LinearGradient(
                                      colors: [AppTheme.accentAmber, Color(0xFFB45309)],
                                    ),
                                    border: Border.all(color: Colors.white, width: 0.8),
                                  ),
                                  child: const Icon(Icons.shield, color: Colors.black87, size: 18),
                                ),
                                const SizedBox(width: 10),
                                const Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'CBI SMART ID CARD',
                                      style: TextStyle(
                                        color: AppTheme.textPrimary,
                                        fontSize: 12,
                                        fontWeight: FontWeight.w800,
                                        letterSpacing: 0.6,
                                      ),
                                    ),
                                    Text(
                                      'GOVT. OF INDIA • SECURE CHIP',
                                      style: TextStyle(
                                        color: AppTheme.accentAmber,
                                        fontSize: 9,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: AppTheme.threatRed.withOpacity(0.15),
                                borderRadius: BorderRadius.circular(4),
                                border: Border.all(color: AppTheme.threatRed.withOpacity(0.6), width: 0.8),
                              ),
                              child: const Text(
                                'LEVEL-4',
                                style: TextStyle(
                                  color: AppTheme.threatRed,
                                  fontSize: 9.5,
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                            ),
                          ],
                        ),

                        const SizedBox(height: 16),

                        // Officer Photo & Chip
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Officer Avatar / Photo Frame
                            Container(
                              width: 72,
                              height: 84,
                              decoration: BoxDecoration(
                                color: AppTheme.surface,
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: AppTheme.primaryCyan.withOpacity(0.5), width: 1.2),
                              ),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  const Icon(Icons.person, color: AppTheme.primaryCyan, size: 40),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                                    decoration: BoxDecoration(
                                      color: AppTheme.primaryCyan.withOpacity(0.2),
                                      borderRadius: BorderRadius.circular(2),
                                    ),
                                    child: const Text(
                                      'OFFICER',
                                      style: TextStyle(color: AppTheme.primaryCyan, fontSize: 7.5, fontWeight: FontWeight.bold),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 14),

                            // Details
                            const Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'AKHIL JATOTH',
                                    style: TextStyle(
                                      color: AppTheme.textPrimary,
                                      fontSize: 14,
                                      fontWeight: FontWeight.w800,
                                      letterSpacing: 0.4,
                                    ),
                                  ),
                                  SizedBox(height: 2),
                                  Text(
                                    'Special Cyber Investigator',
                                    style: TextStyle(
                                      color: AppTheme.primaryCyan,
                                      fontSize: 11,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                  SizedBox(height: 6),
                                  Text(
                                    'BADGE: CBI-IND-7739\nDIV: Cyber & Counter-Terror Cell\nCLEARANCE: TOP SECRET // ORCON',
                                    style: TextStyle(
                                      color: AppTheme.textMuted,
                                      fontSize: 9.5,
                                      fontFamily: 'monospace',
                                      height: 1.35,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),

                        const SizedBox(height: 16),

                        // Simulated Holographic Bar
                        AnimatedBuilder(
                          animation: _scanAnimation,
                          builder: (context, child) {
                            return Container(
                              height: 3,
                              width: double.infinity,
                              decoration: BoxDecoration(
                                gradient: LinearGradient(
                                  colors: [
                                    Colors.transparent,
                                    AppTheme.primaryCyan.withOpacity(0.8),
                                    AppTheme.accentAmber.withOpacity(0.8),
                                    Colors.transparent,
                                  ],
                                  stops: [
                                    (_scanAnimation.value - 0.2).clamp(0.0, 1.0),
                                    _scanAnimation.value,
                                    (_scanAnimation.value + 0.1).clamp(0.0, 1.0),
                                    (_scanAnimation.value + 0.3).clamp(0.0, 1.0),
                                  ],
                                ),
                              ),
                            );
                          },
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Authentication Section
                  CyberContainer(
                    padding: const EdgeInsets.all(18),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'OFFICER CLEARANCE PIN',
                          style: TextStyle(
                            color: AppTheme.textMuted,
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 0.6,
                          ),
                        ),
                        const SizedBox(height: 8),

                        TextField(
                          controller: _passcodeController,
                          obscureText: true,
                          keyboardType: TextInputType.number,
                          style: const TextStyle(
                            color: AppTheme.primaryCyan,
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 4,
                            fontFamily: 'monospace',
                          ),
                          decoration: InputDecoration(
                            filled: true,
                            fillColor: AppTheme.surface,
                            hintText: 'Enter PIN (Default: 7739)',
                            hintStyle: const TextStyle(
                              color: AppTheme.textMuted,
                              fontSize: 12,
                              letterSpacing: 0,
                              fontFamily: 'sans-serif',
                            ),
                            prefixIcon: const Icon(Icons.lock_outline, color: AppTheme.primaryCyan, size: 20),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                              borderSide: const BorderSide(color: AppTheme.borderSubtle),
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                              borderSide: const BorderSide(color: AppTheme.borderSubtle),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                              borderSide: const BorderSide(color: AppTheme.primaryCyan, width: 1.5),
                            ),
                          ),
                        ),

                        const SizedBox(height: 18),

                        // Login / Bio-Scan Button
                        SizedBox(
                          width: double.infinity,
                          height: 48,
                          child: ElevatedButton(
                            onPressed: _isScanning ? null : _handleAuthentication,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppTheme.primaryCyan,
                              foregroundColor: Colors.black,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                              elevation: 4,
                            ),
                            child: _isScanning
                                ? const Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      SizedBox(
                                        width: 18,
                                        height: 18,
                                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black87),
                                      ),
                                      SizedBox(width: 12),
                                      Text(
                                        'AUTHENTICATING BIOMETRICS...',
                                        style: TextStyle(fontWeight: FontWeight.w800, fontSize: 12),
                                      ),
                                    ],
                                  )
                                : const Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Icon(Icons.fingerprint, size: 22),
                                      SizedBox(width: 8),
                                      Text(
                                        'AUTHENTICATE & ENTER CNAS',
                                        style: TextStyle(
                                          fontWeight: FontWeight.w800,
                                          fontSize: 13,
                                          letterSpacing: 0.5,
                                        ),
                                      ),
                                    ],
                                  ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 24),

                  const Text(
                    'RESTRICTED LAW ENFORCEMENT SYSTEM\nUNAUTHORIZED ACCESS IS STRICTLY MONITORED UNDER IT ACT SEC 66F',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: AppTheme.textMuted,
                      fontSize: 8.5,
                      fontFamily: 'monospace',
                      height: 1.4,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
