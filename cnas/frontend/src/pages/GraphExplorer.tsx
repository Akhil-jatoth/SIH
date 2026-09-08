import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ForceGraph2D from 'react-force-graph-2d';
import {
  Search,
  RotateCcw,
  X,
  Sparkles,
  Route,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { HumanInTheLoopBanner } from '../components/HumanInTheLoopBanner';
import { ExplainabilityTooltip } from '../components/ExplainabilityTooltip';
import { api } from '../services/api';
import { GraphData, Entity, Community, EntityType } from '../types';

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
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  // Shortest Path state
  const [pathTargetId, setPathTargetId] = useState<string>('');
  const [pathResult, setPathResult] = useState<any | null>(null);
  const [pathLoading, setPathLoading] = useState(false);

  // Type Colors for vibrant purple space
  const typeColors: Record<EntityType, string> = {
    Person: '#38bdf8',       // Sky Blue
    Vehicle: '#fbbf24',      // Amber
    Phone: '#34d399',        // Emerald Green
    Account: '#e879f9',      // Fuchsia Purple
    Location: '#f87171',     // Coral Red
    Organization: '#22d3ee', // Cyan
  };

  const communityColors = [
    '#38bdf8', // Sky Blue
    '#fbbf24', // Amber
    '#34d399', // Emerald
    '#f87171', // Coral Red
    '#c084fc', // Purple
    '#f472b6', // Pink
  ];

  // Fetch full graph & communities
  useEffect(() => {
    const loadGraph = async () => {
      try {
        setLoading(true);
        const [gData, commData] = await Promise.all([
          api.getFullGraph(),
          api.getCommunities(),
        ]);
        setGraphData(gData);
        setCommunities(commData);
      } catch (err) {
        console.error('Failed to fetch graph data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadGraph();
  }, []);

  // Handle URL highlight param
  useEffect(() => {
    const highlightId = searchParams.get('highlight');
    if (highlightId && graphData.nodes.length > 0) {
      const target = graphData.nodes.find((n) => String(n.id) === highlightId);
      if (target) {
        setSelectedNode(target);
        if (graphRef.current) {
          graphRef.current.centerAt(target.x || 0, target.y || 0, 1000);
          graphRef.current.zoom(2.5, 1000);
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

  // Handle Search Zoom
  const handleSearchSelect = (entity: Entity) => {
    setSelectedNode(entity);
    setSearchQuery('');
    if (graphRef.current) {
      graphRef.current.centerAt(entity.x || 0, entity.y || 0, 1000);
      graphRef.current.zoom(2.8, 1000);
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

  // Node coloring function
  const getNodeColor = useCallback(
    (node: any) => {
      if (pathResult?.path_node_ids?.includes(node.id)) {
        return '#fbbf24'; // Highlight gold for shortest path
      }
      if (colorMode === 'community') {
        const clusterIdx = node.cluster_id ?? 0;
        return communityColors[clusterIdx % communityColors.length];
      }
      return typeColors[node.type as EntityType] || '#ffffff';
    },
    [colorMode, pathResult]
  );

  // Search matches
  const searchMatches = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return graphData.nodes
      .filter((n) => n.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 6);
  }, [searchQuery, graphData.nodes]);

  // Selected Node Connections
  const nodeConnections = useMemo(() => {
    if (!selectedNode) return [];
    const rels: any[] = [];

    graphData.links.forEach((l: any) => {
      const sId = typeof l.source === 'object' ? l.source.id : l.source;
      const tId = typeof l.target === 'object' ? l.target.id : l.target;

      if (sId === selectedNode.id) {
        const targetNode = graphData.nodes.find((n) => n.id === tId);
        rels.push({
          type: l.relation_type,
          node: targetNode,
        });
      } else if (tId === selectedNode.id) {
        const sourceNode = graphData.nodes.find((n) => n.id === sId);
        rels.push({
          type: l.relation_type,
          node: sourceNode,
        });
      }
    });

    return rels;
  }, [selectedNode, graphData]);

  return (
    <div className="space-y-4 pb-10">
      {/* Top Banner */}
      <HumanInTheLoopBanner />

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full lg:w-96">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-purple-300" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search suspect, vehicle, phone, account..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/20 text-white text-xs focus:outline-none focus:border-white focus:ring-1 focus:ring-white shadow-lg font-medium"
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
            <div className="absolute top-full left-0 right-0 mt-1.5 p-2 rounded-2xl bg-[#2d0932] border border-white/30 z-50 shadow-2xl space-y-1">
              {searchMatches.map((m) => (
                <div
                  key={m.id}
                  onClick={() => handleSearchSelect(m)}
                  className="p-2 rounded-xl hover:bg-white/10 cursor-pointer flex items-center justify-between text-xs transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: typeColors[m.type] }}
                    />
                    <span className="font-bold text-white">{m.name}</span>
                  </div>
                  <span className="text-[10px] font-mono font-semibold text-purple-200 uppercase">
                    {m.type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Color Mode Toggle */}
          <div className="flex items-center bg-[#341038] p-1 rounded-xl border border-white/20 shadow-sm text-xs">
            <button
              onClick={() => setColorMode('type')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                colorMode === 'type'
                  ? 'bg-white/25 text-white shadow-sm'
                  : 'text-purple-200 hover:text-white'
              }`}
            >
              Entity Type
            </button>
            <button
              onClick={() => setColorMode('community')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                colorMode === 'community'
                  ? 'bg-white/25 text-white shadow-sm'
                  : 'text-purple-200 hover:text-white'
              }`}
            >
              Cell / Community
            </button>
          </div>

          {/* Entity Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-[#341038] border border-white/20 text-white text-xs font-semibold focus:outline-none shadow-sm cursor-pointer"
          >
            <option value="ALL">All Types ({graphData.nodes.length})</option>
            <option value="Person">Persons</option>
            <option value="Vehicle">Vehicles</option>
            <option value="Phone">Phones / SIMs</option>
            <option value="Account">Bank / Crypto Accounts</option>
            <option value="Location">Locations / Safehouses</option>
            <option value="Organization">Organizations / Fronts</option>
          </select>

          {/* Reset Zoom */}
          <button
            onClick={() => {
              if (graphRef.current) {
                graphRef.current.zoomToFit(800, 40);
                setSelectedNode(null);
                setPathResult(null);
              }
            }}
            className="p-2.5 rounded-xl bg-[#341038] border border-white/20 text-purple-200 hover:text-white hover:bg-white/10 shadow-sm transition-colors cursor-pointer"
            title="Reset Graph Zoom"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Canvas & Side Panel Container */}
      <div className="relative w-full h-[680px] rounded-3xl bg-[#341038] border border-white/25 overflow-hidden shadow-2xl">
        {loading ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-purple-200 text-sm">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span className="font-medium">Constructing NetworkX Force Topology...</span>
          </div>
        ) : (
          <ForceGraph2D
            ref={graphRef}
            graphData={filteredData}
            backgroundColor="#341038"
            nodeRelSize={6}
            nodeVal={(n: any) => Math.max(3.5, (n.composite_centrality || 0.2) * 14)}
            nodeColor={getNodeColor}
            nodeLabel={(n: any) => `
              <div style="background: rgba(35,8,38,0.95); padding: 8px 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.25); font-family: Inter, sans-serif; font-size: 12px; color: #ffffff; box-shadow: 0 8px 24px rgba(0,0,0,0.6);">
                <div style="font-weight: bold; color: #fdf4ff;">${n.name}</div>
                <div style="color: #e9d5ff; font-size: 11px; font-weight: 500;">Type: ${n.type} | Risk: ${n.risk_score}</div>
                <div style="color: #fbcfe8; font-size: 10px; margin-top: 3px; font-family: monospace;">Degree: ${n.degree || 1} links</div>
              </div>
            `}
            linkColor={() => 'rgba(255, 255, 255, 0.22)'}
            linkWidth={(l: any) => Math.max(1, (l.weight || 1) * 1.5)}
            linkDirectionalParticles={2}
            linkDirectionalParticleSpeed={0.006}
            linkDirectionalParticleWidth={2}
            linkDirectionalParticleColor={() => '#e879f9'}
            onNodeClick={(node: any) => {
              setSelectedNode(node);
              setPathResult(null);
            }}
            cooldownTicks={120}
          />
        )}

        {/* Legend Overlay */}
        <div className="absolute bottom-4 left-4 p-3.5 rounded-2xl bg-[#280c2c]/90 border border-white/20 shadow-2xl backdrop-blur-md hidden sm:block pointer-events-none">
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

        {/* Node Detail Slide-Over Panel */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              initial={{ opacity: 0, x: 320 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 320 }}
              transition={{ duration: 0.25 }}
              className="absolute top-0 right-0 bottom-0 w-80 sm:w-96 bg-[#2d0932]/95 border-l border-white/25 p-5 overflow-y-auto z-40 flex flex-col justify-between shadow-2xl backdrop-blur-xl"
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

                {/* Centrality & Explainability */}
                <div className="mt-4 p-3.5 rounded-xl bg-white/10 border border-white/15 space-y-2">
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

                {/* Attributes Metadata */}
                <div className="mt-4">
                  <h4 className="text-xs font-bold text-purple-200 uppercase tracking-wider mb-2 font-display">
                    Dossier Metadata
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
                <div className="mt-4">
                  <h4 className="text-xs font-bold text-purple-200 uppercase tracking-wider mb-2 font-display">
                    Direct Linkages ({nodeConnections.length})
                  </h4>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
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
                        <span className="text-[10px] font-mono font-semibold text-fuchsia-300">
                          {conn.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Find Shortest Path Tool */}
                <div className="mt-4 p-3.5 rounded-xl bg-purple-950/50 border border-white/20">
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
                  onClick={() => navigate(`/assistant?q=who is connected to ${selectedNode.name}`)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-white/20 hover:bg-white/30 text-white border border-white/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-fuchsia-300" />
                  <span>Ask AI Assistant</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
