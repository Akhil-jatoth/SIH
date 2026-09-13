import 'package:flutter/material.dart';
import '../core/theme/app_theme.dart';
import '../services/api_service.dart';
import '../widgets/cyber_container.dart';
import '../widgets/threat_badge.dart';

class SuspectRadarScreen extends StatefulWidget {
  const SuspectRadarScreen({super.key});

  @override
  State<SuspectRadarScreen> createState() => _SuspectRadarScreenState();
}

class _SuspectRadarScreenState extends State<SuspectRadarScreen> {
  final TextEditingController _searchController = TextEditingController();
  final ApiService _apiService = ApiService();
  bool _isLoading = false;
  Map<String, dynamic>? _searchResult;
  String? _errorMessage;

  final List<String> _quickQueries = [
    'Vikram',
    '9876543210',
    'Rajesh',
    'Hawala',
    'Arms',
  ];

  void _performSearch(String query) async {
    if (query.trim().isEmpty) return;
    FocusScope.of(context).unfocus();

    setState(() {
      _isLoading = true;
      _errorMessage = null;
      _searchResult = null;
    });

    try {
      final res = await _apiService.searchSuspectOrPhone(query.trim());
      setState(() {
        _searchResult = res;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to execute radar scan: $e';
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('RADAR SUSPECT TRACKER'),
        backgroundColor: AppTheme.surface,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Search Input Container
            CyberContainer(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'TELECOM & SUSPECT INTELLIGENCE SEARCH',
                    style: TextStyle(
                      color: AppTheme.primaryCyan,
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 0.5,
                    ),
                  ),
                  const SizedBox(height: 8),

                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _searchController,
                          style: const TextStyle(color: AppTheme.textPrimary, fontSize: 13),
                          decoration: InputDecoration(
                            hintText: 'Enter phone number, name, or alias...',
                            hintStyle: const TextStyle(color: AppTheme.textMuted, fontSize: 11.5),
                            filled: true,
                            fillColor: AppTheme.surface,
                            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                              borderSide: const BorderSide(color: AppTheme.borderSubtle),
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                              borderSide: const BorderSide(color: AppTheme.borderSubtle),
                            ),
                          ),
                          onSubmitted: _performSearch,
                        ),
                      ),
                      const SizedBox(width: 8),
                      ElevatedButton(
                        onPressed: _isLoading ? null : () => _performSearch(_searchController.text),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.primaryCyan,
                          foregroundColor: Colors.black,
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                        child: _isLoading
                            ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black87))
                            : const Icon(Icons.radar, size: 20),
                      ),
                    ],
                  ),

                  const SizedBox(height: 10),

                  // Quick Query Chips
                  Wrap(
                    spacing: 6,
                    runSpacing: 6,
                    children: _quickQueries.map((query) {
                      return InkWell(
                        onTap: () {
                          _searchController.text = query;
                          _performSearch(query);
                        },
                        borderRadius: BorderRadius.circular(4),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: AppTheme.surface,
                            borderRadius: BorderRadius.circular(4),
                            border: Border.all(color: AppTheme.borderSubtle, width: 0.8),
                          ),
                          child: Text(
                            '⚡ $query',
                            style: const TextStyle(color: AppTheme.textMuted, fontSize: 10, fontWeight: FontWeight.w600),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            if (_errorMessage != null)
              CyberContainer(
                borderColor: AppTheme.threatRed.withOpacity(0.5),
                backgroundColor: AppTheme.threatRed.withOpacity(0.1),
                child: Text(
                  _errorMessage!,
                  style: const TextStyle(color: AppTheme.threatRed, fontSize: 12),
                ),
              ),

            if (_searchResult != null) ...[
              if (_searchResult!['found'] == true) ...[
                // Target Profile Card
                CyberContainer(
                  borderColor: AppTheme.accentAmber.withOpacity(0.5),
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
                                _searchResult!['target']?['name'] ?? 'Target Identified',
                                style: const TextStyle(
                                  color: AppTheme.textPrimary,
                                  fontSize: 16,
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                              Text(
                                'TYPE: ${_searchResult!['target']?['type'] ?? 'Person'}',
                                style: const TextStyle(
                                  color: AppTheme.textMuted,
                                  fontSize: 10.5,
                                  fontFamily: 'monospace',
                                ),
                              ),
                            ],
                          ),
                          ThreatBadge(
                            score: ((_searchResult!['target']?['risk_score'] as num?)?.toDouble() ?? 0.5),
                          ),
                        ],
                      ),

                      const SizedBox(height: 12),

                      // Latest Known Coordinates
                      if (_searchResult!['latest_location'] != null) ...[
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: AppTheme.surface,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: AppTheme.primaryCyan.withOpacity(0.4), width: 0.8),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Row(
                                children: [
                                  Icon(Icons.location_on, color: AppTheme.primaryCyan, size: 14),
                                  SizedBox(width: 6),
                                  Text(
                                    'LATEST TELEMETRY POSITION',
                                    style: TextStyle(
                                      color: AppTheme.primaryCyan,
                                      fontSize: 10,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Text(
                                '${_searchResult!['latest_location']['area'] ?? ''}, ${_searchResult!['latest_location']['city'] ?? ''} (PIN: ${_searchResult!['latest_location']['pincode'] ?? 'N/A'})',
                                style: const TextStyle(color: AppTheme.textPrimary, fontSize: 12, fontWeight: FontWeight.w600),
                              ),
                              Text(
                                'COORDS: ${_searchResult!['latest_location']['latitude']}, ${_searchResult!['latest_location']['longitude']}',
                                style: const TextStyle(color: AppTheme.textMuted, fontSize: 10, fontFamily: 'monospace'),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ],
                  ),
                ),

                const SizedBox(height: 16),

                // Linked Associates
                if (_searchResult!['associates'] is List && (_searchResult!['associates'] as List).isNotEmpty) ...[
                  const Text(
                    'LINKED CALL & TRANSACTION ASSOCIATES',
                    style: TextStyle(
                      color: AppTheme.textMuted,
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 0.5,
                    ),
                  ),
                  const SizedBox(height: 8),

                  ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: (_searchResult!['associates'] as List).length,
                    itemBuilder: (context, index) {
                      final assoc = _searchResult!['associates'][index];
                      return CyberContainer(
                        margin: const EdgeInsets.only(bottom: 8),
                        padding: const EdgeInsets.all(10),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  assoc['name'] ?? 'Associate',
                                  style: const TextStyle(color: AppTheme.textPrimary, fontSize: 13, fontWeight: FontWeight.w700),
                                ),
                                Text(
                                  'RELATION: ${assoc['relation_type'] ?? 'connected'} • ROLE: ${assoc['role'] ?? 'Node'}',
                                  style: const TextStyle(color: AppTheme.textMuted, fontSize: 10),
                                ),
                              ],
                            ),
                            ThreatBadge(
                              score: ((assoc['risk_score'] as num?)?.toDouble() ?? 0.5),
                              isCompact: true,
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ],
              ] else ...[
                CyberContainer(
                  child: Center(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 24),
                      child: Column(
                        children: [
                          const Icon(Icons.search_off, color: AppTheme.textMuted, size: 36),
                          const SizedBox(height: 8),
                          Text(
                            _searchResult!['message'] ?? 'No records matching query',
                            style: const TextStyle(color: AppTheme.textMuted, fontSize: 12),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ],
          ],
        ),
      ),
    );
  }
}
