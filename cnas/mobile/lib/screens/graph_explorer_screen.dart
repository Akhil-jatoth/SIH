import 'package:flutter/material.dart';
import '../core/theme/app_theme.dart';
import '../models/entity_model.dart';
import '../services/api_service.dart';
import '../widgets/cyber_container.dart';
import '../widgets/threat_badge.dart';
import 'official_dossier_screen.dart';

class GraphExplorerScreen extends StatefulWidget {
  const GraphExplorerScreen({super.key});

  @override
  State<GraphExplorerScreen> createState() => _GraphExplorerScreenState();
}

class _GraphExplorerScreenState extends State<GraphExplorerScreen> {
  final ApiService _apiService = ApiService();
  bool _isLoading = true;
  List<EntityNode> _nodes = [];
  List<EntityNode> _filteredNodes = [];
  String _selectedFilter = 'All';
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _loadGraphData();
  }

  Future<void> _loadGraphData() async {
    setState(() => _isLoading = true);
    try {
      final nodes = await _apiService.getFullGraphEntities();
      if (mounted) {
        setState(() {
          _nodes = nodes;
          _applyFilters();
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  void _applyFilters() {
    setState(() {
      _filteredNodes = _nodes.where((node) {
        final matchesSearch = _searchQuery.isEmpty ||
            node.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
            node.type.toLowerCase().contains(_searchQuery.toLowerCase());

        final matchesType = _selectedFilter == 'All' ||
            node.type.toLowerCase() == _selectedFilter.toLowerCase() ||
            (_selectedFilter == 'High Risk' && node.riskScore >= 0.8);

        return matchesSearch && matchesType;
      }).toList();
    });
  }

  @override
  Widget build(BuildContext context) {
    final filterOptions = ['All', 'High Risk', 'Person', 'Organization', 'Phone', 'Account'];

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('NETWORK GRAPH EXPLORER'),
        backgroundColor: AppTheme.surface,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppTheme.primaryCyan))
          : Column(
              children: [
                // Top Search Bar
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
                  child: TextField(
                    style: const TextStyle(color: AppTheme.textPrimary, fontSize: 13),
                    decoration: InputDecoration(
                      hintText: 'Filter nodes by name or identifier...',
                      hintStyle: const TextStyle(color: AppTheme.textMuted, fontSize: 12),
                      prefixIcon: const Icon(Icons.search, color: AppTheme.primaryCyan, size: 18),
                      filled: true,
                      fillColor: AppTheme.surface,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: const BorderSide(color: AppTheme.borderSubtle),
                      ),
                    ),
                    onChanged: (val) {
                      _searchQuery = val;
                      _applyFilters();
                    },
                  ),
                ),

                // Filter Chips
                SizedBox(
                  height: 36,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: filterOptions.length,
                    itemBuilder: (context, index) {
                      final opt = filterOptions[index];
                      final isSelected = _selectedFilter == opt;
                      return Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: ChoiceChip(
                          label: Text(opt),
                          selected: isSelected,
                          selectedColor: AppTheme.primaryCyan,
                          backgroundColor: AppTheme.surface,
                          labelStyle: TextStyle(
                            color: isSelected ? Colors.black : AppTheme.textMuted,
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                          ),
                          onSelected: (selected) {
                            if (selected) {
                              setState(() {
                                _selectedFilter = opt;
                                _applyFilters();
                              });
                            }
                          },
                        ),
                      );
                    },
                  ),
                ),

                const SizedBox(height: 8),

                // Node List
                Expanded(
                  child: _filteredNodes.isEmpty
                      ? const Center(
                          child: Text(
                            'No network nodes match current filters.',
                            style: TextStyle(color: AppTheme.textMuted),
                          ),
                        )
                      : ListView.builder(
                          padding: const EdgeInsets.all(16),
                          itemCount: _filteredNodes.length,
                          itemBuilder: (context, index) {
                            final node = _filteredNodes[index];
                            return CyberContainer(
                              margin: const EdgeInsets.only(bottom: 10),
                              padding: const EdgeInsets.all(12),
                              onTap: () {
                                Navigator.of(context).push(
                                  MaterialPageRoute(
                                    builder: (_) => OfficialDossierScreen(entity: node),
                                  ),
                                );
                              },
                              child: Row(
                                children: [
                                  Container(
                                    width: 40,
                                    height: 40,
                                    decoration: BoxDecoration(
                                      color: AppTheme.surface,
                                      borderRadius: BorderRadius.circular(8),
                                      border: Border.all(color: AppTheme.primaryCyan.withOpacity(0.4)),
                                    ),
                                    child: Center(
                                      child: Icon(
                                        node.type.toLowerCase() == 'phone'
                                            ? Icons.phone_android
                                            : node.type.toLowerCase() == 'account'
                                                ? Icons.account_balance
                                                : Icons.person,
                                        color: AppTheme.primaryCyan,
                                        size: 20,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          node.name,
                                          style: const TextStyle(
                                            color: AppTheme.textPrimary,
                                            fontSize: 13.5,
                                            fontWeight: FontWeight.w700,
                                          ),
                                        ),
                                        Text(
                                          '${node.type.toUpperCase()} • ${node.degree} Links • Cluster: ${node.clusterName}',
                                          style: const TextStyle(
                                            color: AppTheme.textMuted,
                                            fontSize: 10,
                                            fontFamily: 'monospace',
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  ThreatBadge(score: node.riskScore),
                                ],
                              ),
                            );
                          },
                        ),
                ),
              ],
            ),
    );
  }
}
