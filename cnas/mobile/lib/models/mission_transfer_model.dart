class MissionTransferModel {
  final int id;
  final String transferId;
  final String senderOfficer;
  final String targetOfficer;
  final String targetAgency;
  final String classification;
  final String title;
  final String notes;
  final int payloadSize;
  final int caseCount;
  final int entityCount;
  final int relationshipCount;
  final int eventCount;
  final String createdAt;
  final String expiresAt;
  final int attemptsRemaining;
  final int failedAttempts;
  final bool isUnlocked;
  final bool isDestructed;

  MissionTransferModel({
    required this.id,
    required this.transferId,
    required this.senderOfficer,
    required this.targetOfficer,
    required this.targetAgency,
    required this.classification,
    required this.title,
    required this.notes,
    required this.payloadSize,
    required this.caseCount,
    required this.entityCount,
    required this.relationshipCount,
    required this.eventCount,
    required this.createdAt,
    required this.expiresAt,
    required this.attemptsRemaining,
    required this.failedAttempts,
    required this.isUnlocked,
    required this.isDestructed,
  });

  factory MissionTransferModel.fromJson(Map<String, dynamic> json) {
    return MissionTransferModel(
      id: json['id'] ?? 0,
      transferId: json['transfer_id'] ?? '',
      senderOfficer: json['sender_officer'] ?? '',
      targetOfficer: json['target_officer'] ?? '',
      targetAgency: json['target_agency'] ?? 'CBI HQ',
      classification: json['classification'] ?? 'SECRET',
      title: json['title'] ?? '',
      notes: json['notes'] ?? '',
      payloadSize: json['payload_size'] ?? 0,
      caseCount: json['case_count'] ?? 0,
      entityCount: json['entity_count'] ?? 0,
      relationshipCount: json['relationship_count'] ?? 0,
      eventCount: json['event_count'] ?? 0,
      createdAt: json['created_at'] ?? '',
      expiresAt: json['expires_at'] ?? '',
      attemptsRemaining: json['attempts_remaining'] ?? 3,
      failedAttempts: json['failed_attempts'] ?? 0,
      isUnlocked: json['is_unlocked'] ?? false,
      isDestructed: json['is_destructed'] ?? false,
    );
  }
}

class AuditLogModel {
  final int id;
  final String timestamp;
  final String user;
  final String action;
  final String details;
  final String hash;

  AuditLogModel({
    required this.id,
    required this.timestamp,
    required this.user,
    required this.action,
    required this.details,
    required this.hash,
  });

  factory AuditLogModel.fromJson(Map<String, dynamic> json) {
    return AuditLogModel(
      id: json['id'] ?? 0,
      timestamp: json['timestamp'] ?? '',
      user: json['user'] ?? 'SYSTEM',
      action: json['action'] ?? '',
      details: json['details'] ?? '',
      hash: json['hash'] ?? '',
    );
  }
}
