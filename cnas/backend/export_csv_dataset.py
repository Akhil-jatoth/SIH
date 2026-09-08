import os
import csv
import json
import sqlite3
import sys

# Ensure backend directory is in path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.graph_engine import detect_anomalies

DATASET_DIR = r"e:\AJ\SIH\cnas\dataset"
DB_PATH = r"e:\AJ\SIH\cnas\backend\cnas.db"

os.makedirs(DATASET_DIR, exist_ok=True)

conn = sqlite3.connect(DB_PATH)
conn.row_factory = sqlite3.Row
cur = conn.cursor()

# 1. Export entities.csv
cur.execute("SELECT id, name, type, risk_score, attributes FROM entities ORDER BY id")
entities = cur.fetchall()
entities_csv_path = os.path.join(DATASET_DIR, "entities.csv")
with open(entities_csv_path, "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["entity_id", "name", "entity_type", "risk_score", "alias_or_role", "attributes_json"])
    for row in entities:
        attrs = json.loads(row["attributes"] or "{}") if isinstance(row["attributes"], str) else (row["attributes"] or {})
        alias_or_role = attrs.get("alias") or attrs.get("role") or attrs.get("carrier") or attrs.get("model") or ""
        writer.writerow([
            row["id"],
            row["name"],
            row["type"],
            row["risk_score"],
            alias_or_role,
            json.dumps(attrs)
        ])
print(f"[OK] Exported {len(entities)} entities to {entities_csv_path}")

# 2. Export relationships.csv
cur.execute("""
    SELECT r.id, r.source_entity_id, e1.name as source_name, e1.type as source_type,
           r.target_entity_id, e2.name as target_name, e2.type as target_type,
           r.relation_type, r.weight, r.case_id, c.title as case_title
    FROM relationships r
    JOIN entities e1 ON r.source_entity_id = e1.id
    JOIN entities e2 ON r.target_entity_id = e2.id
    LEFT JOIN cases c ON r.case_id = c.id
    ORDER BY r.id
""")
relationships = cur.fetchall()
rel_csv_path = os.path.join(DATASET_DIR, "relationships.csv")
with open(rel_csv_path, "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow([
        "rel_id", "source_entity_id", "source_name", "source_type",
        "target_entity_id", "target_name", "target_type",
        "relation_type", "confidence_weight", "case_id", "case_title"
    ])
    for row in relationships:
        writer.writerow([
            row["id"],
            row["source_entity_id"],
            row["source_name"],
            row["source_type"],
            row["target_entity_id"],
            row["target_name"],
            row["target_type"],
            row["relation_type"],
            row["weight"],
            row["case_id"] or "",
            row["case_title"] or "GENERAL NETWORK"
        ])
print(f"[OK] Exported {len(relationships)} relationships to {rel_csv_path}")

# 3. Export cases_operations.csv
cur.execute("SELECT id, title, status, description, created_at FROM cases ORDER BY id")
cases = cur.fetchall()
cases_csv_path = os.path.join(DATASET_DIR, "cases_operations.csv")
with open(cases_csv_path, "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["case_id", "operation_title", "status", "description", "created_at"])
    for row in cases:
        writer.writerow([
            row["id"],
            row["title"],
            row["status"],
            row["description"] or "",
            row["created_at"]
        ])
print(f"[OK] Exported {len(cases)} cases to {cases_csv_path}")

# 4. Export timeline_gis_telemetry.csv
cur.execute("""
    SELECT ev.id, ev.entity_id, e.name as entity_name, e.type as entity_type,
           ev.case_id, c.title as case_title, ev.latitude, ev.longitude,
           ev.timestamp, ev.description
    FROM events ev
    LEFT JOIN entities e ON ev.entity_id = e.id
    LEFT JOIN cases c ON ev.case_id = c.id
    ORDER BY ev.timestamp
""")
events = cur.fetchall()
timeline_csv_path = os.path.join(DATASET_DIR, "timeline_gis_telemetry.csv")
with open(timeline_csv_path, "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow([
        "event_id", "entity_id", "entity_name", "entity_type",
        "case_id", "case_title", "latitude", "longitude",
        "timestamp", "location_telemetry_description"
    ])
    for row in events:
        writer.writerow([
            row["id"],
            row["entity_id"],
            row["entity_name"],
            row["entity_type"],
            row["case_id"] or "",
            row["case_title"] or "PATROL SURVEILLANCE",
            row["latitude"],
            row["longitude"],
            row["timestamp"],
            row["description"]
        ])
