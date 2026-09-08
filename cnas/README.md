# CNAS — Criminal Network Analysis System
**Team: Shadow Trace | Problem Statement ID: SIH26189**

An AI-powered knowledge graph, spatial-temporal link analysis, and natural-language intelligence copilot designed for law enforcement agencies, cyber cells, and cross-jurisdictional crime investigative units.

---

## 🌟 Key Features

1. **In-Memory Knowledge Graph Engine (NetworkX):**
   - Ingests multi-modal entities (Persons, Vehicles, Phones/SIMs, Bank/Crypto Accounts, Safehouses, Shell Organizations).
   - Real-time Louvain / greedy modularity community detection & cell clustering.
   - Degree, betweenness, and eigenvector centrality scoring for identifying kingpins and inter-cluster bottlenecks.
   - Multi-hop shortest path and communication chain tracing.

2. **Liquid Glassmorphism Interface:**
   - Dark theme (`#0a0e14` to `#0f1420`) with frosted translucent glass panels (`backdrop-filter: blur(20px)`), animated glowing borders, and particle canvas background.
   - Interactive 2D force-directed knowledge graph (`react-force-graph-2d`) with node categorization, cluster coloring, and entity dossier inspector.

3. **Spatial-Temporal GIS & Timeline Correlation:**
   - Dark Matter map (`react-leaflet` / CartoDB) plotting geo-tagged telemetry pins across Indian hubs (Delhi, Mumbai, Bengaluru, Hyderabad, Kolkata).
   - Draggable date range slider synchronized bidirectionally with map markers and chronological incident feed.

4. **Natural-Language AI Investigation Assistant:**
   - Investigator copilot accepting natural-language queries (e.g., *"Who is connected to Rahul Verma?"*, *"Shortest path between Kabir Khan and Priya Sharma"*, *"Show key entities in case #2"*).
   - Returns markdown answers with interactive clickable entity chips that navigate directly into the 2D Graph Explorer.
   - Modular backend intent classifier with hook for plugging in live LLMs (OpenAI, Gemini, Anthropic).

5. **Explainability ("Why?") & Human-in-the-Loop Protocol:**
   - Plain-language evidence popovers on every key entity, anomaly, and case linkage.
   - Prominent, dismissible statutory human-in-the-loop compliance notice ensuring AI suggestions remain aids rather than automated verdicts.

6. **Cryptographic Chain-of-Custody Evidence Ledger (SIH Cybersecurity/Blockchain Alignment):**
   - Tamper-evident SHA-256 block ledger tracking all ingested evidence, centrality alarms, and investigator access actions.

---

## 🏛️ System Architecture

```
[Raw Intelligence Feeds: Wire, CDR, Fastag, Banking]
                     │
                     ▼
[Entity Extraction & Entity Resolution Pipeline (Mocked/Ingested)]
                     │
                     ▼
[SQLAlchemy Persistence + NetworkX Graph Engine]
   ├─ Louvain Community Detection (Cell Clustering)
   ├─ Betweenness & Degree Centrality (Kingpin Ranking)
   ├─ Graph Path Traversal (Multi-hop Connection Chains)
   └─ Heuristic Anomaly Detector (Structural Outliers)
                     │
                     ▼
[FastAPI Asynchronous Intelligence Microservices (Port 8000)]
   ├─ /api/graph/full, /api/graph/key-entities, /api/graph/path
   ├─ /api/timeline, /api/gis/events, /api/cases
   ├─ /api/assistant/query (Rule-based NLP / LLM Extension)
   └─ /api/audit-logs (Tamper-evident Chain-of-Custody)
                     │
                     ▼
[React 18 + Vite + TypeScript + Tailwind Frontend (Port 5173)]
   ├─ Glassmorphic Liquid Design System
   ├─ Force-directed 2D Graph Visualizer
   ├─ Spatial-Temporal GIS & Synchronized Timeline
   ├─ AI Natural-Language Chat Interface
   └─ Explainability Popovers & Human-in-the-Loop Verification
```

---

## 🚀 Quick Setup & Run Instructions

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** & **npm**

### Step 1: Start the Backend (FastAPI + NetworkX)

```bash
cd cnas/backend

# (Optional) Create virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the backend server
python -m uvicorn main:app --reload --port 8000
```
> The database (`cnas.db`) will be automatically created and seeded with 62+ entities, 129+ relationships, 15 cases, and 40 geo-events on startup.
> Backend API docs available at: [http://localhost:8000/docs](http://localhost:8000/docs)

### Step 2: Start the Frontend (Vite + React)

In a new terminal:

```bash
cd cnas/frontend

# Install packages
npm install

# Start the development server
npm run dev
```
> Open your browser at: [http://localhost:5173](http://localhost:5173)

---

## 🔐 Demo Credentials

For hackathon judging demo:
- **Username:** `demo` (or `admin`)
- **Password:** `demo` (or `admin`)

---

## 🎬 2-Minute SIH Judging Demo Script

1. **Login & Dashboard Overview (0:00 - 0:30):**
   - Log in with `demo / demo`.
   - Point out the 4 animated stat cards: **62 Entities**, **129 Linkages**, **15 Cases**, and **5 Key Kingpins**.
   - Show the **Human-in-the-Loop** banner on top and click the **"Why?"** button next to *Rahul Verma* or *Kabir Khan* to showcase explainability.
   - Click the **"Evidence Ledger"** in the top navbar to show the cryptographic SHA-256 chain-of-custody audit log for the Blockchain & Cybersecurity theme.

2. **Graph Explorer & Link Analysis (0:30 - 1:00):**
   - Navigate to **Graph Explorer**.
   - Show the force-directed graph. Toggle between **"Entity Type"** and **"Cell / Community"** to show the 4 regional syndicates (North, West, South, East).
   - Search for **"Kabir Khan"** — the camera flies straight to the node.
   - Click *Kabir Khan* to open the side panel. In the **"Find Shortest Path"** tool, select **Priya Sharma** and click **Trace** to highlight the 2-hop bridge connecting North syndicate with South crypto cell.

3. **Spatial-Temporal Timeline & GIS (1:00 - 1:30):**
   - Navigate to **Timeline & GIS**.
   - Drag the **Temporal Window Slider** to show incidents appearing chronologically across Delhi, Mumbai, Hyderabad, and Kolkata.
   - Click on an incident card on the left — the Leaflet map automatically centers and zooms to that geo-pin with dark tiles and animated pulsing halos.

4. **AI Investigation Copilot (1:30 - 2:00):**
   - Navigate to **AI Assistant**.
   - Click the sample query: *"Who is connected to Rahul Verma?"* or type *"Shortest path between Kabir Khan and Priya Sharma"*.
   - Watch the copilot answer with structured links and generated **Entity Quick-Link Chips**.
   - Click one of the entity chips to transition directly into the Graph Explorer with that suspect focused!
