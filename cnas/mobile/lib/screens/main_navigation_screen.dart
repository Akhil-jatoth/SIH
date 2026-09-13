import 'package:flutter/material.dart';
import '../core/theme/app_theme.dart';
import '../widgets/officer_header.dart';
import 'dashboard_screen.dart';
import 'graph_explorer_screen.dart';
import 'cases_list_screen.dart';
import 'gis_tracking_screen.dart';
import 'ai_assistant_screen.dart';
import 'suspect_radar_screen.dart';

class MainNavigationScreen extends StatefulWidget {
  const MainNavigationScreen({super.key});

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = [
    const DashboardScreen(),
    const GraphExplorerScreen(),
    const CasesListScreen(),
    const GisTrackingScreen(),
    const AiAssistantScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      body: Column(
        children: [
          OfficerHeader(
            officerName: 'Akhil Jatoth',
            designation: 'Special Cyber Investigator',
            clearance: 'LEVEL-4 TOP SECRET',
            onNotificationTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('🛡️ CBI Clearance Level-4 Active • Render Cloud Connected'),
                  backgroundColor: AppTheme.primaryCyan,
                  duration: Duration(seconds: 2),
                ),
              );
            },
          ),
          Expanded(
            child: IndexedStack(
              index: _currentIndex,
              children: _screens,
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.of(context).push(
            MaterialPageRoute(builder: (_) => const SuspectRadarScreen()),
          );
        },
        backgroundColor: AppTheme.primaryCyan,
        foregroundColor: Colors.black,
        tooltip: 'Suspect & Telecom Radar',
        child: const Icon(Icons.radar, size: 28),
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.dashboard_outlined),
            activeIcon: Icon(Icons.dashboard),
            label: 'Command',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.hub_outlined),
            activeIcon: Icon(Icons.hub),
            label: 'Network',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.folder_outlined),
            activeIcon: Icon(Icons.folder),
            label: 'Cases',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.location_on_outlined),
            activeIcon: Icon(Icons.location_on),
            label: 'GIS Tracking',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.psychology_outlined),
            activeIcon: Icon(Icons.psychology),
            label: 'AI Intel',
          ),
        ],
      ),
    );
  }
}
