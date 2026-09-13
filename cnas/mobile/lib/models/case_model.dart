class CaseSummary {
  final int id;
  final String title;
  final String description;
  final String status;
  final String severity;
  final int entityCount;
  final int eventCount;

  CaseSummary({
    required this.id,
    required this.title,
    required this.description,
    required this.status,
    required this.severity,
    required this.entityCount,
    required this.eventCount,
  });

  factory CaseSummary.fromJson(Map<String, dynamic> json) {
    return CaseSummary(
      id: json['id'] ?? 0,
      title: json['title'] ?? 'Untitled Case',
      description: json['description'] ?? '',
      status: json['status'] ?? 'Open',
      severity: json['severity'] ?? 'Medium',
      entityCount: json['entity_count'] ?? 0,
      eventCount: json['event_count'] ?? 0,
    );
  }
}

class CaseDetailModel {
  final int id;
  final String title;
  final String description;
  final String status;
  final String severity;
  final List<dynamic> entities;
  final List<dynamic> events;

  CaseDetailModel({
    required this.id,
    required this.title,
    required this.description,
    required this.status,
    required this.severity,
    required this.entities,
    required this.events,
  });

  factory CaseDetailModel.fromJson(Map<String, dynamic> json) {
    return CaseDetailModel(
      id: json['id'] ?? 0,
      title: json['title'] ?? 'Untitled Case',
      description: json['description'] ?? '',
      status: json['status'] ?? 'Open',
      severity: json['severity'] ?? 'Medium',
      entities: json['entities'] as List<dynamic>? ?? [],
      events: json['events'] as List<dynamic>? ?? [],
    );
  }
}
