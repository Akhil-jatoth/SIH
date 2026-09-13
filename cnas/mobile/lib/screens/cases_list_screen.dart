import 'package:flutter/material.dart';
import '../core/theme/app_theme.dart';
import '../models/case_model.dart';
import '../services/api_service.dart';
import '../widgets/cyber_container.dart';
import 'case_detail_screen.dart';

class CasesListScreen extends StatefulWidget {
  const CasesListScreen({super.key});

  @override
  State<CasesListScreen> createState() => _CasesListScreenState();
}

class _CasesListScreenState extends State<CasesListScreen> {
  final ApiService _apiService = ApiService();
  bool _isLoading = true;
  List<CaseSummary> _cases = [];

  @override
  void initState() {
    super.initState();
    _loadCases();
  }

  Future<void> _loadCases() async {
    setState(() => _isLoading = true);
    try {
      final cases = await _apiService.getCases();
      if (mounted) {
        setState(() {
          _cases = cases;
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
        title: const Text('INVESTIGATION CASES'),
        backgroundColor: AppTheme.surface,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppTheme.primaryCyan))
          : RefreshIndicator(
              onRefresh: _loadCases,
              color: AppTheme.primaryCyan,
              child: ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: _cases.length,
                itemBuilder: (context, index) {
                  final c = _cases[index];
                  final isCritical = c.severity.toLowerCase() == 'critical' || c.severity.toLowerCase() == 'high';

                  return CyberContainer(
                    margin: const EdgeInsets.only(bottom: 12),
                    borderColor: isCritical ? AppTheme.threatRed.withOpacity(0.4) : AppTheme.borderSubtle,
                    onTap: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => CaseDetailScreen(caseId: c.id, title: c.title),
                        ),
                      );
                    },
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'CASE #CBI-2026-${c.id.toString().padLeft(3, '0')}',
                              style: const TextStyle(
                                color: AppTheme.primaryCyan,
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                                fontFamily: 'monospace',
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: isCritical ? AppTheme.threatRed.withOpacity(0.15) : AppTheme.accentAmber.withOpacity(0.15),
                                borderRadius: BorderRadius.circular(4),
                                border: Border.all(
                                  color: isCritical ? AppTheme.threatRed.withOpacity(0.6) : AppTheme.accentAmber.withOpacity(0.6),
                                  width: 0.8,
                                ),
                              ),
                              child: Text(
                                c.severity.toUpperCase(),
                                style: TextStyle(
                                  color: isCritical ? AppTheme.threatRed : AppTheme.accentAmber,
                                  fontSize: 9.5,
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text(
                          c.title,
                          style: const TextStyle(
                            color: AppTheme.textPrimary,
                            fontSize: 14,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          c.description,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            color: AppTheme.textSecondary,
                            fontSize: 11,
                            height: 1.3,
                          ),
                        ),
                        const SizedBox(height: 10),
                        Row(
                          children: [
                            const Icon(Icons.people_outline, color: AppTheme.textMuted, size: 14),
                            const SizedBox(width: 4),
                            Text('${c.entityCount} Suspects', style: const TextStyle(color: AppTheme.textMuted, fontSize: 10.5)),
                            const SizedBox(width: 14),
                            const Icon(Icons.timeline, color: AppTheme.textMuted, size: 14),
                            const SizedBox(width: 4),
                            Text('${c.eventCount} GIS Events', style: const TextStyle(color: AppTheme.textMuted, fontSize: 10.5)),
                            const Spacer(),
                            const Text(
                              'OPEN DOSSIER →',
                              style: TextStyle(color: AppTheme.primaryCyan, fontSize: 10, fontWeight: FontWeight.bold),
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
