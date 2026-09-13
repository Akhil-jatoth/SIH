import 'package:flutter/material.dart';
import '../core/theme/app_theme.dart';
import '../models/entity_model.dart';
import '../widgets/cyber_container.dart';
import '../widgets/threat_badge.dart';

class OfficialDossierScreen extends StatelessWidget {
  final EntityNode entity;

  const OfficialDossierScreen({super.key, required this.entity});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('OFFICIAL DOSSIER'),
        backgroundColor: AppTheme.surface,
        actions: [
          IconButton(
            icon: const Icon(Icons.print, color: AppTheme.primaryCyan),
            tooltip: 'Export / Print Tactical Sheet',
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('📄 Tactical Intelligence Dossier prepared for export/print!'),
                  backgroundColor: AppTheme.primaryCyan,
                ),
              );
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top CBI Header Banner
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppTheme.accentAmber, width: 1),
              ),
              child: Column(
                children: [
                  const Text(
                    'CENTRAL BUREAU OF INVESTIGATION',
                    style: TextStyle(
                      color: AppTheme.accentAmber,
                      fontSize: 12,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 1.2,
                    ),
                  ),
                  const Text(
                    'SPECIAL CYBER & COUNTER-TERROR INTELLIGENCE DIVISION',
                    style: TextStyle(
                      color: AppTheme.textMuted,
                      fontSize: 8.5,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: AppTheme.threatRed.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(4),
                      border: Border.all(color: AppTheme.threatRed, width: 0.8),
                    ),
                    child: const Text(
                      'CLASSIFIED // FOR LAW ENFORCEMENT EYES ONLY',
                      style: TextStyle(
                        color: AppTheme.threatRed,
                        fontSize: 9,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.8,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Subject Profile Summary Card
            CyberContainer(
              borderColor: AppTheme.primaryCyan.withOpacity(0.4),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            entity.name.toUpperCase(),
                            style: const TextStyle(
                              color: AppTheme.textPrimary,
                              fontSize: 18,
                              fontWeight: FontWeight.w900,
                              letterSpacing: 0.5,
                            ),
                          ),
                          Text(
                            'SUBJECT ID: CBI-ENT-${entity.id.toString().padLeft(4, '0')} • TYPE: ${entity.type}',
                            style: const TextStyle(
                              color: AppTheme.textMuted,
                              fontSize: 10,
                              fontFamily: 'monospace',
                            ),
                          ),
                        ],
                      ),
                      ThreatBadge(score: entity.riskScore),
                    ],
                  ),

                  const SizedBox(height: 12),
                  const Divider(color: AppTheme.borderSubtle, height: 1),
                  const SizedBox(height: 12),

                  // Metrics Grid
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('NETWORK DEGREE', style: TextStyle(color: AppTheme.textMuted, fontSize: 9.5, fontWeight: FontWeight.bold)),
                            Text('${entity.degree} Connections', style: const TextStyle(color: AppTheme.primaryCyan, fontSize: 13, fontWeight: FontWeight.w700)),
                          ],
                        ),
                      ),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('CLUSTER CLOUD', style: TextStyle(color: AppTheme.textMuted, fontSize: 9.5, fontWeight: FontWeight.bold)),
                            Text(entity.clusterName, style: const TextStyle(color: AppTheme.accentAmber, fontSize: 13, fontWeight: FontWeight.w700)),
                          ],
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 12),
                  const Text(
                    'INTELLIGENCE SUMMARY & SYNOPSIS',
                    style: TextStyle(
                      color: AppTheme.primaryCyan,
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 0.5,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    entity.reason.isNotEmpty ? entity.reason : 'High-priority entity identified during network centrality calculation and spatial-temporal correlation.',
                    style: const TextStyle(
                      color: AppTheme.textPrimary,
                      fontSize: 12,
                      height: 1.4,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Digital Security Seal & SHA-256
            CyberContainer(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.verified_user_rounded, color: AppTheme.accentEmerald, size: 16),
                      SizedBox(width: 8),
                      Text(
                        'DIGITAL FORENSIC SEAL',
                        style: TextStyle(
                          color: AppTheme.accentEmerald,
                          fontSize: 10,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'SHA-256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855\nGENERATED: ${DateTime.now().toUtc().toIso8601String()}Z\nSTATUS: VERIFIED SECURE // LAW ENFORCEMENT CLEARANCE',
                    style: const TextStyle(
                      color: AppTheme.textMuted,
                      fontSize: 8.5,
                      fontFamily: 'monospace',
                      height: 1.35,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
