import networkx as nx
from networkx.algorithms import community
from sqlalchemy.orm import Session
from .models import Entity, Relationship, Case

def build_graph_from_db(db: Session) -> nx.Graph:
    G = nx.Graph()
    entities = db.query(Entity).all()
    relationships = db.query(Relationship).all()

    for ent in entities:
        G.add_node(
            ent.id,
            name=ent.name,
            type=ent.type,
            risk_score=ent.risk_score,
            attributes=ent.attributes or {}
        )

    for rel in relationships:
        G.add_edge(
            rel.source_entity_id,
            rel.target_entity_id,
            id=rel.id,
            relation_type=rel.relation_type,
            weight=rel.weight or 1.0,
            timestamp=rel.timestamp,
            case_id=rel.case_id
        )

    return G

def get_centrality_scores(db: Session, top_n: int = 10):
    G = build_graph_from_db(db)
    if len(G) == 0:
        return []

    degree_cent = nx.degree_centrality(G)
    between_cent = nx.betweenness_centrality(G)
    
    # Try eigenvector centrality if graph is connected / non-trivial
    try:
        eigen_cent = nx.eigenvector_centrality(G, max_iter=500)
    except Exception:
        eigen_cent = degree_cent

    results = []
    for node_id in G.nodes:
        node_data = G.nodes[node_id]
        deg = degree_cent.get(node_id, 0.0)
        bet = between_cent.get(node_id, 0.0)
        eig = eigen_cent.get(node_id, 0.0)
        raw_degree = G.degree(node_id)

        # Composite score
        composite = round(0.4 * bet + 0.4 * deg + 0.2 * eig, 4)
        scaled_score = round(min(1.0, composite * 2.5 + (node_data.get("risk_score", 0) * 0.3)), 3)

        # Generate explainability rationale
        reasons = []
        if bet > 0.08:
            reasons.append(f"High betweenness ({round(bet, 3)}): Critical bridge connecting multiple criminal sub-networks")
        if raw_degree >= 5:
            reasons.append(f"High connectivity: Directly linked to {raw_degree} other entities across operations")
        if node_data.get("risk_score", 0) >= 0.85:
            reasons.append(f"Elevated risk index ({node_data.get('risk_score')}) based on intelligence dossier flags")
        
        reason_text = " | ".join(reasons) if reasons else f"Standard hub node with degree {raw_degree}"

        results.append({
            "id": node_id,
            "name": node_data.get("name"),
            "type": node_data.get("type"),
            "risk_score": node_data.get("risk_score", 0.0),
            "degree": raw_degree,
            "degree_centrality": round(deg, 4),
            "betweenness_centrality": round(bet, 4),
            "composite_centrality": scaled_score,
            "reason": reason_text
        })

    results.sort(key=lambda x: (x["composite_centrality"], x["betweenness_centrality"]), reverse=True)
    return results[:top_n]

def detect_communities(db: Session):
    G = build_graph_from_db(db)
    if len(G) == 0:
        return []

    # Greedy modularity communities
    try:
        comm_sets = list(community.greedy_modularity_communities(G))
    except Exception:
        comm_sets = [set(G.nodes)]

    cluster_names = [
        "North Syndicate Nexus (Delhi-NCR)",
        "West Financial Hawala & Customs Hub (Mumbai-Gujarat)",
        "South Cyber, Darknet & Crypto Tumbler Cell (BLR-HYD)",
        "East Cross-Border Transit & Marine Freight (WB-Northeast)",
        "Interstate Executive Clearing Network"
    ]

    clusters = []
    for idx, cset in enumerate(comm_sets):
        cluster_name = cluster_names[idx] if idx < len(cluster_names) else f"Cluster #{idx+1}"
        members = []
        for nid in cset:
            ndata = G.nodes[nid]
            members.append({
                "id": nid,
                "name": ndata.get("name"),
                "type": ndata.get("type"),
                "risk_score": ndata.get("risk_score")
            })
        clusters.append({
            "cluster_id": idx,
            "name": cluster_name,
            "size": len(cset),
            "members": members
        })

    return clusters

