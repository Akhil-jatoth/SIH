import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:webview_flutter_android/webview_flutter_android.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Color(0xFF080C14),
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: Color(0xFF080C14),
      systemNavigationBarIconBrightness: Brightness.light,
    ),
  );
  runApp(const CnasMobileApp());
}

class CnasMobileApp extends StatelessWidget {
  const CnasMobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'CNAS — CBI Criminal Intelligence',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF080C14),
        primaryColor: const Color(0xFF06B6D4),
      ),
      home: const CnasWebViewScreen(),
    );
  }
}

class CnasWebViewScreen extends StatefulWidget {
  const CnasWebViewScreen({super.key});

  @override
  State<CnasWebViewScreen> createState() => _CnasWebViewScreenState();
}

class _CnasWebViewScreenState extends State<CnasWebViewScreen> {
  late final WebViewController _controller;
  bool _isLoading = true;
  int _loadingProgress = 0;
  bool _hasError = false;
  String _errorMessage = '';

  static const String _appUrl = 'https://sih-frontend-0pll.onrender.com';

  @override
  void initState() {
    super.initState();
    _initWebViewController();
  }

  void _initWebViewController() {
    late final PlatformWebViewControllerCreationParams params;
    if (WebViewPlatform.instance is AndroidWebViewPlatform) {
      params = AndroidWebViewControllerCreationParams();
    } else {
      params = const PlatformWebViewControllerCreationParams();
    }

    final WebViewController controller =
        WebViewController.fromPlatformCreationParams(params);

    controller
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0xFF080C14))
      ..setNavigationDelegate(
        NavigationDelegate(
          onProgress: (int progress) {
            setState(() {
              _loadingProgress = progress;
            });
          },
          onPageStarted: (String url) {
            setState(() {
              _isLoading = true;
              _hasError = false;
            });
          },
          onPageFinished: (String url) {
            setState(() {
              _isLoading = false;
            });
          },
          onWebResourceError: (WebResourceError error) {
            // Ignore minor resource error on sub-assets, only trigger on main frame
            if (error.isForMainFrame ?? true) {
              setState(() {
                _isLoading = false;
                _hasError = true;
                _errorMessage = error.description;
              });
            }
          },
        ),
      )
      ..loadRequest(Uri.parse(_appUrl));

    if (controller.platform is AndroidWebViewController) {
      AndroidWebViewController.enableDebugging(false);
      (controller.platform as AndroidWebViewController)
          .setMediaPlaybackRequiresUserGesture(false);
    }

    _controller = controller;
  }

  Future<bool> _onWillPop() async {
    if (await _controller.canGoBack()) {
      await _controller.goBack();
      return false;
    }
    return true;
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: _onWillPop,
      child: Scaffold(
        backgroundColor: const Color(0xFF080C14),
        body: SafeArea(
          child: Stack(
            children: [
              // Main WebView with 100% exact UI
              WebViewWidget(controller: _controller),

              // Progress Bar while loading
              if (_isLoading && _loadingProgress < 100)
                Positioned(
                  top: 0,
                  left: 0,
                  right: 0,
                  child: LinearProgressIndicator(
                    value: _loadingProgress / 100.0,
                    backgroundColor: Colors.transparent,
                    valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF06B6D4)),
                    minHeight: 2.5,
                  ),
                ),

              // Error Fallback & Retry Screen
              if (_hasError)
                Container(
                  color: const Color(0xFF080C14),
                  padding: const EdgeInsets.all(24),
                  child: Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: const Color(0xFF1E293B),
                            shape: BoxShape.circle,
                            border: Border.all(color: const Color(0xFFEF4444).withOpacity(0.5)),
                          ),
                          child: const Icon(
                            Icons.wifi_off_rounded,
                            color: Color(0xFFEF4444),
                            size: 40,
                          ),
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'CONNECTION ERROR',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 0.8,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          _errorMessage.isNotEmpty ? _errorMessage : 'Unable to connect to CBI Intelligence Server.',
                          textAlign: TextAlign.center,
                          style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
                        ),
                        const SizedBox(height: 20),
                        ElevatedButton.icon(
                          onPressed: () {
                            setState(() {
                              _hasError = false;
                              _isLoading = true;
                            });
                            _controller.reload();
                          },
                          icon: const Icon(Icons.refresh_rounded, size: 18),
                          label: const Text('RECONNECT TO CNAS'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF06B6D4),
                            foregroundColor: Colors.black,
                            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
