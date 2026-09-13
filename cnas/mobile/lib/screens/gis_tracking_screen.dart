import 'package:flutter/material.dart';
import '../core/theme/app_theme.dart';
import '../models/event_model.dart';
import '../services/api_service.dart';
import '../widgets/cyber_container.dart';

class GisTrackingScreen extends StatefulWidget {
  const GisTrackingScreen({super.key});

  @override
  State<GisTrackingScreen> createState() => _GisTrackingScreenState();
}

class _GisTrackingScreenState extends State<GisTrackingScreen> {
  final ApiService _apiService = ApiService();
  bool _isLoading = true;
  List<GisTimelineEvent> _events = [];

  @override
  void initState() {
    super.initState();
    _loadEvents();
  }

  Future<void> _loadEvents() async {
    setState(() => _isLoading = true);
    try {
      final events = await _apiService.getGisEvents();
      if (mounted) {
        setState(() {
          _events = events;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('GIS TELEMETRY & TRACKING'),
        backgroundColor: AppTheme.surface,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppTheme.primaryCyan))
          : RefreshIndicator(
              onRefresh: _loadEvents,
              color: AppTheme.primaryCyan,
              child: ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: _events.length,
                itemBuilder: (context, index) {
                  final ev = _events[index];
                  return CyberContainer(
                    margin: const EdgeInsets.only(bottom: 10),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.location_on, color: AppTheme.primaryCyan, size: 16),
                            const SizedBox(width: 6),
                            Expanded(
                              child: Text(
                                ev.entityName,
                                style: const TextStyle(
                                  color: AppTheme.textPrimary,
                                  fontSize: 13.5,
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: AppTheme.primaryCyan.withOpacity(0.15),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                'PIN: ${ev.pincode.isNotEmpty ? ev.pincode : 'IND'}',
                                style: const TextStyle(color: AppTheme.primaryCyan, fontSize: 9.5, fontWeight: FontWeight.bold),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text(
                          ev.description,
                          style: const TextStyle(color: AppTheme.textSecondary, fontSize: 11.5, height: 1.3),
                        ),
                        const SizedBox(height: 8),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'COORDS: ${ev.latitude}, ${ev.longitude}',
                              style: const TextStyle(color: AppTheme.textMuted, fontSize: 9.5, fontFamily: 'monospace'),
                            ),
                            Text(
                              ev.timestamp,
                              style: const TextStyle(color: AppTheme.textMuted, fontSize: 9.5),
                            ),
                          ],
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
    );
  }
}
