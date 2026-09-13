import 'dart:convert';
import 'package:http/http.dart' as http;
import '../core/constants/api_constants.dart';
import '../models/stats_model.dart';
import '../models/entity_model.dart';
import '../models/case_model.dart';
import '../models/event_model.dart';
import '../models/assistant_model.dart';
import '../models/mission_transfer_model.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  // Helper GET request
  Future<dynamic> _get(String url) async {
    try {
      final response = await http.get(
        Uri.parse(url),
        headers: {'Content-Type': 'application/json'},
      ).timeout(const Duration(seconds: 15));

      if (response.statusCode >= 200 && response.statusCode < 300) {
        return json.decode(utf8.decode(response.bodyBytes));
      } else {
        throw Exception('Server returned ${response.statusCode}: ${response.body}');
      }
    } catch (e) {
      // If live URL failed, try local fallback if not already on local
      if (ApiConstants.baseUrl != ApiConstants.localBaseUrl) {
        try {
          final fallbackUrl = url.replaceFirst(ApiConstants.baseUrl, ApiConstants.localBaseUrl);
          final response = await http.get(
            Uri.parse(fallbackUrl),
            headers: {'Content-Type': 'application/json'},
          ).timeout(const Duration(seconds: 5));
          if (response.statusCode >= 200 && response.statusCode < 300) {
            ApiConstants.baseUrl = ApiConstants.localBaseUrl;
            return json.decode(utf8.decode(response.bodyBytes));
          }
        } catch (_) {}
      }
      rethrow;
    }
  }

  // Helper POST request
  Future<dynamic> _post(String url, Map<String, dynamic> body) async {
    try {
      final response = await http.post(
        Uri.parse(url),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(body),
      ).timeout(const Duration(seconds: 25));

      if (response.statusCode >= 200 && response.statusCode < 300) {
        return json.decode(utf8.decode(response.bodyBytes));
      } else {
        throw Exception('Server returned ${response.statusCode}: ${response.body}');
      }
    } catch (e) {
      rethrow;
    }
  }

  // 1. Health Check
  Future<bool> checkHealth() async {
    try {
      final data = await _get(ApiConstants.health);
      return data['status'] == 'ok';
    } catch (_) {
      return false;
    }
  }

  // 2. Stats Summary
  Future<StatsSummary> getStatsSummary() async {
    final data = await _get(ApiConstants.statsSummary);
    return StatsSummary.fromJson(data);
  }

  // 3. Key Entities
  Future<List<KeyEntityModel>> getKeyEntities({int topN = 10}) async {
    final data = await _get('${ApiConstants.keyEntities}?top_n=$topN');
    if (data is List) {
      return data.map((item) => KeyEntityModel.fromJson(item)).toList();
    }
    return [];
  }

  // 4. Full Graph Nodes
  Future<List<EntityNode>> getFullGraphEntities() async {
    final data = await _get(ApiConstants.fullGraph);
    if (data != null && data['nodes'] is List) {
      return (data['nodes'] as List).map((node) => EntityNode.fromJson(node)).toList();
    }
    return [];
  }

  // 5. Shortest Path Finder
  Future<Map<String, dynamic>> findShortestPath(int sourceId, int targetId) async {
    final data = await _get(ApiConstants.shortestPath(sourceId, targetId));
    return data as Map<String, dynamic>;
  }

  // 6. Cases List
  Future<List<CaseSummary>> getCases() async {
    final data = await _get(ApiConstants.cases);
    if (data is List) {
      return data.map((item) => CaseSummary.fromJson(item)).toList();
    }
    return [];
  }

  // 7. Case Detail
  Future<CaseDetailModel> getCaseDetail(int caseId) async {
    final data = await _get(ApiConstants.caseDetail(caseId));
    return CaseDetailModel.fromJson(data);
  }

  // 8. GIS Events & Timeline
  Future<List<GisTimelineEvent>> getGisEvents() async {
    final data = await _get(ApiConstants.gisEvents);
    if (data is List) {
      return data.map((item) => GisTimelineEvent.fromJson(item)).toList();
    }
    return [];
  }

  // 9. AI Assistant Query
  Future<AssistantResponseModel> queryAssistant(String question) async {
    final data = await _post(ApiConstants.assistantQuery, {'question': question});
    return AssistantResponseModel.fromJson(data);
  }

  // 10. Suspect & Phone Radar Search
  Future<Map<String, dynamic>> searchSuspectOrPhone(String query) async {
    final data = await _get(ApiConstants.searchSuspectOrPhone(query));
    return data as Map<String, dynamic>;
  }

  // 11. Coordinates Resolve
  Future<Map<String, dynamic>> resolveCoordinates(double lat, double lon, {int radiusKm = 100}) async {
    final data = await _get(ApiConstants.resolveCoordinates(lat, lon, radiusKm: radiusKm));
    return data as Map<String, dynamic>;
  }

  // 12. Dynamic Ingest Entity
  Future<Map<String, dynamic>> ingestEntity(Map<String, dynamic> payload) async {
    final data = await _post('${ApiConstants.baseUrl}/ingest/entity', payload);
    return data as Map<String, dynamic>;
  }

  // 13. Dynamic Ingest Relationship
  Future<Map<String, dynamic>> ingestRelationship(Map<String, dynamic> payload) async {
    final data = await _post('${ApiConstants.baseUrl}/ingest/relationship', payload);
    return data as Map<String, dynamic>;
  }

  // 14. Mission Transfers
  Future<List<MissionTransferModel>> getMissionTransfers() async {
    final data = await _get(ApiConstants.missionTransfers);
    if (data is List) {
      return data.map((item) => MissionTransferModel.fromJson(item)).toList();
    }
    return [];
  }

  // 15. Create Mission Transfer
  Future<Map<String, dynamic>> createMissionTransfer(Map<String, dynamic> payload) async {
    final data = await _post('${ApiConstants.baseUrl}/mission/transfer', payload);
    return data as Map<String, dynamic>;
  }

  // 16. Unlock Mission Transfer
  Future<Map<String, dynamic>> unlockMissionTransfer(String transferId, String passCode) async {
    final data = await _post('${ApiConstants.baseUrl}/mission/unlock', {
      'transfer_id': transferId,
      'passcode': passCode,
    });
    return data as Map<String, dynamic>;
  }

  // 17. Audit Logs
  Future<List<AuditLogModel>> getAuditLogs() async {
    final data = await _get(ApiConstants.auditLogs);
    if (data is List) {
      return data.map((item) => AuditLogModel.fromJson(item)).toList();
    }
    return [];
  }
}
