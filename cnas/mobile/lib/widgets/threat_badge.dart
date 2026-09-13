import 'package:flutter/material.dart';
import '../core/theme/app_theme.dart';

class ThreatBadge extends StatelessWidget {
  final double score;
  final bool isCompact;

  const ThreatBadge({
    super.key,
    required this.score,
    this.isCompact = false,
  });

  Color get badgeColor {
    if (score >= 0.8) return AppTheme.threatRed;
    if (score >= 0.5) return AppTheme.accentAmber;
    return AppTheme.accentEmerald;
  }

  String get threatLabel {
    if (score >= 0.8) return 'CRITICAL';
    if (score >= 0.5) return 'ELEVATED';
    return 'LOW';
  }

  @override
  Widget build(BuildContext context) {
    final color = badgeColor;
    final percentage = (score * 100).toStringAsFixed(0);

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: isCompact ? 6 : 10,
        vertical: isCompact ? 2 : 4,
      ),
      decoration: BoxDecoration(
        color: color.withOpacity(0.15),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: color.withOpacity(0.6), width: 0.8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 6,
            height: 6,
            decoration: BoxDecoration(
              color: color,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(color: color.withOpacity(0.8), blurRadius: 4),
              ],
            ),
          ),
          const SizedBox(width: 6),
          Text(
            isCompact ? '$percentage%' : '$threatLabel ($percentage%)',
            style: TextStyle(
              color: color,
              fontSize: isCompact ? 10 : 11,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.5,
            ),
          ),
        ],
      ),
    );
  }
}