print(f"[OK] Exported {len(events)} timeline GIS events to {timeline_csv_path}")

# 5. Export intelligence_anomalies.csv
db = SessionLocal()
try:
    anomalies = detect_anomalies(db)
    anomalies_csv_path = os.path.join(DATASET_DIR, "intelligence_anomalies.csv")
    with open(anomalies_csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([
            "anomaly_id", "entity_id", "entity_name", "entity_type",
            "severity", "title", "trigger_reason", "details"
        ])
        for a in anomalies:
            writer.writerow([
                a.get("id"),
                a.get("entity_id"),
                a.get("name"),
                a.get("type"),
                a.get("severity"),
                a.get("title"),
                a.get("reason"),
                a.get("description")
            ])
    print(f"[OK] Exported {len(anomalies)} anomalies to {anomalies_csv_path}")
finally:
    db.close()

# 6. Call Detail Records (CDR) Telecom Logs
cdr_csv_path = os.path.join(DATASET_DIR, "cdr_telecom_logs.csv")
with open(cdr_csv_path, "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow([
        "cdr_id", "caller_name", "caller_msisdn", "receiver_name", "receiver_msisdn",
        "call_duration_seconds", "call_type", "cell_tower_bts", "circle_city", "timestamp", "risk_flag"
    ])
    calls_data = [
        ("CDR-001", "Sunil 'Bhai' Deshmukh", "+91-98999-00001", "Kabir Khan", "+91-98110-11223", 420, "Encrypted VoIP/GSM", "BTS-DEL-4091", "Old Delhi", "2026-03-01 02:14:00 IST", "HIGH"),
        ("CDR-002", "Kabir Khan", "+91-98110-11223", "Rahul Verma", "+91-98200-55441", 185, "Burner Direct", "BTS-MAH-3481", "Mumbai BKC", "2026-03-02 11:30:00 IST", "HIGH"),
        ("CDR-003", "Rahul Verma", "+91-98200-55441", "Arjun Mehta", "+91-98450-12345", 310, "Signal Encrypted", "BTS-BLR-9021", "Bengaluru Indiranagar", "2026-03-03 16:45:00 IST", "CRITICAL"),
        ("CDR-004", "Vikram Malhotra", "+91-98110-33211", "Tariq Sheikh", "+91-98300-11998", 65, "VoIP Burst", "BTS-WB-7712", "Petrapole Border", "2026-03-04 23:55:00 IST", "CRITICAL"),
        ("CDR-005", "Sunil 'Bhai' Deshmukh", "+91-98999-00001", "Ananya Das", "+91-98300-11998", 540, "Conference Call", "BTS-RAJ-1102", "Jaipur Cyber Hub", "2026-03-05 14:10:00 IST", "MEDIUM"),
        ("CDR-006", "Priya Sharma", "+91-98450-12345", "Kabir Khan", "+91-98110-11223", 95, "Brief Handoff", "BTS-HYD-5520", "Hyderabad Hitec City", "2026-03-06 09:20:00 IST", "HIGH"),
        ("CDR-007", "Farhan Qureshi", "+91-98200-11229", "Tariq Sheikh", "+91-98300-11998", 412, "Cross-Border Trunk", "BTS-GUJ-8140", "Ahmedabad SG Hwy", "2026-03-07 19:30:00 IST", "HIGH"),
        ("CDR-008", "Rohit Rawat", "+91-98110-33211", "Vikram Malhotra", "+91-98999-00001", 150, "Direct Relay", "BTS-DEL-1022", "Connaught Place", "2026-03-08 13:00:00 IST", "HIGH")
    ]
    for row in calls_data:
        writer.writerow(row)
print(f"[OK] Exported CDR logs to {cdr_csv_path}")

conn.close()
print("\n[SUCCESS] ALL CSV DATASET FILES HAVE BEEN GENERATED AT e:\\AJ\\SIH\\cnas\\dataset\\")
