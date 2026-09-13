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
  source_name?: string;
  target_name?: string;
  relation_type: string;
  label?: string;
  weight: number;
  timestamp?: string;
  case_id?: number;
}

export interface EntityDossierConnection {
  relationship_id: number;
  direction: 'outgoing' | 'incoming';
  relation_type: string;
  target_id: number;
  target_name: string;
  target_type: EntityType;
  target_risk: number;
  target_attributes: Record<string, any>;
  case_id?: number;
  description: string;
}

export interface BankTransactionItem {
  account_id: number;
  account_name: string;
  bank_name: string;
  branch: string;
  balance: string;
  status: string;
  risk_score: number;
  last_transaction: {
    amount: string;
    type: string;
    timestamp: string;
    status: string;
  };
}

export interface VehicleItem {
  vehicle_id: number;
  name: string;
  plate_number: string;
  make_model: string;
  color: string;
  registered_owner: string;
  risk_score: number;
  status: string;
}

export interface PhoneItem {
  phone_id: number | string;
  number: string;
  carrier: string;
  imei: string;
  status: string;
}

export interface LastDisconnectedLocation {
  latitude: number;
  longitude: number;
  description: string;
  timestamp: string;
  case_id?: number;
  case_title?: string;
  cell_tower: string;
  triangulation_status: string;
  signal_drop_time: string;
}

export interface EntityDossier {
  entity: {
    id: number;
    name: string;
    type: EntityType;
    risk_score: number;
    attributes: Record<string, any>;
    role: string;
    alias: string;
    citizenship: string;
    phone: string;
  };
  connections_count: number;
  connections: EntityDossierConnection[];
  bank_transactions: BankTransactionItem[];
  vehicles: VehicleItem[];
  phones: PhoneItem[];
  last_disconnected_location: LastDisconnectedLocation;
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

export interface CoordinatesResolveResponse {
  query_coordinates: {
    latitude: number;
    longitude: number;
    formatted: string;
  };
  resolved_metadata: {
    pincode: string;
    city: string;
    state: string;
    area: string;
    formatted_address: string;
    nearest_bts_tower: string;
    carrier_sector: string;
  };
  nearby_entities_count: number;
  nearby_entities: Array<{
    entity_id: number;
    name: string;
    type: EntityType;
    risk_score: number;
    distance_km: number;
    last_known_ping: string;
    event_description: string;
  }>;
  nearby_events_count: number;
  nearby_events: Array<{
    event_id: number;
    entity_id: number;
    entity_name: string;
    entity_type: EntityType;
    risk_score: number;
    latitude: number;
    longitude: number;
    distance_km: number;
    description: string;
    timestamp: string;
    case_id?: number;
    case_title?: string;
  }>;
}

export interface IngestEntityPayload {
  name: string;
  type: EntityType;
  risk_score?: number;
  attributes?: Record<string, any>;
  latitude?: number;
  longitude?: number;
  link_to_entity_id?: number;
  relation_type?: string;
  case_id?: number;
}

export interface IngestRelationshipPayload {
  source_id: number;
  target_id: number;
  relation_type: string;
  weight?: number;
  case_id?: number;
}

export interface IngestDatasetPayload {
  csv_text?: string;
  dataset_type?: string;
  entities?: Array<Record<string, any>>;
  relationships?: Array<Record<string, any>>;
  events?: Array<Record<string, any>>;
  case_id?: number;
  source_note?: string;
}

export interface IngestResponse {
  success: boolean;
  message: string;
  created_entities_count?: number;
  created_entities?: Array<{ id: number; name: string; type: string }>;
  created_relationships_count?: number;
  created_relationships?: Array<{ id: number; source_id: number; target_id: number; relation_type: string }>;
  created_events_count?: number;
  created_events?: Array<{ id: number; entity_id: number; latitude: number; longitude: number }>;
}

export interface MissionTransfer {
  id: number;
  operation_name: string;
  outgoing_officer_name: string;
  outgoing_officer_badge: string;
  outgoing_officer_rank: string;
  outgoing_officer_department: string;
  outgoing_officer_clearance: string;
  outgoing_officer_zone?: string;
  outgoing_officer_service_no?: string;
  handover_notes?: string;
  handover_notes_preview?: string;
  target_officer_name: string;
  target_officer_badge?: string;
  status: 'LOCKED_PENDING' | 'CLAIMED' | 'COMPROMISED_ALERT' | 'DESTROYED_PURGED';
  failed_attempts: number;
  max_attempts: number;
  created_at: string;
  updated_at?: string;
  claimed_at?: string;
  case_id?: number;
  has_payload?: boolean;
  payload?: any;
}

export interface CreateMissionTransferPayload {
  operation_name: string;
  code_word: string;
  case_id?: number;
  outgoing_officer_name: string;
  outgoing_officer_badge: string;
  outgoing_officer_rank: string;
  outgoing_officer_department: string;
  outgoing_officer_clearance?: string;
  outgoing_officer_zone?: string;
  outgoing_officer_service_no?: string;
  handover_notes?: string;
  target_officer_name: string;
  target_officer_badge?: string;
}

export interface UnlockMissionPayload {
  operation_name: string;
  code_word: string;
  face_snapshot_base64?: string;
  attempted_by_name?: string;
  ip_address?: string;
  user_agent?: string;
}

export interface UnlockMissionResponse {
  success: boolean;
  destroyed: boolean;
  attempt?: number;
  remaining_attempts?: number;
  operation_name?: string;
  alert_id?: number;
  message: string;
  important_note?: string;
  mission?: MissionTransfer;
}

export interface IntruderBreachAlert {
  id: number;
  transfer_id?: number;
  operation_name: string;
  attempt_number: number;
  face_snapshot_base64?: string;
  timestamp: string;
  ip_address: string;
  user_agent: string;
  severity: string;
  status: 'ACTIVE_ALERT' | 'ACKNOWLEDGED' | 'PURGED';
}


