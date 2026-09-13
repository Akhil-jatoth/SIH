class ApiConstants {
  // Live Render production API backend
  static const String liveBaseUrl = 'https://sih-gctv.onrender.com/api';

  // Local fallback (Android Emulator: 10.0.2.2, Physical device: LAN IP)
  static const String localBaseUrl = 'http://10.0.2.2:8000/api';

  // Active base URL (defaults to live Render cloud backend)
  static String baseUrl = liveBaseUrl;

  // Endpoints
  static String get health => '$baseUrl/health';
  static String get statsSummary => '$baseUrl/stats/summary';
  static String get fullGraph => '$baseUrl/graph/full';
  static String get keyEntities => '$baseUrl/graph/key-entities';
  static String get communities => '$baseUrl/graph/communities';
  static String get anomalies => '$baseUrl/graph/anomalies';
  static String get cases => '$baseUrl/cases';
  static String get timeline => '$baseUrl/timeline';
  static String get gisEvents => '$baseUrl/gis/events';
  static String get assistantQuery => '$baseUrl/assistant/query';
  static String get auditLogs => '$baseUrl/audit-logs';
  static String get missionTransfers => '$baseUrl/mission/transfers';
  static String get breachAlerts => '$baseUrl/mission/alerts/latest';

  static String entityDossier(int id) => '$baseUrl/graph/entity/$id/dossier';
  static String caseDetail(int id) => '$baseUrl/cases/$id';
  static String relatedCases(int id) => '$baseUrl/cases/$id/related';
  static String shortestPath(int source, int target) =>
      '$baseUrl/graph/path?source=$source&target=$target';
  static String searchSuspectOrPhone(String query) =>
      '$baseUrl/investigate/search?query=${Uri.encodeComponent(query)}';
  static String resolveCoordinates(double lat, double lon, {int radiusKm = 100}) =>
      '$baseUrl/coordinates/resolve?lat=$lat&lon=$lon&radius_km=$radiusKm';
}
