export type EntityType = 'Person' | 'Vehicle' | 'Phone' | 'Account' | 'Location' | 'Organization';

export interface Entity {
  id: number;
  name: string;
  type: EntityType;
  attributes: Record<string, any>;
  risk_score: number;
  degree?: number;
  composite_centrality?: number;
  betweenness_centrality?: number;
  cluster_id?: number;
  cluster_name?: string;
  reason?: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

export interface Relationship {
  id: number;
  source: number | Entity;
  target: number | Entity;
  relation_type: string;
  weight: number;
  timestamp?: string;
  case_id?: number;
}

export interface GraphData {
  nodes: Entity[];
  links: Relationship[];
}

export interface KeyEntity {
  id: number;
  name: string;
  type: EntityType;
  risk_score: number;
  degree: number;
  degree_centrality: number;
  betweenness_centrality: number;
  composite_centrality: number;
  reason: string;
}

export interface CommunityMember {
  id: number;
  name: string;
  type: EntityType;
  risk_score: number;
}

export interface Community {
  cluster_id: number;
  name: string;
  size: number;
  members: CommunityMember[];
}

export interface Anomaly {
  id: string;
  entity_id: number;
  name: string;
  type: EntityType;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  title: string;
  description: string;
  reason: string;
}

export interface CaseItem {
  id: number;
  title: string;
  status: 'Active' | 'Under Review' | 'Closed' | 'Critical';
  created_at: string;
  description?: string;
  entity_count?: number;
  event_count?: number;
}

export interface RelatedCase {
  case_id: number;
  title: string;
  status: string;
  shared_count: number;
  shared_entities: Array<{ id: number; name: string; type: EntityType }>;
  reason: string;
}

export interface CaseDetail extends CaseItem {
  entities: Entity[];
  events: TimelineEvent[];
}

export interface TimelineEvent {
  id: number;
  entity_id: number;
  entity_name: string;
  entity_type: EntityType;
  case_id?: number;
  case_title: string;
  description: string;
  timestamp: string;
  latitude: number;
  longitude: number;
}

export interface StatsSummary {
  entities: number;
  relationships: number;
  cases: number;
  key_entities: number;
  high_risk_entities: number;
  anomalies_count: number;
}

export interface AuditLog {
  id: number;
  timestamp: string;
  action: string;
  actor: string;
  details: string;
  block_hash: string;
}

export interface AssistantResponse {
  answer: string;
  intent: string;
  data: Record<string, any>;
  suggested_entities: number[];
}
