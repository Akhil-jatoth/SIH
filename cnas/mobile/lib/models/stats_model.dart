class StatsSummary {
  final int entities;
  final int relationships;
  final int cases;
  final int keyEntities;
  final int highRiskEntities;
  final int anomaliesCount;

  StatsSummary({
    required this.entities,
    required this.relationships,
    required this.cases,
    required this.keyEntities,
    required this.highRiskEntities,
    required this.anomaliesCount,
  });

  factory StatsSummary.fromJson(Map<String, dynamic> json) {
    return StatsSummary(
      entities: json['entities'] ?? 0,
      relationships: json['relationships'] ?? 0,
      cases: json['cases'] ?? 0,
      keyEntities: json['key_entities'] ?? 0,
      highRiskEntities: json['high_risk_entities'] ?? 0,
      anomaliesCount: json['anomalies_count'] ?? 0,
    );
  }
}
