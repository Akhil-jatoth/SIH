import 'package:flutter/material.dart';
import '../core/theme/app_theme.dart';
import '../models/assistant_model.dart';
import '../services/api_service.dart';
import '../widgets/cyber_container.dart';

class AiAssistantScreen extends StatefulWidget {
  const AiAssistantScreen({super.key});

  @override
  State<AiAssistantScreen> createState() => _AiAssistantScreenState();
}

class _AiAssistantScreenState extends State<AiAssistantScreen> {
  final TextEditingController _controller = TextEditingController();
  final ApiService _apiService = ApiService();
  final List<AssistantMessage> _messages = [
    AssistantMessage(
      text: 'Greetings Officer. I am the CBI Neural Knowledge Assistant. Ask me about cartel hierarchies, money trails, suspect coordinates, or centrality paths.',
      isUser: false,
    ),
  ];
  bool _isTyping = false;

  final List<String> _suggestedPrompts = [
    'Who is the main kingpin in the cartel?',
    'Show highest risk suspects in the network',
    'What are the recent hawala transactions?',
  ];

  void _sendMessage([String? promptText]) async {
    final query = promptText ?? _controller.text.trim();
    if (query.isEmpty) return;

    _controller.clear();
    setState(() {
      _messages.add(AssistantMessage(text: query, isUser: true));
      _isTyping = true;
    });

    try {
      final response = await _apiService.queryAssistant(query);
      if (mounted) {
        setState(() {
          _messages.add(AssistantMessage(
            text: response.answer,
            isUser: false,
            modelUsed: response.modelUsed,
            graphContext: response.graphContext,
            suggestedActions: response.suggestedActions,
          ));
          _isTyping = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _messages.add(AssistantMessage(
            text: 'Neural Assistant Error: $e',
            isUser: false,
          ));
          _isTyping = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('CBI NEURAL ASSISTANT'),
        backgroundColor: AppTheme.surface,
      ),
      body: Column(
        children: [
          // Messages List
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final msg = _messages[index];
                return Align(
                  alignment: msg.isUser ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.82),
                    child: CyberContainer(
                      padding: const EdgeInsets.all(12),
                      backgroundColor: msg.isUser
                          ? AppTheme.primaryCyan.withOpacity(0.18)
                          : AppTheme.surfaceCard,
                      borderColor: msg.isUser
                          ? AppTheme.primaryCyan.withOpacity(0.5)
                          : AppTheme.borderSubtle,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          if (!msg.isUser) ...[
                            Row(
                              children: [
                                const Icon(Icons.auto_awesome, color: AppTheme.accentAmber, size: 14),
                                const SizedBox(width: 6),
                                Text(
                                  msg.modelUsed ?? 'CNAS AI Engine',
                                  style: const TextStyle(
                                    color: AppTheme.accentAmber,
                                    fontSize: 9.5,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 6),
                          ],
                          Text(
                            msg.text,
                            style: const TextStyle(
                              color: AppTheme.textPrimary,
                              fontSize: 12.5,
                              height: 1.35,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
          ),

          if (_isTyping)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
              child: Row(
                children: [
                  const SizedBox(
                    width: 14,
                    height: 14,
                    child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.primaryCyan),
                  ),
                  const SizedBox(width: 8),
                  const Text(
                    'Synthesizing network graph reasoning...',
                    style: TextStyle(color: AppTheme.textMuted, fontSize: 11),
                  ),
                ],
              ),
            ),

          // Suggestion Chips
          SizedBox(
            height: 32,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _suggestedPrompts.length,
              itemBuilder: (context, index) {
                final prompt = _suggestedPrompts[index];
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: InkWell(
                    onTap: () => _sendMessage(prompt),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppTheme.surface,
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: AppTheme.borderSubtle),
                      ),
                      child: Text(
                        '💡 $prompt',
                        style: const TextStyle(color: AppTheme.textSecondary, fontSize: 10, fontWeight: FontWeight.w600),
                      ),
                    ),
                  ),
                );
              },
            ),
          ),

          const SizedBox(height: 8),

          // Input Bar
          Container(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
            decoration: const BoxDecoration(
              color: AppTheme.surface,
              border: Border(top: BorderSide(color: AppTheme.border)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _controller,
                    style: const TextStyle(color: AppTheme.textPrimary, fontSize: 13),
                    decoration: InputDecoration(
                      hintText: 'Ask intelligence question...',
                      hintStyle: const TextStyle(color: AppTheme.textMuted, fontSize: 12),
                      filled: true,
                      fillColor: AppTheme.surfaceCard,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: const BorderSide(color: AppTheme.borderSubtle),
                      ),
                    ),
                    onSubmitted: (_) => _sendMessage(),
                  ),
                ),
                const SizedBox(width: 8),
                ElevatedButton(
                  onPressed: _isTyping ? null : () => _sendMessage(),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryCyan,
                    foregroundColor: Colors.black,
                    padding: const EdgeInsets.all(12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  child: const Icon(Icons.send_rounded, size: 20),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
