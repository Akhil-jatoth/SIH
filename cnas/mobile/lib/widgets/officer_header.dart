import 'package:flutter/material.dart';
import '../core/theme/app_theme.dart';

class OfficerHeader extends StatelessWidget {
  final String officerName;
  final String designation;
  final String clearance;
  final VoidCallback? onNotificationTap;

  const OfficerHeader({
    super.key,
    this.officerName = 'Akhil Jatoth',
    this.designation = 'Special Cyber Investigator',
    this.clearance = 'LEVEL-4 TOP SECRET',
    this.onNotificationTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: const BoxDecoration(
        color: AppTheme.surface,
        border: Border(bottom: BorderSide(color: AppTheme.border, width: 1)),
      ),
      child: SafeArea(
        bottom: false,
        child: Row(
          children: [
            // CBI Emblem / Gold Hologram
            Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: const LinearGradient(
                  colors: [AppTheme.accentAmber, Color(0xFFD97706)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                border: Border.all(color: Colors.white.withOpacity(0.3), width: 1),
                boxShadow: [
                  BoxShadow(
                    color: AppTheme.accentAmber.withOpacity(0.3),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: const Center(
                child: Icon(Icons.shield_rounded, color: Colors.black87, size: 22),
              ),
            ),
            const SizedBox(width: 12),

            // Officer Info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(
                    children: [
                      Flexible(
                        child: Text(
                          officerName,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            color: AppTheme.textPrimary,
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 0.3,
                          ),
                        ),
                      ),
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                        decoration: BoxDecoration(
                          color: AppTheme.primaryCyan.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(4),
                          border: Border.all(color: AppTheme.primaryCyan.withOpacity(0.5), width: 0.6),
                        ),
                        child: const Text(
                          'CBI-IND',
                          style: TextStyle(
                            color: AppTheme.primaryCyan,
                            fontSize: 9,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '$designation • $clearance',
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      color: AppTheme.textMuted,
                      fontSize: 10.5,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),

            // Action / Notification Button
            if (onNotificationTap != null)
              IconButton(
                icon: const Icon(Icons.security_update_good_rounded, color: AppTheme.primaryCyan, size: 22),
                onPressed: onNotificationTap,
                tooltip: 'Clearance Status',
              ),
          ],
        ),
      ),
    );
  }
}
