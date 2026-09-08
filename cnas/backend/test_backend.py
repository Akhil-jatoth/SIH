import os
import sys
from fastapi.testclient import TestClient

from main import app
from app.database import engine, Base, SessionLocal
from app.mock_data import seed_database

def run_tests():
    print("Testing CNAS Backend initialization...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    seed_database(db)
    db.close()

    client = TestClient(app)

    # 1. Health
    r = client.get("/api/health")
    assert r.status_code == 200, f"Health check failed: {r.text}"
    print("[OK] /api/health passed:", r.json())

    # 2. Stats
    r = client.get("/api/stats/summary")
    assert r.status_code == 200, f"Stats failed: {r.text}"
    stats = r.json()
    print("[OK] /api/stats/summary passed:", stats)
    assert stats["entities"] >= 60, f"Expected >= 60 entities, got {stats['entities']}"
    assert stats["relationships"] >= 100, f"Expected >= 100 relationships, got {stats['relationships']}"
    assert stats["cases"] >= 15, f"Expected >= 15 cases, got {stats['cases']}"

    # 3. Full Graph
    r = client.get("/api/graph/full")
    assert r.status_code == 200, f"Graph full failed: {r.text}"
    graph_data = r.json()
    print(f"[OK] /api/graph/full passed: {len(graph_data['nodes'])} nodes, {len(graph_data['links'])} links")

    # 4. Key Entities
    r = client.get("/api/graph/key-entities")
    assert r.status_code == 200, f"Key entities failed: {r.text}"
    key_ents = r.json()
    print(f"[OK] /api/graph/key-entities passed: top 1 is {key_ents[0]['name']} (Centrality: {key_ents[0]['composite_centrality']})")

    # 5. Communities
    r = client.get("/api/graph/communities")
    assert r.status_code == 200, f"Communities failed: {r.text}"
    comms = r.json()
    print(f"[OK] /api/graph/communities passed: {len(comms)} clusters detected")

    # 6. Anomalies
    r = client.get("/api/graph/anomalies")
    assert r.status_code == 200, f"Anomalies failed: {r.text}"
    anoms = r.json()
    print(f"[OK] /api/graph/anomalies passed: {len(anoms)} anomalies flagged")

    # 7. Cases & Related
    r = client.get("/api/cases")
    assert r.status_code == 200, f"Cases failed: {r.text}"
    cases = r.json()
    print(f"[OK] /api/cases passed: {len(cases)} cases")

    r = client.get("/api/cases/2/related")
    assert r.status_code == 200, f"Related cases failed: {r.text}"
    print(f"[OK] /api/cases/2/related passed: {len(r.json())} related cases found")

    # 8. Timeline & GIS
    r = client.get("/api/timeline")
    assert r.status_code == 200, f"Timeline failed: {r.text}"
    print(f"[OK] /api/timeline passed: {len(r.json())} events")

    r = client.get("/api/gis/events")
    assert r.status_code == 200, f"GIS events failed: {r.text}"
    print(f"[OK] /api/gis/events passed: {len(r.json())} geo events")

    # 9. AI Assistant Query
    r = client.post("/api/assistant/query", json={"question": "who is connected to Rahul Verma?"})
    assert r.status_code == 200, f"Assistant query failed: {r.text}"
    print("[OK] /api/assistant/query (connections) passed")

    r = client.post("/api/assistant/query", json={"question": "shortest path between Kabir Khan and Priya Sharma"})
    assert r.status_code == 200, f"Assistant path query failed: {r.text}"
    print("[OK] /api/assistant/query (shortest path) passed")

    # 10. Audit Logs
    r = client.get("/api/audit-logs")
    assert r.status_code == 200, f"Audit logs failed: {r.text}"
    print(f"[OK] /api/audit-logs passed: {len(r.json())} evidence chain blocks")

    print("\nALL BACKEND API TESTS COMPLETED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
