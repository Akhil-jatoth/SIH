import React, { useState, useEffect } from 'react';
import { Radio, AlertTriangle, ShieldCheck, Zap, ArrowRight } from 'lucide-react';

const WIRE_FEEDS = [
  { id: 1, type: 'WIRE-INT', code: 'INT-4091', text: 'Encrypted VoIP burst intercepted between North Hub (Delhi) & South Crypto Node (Hyderabad)', level: 'high' },
  { id: 2, type: 'FASTAG', code: 'TOLL-882', text: 'Target Vehicle (DL-01-AB-1234) crossed Kherki Daula Toll Plaza at 18:24 hrs', level: 'medium' },
  { id: 3, type: 'CRYPTO-ALERT', code: 'LEDGER-09', text: 'Automated 42.5 ETH mixer hop detected from Wallet 0x7f2...4a9 linked to Priya Sharma', level: 'high' },
  { id: 4, type: 'CENTRALITY-ALARM', code: 'GRAPH-91', text: 'Rahul Verma betweenness centrality crossed 0.95 — critical syndicate bottleneck active', level: 'critical' },
  { id: 5, type: 'GIS-CLUSTER', code: 'GEO-331', text: '3 multi-jurisdiction telecom pings clustered near Cyber Gateway, HITEC City', level: 'medium' },
  { id: 6, type: 'BLOCKCHAIN-LOG', code: 'SHA-256', text: 'Evidence Block #129 cryptographically notarized & sealed with hash 0x3a4f...8e1b', level: 'normal' },
  { id: 7, type: 'HAWALA-TRAIL', code: 'BANK-112', text: 'Shell account Apex Global Ventures received INR 4.5 Cr structured deposit batch', level: 'high' },
];

export const LiveWireTicker: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % WIRE_FEEDS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const current = WIRE_FEEDS[currentIndex];

  const getBadgeStyle = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'high':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'medium':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  return (
    <div className="w-full bg-slate-900/90 border border-slate-700/60 rounded-xl px-3.5 py-2 flex items-center justify-between gap-3 text-xs backdrop-blur-md shadow-inner overflow-hidden">
      {/* Ticker Title */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
        </span>
        <span className="font-bold font-mono uppercase tracking-wider text-rose-300 flex items-center gap-1 text-[11px]">
          <Zap className="w-3.5 h-3.5 text-rose-400" />
          <span>TACTICAL WIRE FEED</span>
        </span>
      </div>

      <div className="h-4 w-px bg-slate-700 shrink-0 hidden sm:block" />

      {/* Rotating Item Content */}
      <div className="flex-1 min-w-0 flex items-center gap-2.5 overflow-hidden transition-all duration-300">
        <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-mono font-bold border uppercase ${getBadgeStyle(current.level)}`}>
          [{current.type}]
        </span>
        <span className="font-mono text-slate-400 text-[11px] shrink-0 hidden md:inline">
          {current.code}:
        </span>
        <span className="truncate text-slate-200 font-medium">
          {current.text}
        </span>
      </div>

      {/* Index Counter */}
      <div className="shrink-0 flex items-center gap-1.5 text-[11px] font-mono text-slate-400 pl-2 border-l border-slate-700">
        <span className="text-amber-400 font-bold">{currentIndex + 1}</span>
        <span>/</span>
        <span>{WIRE_FEEDS.length}</span>
      </div>
    </div>
  );
};
