import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Users,
  Share2,
  Briefcase,
  ShieldAlert,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  ChevronRight,
  Network,
  FileText,
  Printer,
  Radio
} from 'lucide-react';
import { GlassPanel } from '../components/GlassPanel';
import { HumanInTheLoopBanner } from '../components/HumanInTheLoopBanner';
import { ExplainabilityTooltip } from '../components/ExplainabilityTooltip';
import { LiveWireTicker } from '../components/LiveWireTicker';
import { SyndicateMatrixPanel } from '../components/SyndicateMatrixPanel';
import { OfficialDossierModal } from '../components/OfficialDossierModal';
import { SuspectRadarModal } from '../components/SuspectRadarModal';
import { api } from '../services/api';
import { StatsSummary, KeyEntity, CaseItem, Anomaly } from '../types';

const CountUp: React.FC<{ target: number }> = ({ target }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const steps = 30;
    const increment = Math.max(1, Math.floor(target / steps));
    const stepTime = duration / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [target]);

  return <span>{count}</span>;
};

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<StatsSummary | null>(null);
  const [keyEntities, setKeyEntities] = useState<KeyEntity[]>([]);
  const [recentCases, setRecentCases] = useState<CaseItem[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);
  const [isRadarOpen, setIsRadarOpen] = useState(false);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [statsData, keyData, casesData, anomsData] = await Promise.all([
          api.getStats(),
          api.getKeyEntities(5),
          api.getCases(),
          api.getAnomalies(),
        ]);
        setStats(statsData);
        setKeyEntities(keyData);
        setRecentCases(casesData.slice(0, 5));
        setAnomalies(anomsData.slice(0, 4));
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const statCards = [
    {
      title: 'Monitored Entities',
      value: stats?.entities ?? 62,
      subtitle: 'Persons, Vehicles, Phones, Accounts',
      icon: Users,
      glow: 'blue' as const,
      color: 'text-sky-300',
      iconBg: 'bg-sky-500/20 border-sky-400/30 text-sky-200',
    },
    {
      title: 'Active Linkages',
      value: stats?.relationships ?? 129,
      subtitle: 'Cross-State Intercepts & Wire Logs',
      icon: Share2,
      glow: 'green' as const,
      color: 'text-emerald-300',
      iconBg: 'bg-emerald-500/20 border-emerald-400/30 text-emerald-200',
    },
    {
      title: 'Investigation Cases',
      value: stats?.cases ?? 15,
      subtitle: 'Linked Operation Dossiers',
      icon: Briefcase,
      glow: 'amber' as const,
      color: 'text-amber-300',
      iconBg: 'bg-amber-500/20 border-amber-400/30 text-amber-200',
    },
    {
      title: 'Key Bottlenecks',
      value: stats?.key_entities ?? 5,
      subtitle: 'High Centrality Kingpins & Bridges',
      icon: ShieldAlert,
      glow: 'red' as const,
      color: 'text-rose-300',
      iconBg: 'bg-rose-500/20 border-rose-400/30 text-rose-200',
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <HumanInTheLoopBanner />

      {/* Live Tactical Surveillance Wire Intercept Ticker */}
      <LiveWireTicker />

      {/* Title & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5 font-display">
            Operational Intelligence Dashboard
            <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-white/20 text-purple-100 border border-white/30">
              REAL-TIME GRAPH
            </span>
          </h1>
          <p className="text-xs text-purple-200 mt-1 font-medium">
            Automated entity resolution, network topology scoring, and multi-jurisdictional link analysis.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Suspect & Telecom Radar Button */}
          <button
            onClick={() => setIsRadarOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 text-xs font-semibold border border-sky-400/40 shadow-sm transition-all cursor-pointer"
            title="Locate suspect by name or phone number"
          >
            <Radio className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
            <span>Suspect & Telecom Radar</span>
          </button>

          {/* Official Dossier Export Button */}
          <button
            onClick={() => setIsDossierModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-semibold border border-amber-400/40 shadow-sm transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-amber-300" />
            <span>Official Dossier (PDF)</span>
          </button>

          <Link
            to="/graph"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-700 hover:from-fuchsia-500 hover:to-purple-600 text-white text-xs font-semibold shadow-lg border border-white/30 transition-all cursor-pointer"
          >
            <Network className="w-4 h-4" />
            <span>Launch Graph Explorer</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <GlassPanel
              key={card.title}
              glow={card.glow}
              className="p-5 flex flex-col justify-between relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-purple-200">
                  {card.title}
                </span>
                <div className={`p-2 rounded-xl border ${card.iconBg}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div>
                <div className={`text-3xl font-extrabold tracking-tight font-display ${card.color}`}>
                  {loading ? (
                    <div className="h-8 w-16 bg-white/10 rounded animate-pulse" />
                  ) : (
                    <CountUp target={card.value} />
                  )}
                </div>
                <div className="text-[11px] text-purple-200 mt-1.5 flex items-center gap-1 font-medium">
                  <TrendingUp className="w-3 h-3 text-emerald-300" />
                  <span>{card.subtitle}</span>
                </div>
              </div>
            </GlassPanel>
          );
        })}
      </div>

      {/* Regional Syndicate Threat Matrix Panel */}
      <SyndicateMatrixPanel />

      {/* Main Grid: Key Entities & Detected Anomalies */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Key Entities (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <GlassPanel glow="blue" className="p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/15">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-fuchsia-500/20 text-fuchsia-300 border border-white/20">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider font-display">
                    High Centrality Key Entities
                  </h2>
                  <p className="text-[11px] text-purple-200 font-medium">
                    Ranked by Betweenness & Degree Centrality (Network Bottlenecks)
                  </p>
                </div>
              </div>

              <Link
                to="/graph"
                className="text-xs text-purple-200 hover:text-white font-bold flex items-center gap-1"
              >
                <span>View on Graph</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-14 bg-white/10 rounded-xl animate-pulse" />
                ))
              ) : (
                keyEntities.map((ent, rank) => {
                  const pct = Math.round(ent.composite_centrality * 100);
                  const typeColors: Record<string, string> = {
                    Person: 'bg-sky-500/25 text-sky-200 border-sky-400/40',
                    Vehicle: 'bg-amber-500/25 text-amber-200 border-amber-400/40',
                    Phone: 'bg-emerald-500/25 text-emerald-200 border-emerald-400/40',
                    Account: 'bg-fuchsia-500/25 text-fuchsia-200 border-fuchsia-400/40',
                    Location: 'bg-rose-500/25 text-rose-200 border-rose-400/40',
                    Organization: 'bg-cyan-500/25 text-cyan-200 border-cyan-400/40',
                  };

                  return (
                    <div
                      key={ent.id}
                      onClick={() => navigate(`/graph?highlight=${ent.id}`)}
                      className="p-3.5 rounded-xl bg-white/[0.06] border border-white/10 hover:border-white/30 hover:bg-white/[0.12] transition-all cursor-pointer group shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-white/20 text-white text-xs font-mono font-bold flex items-center justify-center">
                            {rank + 1}
                          </span>
                          <span className="text-xs font-bold text-white group-hover:text-fuchsia-200 transition-colors">
                            {ent.name}
                          </span>
                          <span
                            className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${
                              typeColors[ent.type] || 'bg-white/10 text-white'
                            }`}
                          >
                            {ent.type}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <ExplainabilityTooltip
                            entityName={ent.name}
                            reason={ent.reason}
                            title={`Centrality Rationale: ${ent.name}`}
                          />
                          <span className="text-xs font-mono font-bold text-purple-200">
                            {pct}% Cent.
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-1.5 rounded-full bg-black/40 overflow-hidden relative">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-fuchsia-400 via-pink-400 to-amber-300 shadow-[0_0_10px_rgba(232,121,249,0.7)]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </GlassPanel>

          {/* Recent Cases */}
          <GlassPanel glow="amber" className="p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/15">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-white/20">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider font-display">
                    Recent Investigation Dossiers
                  </h2>
                  <p className="text-[11px] text-purple-200 font-medium">
                    Active cross-jurisdictional syndicate investigations
                  </p>
                </div>
              </div>

              <Link
                to="/cases"
                className="text-xs text-amber-300 hover:text-white font-bold flex items-center gap-1"
              >
                <span>All Cases</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {recentCases.map((c) => {
                const statusBadge: Record<string, string> = {
                  Active: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40',
                  'Under Review': 'bg-amber-500/20 text-amber-200 border-amber-400/40',
                  Critical: 'bg-rose-500/20 text-rose-200 border-rose-400/40',
                  Closed: 'bg-white/10 text-purple-200 border-white/20',
                };

                return (
                  <div
                    key={c.id}
                    onClick={() => navigate(`/cases/${c.id}`)}
                    className="p-3.5 rounded-xl bg-white/[0.06] border border-white/10 hover:border-amber-400/40 hover:bg-white/[0.1] transition-all cursor-pointer flex items-center justify-between shadow-sm"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white hover:text-amber-200">
                          {c.title}
                        </span>
                        <span
                          className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                            statusBadge[c.status] || ''
                          }`}
                        >
                          {c.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-purple-200 mt-0.5 line-clamp-1 font-medium">
                        {c.description}
                      </p>
                    </div>

                    <div className="text-right flex items-center gap-3">
                      <span className="text-[11px] font-mono text-purple-200 font-medium">
                        {c.entity_count} entities
                      </span>
                      <ChevronRight className="w-4 h-4 text-purple-300" />
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassPanel>
        </div>

        {/* Right: Detected Anomalies & Quick Assistant (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <GlassPanel glow="red" className="p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/15">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-300 border border-white/20">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider font-display">
                    Flagged Graph Anomalies
                  </h2>
                  <p className="text-[11px] text-purple-200 font-medium">
                    Structural outliers & multi-cell bottlenecks
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-200 border border-rose-400/40">
                {anomalies.length} ALERTS
              </span>
            </div>

            <div className="space-y-3">
              {anomalies.map((anom) => {
                const severityColors = {
                  CRITICAL: 'border-rose-400/50 bg-rose-950/30 text-rose-200',
                  HIGH: 'border-amber-400/50 bg-amber-950/30 text-amber-200',
                  MEDIUM: 'border-blue-400/50 bg-blue-950/30 text-blue-200',
                };

                return (
                  <div
                    key={anom.id}
                    className={`p-3.5 rounded-xl border ${
                      severityColors[anom.severity]
                    } relative transition-all shadow-sm`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-black/40 border border-white/10">
                        [{anom.severity}] {anom.title}
                      </span>
                      <ExplainabilityTooltip
                        entityName={anom.name}
                        reason={anom.reason}
                        title="Anomaly Evidence Breakdown"
                      />
                    </div>

                    <div className="text-xs font-bold text-white mt-1">
                      Target: {anom.name} ({anom.type})
                    </div>

                    <p className="text-[11px] text-purple-100 mt-1 leading-relaxed">
                      {anom.description}
                    </p>

                    <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[10px]">
                      <span className="text-purple-300 italic">
                        Click to inspect on Graph Explorer
                      </span>
                      <button
                        onClick={() => navigate(`/graph?highlight=${anom.entity_id}`)}
                        className="text-sky-300 hover:text-white font-bold inline-flex items-center gap-1 cursor-pointer"
                      >
                        Inspect Node
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassPanel>

          {/* Quick AI Assistant Card */}
          <GlassPanel glow="purple" className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-white/15 border border-white/20 text-fuchsia-300 shadow-sm">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-display">
                  Investigation Copilot
                </h3>
                <p className="text-[11px] text-purple-200 font-medium">
                  Query connections and shortest suspect paths in natural language
                </p>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <button
                onClick={() => navigate('/assistant?q=Who is connected to Rahul Verma?')}
                className="w-full text-left p-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-medium text-purple-100 flex items-center justify-between transition-all cursor-pointer shadow-xs"
              >
                <span>"Who is connected to Rahul Verma?"</span>
                <ChevronRight className="w-3.5 h-3.5 text-purple-300" />
              </button>

              <button
                onClick={() => navigate('/assistant?q=Shortest path between Kabir Khan and Priya Sharma')}
                className="w-full text-left p-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-medium text-purple-100 flex items-center justify-between transition-all cursor-pointer shadow-xs"
              >
                <span>"Shortest path between Kabir Khan and Priya Sharma"</span>
                <ChevronRight className="w-3.5 h-3.5 text-purple-300" />
              </button>
            </div>
          </GlassPanel>
        </div>
      </div>

      {/* Official Intelligence Dossier Modal */}
      <OfficialDossierModal
        isOpen={isDossierModalOpen}
        onClose={() => setIsDossierModalOpen(false)}
        stats={stats}
        keyEntities={keyEntities}
        cases={recentCases}
      />

      {/* Suspect & Telecom Radar Modal */}
      <SuspectRadarModal
        isOpen={isRadarOpen}
        onClose={() => setIsRadarOpen(false)}
      />
    </div>
  );
};