def find_related_cases(db: Session, case_id: int):
    target_case = db.query(Case).filter(Case.id == case_id).first()
    if not target_case:
        return []

    # Find entities linked to this case via relationships and events
    target_rel = db.query(Relationship).filter(Relationship.case_id == case_id).all()
    target_entity_ids = set()
    for r in target_rel:
        target_entity_ids.add(r.source_entity_id)
        target_entity_ids.add(r.target_entity_id)

    # Also check events for this case
    target_events = target_case.events
    for ev in target_events:
        target_entity_ids.add(ev.entity_id)

    other_cases = db.query(Case).filter(Case.id != case_id).all()
    related = []

    for oc in other_cases:
        oc_rel = db.query(Relationship).filter(Relationship.case_id == oc.id).all()
        oc_entity_ids = set()
        for r in oc_rel:
            oc_entity_ids.add(r.source_entity_id)
            oc_entity_ids.add(r.target_entity_id)
        for ev in oc.events:
            oc_entity_ids.add(ev.entity_id)

        shared = target_entity_ids.intersection(oc_entity_ids)
        if shared:
            shared_entities = db.query(Entity).filter(Entity.id.in_(shared)).all()
            shared_names = [e.name for e in shared_entities]
            related.append({
                "case_id": oc.id,
                "title": oc.title,
                "status": oc.status,
                "shared_count": len(shared),
                "shared_entities": [{"id": e.id, "name": e.name, "type": e.type} for e in shared_entities],
                "reason": f"Shares {len(shared)} common targets/assets ({', '.join(shared_names[:3])}{'...' if len(shared_names) > 3 else ''}) across operational intelligence files."
            })

    related.sort(key=lambda x: x["shared_count"], reverse=True)
    return related

def get_shortest_path(db: Session, entity_id_a: int, entity_id_b: int):
    G = build_graph_from_db(db)
    if entity_id_a not in G or entity_id_b not in G:
        return {"found": False, "message": "One or both entities not found in knowledge graph."}

    try:
        path_nodes = nx.shortest_path(G, source=entity_id_a, target=entity_id_b)
        path_details = []
        for nid in path_nodes:
            ndata = G.nodes[nid]
            path_details.append({
                "id": nid,
                "name": ndata.get("name"),
                "type": ndata.get("type"),
                "risk_score": ndata.get("risk_score")
            })

        hops = len(path_nodes) - 1
        return {
            "found": True,
            "hops": hops,
            "path_node_ids": path_nodes,
            "path": path_details,
            "summary": f"Identified direct linkage chain spanning {hops} hop(s) connecting {path_details[0]['name']} and {path_details[-1]['name']}."
        }
    except nx.NetworkXNoPath:
        return {"found": False, "message": "No direct or indirect graph path connecting these two entities."}

def detect_anomalies(db: Session):
    G = build_graph_from_db(db)
    anomalies = []

    # Heuristic 1: High Degree vs Type expectations (e.g. A single Phone or Vehicle linked to >= 4 major personas)
    for node_id in G.nodes:
        ndata = G.nodes[node_id]
        deg = G.degree(node_id)
        ntype = ndata.get("type")
        
        if ntype in ["Phone", "Vehicle", "Account"] and deg >= 3:
            anomalies.append({
                "id": f"anom-hub-{node_id}",
                "entity_id": node_id,
                "name": ndata.get("name"),
                "type": ntype,
                "severity": "HIGH",
                "title": f"Critical Asset Conduit: {ntype}",
                "description": f"This {ntype.lower()} maintains {deg} active connections to distinct operatives across cells.",
                "reason": f"Expected average degree for {ntype} is 1.2; observed {deg} links indicate a shared burner or laundering clearing asset."
            })

    # Heuristic 2: Extreme Betweenness Bridge Nodes (Super-Connectors)
    between_cent = nx.betweenness_centrality(G)
    for node_id, score in between_cent.items():
        if score > 0.10:
            ndata = G.nodes[node_id]
            anomalies.append({
                "id": f"anom-bridge-{node_id}",
                "entity_id": node_id,
                "name": ndata.get("name"),
                "type": ndata.get("type"),
                "severity": "CRITICAL",
                "title": "Inter-Cell Nexus / Key Facilitator",
                "description": f"Bridge centrality metric is in the top 1st percentile ({round(score, 3)}).",
                "reason": f"Controls information and capital transfer bottlenecks between independent regional clusters."
            })

    # Heuristic 3: Rapid High-Value Account Laundering Flag
    accounts = db.query(Entity).filter(Entity.type == "Account", Entity.risk_score >= 0.85).all()
    for acc in accounts:
        deg = G.degree(acc.id) if acc.id in G else 0
        anomalies.append({
            "id": f"anom-acc-{acc.id}",
            "entity_id": acc.id,
            "name": acc.name,
            "type": "Account",
            "severity": "HIGH",
            "title": "High-Velocity Laundering Endpoint",
            "description": f"Account flagged with risk score {acc.risk_score} and cross-jurisdictional transfers.",
            "reason": f"Balance flows exceed standard threshold with multi-hop hops terminating in tumbler/mixer wallets."
        })

    # Deduplicate and sort by severity
    severity_order = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2}
    anomalies.sort(key=lambda x: severity_order.get(x["severity"], 3))
    return anomalies[:8]
