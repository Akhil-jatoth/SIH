import React, { useState, useEffect } from 'react';
import { Shield, Radio, Lock, Clock, AlertTriangle } from 'lucide-react';

export const OfficialHeaderBar: React.FC = () => {
  const [timeState, setTimeState] = useState({
    ist: '',
    utc: '',
  });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeState({
        ist: now.toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }) + ' IST',
        utc: now.toLocaleTimeString('en-GB', {
          timeZone: 'UTC',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }) + ' UTC',
      });
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full bg-gradient-to-r from-slate-950 via-[#111827] to-slate-950 border-b border-amber-500/30 text-slate-300 text-[11px] font-mono select-none shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex flex-wrap items-center justify-between gap-2">
        {/* Left: Official Government & Agency Classification */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/40 text-amber-400 font-bold tracking-wider">
            <Shield className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>MHA // I4C</span>
          </div>

          <span className="hidden sm:inline text-slate-500">|</span>

          <div className="flex items-center gap-1.5 text-slate-300 font-semibold tracking-wide">
            <Lock className="w-3 h-3 text-rose-400" />
            <span className="text-rose-400 font-bold">TOP SECRET</span>
            <span className="text-slate-400 hidden md:inline">// LAW ENFORCEMENT SENSITIVE (LES)</span>
          </div>
        </div>

        {/* Center: Live Threat Defcon */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-0.5 rounded bg-rose-950/40 border border-rose-500/30 text-rose-300 text-[10px]">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span className="font-bold tracking-wider">THREAT LEVEL: DEFCON-3 (ELEVATED)</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">SYNC: NATGRID-SECURE (99.98%)</span>
        </div>

        {/* Right: Live IST/UTC Radar Clock & Badge */}
        <div className="flex items-center gap-3 ml-auto">
          <div className="flex items-center gap-1.5 text-sky-400 bg-sky-950/40 border border-sky-500/30 px-2 py-0.5 rounded">
            <Radio className="w-3 h-3 text-sky-400 animate-pulse" />
            <span className="font-semibold">{timeState.ist || '00:00:00 IST'}</span>
            <span className="text-slate-500 hidden sm:inline">({timeState.utc})</span>
          </div>

          <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700 text-slate-300 text-[10px] font-semibold">
            <span>BADGE:</span>
            <span className="text-emerald-400 font-bold">IO-CBI-7729</span>
          </div>
        </div>
      </div>
    </div>
  );
};
