class AssistantMessage {
  final String text;
  final bool isUser;
  final String? modelUsed;
  final List<dynamic>? graphContext;
  final List<dynamic>? suggestedActions;
  final DateTime timestamp;

  AssistantMessage({
    required this.text,
    required this.isUser,
    this.modelUsed,
    this.graphContext,
    this.suggestedActions,
    DateTime? timestamp,
  }) : timestamp = timestamp ?? DateTime.now();
}

class AssistantResponseModel {
  final String answer;
  final String modelUsed;
  final List<dynamic> graphContext;
  final List<dynamic> suggestedActions;

  AssistantResponseModel({
    required this.answer,
    required this.modelUsed,
    required this.graphContext,
    required this.suggestedActions,
  });

  factory AssistantResponseModel.fromJson(Map<String, dynamic> json) {
    return AssistantResponseModel(
      answer: json['answer'] ?? '',
      modelUsed: json['model_used'] ?? 'CNAS Neural Graph Engine',
      graphContext: json['graph_context'] as List<dynamic>? ?? [],
      suggestedActions: json['suggested_actions'] as List<dynamic>? ?? [],
    );
  }
}
