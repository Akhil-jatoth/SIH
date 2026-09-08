import {
  StatsSummary,
  GraphData,
  KeyEntity,
  Community,
  Anomaly,
  CaseItem,
  CaseDetail,
  RelatedCase,
  TimelineEvent,
  AssistantResponse,
  AuditLog
} from '../types';

const API_BASE = 'http://localhost:8000/api';

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    });
    if (!res.ok) {
      throw new Error(`API error ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.error(`Failed to fetch from ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // Health
  getHealth: () => fetchJson<{ status: string }>('/health'),

  // Stats Summary
  getStats: () => fetchJson<StatsSummary>('/stats/summary'),

  // Graph Data
  getFullGraph: () => fetchJson<GraphData>('/graph/full'),
  getKeyEntities: (topN = 10) => fetchJson<KeyEntity[]>(`/graph/key-entities?top_n=${topN}`),
  getCommunities: () => fetchJson<Community[]>('/graph/communities'),
  getAnomalies: () => fetchJson<Anomaly[]>('/graph/anomalies'),
  getShortestPath: (sourceId: number, targetId: number) =>
    fetchJson<{ found: boolean; hops?: number; path?: any[]; path_node_ids?: number[]; summary?: string; message?: string }>(
      `/graph/path?source=${sourceId}&target=${targetId}`
    ),

  // Cases
  getCases: () => fetchJson<CaseItem[]>('/cases'),
  getCaseDetail: (caseId: number) => fetchJson<CaseDetail>(`/cases/${caseId}`),
  getRelatedCases: (caseId: number) => fetchJson<RelatedCase[]>(`/cases/${caseId}/related`),

  // Timeline & GIS
  getTimeline: () => fetchJson<TimelineEvent[]>('/timeline'),
  getGisEvents: () => fetchJson<TimelineEvent[]>('/gis/events'),

  // AI Assistant
  queryAssistant: (question: string) =>
    fetchJson<AssistantResponse>('/assistant/query', {
      method: 'POST',
      body: JSON.stringify({ question }),
    }),

  // Audit Logs
  getAuditLogs: () => fetchJson<AuditLog[]>('/audit-logs'),

  // Live Suspect & Telecom Tracker Search
  searchSuspectOrPhone: (query: string) =>
    fetchJson<{
      found: boolean;
      query: string;
      message?: string;
      target?: {
        id: number;
        name: string;
        type: string;
        risk_score: number;
        attributes: Record<string, any>;
        linked_owner?: string;
      };
      associates_count?: number;
      associates?: Array<{
        id: number;
        name: string;
        type: string;
        relation_type: string;
        risk_score: number;
        role: string;
        phone: string;
        alias: string;
        direction: string;
      }>;
      latest_location?: {
        latitude: number;
        longitude: number;
        description: string;
        timestamp: string;
        case_id?: number;
        case_title?: string;
        entity_name?: string;
      };
      movement_history?: Array<{
        latitude: number;
        longitude: number;
        description: string;
        timestamp: string;
        case_title?: string;
      }>;
    }>(`/investigate/search?query=${encodeURIComponent(query)}`),
};
