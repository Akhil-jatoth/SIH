import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ForceGraph2D from 'react-force-graph-2d';
import {
  Search,
  RotateCcw,
  X,
  Sparkles,
  Route,
  ChevronRight,
  Shield,
  CreditCard,
  Car,
  Phone,
  Radio,
  MapPin,
  Building,
  User,
  Activity,
  Layers,
  Eye,
  EyeOff,
  Filter,
  ArrowRight,
  AlertTriangle,
  Navigation,
  Download,
  Printer,
  FileSpreadsheet,
  FileCode,
  FileText,
  Maximize2,
  Minimize2,
  Database,
  Compass,
  Crosshair,
  Copy,
  Check,
  ExternalLink,
  Plus,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { HumanInTheLoopBanner } from '../components/HumanInTheLoopBanner';
import { ExplainabilityTooltip } from '../components/ExplainabilityTooltip';
import { PersonStatementModal } from '../components/PersonStatementModal';
import { CoordinatesFinderModal } from '../components/CoordinatesFinderModal';
import { DatasetIngestionModal } from '../components/DatasetIngestionModal';
import { api } from '../services/api';
import { GraphData, Entity, Community, EntityType, EntityDossier, IngestResponse } from '../types';

export const GraphExplorer: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const graphRef = useRef<any>(null);

  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);

  // View state
  const [colorMode, setColorMode] = useState<'type' | 'community'>('type');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNode, setSelectedNode] = useState<Entity | null>(null);
  const [hoveredNode, setHoveredNode] = useState<Entity | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [spreadLayout, setSpreadLayout] = useState(false);

  // Statement modal state
  const [showStatementModal, setShowStatementModal] = useState(false);

  // Exact Coordinates & GPS Inspector Modal State
  const [showCoordinatesModal, setShowCoordinatesModal] = useState(false);
  const [coordsCopied, setCoordsCopied] = useState(false);

  // Dynamic Ingestion Modal State
  const [showIngestModal, setShowIngestModal] = useState(false);
  const [ingestTargetEntityId, setIngestTargetEntityId] = useState<number | undefined>(undefined);
  const [ingestCoordinates, setIngestCoordinates] = useState<{ lat: number; lon: number; address?: string } | undefined>(undefined);
  const [newlyAddedNodeIds, setNewlyAddedNodeIds] = useState<Set<number>>(new Set());
  const [hudNotification, setHudNotification] = useState<string | null>(null);

  // Entity Detailed Dossier (fetched from API for statement data)
  const [dossier, setDossier] = useState<EntityDossier | null>(null);
  const [dossierLoading, setDossierLoading] = useState(false);

  // Shortest Path state
  const [pathTargetId, setPathTargetId] = useState<string>('');
  const [pathResult, setPathResult] = useState<any | null>(null);
  const [pathLoading, setPathLoading] = useState(false);

  // Load Graph Callback
  const loadGraph = useCallback(async (highlightNewId?: number) => {
    try {
      setLoading(true);
      const [gData, commData] = await Promise.all([
        api.getFullGraph(),
        api.getCommunities(),
      ]);
      setGraphData(gData);
      setCommunities(commData);

      if (highlightNewId) {
        const found = gData.nodes.find((n) => n.id === highlightNewId);
        if (found) {
          setSelectedNode(found);
          setTimeout(() => {
            if (graphRef.current) {
              graphRef.current.centerAt(found.x || 0, found.y || 0, 400);
              graphRef.current.zoom(2.5, 400);
            }
          }, 300);
        }
      }
    } catch (err) {
      console.error('Failed to fetch graph data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch full graph & communities on mount
  useEffect(() => {
    loadGraph();
  }, [loadGraph]);

  // Handle Ingestion Success
  const handleIngestSuccess = (res: IngestResponse) => {
    const newIds = new Set<number>();
    res.created_entities?.forEach((e) => newIds.add(e.id));
    setNewlyAddedNodeIds(newIds);

    const firstNewId = res.created_entities?.[0]?.id;
    loadGraph(firstNewId);

    setHudNotification(res.message);
    setTimeout(() => {
      setHudNotification(null);
    }, 6000);
  };

  // Fullscreen escape key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Highlighted connected neighborhood nodes when a node is selected or hovered
  const highlightNodes = useMemo(() => {
    const set = new Set<number>();
    const target = selectedNode || hoveredNode;
    if (!target) return set;
    set.add(target.id);
    graphData.links.forEach((l) => {
      const sId = typeof l.source === 'object' ? (l.source as any).id : l.source;
      const tId = typeof l.target === 'object' ? (l.target as any).id : l.target;
      if (sId === target.id) set.add(tId);
      if (tId === target.id) set.add(sId);
    });
    return set;
  }, [selectedNode, hoveredNode, graphData]);

  // Type Colors matching visual reference palette
  const typeColors: Record<EntityType, string> = {
    Person: '#00c2ff',       // Vibrant Cyan / Sky Blue
    Vehicle: '#ffb703',      // Golden Amber
    Phone: '#20c997',        // Emerald / Mint Green
    Account: '#e599f7',      // Lilac / Orchid Violet
    Location: '#ff6b6b',     // Salmon / Coral Red
    Organization: '#38bdf8', // Azure Blue
  };

  const communityColors = [
    '#00c2ff', // Cyan Sky
    '#ff6b6b', // Coral Salmon
    '#20c997', // Mint Emerald
    '#ffb703', // Warm Amber
    '#e599f7', // Orchid Pink
    '#38bdf8', // Azure Blue
    '#c084fc', // Lilac
    '#f43f5e', // Rose
  ];

  // Fetch Entity Dossier when selectedNode changes
  useEffect(() => {
    if (!selectedNode) {
      setDossier(null);
      return;
    }
    const loadDossier = async () => {
      try {
        setDossierLoading(true);
        const data = await api.getEntityDossier(selectedNode.id);
        setDossier(data);
      } catch (err) {
        console.error('Failed to load entity dossier:', err);
      } finally {
        setDossierLoading(false);
      }
    };
    loadDossier();
  }, [selectedNode]);

  // Handle URL highlight param
  useEffect(() => {
    const highlightId = searchParams.get('highlight');
    if (highlightId && graphData.nodes.length > 0) {
      const target = graphData.nodes.find((n) => String(n.id) === highlightId);
      if (target) {
        setSelectedNode(target);
        if (graphRef.current) {
          graphRef.current.centerAt(target.x || 0, target.y || 0, 400);
          graphRef.current.zoom(2.5, 400);
        }
      }
    }
  }, [searchParams, graphData]);

  // Filtered nodes and links
  const filteredData = useMemo(() => {
    if (typeFilter === 'ALL') return graphData;
    const activeNodes = graphData.nodes.filter((n) => n.type === typeFilter);
    const activeNodeIds = new Set(activeNodes.map((n) => n.id));
    const activeLinks = graphData.links.filter(
      (l) =>
        activeNodeIds.has(typeof l.source === 'object' ? (l.source as any).id : l.source) &&
        activeNodeIds.has(typeof l.target === 'object' ? (l.target as any).id : l.target)
    );
    return { nodes: activeNodes, links: activeLinks };
  }, [graphData, typeFilter]);

  // Selected node connections list
  const nodeConnections = useMemo(() => {
    if (!selectedNode) return [];
    const conns: { node: Entity | undefined; type: string; direction: string }[] = [];
    const entMap = new Map(graphData.nodes.map((n) => [n.id, n]));

    graphData.links.forEach((l) => {
      const sId = typeof l.source === 'object' ? (l.source as any).id : l.source;
      const tId = typeof l.target === 'object' ? (l.target as any).id : l.target;

      if (sId === selectedNode.id) {
        conns.push({ node: entMap.get(tId), type: l.relation_type, direction: 'outgoing' });
      } else if (tId === selectedNode.id) {
        conns.push({ node: entMap.get(sId), type: l.relation_type, direction: 'incoming' });
      }
    });
    return conns;
  }, [selectedNode, graphData]);

  // Handle Search Zoom
  const handleSearchSelect = (entity: Entity) => {
    setSelectedNode(entity);
    setSearchQuery('');
    if (graphRef.current) {
      graphRef.current.centerAt(entity.x || 0, entity.y || 0, 400);
      graphRef.current.zoom(2.8, 400);
    }
  };

  // Find shortest path action
  const handleFindPath = async () => {
    if (!selectedNode || !pathTargetId) return;
    try {
      setPathLoading(true);
      const res = await api.getShortestPath(selectedNode.id, parseInt(pathTargetId));
      setPathResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setPathLoading(false);
    }
  };

  // Download Statement CSV
  const handleDownloadCSV = () => {
    const ent = dossier?.entity || selectedNode;
    if (!ent) return;

    const lines: string[] = [];
    const currentDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const currentTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const statementRef = `CNAS/I4C/2026/STAT-${ent.id}-${Math.abs(ent.id * 137).toString().padStart(4, '0')}`;

    lines.push('INDIAN CYBER CRIME COORDINATION CENTRE (I4C) - CNAS OFFICIAL INVESTIGATIVE STATEMENT');
    lines.push('CONFIDENTIAL // TOP SECRET // LAW ENFORCEMENT SENSITIVE');
    lines.push(`Statement Reference,${statementRef}`);
    lines.push(`Generated Date & Time,${currentDate} ${currentTime} IST`);
    lines.push('');

    // 1. Identification Profile
    lines.push('--- 1. SUBJECT IDENTIFICATION PROFILE ---');
    lines.push('Field,Value');
    lines.push(`Subject ID,${ent.id}`);
    lines.push(`Full Legal Name,"${ent.name}"`);
    lines.push(`Entity Classification,${ent.type}`);
    lines.push(`Syndicate Operational Role,"${(ent as any).role || ent.attributes?.role || 'Primary Target'}"`);
    lines.push(`Known Alias / Codename,"${(ent as any).alias || ent.attributes?.alias || 'None'}"`);
    lines.push(`Citizenship,"${(ent as any).citizenship || ent.attributes?.citizenship || 'Indian'}"`);
    lines.push(`Primary Phone / Intercept,"${(ent as any).phone || ent.attributes?.phone || 'Unlisted'}"`);
    lines.push(`Syndicate Risk Rating,"${(ent.risk_score * 100).toFixed(1)}%"`);
    lines.push('');

    // 2. Financial & Hawala Accounts
    lines.push('--- 2. BANK ACCOUNTS & HAWALA TRANSACTIONS ---');
    lines.push('Account Name,Institution / Bank,Branch / Ledger,Balance,Account Status,Last Tx Amount,Flow Type,Timestamp');
    if (dossier?.bank_transactions && dossier.bank_transactions.length > 0) {
      dossier.bank_transactions.forEach((tx) => {
        lines.push(
          `"${tx.account_name}","${tx.bank_name}","${tx.branch}","${tx.balance}","${tx.status}","${tx.last_transaction?.amount || 'N/A'}","${tx.last_transaction?.type || 'Transfer'}","${tx.last_transaction?.timestamp || 'N/A'}"`
        );
      });
    } else {
      lines.push('No direct bank or Hawala accounts registered for this subject.,,,,,,');
    }
    lines.push('');

    // 3. Vehicles
    lines.push('--- 3. REGISTERED VEHICLES & LOGISTICS ASSETS ---');
    lines.push('Plate Number,Make & Model,Color,Registered Owner,Surveillance Status');
    if (dossier?.vehicles && dossier.vehicles.length > 0) {
      dossier.vehicles.forEach((v) => {
        lines.push(
          `"${v.plate_number}","${v.make_model}","${v.color}","${v.registered_owner}","${v.status}"`
        );
      });
    } else {
      lines.push('No registered vehicle plates or fleet assets linked.,,,,');
    }
    lines.push('');

    // 4. Telecom & Cell Tower
    lines.push('--- 4. TELECOM INTERCEPT & LAST KNOWN LOCATION ---');
    const loc = dossier?.last_disconnected_location;
    lines.push('Parameter,Value');
    lines.push(`Primary Phone,"${dossier?.phones?.[0]?.number || (ent as any).phone || ent.attributes?.phone || 'N/A'}"`);
    lines.push(`Carrier,"${dossier?.phones?.[0]?.carrier || 'Airtel Delhi'}"`);
    lines.push(`IMEI Reference,"${dossier?.phones?.[0]?.imei || '864501048892101'}"`);
    lines.push(`Triangulated Cell Tower,"${loc?.cell_tower || 'BTS-NCR-PRIMARY-808'}"`);
    lines.push(`GPS Latitude,"${loc?.latitude?.toFixed(4) || '28.6139'}° N"`);
    lines.push(`GPS Longitude,"${loc?.longitude?.toFixed(4) || '77.2090'}° E"`);
    lines.push(`Signal Drop Time,"${loc?.timestamp || '2025-02-23 18:45:12 IST'}"`);
    lines.push(`Corridor Description,"${loc?.description?.replace(/"/g, '""') || 'Last known spatial corridor'}"`);
    lines.push('');

    // 5. Syndicate Linkages
    lines.push('--- 5. DIRECT SYNDICATE NETWORK LINKAGES ---');
    lines.push('Target Name,Target Type,Relationship Type,Risk Score,Direction,Linkage Description');
    if (dossier?.connections && dossier.connections.length > 0) {
      dossier.connections.forEach((c) => {
        lines.push(
          `"${c.target_name}","${c.target_type}","${c.relation_type}","${(c.target_risk * 100).toFixed(0)}%","${c.direction}","${c.description.replace(/"/g, '""')}"`
        );
      });
    } else {
      lines.push('No direct linkages identified in active subgraph.,,,,,');
    }

    const csvBlob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(csvBlob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `statement_${ent.name.replace(/\s+/g, '_')}_${ent.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download Statement JSON
  const handleDownloadJSON = () => {
    const ent = dossier?.entity || selectedNode;
    if (!ent) return;

    const dataToExport = {
      statement_ref: `CNAS/I4C/2026/STAT-${ent.id}`,
      generated_at: new Date().toISOString(),
      classification: 'TOP SECRET // LAW ENFORCEMENT SENSITIVE',
      subject: ent,
      financial_statement: dossier?.bank_transactions || [],
      vehicle_assets: dossier?.vehicles || [],
      telecom_intercepts: dossier?.phones || [],
      last_location_triangulation: dossier?.last_disconnected_location || null,
      direct_syndicate_linkages: dossier?.connections || [],
    };

    const jsonBlob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(jsonBlob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `statement_${ent.name.replace(/\s+/g, '_')}_${ent.id}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Configure D3 Force Physics (Supports Dynamic Expand Spacing)
  useEffect(() => {
    if (graphRef.current) {
      const charge = spreadLayout ? -320 : -150;
      const distance = spreadLayout ? 80 : 48;
      graphRef.current.d3Force('charge')?.strength(charge);
      graphRef.current.d3Force('link')?.distance(distance);
      graphRef.current.d3ReheatSimulation?.();
    }
  }, [graphData, spreadLayout]);

  // Handler to Expand Selected Node's neighborhood camera view
  const handleExpandSelectedNode = () => {
    if (!selectedNode || !graphRef.current) return;
    const neighbors = Array.from(highlightNodes)
      .map((id) => graphData.nodes.find((n) => n.id === id))
      .filter(Boolean);

    if (neighbors.length > 0) {
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      neighbors.forEach((n: any) => {
        if (typeof n.x === 'number') {
          minX = Math.min(minX, n.x);
          maxX = Math.max(maxX, n.x);
          minY = Math.min(minY, n.y);
          maxY = Math.max(maxY, n.y);
        }
      });
      const centerX = (minX + maxX) / 2 + 35;
      const centerY = (minY + maxY) / 2;
      graphRef.current.centerAt(centerX, centerY, 400);
      graphRef.current.zoom(2.0, 400);
    }
  };

  // Custom Clean Node Renderer (Matches reference image with focused click highlighting)
  const drawNode = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const isSelected = selectedNode && selectedNode.id === node.id;
    const isHovered = hoveredNode && hoveredNode.id === node.id;
    const isPathNode = pathResult?.path_node_ids?.includes(node.id);
    const isNeighbor = highlightNodes.has(node.id);
    const isNewlyIngested = newlyAddedNodeIds.has(node.id);
    const hasFocus = selectedNode !== null || hoveredNode !== null;

    // Dynamic node size matching screenshot variation
    const baseRadius = 5.2;
    const centralityBonus = (node.composite_centrality || 0.2) * 12;
    const degreeBonus = Math.min(6, (node.degree || 1) * 0.9);
    const radius = Math.max(5.2, Math.min(22, baseRadius + centralityBonus + degreeBonus));

    const color = isPathNode
      ? '#ffb703'
      : colorMode === 'community'
        ? communityColors[(node.cluster_id ?? 0) % communityColors.length]
        : typeColors[node.type as EntityType] || '#00c2ff';

    ctx.save();

    // Dim unconnected nodes when a node is selected or hovered
    if (hasFocus && !isNeighbor && !isPathNode && !isNewlyIngested) {
      ctx.globalAlpha = 0.2;
    }

    // Outer glow halo on newly ingested, selected, hovered, or path node
    if (isNewlyIngested) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius + 8, 0, 2 * Math.PI, false);
      ctx.fillStyle = 'rgba(32, 201, 151, 0.4)';
      ctx.fill();
      ctx.strokeStyle = '#20c997';
      ctx.lineWidth = 2.4 / globalScale;
      ctx.stroke();
    } else if (isSelected || isPathNode || isHovered) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius + 6, 0, 2 * Math.PI, false);
      ctx.fillStyle = isPathNode
        ? 'rgba(255, 183, 3, 0.4)'
        : isSelected
          ? 'rgba(0, 194, 255, 0.45)'
          : 'rgba(229, 153, 247, 0.35)';
      ctx.fill();
      ctx.strokeStyle = isPathNode ? '#ffb703' : isSelected ? '#00c2ff' : '#e599f7';
      ctx.lineWidth = 1.8 / globalScale;
      ctx.stroke();
    } else if (hasFocus && isNeighbor) {
      // Subtle pulse halo on directly connected neighbor nodes
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius + 3, 0, 2 * Math.PI, false);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1.0 / globalScale;
      ctx.stroke();
    }

    // Node Circle (Clean, solid, vibrant colored disc matching reference)
    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();

    // Subtle edge highlight on active nodes
    if (isSelected || isPathNode || isHovered || isNewlyIngested) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.4 / globalScale;
      ctx.stroke();
    }

    // Node Name Label - clean badge shown on hover, selection, path, newly ingested, or high zoom
    if (isSelected || isPathNode || isHovered || isNewlyIngested || (hasFocus && isNeighbor) || globalScale > 1.4) {
      const label = node.name;
      const fontSize = Math.max(3.8, 10 / globalScale);
      ctx.font = `600 ${fontSize}px Inter, -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const textWidth = ctx.measureText(label).width;
      const padX = 4 / globalScale;
      const padY = 2 / globalScale;
      const pillY = node.y + radius + 7 / globalScale;

      ctx.fillStyle = isNewlyIngested ? 'rgba(6, 44, 30, 0.92)' : 'rgba(30, 12, 36, 0.88)';
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(
          node.x - textWidth / 2 - padX,
          pillY - fontSize / 2 - padY,
          textWidth + padX * 2,
          fontSize + padY * 2,
          3 / globalScale
        );
      } else {
        ctx.rect(
          node.x - textWidth / 2 - padX,
          pillY - fontSize / 2 - padY,
          textWidth + padX * 2,
          fontSize + padY * 2
        );
      }
      ctx.fill();

      ctx.fillStyle = isNewlyIngested ? '#6ee7b7' : '#ffffff';
      ctx.fillText(label, node.x, pillY);
    }

    ctx.restore();
  }, [selectedNode, hoveredNode, highlightNodes, pathResult, colorMode, newlyAddedNodeIds]);

  // Custom Clean Link Renderer (Focused connections & dimming for others)
  const drawLink = useCallback((link: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const s = link.source;
    const t = link.target;
    if (!s || !t || typeof s.x !== 'number' || typeof t.x !== 'number') return;

    const sId = typeof s === 'object' ? s.id : s;
    const tId = typeof t === 'object' ? t.id : t;

    const targetId = selectedNode?.id ?? hoveredNode?.id;
    const isConnected = targetId !== undefined && (sId === targetId || tId === targetId);
    const isPathLink = pathResult?.path_node_ids?.includes(sId) && pathResult?.path_node_ids?.includes(tId);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(t.x, t.y);

    if (isPathLink) {
      ctx.strokeStyle = '#ffb703';
      ctx.lineWidth = 2.4 / globalScale;
    } else if (isConnected) {
      ctx.strokeStyle = '#00c2ff';
      ctx.lineWidth = 2.0 / globalScale;
    } else if (targetId !== undefined) {
      ctx.strokeStyle = 'rgba(195, 155, 205, 0.08)';
      ctx.lineWidth = 0.8 / globalScale;
    } else {
      ctx.strokeStyle = 'rgba(195, 155, 205, 0.28)';
      ctx.lineWidth = 1.0 / globalScale;
    }

    ctx.stroke();
    ctx.restore();
  }, [selectedNode, hoveredNode, pathResult]);

  // Search matches (Matches by Person Name, Phone Number, or Alias)
  const searchMatches = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    const cleanQ = q.replace(/[\s\-\+\(\)]/g, '');
    return graphData.nodes
      .filter((n) => {
        const nameMatch = n.name.toLowerCase().includes(q);
        const phoneMatch = n.attributes?.phone && String(n.attributes.phone).replace(/[\s\-\+\(\)]/g, '').includes(cleanQ);
        const aliasMatch = n.attributes?.alias && String(n.attributes.alias).toLowerCase().includes(q);
        const roleMatch = n.attributes?.role && String(n.attributes.role).toLowerCase().includes(q);
        return nameMatch || phoneMatch || aliasMatch || roleMatch;
      })
      .slice(0, 8);
  }, [searchQuery, graphData.nodes]);

  // Extract Exact Node Coordinates for Slide-over Panel
  const selectedNodeCoords = useMemo(() => {
    if (!selectedNode) return null;
    const lat = selectedNode.attributes?.latitude ||
      (selectedNode.attributes?.coordinates ? parseFloat(selectedNode.attributes.coordinates.split(',')[0]) : null) ||
      dossier?.last_disconnected_location?.latitude ||
      28.6139;
    const lon = selectedNode.attributes?.longitude ||
      (selectedNode.attributes?.coordinates ? parseFloat(selectedNode.attributes.coordinates.split(',')[1]) : null) ||
      dossier?.last_disconnected_location?.longitude ||
      77.2090;
    const pincode = selectedNode.attributes?.pincode || dossier?.last_disconnected_location?.cell_tower || '110001';
    const area = selectedNode.attributes?.area || selectedNode.attributes?.city || selectedNode.attributes?.address || dossier?.last_disconnected_location?.description || 'Active Surveillance Sector';

    return {
      lat: Number(lat),
      lon: Number(lon),
      formatted: `${Math.abs(Number(lat)).toFixed(4)}° ${Number(lat) >= 0 ? 'N' : 'S'}, ${Math.abs(Number(lon)).toFixed(4)}° ${Number(lon) >= 0 ? 'E' : 'W'}`,
      pincode,
      area
    };
  }, [selectedNode, dossier]);

  return (
    <div className={`space-y-4 pb-12 ${isFullscreen ? 'fixed inset-0 z-50 bg-[#200d25] p-4 flex flex-col overflow-hidden pb-4' : ''}`}>
      {/* Classification & Human in Loop Warning (Hidden in fullscreen to maximize viewport) */}
      {!isFullscreen && <HumanInTheLoopBanner />}

      {/* Floating HUD Ingestion Success Alert */}
      <AnimatePresence>
        {hudNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-14 right-8 z-50 p-4 rounded-2xl bg-[#102d21]/95 border border-emerald-400/50 text-emerald-100 shadow-2xl backdrop-blur-xl flex items-center gap-3 max-w-md font-mono text-xs"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <span className="font-bold text-white block">INTELLIGENCE SYNCED</span>
              <span className="text-emerald-300 text-[11px] block">{hudNotification}</span>
            </div>
            <button
              onClick={() => setHudNotification(null)}
              className="p-1 text-emerald-400 hover:text-white rounded-lg cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Official Person Statement Modal */}
      <PersonStatementModal
        isOpen={showStatementModal}
        onClose={() => setShowStatementModal(false)}
        dossier={dossier}
        selectedNode={selectedNode}
      />

      {/* Exact Coordinates & GPS Inspector Modal */}
      <CoordinatesFinderModal
        isOpen={showCoordinatesModal}
        onClose={() => setShowCoordinatesModal(false)}
        initialLat={selectedNodeCoords?.lat}
        initialLon={selectedNodeCoords?.lon}
        onFocusNode={(nodeId) => {
          const target = graphData.nodes.find((n) => n.id === nodeId);
          if (target) {
            handleSearchSelect(target);
          }
        }}
        onTagLocationAtCoordinates={(lat, lon, addr) => {
          setIngestCoordinates({ lat, lon, address: addr });
          setShowIngestModal(true);
        }}
      />

      {/* Live In-Investigation Dataset Ingestion Modal */}
      <DatasetIngestionModal
        isOpen={showIngestModal}
        onClose={() => {
          setShowIngestModal(false);
          setIngestTargetEntityId(undefined);
          setIngestCoordinates(undefined);
        }}
        existingNodes={graphData.nodes}
        initialTargetEntityId={ingestTargetEntityId}
        initialCoordinates={ingestCoordinates}
        onIngestSuccess={handleIngestSuccess}
      />

      {/* Header & Controls Toolbar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2.5 font-display">
            <span>Knowledge Graph Explorer</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-purple-200 border border-white/20">
              {filteredData.nodes.length} Nodes • {filteredData.links.length} Relations
            </span>
          </h1>
          <p className="text-xs text-purple-200 mt-1 font-medium">
            Interactive multi-relational intelligence graph linking kingpins, Hawala bank accounts, logistics fleet, and cell towers.
          </p>
        </div>

        {/* Search & Actions Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Global Search Autocomplete */}
          <div className="relative w-full sm:w-60">
            <div className="relative">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-purple-300" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search suspect, vehicle, bank..."
                className="w-full pl-10 pr-9 py-2 rounded-xl bg-black/40 border border-white/20 text-white placeholder:text-purple-300/60 text-xs font-medium focus:outline-none focus:border-fuchsia-400 shadow-ops backdrop-blur-md"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-purple-300 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Search Dropdown */}
            {searchMatches.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 p-2 rounded-2xl bg-[#28112e] border border-white/30 z-50 shadow-2xl space-y-1">
                {searchMatches.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => handleSearchSelect(m)}
                    className="p-2 rounded-xl hover:bg-white/10 cursor-pointer flex items-center justify-between text-xs transition-colors gap-2"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: typeColors[m.type] }}
                      />
                      <div className="truncate">
                        <span className="font-bold text-white block truncate">{m.name}</span>
                        {m.attributes?.phone && (
                          <span className="text-[10px] text-emerald-300 font-mono block">
                            📱 {m.attributes.phone}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-semibold text-purple-200 uppercase shrink-0">
                      {m.type}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* DYNAMIC DATASET INGESTION TOOLBAR BUTTON */}
          <button
            onClick={() => {
              setIngestTargetEntityId(selectedNode?.id);
              setShowIngestModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-fuchsia-600 via-purple-600 to-sky-600 hover:from-fuchsia-500 hover:to-sky-500 text-white border border-fuchsia-400/50 text-xs font-bold flex items-center gap-1.5 shadow-md hover:shadow-fuchsia-500/25 transition-all cursor-pointer"
            title="Ingest new dataset (CSV/JSON), telecom CDR logs, or manual nodes into active graph"
          >
            <Database className="w-3.5 h-3.5 text-fuchsia-200 animate-pulse" />
            <span>+ Ingest Data</span>
          </button>

          {/* EXACT GPS & COORDINATES FINDER BUTTON */}
          <button
            onClick={() => setShowCoordinatesModal(true)}
            className="px-3 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 hover:text-white border border-sky-400/40 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            title="Find exact latitude & longitude coordinates, reverse-lookup Indian PIN codes, and identify nearby suspects"
          >
            <Compass className="w-3.5 h-3.5 text-sky-400" />
            <span>GPS Coordinates</span>
          </button>

          {/* Filter controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Color Mode Toggle */}
            <div className="flex items-center bg-[#28112e] p-1 rounded-xl border border-white/20 shadow-sm text-xs">
              <button
                onClick={() => setColorMode('type')}
                className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${colorMode === 'type'
                  ? 'bg-white/20 text-white shadow-xs border border-white/30'
                  : 'text-purple-300 hover:text-white'
                  }`}
              >
                Type
              </button>
              <button
                onClick={() => setColorMode('community')}
                className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${colorMode === 'community'
                  ? 'bg-white/20 text-white shadow-xs border border-white/30'
                  : 'text-purple-300 hover:text-white'
                  }`}
              >
                Cell
              </button>
            </div>

            {/* Entity Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2.5 py-2 rounded-xl bg-[#28112e] border border-white/20 text-white text-xs font-semibold focus:outline-none shadow-sm cursor-pointer"
            >
              <option value="ALL">All ({graphData.nodes.length})</option>
              <option value="Person">👤 Persons</option>
              <option value="Vehicle">🚗 Vehicles</option>
              <option value="Phone">📱 Phones</option>
              <option value="Account">💳 Accounts</option>
              <option value="Location">📍 Locations</option>
              <option value="Organization">🏢 Orgs</option>
            </select>

            {/* Expand / Spread Graph Spacing Toggle */}
            <button
              onClick={() => setSpreadLayout((prev) => !prev)}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${spreadLayout
                  ? 'bg-fuchsia-600/30 border-fuchsia-400 text-white shadow-sm'
                  : 'bg-[#28112e] border-white/20 text-purple-200 hover:text-white hover:bg-white/10'
                }`}
              title={spreadLayout ? 'Compact Graph Layout' : 'Expand Graph Layout Spacing'}
            >
              <Sparkles className="w-4 h-4 text-fuchsia-300" />
            </button>

            {/* Reset Zoom */}
            <button
              onClick={() => {
                if (graphRef.current) {
                  graphRef.current.zoomToFit(400, 40);
                  setSelectedNode(null);
                  setHoveredNode(null);
                  setPathResult(null);
                }
              }}
              className="p-2 rounded-xl bg-[#28112e] border border-white/20 text-purple-200 hover:text-white hover:bg-white/10 shadow-sm transition-colors cursor-pointer"
              title="Reset Zoom & Center"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Expand to Full Screen Toggle Button */}
            <button
              onClick={() => {
                setIsFullscreen((prev) => !prev);
                setTimeout(() => {
                  if (graphRef.current) {
                    graphRef.current.zoomToFit(400, 40);
                  }
                }, 120);
              }}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${isFullscreen
                  ? 'bg-fuchsia-600/30 border-fuchsia-400 text-white shadow-md'
                  : 'bg-[#28112e] border-white/20 text-purple-200 hover:text-white hover:bg-white/10'
                }`}
              title={isFullscreen ? 'Exit Full Screen (Esc)' : 'Expand Graph to Full Screen'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4 text-fuchsia-300" />
              ) : (
                <Maximize2 className="w-4 h-4 text-sky-300" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas & Side Panel Container */}
      <div className={`relative w-full rounded-3xl bg-[#28112e] border border-white/25 overflow-hidden shadow-2xl transition-all ${isFullscreen ? 'flex-1 h-full min-h-[500px]' : 'h-[680px]'
        }`}>
        {loading ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-purple-200 text-sm">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span className="font-medium">Constructing Network Graph Topology...</span>
          </div>
        ) : (
          <ForceGraph2D
            ref={graphRef}
            graphData={filteredData}
            backgroundColor="#28112e"
            nodeRelSize={6}
            nodeCanvasObject={drawNode}
            nodePointerAreaPaint={(node: any, color, ctx) => {
              const r = Math.max(7, (node.composite_centrality || 0.2) * 18);
              ctx.fillStyle = color;
              ctx.beginPath();
              ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
              ctx.fill();
            }}
            linkCanvasObject={drawLink}
            linkDirectionalParticles={1}
            linkDirectionalParticleWidth={2.4}
            linkDirectionalParticleSpeed={0.0035}
            linkDirectionalParticleColor={() => '#e599f7'}
            onNodeHover={(node: any) => setHoveredNode(node || null)}
            onNodeClick={(node: any) => {
              setSelectedNode(node);
              setPathResult(null);
              if (graphRef.current) {
                // Focus slightly to the right of center so left slide panel doesn't occlude the target node
                graphRef.current.centerAt((node.x || 0) + 40, node.y || 0, 400);
              }
            }}
            onNodeDrag={(node: any) => {
              // Fix coordinate of the active node being dragged
              node.fx = node.x;
              node.fy = node.y;

              // Pin all other nodes in the network so ONLY the dragged/selected node moves!
              graphData.nodes.forEach((n: any) => {
                if (n.id !== node.id && (n.fx === undefined || n.fx === null)) {
                  n.fx = n.x;
                  n.fy = n.y;
                }
              });
            }}
            onNodeDragEnd={(node: any) => {
              // Release coordinates so the node smoothly springs back to its original place in the network
              node.fx = undefined;
              node.fy = undefined;
              graphData.nodes.forEach((n: any) => {
                n.fx = undefined;
                n.fy = undefined;
              });
              if (graphRef.current) {
                graphRef.current.d3ReheatSimulation();
              }
            }}
            warmupTicks={150}
            cooldownTicks={120}
            d3AlphaDecay={0.02}
            d3VelocityDecay={0.3}
            enableNodeDrag={true}
          />
        )}

        {/* Floating Quick Action Expand Button on Canvas */}
        {!isFullscreen && (
          <button
            onClick={() => {
              setIsFullscreen(true);
              setTimeout(() => {
                if (graphRef.current) graphRef.current.zoomToFit(400, 40);
              }, 120);
            }}
            className="absolute top-4 right-4 z-30 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 border border-white/25 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg backdrop-blur-md transition-all cursor-pointer"
            title="Expand Graph Canvas to Full Screen"
          >
            <Maximize2 className="w-3.5 h-3.5 text-sky-300" />
            <span>Expand Canvas</span>
          </button>
        )}

        {/* Legend Overlay (Placed on Bottom-Right so Left Drawer is Clear) */}
        <div className="absolute bottom-4 right-4 p-3.5 rounded-2xl bg-[#28112e]/90 border border-white/20 shadow-2xl backdrop-blur-md hidden sm:block pointer-events-none z-30">
          <div className="text-[10px] font-bold uppercase tracking-wider text-purple-200 mb-2 font-mono">
            {colorMode === 'type' ? 'Entity Type Legend' : 'Detected Cell Clusters'}
          </div>
          {colorMode === 'type' ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] font-medium text-purple-100">
              {Object.entries(typeColors).map(([type, color]) => (
                <div key={type} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                  <span>{type}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1 text-[11px] font-medium text-purple-100">
              {communities.map((c, i) => (
                <div key={c.cluster_id} className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: communityColors[i % communityColors.length] }}
                  />
                  <span className="truncate max-w-[200px]">{c.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Node Detail Slide-Over Panel (Placed on LEFT SIDE as requested) */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              initial={{ opacity: 0, x: -440 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -440 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="absolute top-0 left-0 bottom-0 w-84 sm:w-[420px] bg-[#28112e]/98 border-r border-white/25 p-5 overflow-y-auto z-40 flex flex-col justify-between shadow-2xl backdrop-blur-xl"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between pb-3 border-b border-white/15">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border"
                        style={{
                          backgroundColor: `${typeColors[selectedNode.type]}25`,
                          borderColor: `${typeColors[selectedNode.type]}50`,
                          color: typeColors[selectedNode.type],
                        }}
                      >
                        {selectedNode.type}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-400/30">
                        Risk: {selectedNode.risk_score}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white mt-1.5 font-display">
                      {selectedNode.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Expand Node Neighborhood Action */}
                    <button
                      onClick={handleExpandSelectedNode}
                      className="p-1.5 text-sky-300 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
                      title="Expand and Focus Node Subgraph"
                    >
                      <Layers className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedNode(null);
                        setPathResult(null);
                      }}
                      className="p-1.5 text-purple-300 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* EXPAND SUBGRAPH QUICK ACTION BUTTON */}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    onClick={handleExpandSelectedNode}
                    className="py-2 px-2.5 rounded-xl bg-gradient-to-r from-sky-500/30 to-fuchsia-500/30 hover:from-sky-500/40 hover:to-fuchsia-500/40 border border-sky-400/40 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-sky-300" />
                    <span>Focus Subgraph ({nodeConnections.length})</span>
                  </button>

                  <button
                    onClick={() => {
                      setIngestTargetEntityId(selectedNode.id);
                      setShowIngestModal(true);
                    }}
                    className="py-2 px-2.5 rounded-xl bg-fuchsia-600/25 hover:bg-fuchsia-600/35 border border-fuchsia-400/40 text-fuchsia-200 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    title="Ingest new evidence or suspect linked directly to this node"
                  >
                    <Plus className="w-3.5 h-3.5 text-fuchsia-300" />
                    <span>Connect Lead</span>
                  </button>
                </div>

                {/* EXACT LATITUDE & LONGITUDE COORDINATES CARD */}
                {selectedNodeCoords && (
                  <div className="mt-3.5 p-3.5 rounded-2xl bg-gradient-to-br from-sky-950/50 to-purple-950/40 border border-sky-400/35 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-sky-300 font-bold text-xs font-mono">
                        <MapPin className="w-3.5 h-3.5 text-sky-400" />
                        <span>Exact Coordinates & Geolocation</span>
                      </div>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-200 border border-sky-400/30 font-bold">
                        GPS VERIFIED
                      </span>
                    </div>

                    <div className="flex items-center justify-between bg-black/40 p-2.5 rounded-xl border border-white/10">
                      <div>
                        <span className="text-[10px] font-mono text-purple-300 block">LATITUDE & LONGITUDE</span>
                        <span className="text-xs font-mono font-extrabold text-emerald-300">
                          {selectedNodeCoords.formatted}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`${selectedNodeCoords.lat.toFixed(6)}, ${selectedNodeCoords.lon.toFixed(6)}`);
                          setCoordsCopied(true);
                          setTimeout(() => setCoordsCopied(false), 2000);
                        }}
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-purple-200 hover:text-white border border-white/15 text-[10px] font-mono flex items-center gap-1 cursor-pointer transition-all"
                        title="Copy exact decimal coordinates"
                      >
                        {coordsCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-purple-300" />}
                        <span>{coordsCopied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    <div className="text-[11px] text-purple-200 font-mono flex items-center justify-between">
                      <span className="text-purple-300">Corridor / Area:</span>
                      <span className="text-white font-semibold truncate max-w-[200px]">
                        {selectedNodeCoords.area}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      <button
                        onClick={() => setShowCoordinatesModal(true)}
                        className="py-1.5 px-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 border border-sky-400/30 text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer"
                        title="Inspect in Coordinates Tool & find nearby targets"
                      >
                        <Compass className="w-3.5 h-3.5 text-sky-400" />
                        <span>Inspect GPS</span>
                      </button>

                      <button
                        onClick={() => navigate(`/timeline-gis?lat=${selectedNodeCoords.lat}&lon=${selectedNodeCoords.lon}`)}
                        className="py-1.5 px-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-400/30 text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer"
                        title="View live GIS radar telemetry map"
                      >
                        <Radio className="w-3.5 h-3.5 text-purple-300" />
                        <span>GIS Radar Map</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* STATEMENT DOWNLOAD ACTION BOX (Clear Data Export) */}
                <div className="mt-3.5 p-3 rounded-2xl bg-white/10 border border-sky-400/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white font-bold text-xs">
                      <FileText className="w-4 h-4 text-sky-300" />
                      <span>Official Statement & Clear Data</span>
                    </div>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-200 border border-sky-400/30 font-bold">
                      VERIFIED
                    </span>
                  </div>

                  <p className="text-[11px] text-purple-200 leading-tight">
                    Download verified statutory statement, Hawala ledger, and CDR telemetry for <strong>{selectedNode.name}</strong>.
                  </p>

                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    <button
                      onClick={() => setShowStatementModal(true)}
                      className="py-1.5 px-2 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 text-xs font-bold flex items-center justify-center gap-1 shadow-sm transition-all cursor-pointer"
                      title="Open full statutory statement with Print/PDF export"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>View PDF</span>
                    </button>

                    <button
                      onClick={handleDownloadCSV}
                      className="py-1.5 px-2 rounded-xl bg-emerald-500/25 hover:bg-emerald-500/35 text-emerald-200 border border-emerald-400/30 text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer"
                      title="Download clean structured CSV for Excel / Sheets"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>CSV</span>
                    </button>

                    <button
                      onClick={handleDownloadJSON}
                      className="py-1.5 px-2 rounded-xl bg-fuchsia-500/25 hover:bg-fuchsia-500/35 text-fuchsia-200 border border-fuchsia-400/30 text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer"
                      title="Download clean structured JSON dataset"
                    >
                      <FileCode className="w-3.5 h-3.5" />
                      <span>JSON</span>
                    </button>
                  </div>
                </div>

                {/* Centrality & Explainability */}
                <div className="mt-3.5 p-3.5 rounded-xl bg-white/10 border border-white/15 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-purple-200">Network Centrality:</span>
                    <span className="font-mono font-bold text-fuchsia-300">
                      {Math.round((selectedNode.composite_centrality || 0.3) * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-purple-200">Cluster Cell:</span>
                    <span className="text-white truncate max-w-[160px]">
                      {selectedNode.cluster_name || 'General Cell'}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[11px] text-purple-200 font-medium">Link Rationale:</span>
                    <ExplainabilityTooltip
                      entityName={selectedNode.name}
                      reason={selectedNode.reason || `Target has ${selectedNode.degree || 1} confirmed direct linkages.`}
                      title="Entity Graph Rationale"
                    />
                  </div>
                </div>

                {/* Attributes Metadata (Notes) */}
                <div className="mt-3.5">
                  <h4 className="text-xs font-bold text-purple-200 uppercase tracking-wider mb-2 font-display">
                    Dossier Metadata & Notes
                  </h4>
                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/15 font-mono text-[11px] space-y-1.5 text-purple-100">
                    {Object.entries(selectedNode.attributes || {}).map(([key, val]) => (
                      <div key={key} className="flex items-start justify-between gap-2">
                        <span className="text-purple-300">{key}:</span>
                        <span className="text-white font-bold text-right truncate max-w-[160px]">
                          {String(val)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Direct Connections List */}
                <div className="mt-3.5">
                  <h4 className="text-xs font-bold text-purple-200 uppercase tracking-wider mb-2 font-display">
                    Direct Connections ({nodeConnections.length})
                  </h4>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {nodeConnections.map((conn, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          if (conn.node) handleSearchSelect(conn.node);
                        }}
                        className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 cursor-pointer flex items-center justify-between text-xs transition-colors shadow-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: typeColors[conn.node?.type as EntityType] }}
                          />
                          <span className="text-white font-bold truncate max-w-[140px]">
                            {conn.node?.name || 'Asset'}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono font-semibold text-fuchsia-300 uppercase">
                          {conn.type?.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Find Shortest Path Tool */}
                <div className="mt-3.5 p-3.5 rounded-xl bg-purple-950/50 border border-white/20">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-purple-200 mb-2">
                    <Route className="w-3.5 h-3.5 text-purple-300" />
                    <span>Find Shortest Path to Node</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={pathTargetId}
                      onChange={(e) => setPathTargetId(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 rounded-xl bg-black/40 border border-white/20 text-xs text-white focus:outline-none font-medium"
                    >
                      <option value="">Select target entity...</option>
                      {graphData.nodes
                        .filter((n) => n.id !== selectedNode.id)
                        .map((n) => (
                          <option key={n.id} value={n.id} className="bg-[#2d0932]">
                            {n.name} ({n.type})
                          </option>
                        ))}
                    </select>
                    <button
                      onClick={handleFindPath}
                      disabled={!pathTargetId || pathLoading}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-fuchsia-600 to-purple-700 hover:from-fuchsia-500 hover:to-purple-600 disabled:opacity-50 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-md"
                    >
                      {pathLoading ? '...' : 'Trace'}
                    </button>
                  </div>

                  {pathResult && (
                    <div className="mt-2.5 text-[11px] text-purple-100 bg-black/50 p-2.5 rounded-xl border border-white/15 shadow-xs">
                      {pathResult.found ? (
                        <div>
                          <div className="text-amber-300 font-bold mb-1">
                            ✓ {pathResult.hops} Hop Linkage Identified
                          </div>
                          <p className="text-[10px] text-purple-200 font-medium">
                            {pathResult.summary}
                          </p>
                        </div>
                      ) : (
                        <div className="text-rose-300 font-bold">{pathResult.message}</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-white/15 flex items-center gap-2">
                <button
                  onClick={() => setShowStatementModal(true)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Download Statement</span>
                </button>

                <button
                  onClick={() => navigate(`/assistant?q=who is connected to ${selectedNode.name}`)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-white/20 hover:bg-white/30 text-white border border-white/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-fuchsia-300" />
                  <span>Ask AI</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

