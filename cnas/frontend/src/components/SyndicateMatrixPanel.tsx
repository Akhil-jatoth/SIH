import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Network, ArrowUpRight, ChevronRight, Skull, Landmark, Globe, Cpu } from 'lucide-react';
import { GlassPanel } from './GlassPanel';

interface SyndicateInfo {
  id: number;
  name: string;
  region: string;
  threatLevel: number; // percentage (0-100)
  threatRating: 'CRITICAL' | 'HIGH' | 'ELEVATED';
  kingpin: string;
  membersCount: number;
  primaryModus: string;
  icon: any;
  color: string;
  bgGlow: string;
}

const SYNDICATES: SyndicateInfo[] = [
  {
    id: 1,
    name: 'North Narcotics & Smuggling Cell',
    region: 'Delhi NCR / Punjab / Haryana',
    threatLevel: 94,
    threatRating: 'CRITICAL',
    kingpin: 'Rahul Verma',
    membersCount: 18,
    primaryModus: 'Cross-border drug trafficking & Hawala bridge',
    icon: Skull,
    color: 'text-rose-400',
    bgGlow: 'border-rose-500/30 bg-rose-500/10 hover:border-rose-400/50',
  },
  {
    id: 2,
    name: 'West Financial & Extortion Cartel',
    region: 'Mumbai / Pune / Gujarat',
    threatLevel: 89,
    threatRating: 'HIGH',
    kingpin: "Sunil 'Bhai' Deshmukh",
    membersCount: 15,
    primaryModus: 'Corporate extortion, real-estate laundering & benami trusts',
    icon: Landmark,
    color: 'text-amber-400',
    bgGlow: 'border-amber-500/30 bg-amber-500/10 hover:border-amber-400/50',
  },
  {
    id: 3,
    name: 'South Cyber & Crypto Laundering Ring',
    region: 'Hyderabad / Bengaluru / Chennai',
    threatLevel: 96,
    threatRating: 'CRITICAL',
    kingpin: 'Priya Sharma & Kabir Khan',
    membersCount: 16,
    primaryModus: 'Darknet mixers, synthetic identity loans & USDT layering',
    icon: Cpu,
    color: 'text-fuchsia-400',
    bgGlow: 'border-fuchsia-500/30 bg-fuchsia-500/10 hover:border-fuchsia-400/50',
  },
  {
    id: 4,
    name: 'East Shell Logistics & Hawala Network',
    region: 'Kolkata / Siliguri / Assam',
    threatLevel: 78,
    threatRating: 'ELEVATED',
    kingpin: 'Ananya Das',
    membersCount: 13,
    primaryModus: 'Shell export invoices, customs evasion & illegal gold conduits',
    icon: Globe,
    color: 'text-sky-400',
    bgGlow: 'border-sky-500/30 bg-sky-500/10 hover:border-sky-400/50',
  },
];

export const SyndicateMatrixPanel: React.FC = () => {
  const navigate = useNavigate();

  return (
    <GlassPanel glow="blue" className="p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-sm">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide font-display">
              Regional Syndicate Threat Matrix
            </h3>
            <p className="text-[11px] text-slate-400">
              Clustered crime syndicates detected via Louvain community partitioning
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/graph')}
          className="flex items-center gap-1 text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
        >
          <span>Explore in Graph</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Grid of Syndicates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
        {SYNDICATES.map((syndicate) => {
          const IconComponent = syndicate.icon;
          return (
            <div
              key={syndicate.id}
              onClick={() => navigate(`/graph`)}
              className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between gap-2.5 ${syndicate.bgGlow}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg bg-slate-900/80 border border-white/10 ${syndicate.color}`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100 hover:text-sky-300 transition-colors leading-tight">
                      {syndicate.name}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {syndicate.region}
                    </span>
                  </div>
                </div>

                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${
                    syndicate.threatRating === 'CRITICAL'
                      ? 'bg-rose-500/30 text-rose-300 border border-rose-500/50'
                      : syndicate.threatRating === 'HIGH'
                      ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50'
                      : 'bg-sky-500/30 text-sky-300 border border-sky-500/50'
                  }`}
                >
                  {syndicate.threatRating}
                </span>
              </div>

              {/* Progress Bar & Threat Score */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Threat Index</span>
                  <span className="font-mono font-bold text-slate-200">{syndicate.threatLevel}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      syndicate.threatLevel > 90
                        ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                        : syndicate.threatLevel > 80
                        ? 'bg-gradient-to-r from-sky-500 to-amber-500'
                        : 'bg-gradient-to-r from-emerald-500 to-sky-500'
                    }`}
                    style={{ width: `${syndicate.threatLevel}%` }}
                  />
                </div>
              </div>

              {/* Metadata row */}
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/5 font-mono text-slate-400">
                <div>
                  <span className="text-slate-500">Kingpin: </span>
                  <span className="text-slate-200 font-semibold">{syndicate.kingpin}</span>
                </div>
                <div>
                  <span className="text-slate-500">Nodes: </span>
                  <span className="text-emerald-400 font-bold">{syndicate.membersCount}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </GlassPanel>
  );
};
