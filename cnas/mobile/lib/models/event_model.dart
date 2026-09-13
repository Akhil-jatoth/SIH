class GisTimelineEvent {
  final int id;
  final int caseId;
  final int entityId;
  final String timestamp;
  final String description;
  final double latitude;
  final double longitude;
  final String pincode;
  final String entityName;
  final String caseTitle;

  GisTimelineEvent({
    required this.id,
    required this.caseId,
    required this.entityId,
    required this.timestamp,
    required this.description,
    required this.latitude,
    required this.longitude,
    required this.pincode,
    required this.entityName,
    required this.caseTitle,
  });

  factory GisTimelineEvent.fromJson(Map<String, dynamic> json) {
    return GisTimelineEvent(
      id: json['id'] ?? 0,
      caseId: json['case_id'] ?? 0,
      entityId: json['entity_id'] ?? 0,
      timestamp: json['timestamp'] ?? '',
      description: json['description'] ?? '',
      latitude: (json['latitude'] as num?)?.toDouble() ?? 0.0,
      longitude: (json['longitude'] as num?)?.toDouble() ?? 0.0,
      pincode: json['pincode']?.toString() ?? '',
      entityName: json['entity_name'] ?? 'Unknown Entity',
      caseTitle: json['case_title'] ?? 'General Investigation',
    );
  }
}
