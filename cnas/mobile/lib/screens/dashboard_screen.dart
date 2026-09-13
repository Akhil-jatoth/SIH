import 'package:flutter/material.dart';
import '../core/theme/app_theme.dart';
import '../models/stats_model.dart';
import '../models/entity_model.dart';
import '../models/event_model.dart';
import '../services/api_service.dart';
import '../widgets/cyber_container.dart';
import '../widgets/stat_metric_tile.dart';
import '../widgets/threat_badge.dart';
import 'suspect_radar_screen.dart';
import 'official_dossier_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final ApiService _apiService = ApiService();
  bool _isLoading = true;
  StatsSummary? _stats;
  List<KeyEntityModel> _keyEntities = [];
  List<GisTimelineEvent> _recentEvents = [];
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadDashboardData();
  }

  Future<void> _loadDashboardData() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final statsFuture = _apiService.getStatsSummary();
      final keyEntitiesFuture = _apiService.getKeyEntities(topN: 5);
      final eventsFuture = _apiService.getGisEvents();

      final results = await Future.wait([statsFuture, keyEntitiesFuture, eventsFuture]);

      if (mounted) {
        setState(() {
          _stats = results[0] as StatsSummary;
          _keyEntities = results[1] as List<KeyEntityModel>;
          _recentEvents = (results[2] as List<GisTimelineEvent>).take(5).toList();
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = 'Error loading live intelligence: $e';
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(color: AppTheme.primaryCyan),
      );
    }

    if (_error != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.error_outline, color: AppTheme.threatRed, size: 48),
              const SizedBox(height: 12),
              Text(_error!, textAlign: TextAlign.center, style: const TextStyle(color: AppTheme.textSecondary)),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                onPressed: _loadDashboardData,
                icon: const Icon(Icons.refresh),
                label: const Text('RETRY CONNECTION'),
                style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primaryCyan, foregroundColor: Colors.black),
              ),
            ],
          ),
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadDashboardData,
      color: AppTheme.primaryCyan,
      backgroundColor: AppTheme.surface,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Threat Alert Banner
            CyberContainer(
              padding: const EdgeInsets.all(14),
              borderColor: AppTheme.threatRed.withOpacity(0.5),
              backgroundColor: AppTheme.threatRed.withOpacity(0.08),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppTheme.threatRed.withOpacity(0.2),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.warning_amber_rounded, color: AppTheme.threatRed, size: 20),
                  ),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'NATIONAL THREAT STATUS: LEVEL-4 CRITICAL',
                          style: TextStyle(
                            color: AppTheme.threatRed,
                            fontSize: 11.5,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 0.5,
                          ),
                        ),
                        SizedBox(height: 2),
                        Text(
                          'Inter-state cartel active across 4 nodes. High-frequency call anomaly detected.',
                          style: TextStyle(
                            color: AppTheme.textSecondary,
                            fontSize: 10.5,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Quick Radar Action Button
            SizedBox(
              width: double.infinity,
              height: 44,
              child: ElevatedButton.icon(
                onPressed: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => const SuspectRadarScreen()),
                  );
                },
                icon: const Icon(Icons.radar, color: Colors.black87),
                label: const Text(
                  'LAUNCH LIVE SUSPECT & PHONE RADAR',
                  style: TextStyle(color: Colors.black87, fontWeight: FontWeight.w800, fontSize: 12, letterSpacing: 0.5),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryCyan,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
              ),
            ),

            const SizedBox(height: 16),

            // Metrics Grid
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisSpacing: 10,
              mainAxisSpacing: 10,
              childAspectRatio: 1.45,
              children: [
                StatMetricTile(
                  label: 'TOTAL SUSPECTS',
                  value: '${_stats?.entities ?? 0}',
                  icon: Icons.groups_rounded,
                  accentColor: AppTheme.primaryCyan,
                  subtitle: 'Knowledge nodes',
                ),
                StatMetricTile(
                  label: 'HIGH RISK THREATS',
                  value: '${_stats?.highRiskEntities ?? 0}',
                  icon: Icons.priority_high_rounded,
                  accentColor: AppTheme.threatRed,
                  subtitle: 'Score >= 85%',
                ),
                StatMetricTile(
                  label: 'NETWORK LINKS',
                  value: '${_stats?.relationships ?? 0}',
                  icon: Icons.hub_rounded,
                  accentColor: AppTheme.primaryBlue,
                  subtitle: 'Call/money paths',
                ),
                StatMetricTile(
                  label: 'ACTIVE CASES',
                  value: '${_stats?.cases ?? 0}',
                  icon: Icons.folder_special_rounded,
                  accentColor: AppTheme.accentAmber,
                  subtitle: 'CBI investigations',
                ),
              ],
            ),

            const SizedBox(height: 20),

            // Key Suspects Section
            const Text(
              'PRIMARY TARGETS (HIGHEST CENTRALITY)',
              style: TextStyle(
                color: AppTheme.textPrimary,
                fontSize: 12,
                fontWeight: FontWeight.w800,
                letterSpacing: 0.5,
              ),
            ),
            const SizedBox(height: 8),

            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _keyEntities.length,
              itemBuilder: (context, index) {
                final target = _keyEntities[index];
                return CyberContainer(
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.all(12),
                  onTap: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => OfficialDossierScreen(
                          entity: EntityNode(
                            id: target.id,
                            name: target.name,
                            type: target.type,
                            riskScore: target.riskScore,
                            attributes: target.attributes,
                            degree: (target.degreeCentrality * 10).toInt(),
                            compositeCentrality: target.compositeCentrality,
                            betweennessCentrality: target.betweennessCentrality,
                            clusterId: 1,
                            clusterName: 'Primary Cartel Hub',
                            reason: target.reason,
                          ),
                        ),
                      ),
                    );
                  },
                  child: Row(
                    children: [
                      Container(
                        width: 36,
                        height: 36,
                        decoration: BoxDecoration(
                          color: AppTheme.surface,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: AppTheme.primaryCyan.withOpacity(0.4)),
                        ),
                        child: const Center(
                          child: Icon(Icons.person_pin, color: AppTheme.primaryCyan, size: 20),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              target.name,
                              style: const TextStyle(color: AppTheme.textPrimary, fontSize: 13, fontWeight: FontWeight.w700),
                            ),
                            Text(
                              'TYPE: ${target.type} • CENTRALITY: ${(target.compositeCentrality * 100).toStringAsFixed(1)}%',
                              style: const TextStyle(color: AppTheme.textMuted, fontSize: 10, fontFamily: 'monospace'),
                            ),
                          ],
                        ),
                      ),
                      ThreatBadge(score: target.riskScore),
                    ],
                  ),
                );
              },
            ),

            const SizedBox(height: 16),

            // Recent GIS Incidents Section
            const Text(
              'LIVE GIS & TELEMETRY LOGS',
              style: TextStyle(
                color: AppTheme.textPrimary,
                fontSize: 12,
                fontWeight: FontWeight.w800,
                letterSpacing: 0.5,
              ),
            ),
            const SizedBox(height: 8),

            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _recentEvents.length,
              itemBuilder: (context, index) {
                final ev = _recentEvents[index];
                return CyberContainer(
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.all(12),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(Icons.cell_tower_rounded, color: AppTheme.primaryCyan, size: 18),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              ev.description,
                              style: const TextStyle(color: AppTheme.textPrimary, fontSize: 12, fontWeight: FontWeight.w600),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'ENTITY: ${ev.entityName} • COORDS: ${ev.latitude}, ${ev.longitude}',
                              style: const TextStyle(color: AppTheme.textMuted, fontSize: 9.5, fontFamily: 'monospace'),
                            ),
                          ],
                        ),
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
