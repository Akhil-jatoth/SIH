import os
import sys
from datetime import datetime
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 792 - 36, "CNAS — Criminal Network Analysis System | SIH26189")
            self.drawRightString(612 - 54, 792 - 36, "CONFIDENTIAL // LAW ENFORCEMENT ONLY")
            self.setStrokeColor(colors.HexColor("#cbd5e1"))
            self.setLineWidth(0.5)
            self.line(54, 792 - 42, 612 - 54, 792 - 42)
        
        # Footer
        self.setFont("Helvetica", 8)
        self.setStrokeColor(colors.HexColor("#cbd5e1"))
        self.setLineWidth(0.5)
        self.line(54, 45, 612 - 54, 45)
        
        self.drawString(54, 32, f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} | Team: Shadow Trace")
        self.drawRightString(612 - 54, 32, f"Page {self._pageNumber} of {page_count}")
        self.restoreState()


def build_pdf(filename="CNAS_Project_Documentation.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    primary_color = colors.HexColor("#0f172a") # Slate 900
    accent_color = colors.HexColor("#0284c7")  # Sky 600
    secondary_color = colors.HexColor("#334155")
    card_bg = colors.HexColor("#f8fafc")
    border_color = colors.HexColor("#e2e8f0")

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=primary_color,
        spaceAfter=6
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=accent_color,
        spaceAfter=15
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=19,
        textColor=primary_color,
        spaceBefore=16,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=15,
        textColor=accent_color,
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=secondary_color,
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=secondary_color,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=3
    )

    code_style = ParagraphStyle(
        'Code_Custom',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#0f172a")
    )

    callout_style = ParagraphStyle(
        'Callout_Text',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#1e293b")
    )

    story = []

    # ==================== COVER / HEADER ====================
    story.append(Paragraph("CRIMINAL NETWORK ANALYSIS SYSTEM (CNAS)", title_style))
    story.append(Paragraph("Smart India Hackathon (SIH) — Problem Statement ID: SIH26189 | Team: Shadow Trace", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=accent_color, spaceBefore=0, spaceAfter=12))

    # Abstract Box
    abstract_text = """<b>EXECUTIVE SUMMARY:</b> CNAS is an enterprise intelligence, knowledge graph analytics, and AI copilot platform engineered for law enforcement agencies, cyber crime investigation cells, and anti-terror task forces. It ingests multi-modal forensic feeds (Telecom CDRs, FASTag toll logs, Hawala banking records, vehicle registries, and FIR case notes) to construct an in-memory graph, automatically uncover criminal syndicates via Louvain clustering, identify kingpins via betweenness centrality, triangulate live telecom targets, and provide natural-language investigative assistance with statutory Human-in-the-Loop explainability."""
    
    abstract_table = Table(
        [[Paragraph(abstract_text, callout_style)]],
        colWidths=[504]
    )
    abstract_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f0fdf4")),
        ('BORDER', (0,0), (-1,-1), 1, colors.HexColor("#86efac")),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(abstract_table)
    story.append(Spacer(1, 10))

    # ==================== SECTION 1: ARCHITECTURE ====================
    story.append(Paragraph("1. System Architecture & Operational Workflow", h1_style))
    story.append(Paragraph("The system is divided into four tightly integrated architectural tiers:", body_style))

    arch_data = [
        [
            Paragraph("<b>Tier</b>", ParagraphStyle('TH', parent=body_style, fontName='Helvetica-Bold', textColor=colors.white)),
            Paragraph("<b>Core Technology</b>", ParagraphStyle('TH', parent=body_style, fontName='Helvetica-Bold', textColor=colors.white)),
            Paragraph("<b>Primary Responsibilities</b>", ParagraphStyle('TH', parent=body_style, fontName='Helvetica-Bold', textColor=colors.white))
        ],
        [
            Paragraph("<b>Ingestion & Persistence</b>", body_style),
            Paragraph("SQLAlchemy ORM + SQLite / PostgreSQL", code_style),
            Paragraph("Multi-modal entity extraction (Persons, Phones, Accounts, Vehicles, Locations), case linkage persistence, schema normalization.", body_style)
        ],
        [
            Paragraph("<b>Graph Analytics Engine</b>", body_style),
            Paragraph("NetworkX In-Memory Multi-Graph Engine", code_style),
            Paragraph("Real-time Louvain modularity clustering, Betweenness/Degree centrality calculation, Dijkstra multi-hop shortest path, and cut-vertex anomaly detection.", body_style)
        ],
        [
            Paragraph("<b>AI & Microservices</b>", body_style),
            Paragraph("FastAPI (Async) + Groq/OpenAI/Gemini", code_style),
            Paragraph("Multi-tier NLP assistant with fallback rule engine, live telecom BTS triangulation engine, SHA-256 evidence chain ledger, and REST API routing.", body_style)
        ],
        [
            Paragraph("<b>Investigator UI</b>", body_style),
            Paragraph("React 18 + Vite + TypeScript + Tailwind", code_style),
            Paragraph("Liquid glassmorphic UI, force-directed 2D canvas graph, Leaflet CartoDB dark GIS map, timeline slider, suspect radar, and official dossier generator.", body_style)
        ]
    ]

    arch_table = Table(arch_data, colWidths=[110, 130, 264])
    arch_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('GRID', (0,0), (-1,-1), 0.5, border_color),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, card_bg]),
    ]))
    story.append(arch_table)
    story.append(Spacer(1, 12))

    # ==================== SECTION 2: GRAPH ALGORITHMS ====================
    story.append(Paragraph("2. Graph Theory & Mathematical Analytics", h1_style))
    story.append(Paragraph("CNAS utilizes graph algorithms to transform raw links into actionable law-enforcement intelligence:", body_style))

    algo_data = [
        [
            Paragraph("<b>Algorithm / Metric</b>", ParagraphStyle('TH', parent=body_style, fontName='Helvetica-Bold', textColor=colors.white)),
            Paragraph("<b>Mathematical Method</b>", ParagraphStyle('TH', parent=body_style, fontName='Helvetica-Bold', textColor=colors.white)),
            Paragraph("<b>Law Enforcement Operational Output</b>", ParagraphStyle('TH', parent=body_style, fontName='Helvetica-Bold', textColor=colors.white))
        ],
        [
            Paragraph("<b>Louvain Community Detection</b>", body_style),
            Paragraph("Greedy Modularity Optimization <i>Q</i>", code_style),
            Paragraph("Unsupervised clustering of criminal syndicates into 4 regional cells (North Hawala, West Narcotics, South Darknet, East Transit) without manual tagging.", body_style)
        ],
        [
            Paragraph("<b>Betweenness Centrality</b>", body_style),
            Paragraph("<i>C_B(v) = Σ (σ_st(v) / σ_st)</i>", code_style),
            Paragraph("Pins down intermediary brokers and kingpins who control inter-cell communications and financial channels.", body_style)
        ],
        [
            Paragraph("<b>Eigenvector & Degree Centrality</b>", body_style),
            Paragraph("Adjacency Matrix Principal Eigenvector", code_style),
            Paragraph("Computes immediate influence scores and high-risk connectivity hubs across known criminal figures.", body_style)
        ],
        [
            Paragraph("<b>Dijkstra Multi-Hop Path</b>", body_style),
            Paragraph("Weighted Shortest Path Traversal", code_style),
            Paragraph("Traces hidden intermediary conduits linking two seemingly unconnected suspects across shell companies, mules, and burner SIMs.", body_style)
        ],
        [
            Paragraph("<b>Anomaly & Cut-Vertex Finder</b>", body_style),
            Paragraph("Biconnected Components & Degree Spikes", code_style),
            Paragraph("Flags critical bottlenecks (single points of failure) whose elimination will fracture the syndicate's operational capacity.", body_style)
        ]
    ]

    algo_table = Table(algo_data, colWidths=[120, 130, 254])
    algo_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('GRID', (0,0), (-1,-1), 0.5, border_color),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, card_bg]),
    ]))
    story.append(algo_table)
    story.append(Spacer(1, 12))

    # ==================== SECTION 3: KEY PLATFORM MODULES ====================
    story.append(Paragraph("3. Core Investigative Modules & Frontend Capabilities", h1_style))
    
    modules = [
        ("Executive Intelligence Dashboard", "Presents real-time aggregate KPI metrics (Entities: 62+, Links: 129+, Cases: 15, Kingpins: 5), live scrolling cyber-ticker of wiretaps/telecom triggers, syndicate radar matrix, and one-click explainability ('Why?') tooltips."),
        ("2D Force-Directed Knowledge Graph Explorer", "Dynamic canvas simulation with smooth node clustering. Allows investigators to toggle between Entity Type and Syndicate Community color schemes, execute camera fly-to suspect searches, and run shortest path routing."),
        ("Spatial-Temporal GIS & Chronological Timeline", "CartoDB dark matter map with pulsing telemetry markers. Bidirectional date range slider synchronizes event streams across Indian metro hubs (Delhi, Mumbai, Bengaluru, Hyderabad, Kolkata)."),
        ("Live Telecom Tracker & Suspect Radar", "Accepts suspect names or any 10-digit mobile number (MSISDN). Performs simulated carrier HLR / BTS tower triangulation with signal strength (dBm), geographic coordinates, and co-located syndicate operatives."),
        ("AI Investigation Copilot", "Natural-language query assistant powered by Groq, OpenAI, and Gemini with an offline rule engine fallback. Generates interactive Entity Quick-Link Chips that transport investigators straight into the Graph Explorer."),
        ("Official Case Dossier & FIR Exporter", "Generates comprehensive, court-admissible PDF/Print intelligence dossiers compiling all suspect aliases, telecom intercepts, bank accounts, movement history, and cross-case linkages."),
        ("Cryptographic Chain-of-Custody Evidence Ledger", "Tamper-evident SHA-256 hash-chained audit ledger ensuring evidence integrity and forensic compliance with judicial cybersecurity requirements.")
    ]

    for title, desc in modules:
        story.append(Paragraph(f"• <b>{title}:</b> {desc}", bullet_style))

    story.append(Spacer(1, 12))

    # ==================== SECTION 4: AI & TELECOM SUBSYSTEMS ====================
    story.append(Paragraph("4. AI Copilot & Telecom Triangulation Architecture", h1_style))
    
    story.append(Paragraph("<b>Multi-Tier AI Copilot Fallback Pipeline:</b>", h2_style))
    story.append(Paragraph("To ensure zero downtime during critical police operations, the assistant implements a 4-layer fallback strategy: (1) <b>Groq Cloud</b> (~0.3s ultra-fast inference with Qwen/Llama) ➔ (2) <b>OpenAI GPT-4o-mini</b> ➔ (3) <b>Google Gemini 1.5 Flash</b> ➔ (4) <b>Built-in Deterministic Graph Rule Engine</b>. This guarantees full offline functionality even without active internet or API keys.", body_style))

    story.append(Paragraph("<b>Live Telecom Triangulation & Carrier HLR Engine:</b>", h2_style))
    story.append(Paragraph("The backend includes a specialized telecom triangulation resolver. When an investigator enters any MSISDN (e.g., <code>+91-98765-43210</code>), the engine performs carrier HLR resolution (Airtel, Jio, Vi, BSNL), maps the target to active BTS relay towers in major telecom circles (Delhi-NCR, Mumbai BKC, Bengaluru Whitefield, Hyderabad HITEC City), computes dBm signal strength, and identifies nearby co-located suspects in the knowledge graph.", body_style))

    story.append(Spacer(1, 10))

    # ==================== SECTION 5: COMPLETE API SPECIFICATION ====================
    story.append(Paragraph("5. REST API Architecture & Endpoints", h1_style))

    api_data = [
        [
            Paragraph("<b>Endpoint Route</b>", ParagraphStyle('TH', parent=body_style, fontName='Helvetica-Bold', textColor=colors.white)),
            Paragraph("<b>Method</b>", ParagraphStyle('TH', parent=body_style, fontName='Helvetica-Bold', textColor=colors.white)),
            Paragraph("<b>Description & Return Payload</b>", ParagraphStyle('TH', parent=body_style, fontName='Helvetica-Bold', textColor=colors.white))
        ],
        [Paragraph("/api/stats/summary", code_style), Paragraph("GET", body_style), Paragraph("Aggregated counts of entities, links, registered cases, and high-risk nodes.", body_style)],
        [Paragraph("/api/graph/full", code_style), Paragraph("GET", body_style), Paragraph("Complete nodes and links payload with computed centrality scores and Louvain clusters.", body_style)],
        [Paragraph("/api/graph/key-entities", code_style), Paragraph("GET", body_style), Paragraph("Top kingpin entities ranked by composite centrality with plain-language reasoning.", body_style)],
        [Paragraph("/api/graph/communities", code_style), Paragraph("GET", body_style), Paragraph("Detected criminal syndicates, membership rosters, and intra-cell density.", body_style)],
        [Paragraph("/api/graph/anomalies", code_style), Paragraph("GET", body_style), Paragraph("Structural network anomalies, cut-vertices, and single points of failure.", body_style)],
        [Paragraph("/api/graph/path", code_style), Paragraph("GET", body_style), Paragraph("Multi-hop shortest path between source and target suspect IDs.", body_style)],
        [Paragraph("/api/cases", code_style), Paragraph("GET", body_style), Paragraph("List of all active FIR cases with linked suspect and incident counts.", body_style)],
        [Paragraph("/api/cases/{case_id}", code_style), Paragraph("GET", body_style), Paragraph("Full case dossier details, associated suspects, bank accounts, and telemetry log.", body_style)],
        [Paragraph("/api/timeline", code_style), Paragraph("GET", body_style), Paragraph("Chronological event feed with timestamps, suspect IDs, and descriptions.", body_style)],
        [Paragraph("/api/gis/events", code_style), Paragraph("GET", body_style), Paragraph("Spatial-temporal GPS telemetry pins with latitude/longitude coordinates.", body_style)],
        [Paragraph("/api/investigate/search", code_style), Paragraph("GET", body_style), Paragraph("Live suspect search and carrier HLR / BTS triangulation for any mobile number.", body_style)],
        [Paragraph("/api/assistant/query", code_style), Paragraph("POST", body_style), Paragraph("Natural-language AI query processor with Entity Quick-Link generation.", body_style)],
        [Paragraph("/api/audit-logs", code_style), Paragraph("GET", body_style), Paragraph("Tamper-evident SHA-256 cryptographic chain-of-custody audit logs.", body_style)],
        [Paragraph("/api/dataset/download", code_style), Paragraph("GET", body_style), Paragraph("Direct download of complete CSV forensic dataset bundled in a ZIP archive.", body_style)]
    ]

    api_table = Table(api_data, colWidths=[130, 45, 329])
    api_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('GRID', (0,0), (-1,-1), 0.5, border_color),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, card_bg]),
    ]))
    story.append(api_table)
    story.append(Spacer(1, 12))

    # ==================== SECTION 6: HACKATHON DEMO GUIDE ====================
    story.append(Paragraph("6. 2-Minute SIH Judging Demo & Pitch Script", h1_style))

    demo_steps = [
        ("Step 1: Dashboard & Explainability (0:00 - 0:30)", "Log in with <code>demo/demo</code>. Highlight the 4 real-time stat cards (62 Entities, 129 Linkages, 15 Cases, 5 Key Kingpins). Demonstrate the statutory <b>Human-in-the-Loop</b> banner and click <b>'Why?'</b> next to Kabir Khan to prove explainability. Open the <b>Evidence Ledger</b> to show SHA-256 block hashing."),
        ("Step 2: Knowledge Graph Explorer (0:30 - 1:00)", "Navigate to <b>Graph Explorer</b>. Switch coloration between <i>Entity Type</i> and <i>Syndicate Cell</i> to demonstrate unsupervised Louvain clustering. Search for 'Kabir Khan' to show smooth camera focus. In the side panel, use <b>Find Shortest Path</b> with Priya Sharma to reveal the multi-hop crypto-money laundering conduit."),
        ("Step 3: Spatial-Temporal GIS (1:00 - 1:30)", "Navigate to <b>Timeline & GIS</b>. Drag the temporal slider to filter incidents chronologically. Click an incident card to fly the dark map camera to that geo-pin with glowing halos across Indian metro hubs."),
        ("Step 4: Suspect Radar & AI Copilot (1:30 - 2:00)", "Click <b>Suspect Radar</b> and search any 10-digit mobile number to show live carrier BTS triangulation. Switch to <b>AI Assistant</b>, ask: <i>'Who is connected to Rahul Verma?'</i>, and click the generated <b>Entity Chip</b> to transition directly back into the 2D Graph Explorer.")
    ]

    for title, desc in demo_steps:
        story.append(Paragraph(f"• <b>{title}:</b> {desc}", bullet_style))

    story.append(Spacer(1, 15))

    # Concluding remarks
    concl_text = "<b>SYSTEM STATUS:</b> Fully Operational & Verified. Backend running on FastAPI (Port 8000), Frontend running on React + Vite (Port 5173). Database seeded with 62+ multi-modal entities, 129+ forensic relationships, 15 registered cases, and 40 geo-events."
    concl_table = Table(
        [[Paragraph(concl_text, callout_style)]],
        colWidths=[504]
    )
    concl_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
        ('BORDER', (0,0), (-1,-1), 1, colors.HexColor("#cbd5e1")),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(concl_table)

    # Build document with NumberedCanvas
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"[PDF] Successfully built: {filename}")

if __name__ == "__main__":
    out_file = sys.argv[1] if len(sys.argv) > 1 else "CNAS_Project_Documentation.pdf"
    build_pdf(out_file)
