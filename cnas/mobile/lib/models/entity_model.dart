class EntityNode {
  final int id;
  final String name;
  final String type;
  final double riskScore;
  final Map<String, dynamic> attributes;
  final int degree;
  final double compositeCentrality;
  final double betweennessCentrality;
  final int clusterId;
  final String clusterName;
  final String reason;

  EntityNode({
    required this.id,
    required this.name,
    required this.type,
    required this.riskScore,
    required this.attributes,
    required this.degree,
    required this.compositeCentrality,
    required this.betweennessCentrality,
    required this.clusterId,
    required this.clusterName,
    required this.reason,
  });

  factory EntityNode.fromJson(Map<String, dynamic> json) {
    return EntityNode(
      id: json['id'] ?? 0,
      name: json['name'] ?? 'Unknown',
      type: json['type'] ?? 'Person',
      riskScore: (json['risk_score'] as num?)?.toDouble() ?? 0.0,
      attributes: json['attributes'] as Map<String, dynamic>? ?? {},
      degree: json['degree'] ?? 0,
      compositeCentrality: (json['composite_centrality'] as num?)?.toDouble() ?? 0.0,
      betweennessCentrality: (json['betweenness_centrality'] as num?)?.toDouble() ?? 0.0,
      clusterId: json['cluster_id'] ?? 0,
      clusterName: json['cluster_name'] ?? 'General',
      reason: json['reason'] ?? '',
    );
  }
}

class KeyEntityModel {
  final int id;
  final String name;
  final String type;
  final double riskScore;
  final double degreeCentrality;
  final double betweennessCentrality;
  final double compositeCentrality;
  final String reason;
  final Map<String, dynamic> attributes;

  KeyEntityModel({
    required this.id,
    required this.name,
    required this.type,
    required this.riskScore,
    required this.degreeCentrality,
    required this.betweennessCentrality,
    required this.compositeCentrality,
    required this.reason,
    required this.attributes,
  });

  factory KeyEntityModel.fromJson(Map<String, dynamic> json) {
    return KeyEntityModel(
      id: json['id'] ?? 0,
      name: json['name'] ?? 'Unknown',
      type: json['type'] ?? 'Person',
      riskScore: (json['risk_score'] as num?)?.toDouble() ?? 0.0,
      degreeCentrality: (json['degree_centrality'] as num?)?.toDouble() ?? 0.0,
      betweennessCentrality: (json['betweenness_centrality'] as num?)?.toDouble() ?? 0.0,
      compositeCentrality: (json['composite_centrality'] as num?)?.toDouble() ?? 0.0,
      reason: json['reason'] ?? '',
      attributes: json['attributes'] as Map<String, dynamic>? ?? {},
    );
  }
}
