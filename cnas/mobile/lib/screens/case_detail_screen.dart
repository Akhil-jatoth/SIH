import 'package:flutter/material.dart';
import '../core/theme/app_theme.dart';
import '../models/case_model.dart';
import '../services/api_service.dart';
import '../widgets/cyber_container.dart';

class CaseDetailScreen extends StatefulWidget {
  final int caseId;
  final String title;

  const CaseDetailScreen({super.key, required this.caseId, required this.title});

  @override
  State<CaseDetailScreen> createState() => _CaseDetailScreenState();
}

class _CaseDetailScreenState extends State<CaseDetailScreen> {
  final ApiService _apiService = ApiService();
  bool _isLoading = true;
  CaseDetailModel? _detail;

  @override
  void initState() {
    super.initState();
    _loadCaseDetail();
  }

  Future<void> _loadCaseDetail() async {
    setState(() => _isLoading = true);
    try {
      final res = await _apiService.getCaseDetail(widget.caseId);
      if (mounted) {
        setState(() {
          _detail = res;
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
        title: Text(widget.title),
        backgroundColor: AppTheme.surface,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppTheme.primaryCyan))
          : _detail == null
              ? const Center(child: Text('Unable to load case dossier.', style: TextStyle(color: AppTheme.textMuted)))
              : SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Overview Header
                      CyberContainer(
                        borderColor: AppTheme.primaryCyan.withOpacity(0.4),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  'CBI FILE #2026-${_detail!.id.toString().padLeft(3, '0')}',
                                  style: const TextStyle(
                                    color: AppTheme.primaryCyan,
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                    fontFamily: 'monospace',
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: AppTheme.threatRed.withOpacity(0.15),
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: Text(
                                    _detail!.severity.toUpperCase(),
                                    style: const TextStyle(color: AppTheme.threatRed, fontSize: 9.5, fontWeight: FontWeight.bold),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Text(
                              _detail!.title,
                              style: const TextStyle(color: AppTheme.textPrimary, fontSize: 16, fontWeight: FontWeight.w800),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              _detail!.description,
                              style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12, height: 1.4),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 16),

                      // Linked Suspects
                      const Text(
                        'LINKED CARTEL ENTITIES',
                        style: TextStyle(color: AppTheme.textMuted, fontSize: 11, fontWeight: FontWeight.w800, letterSpacing: 0.5),
                      ),
                      const SizedBox(height: 8),

                      if (_detail!.entities.isEmpty)
                        const Text('No entities linked to this case file.', style: TextStyle(color: AppTheme.textMuted, fontSize: 11))
                      else
                        ListView.builder(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: _detail!.entities.length,
                          itemBuilder: (context, index) {
                            final ent = _detail!.entities[index];
                            return CyberContainer(
                              margin: const EdgeInsets.only(bottom: 6),
                              padding: const EdgeInsets.all(10),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    ent['name'] ?? 'Entity',
                                    style: const TextStyle(color: AppTheme.textPrimary, fontSize: 12.5, fontWeight: FontWeight.w700),
                                  ),
                                  Text(
                                    ent['type'] ?? 'Person',
                                    style: const TextStyle(color: AppTheme.primaryCyan, fontSize: 11, fontFamily: 'monospace'),
                                  ),
                                ],
                              ),
                            );
                          },
                        ),

                      const SizedBox(height: 16),

                      // Evidence Timeline
                      const Text(
                        'EVIDENCE CHRONOLOGY & GIS LOGS',
                        style: TextStyle(color: AppTheme.textMuted, fontSize: 11, fontWeight: FontWeight.w800, letterSpacing: 0.5),
                      ),
                      const SizedBox(height: 8),

                      if (_detail!.events.isEmpty)
                        const Text('No timeline logs recorded for this case.', style: TextStyle(color: AppTheme.textMuted, fontSize: 11))
                      else
                        ListView.builder(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: _detail!.events.length,
                          itemBuilder: (context, index) {
                            final ev = _detail!.events[index];
                            return CyberContainer(
                              margin: const EdgeInsets.only(bottom: 6),
                              padding: const EdgeInsets.all(10),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    ev['description'] ?? 'Event recorded',
                                    style: const TextStyle(color: AppTheme.textPrimary, fontSize: 12, fontWeight: FontWeight.w600),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    '${ev['timestamp'] ?? ''} • COORDS: ${ev['latitude']}, ${ev['longitude']}',
                                    style: const TextStyle(color: AppTheme.textMuted, fontSize: 9.5, fontFamily: 'monospace'),
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
                    ],
                  ),
                ),
    );
  }
}
