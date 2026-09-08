import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Activity,
  Network,
  MapPin,
  Bot,
  Briefcase,
  Search,
  Database
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const links = [
    { to: '/', label: 'Dashboard', icon: Activity, badge: 'LIVE' },
    { to: '/graph', label: 'Graph Explorer', icon: Network, badge: '62 Nodes' },
    { to: '/timeline-gis', label: 'Timeline & GIS', icon: MapPin, badge: '40 Locs' },
    { to: '/assistant', label: 'AI Assistant', icon: Bot, badge: 'NLP v1' },
    { to: '/cases', label: 'Case Files', icon: Briefcase, badge: '15 Files' },
  ];

  return (
    <aside className="w-64 flex-shrink-0 hidden lg:flex flex-col gap-5 p-4 border-r border-white/20 bg-[#341038]/70 backdrop-blur-xl h-[calc(100vh-4rem)] sticky top-16">
      {/* Search status hint */}
      <div className="p-3 rounded-xl bg-white/10 border border-white/15 shadow-sm flex items-center gap-2 text-xs text-purple-200">
        <Search className="w-3.5 h-3.5 text-purple-300" />
        <span className="font-mono text-[11px]">Link Database Active</span>
      </div>

      {/* Nav List */}
      <nav className="flex-1 space-y-1.5">
        <div className="text-[10px] font-bold uppercase tracking-wider text-purple-300 px-3 mb-2 font-mono">
          Intelligence Modules
        </div>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-white/25 text-white border border-white/30 shadow-glass'
                    : 'text-purple-200 hover:text-white hover:bg-white/10'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span>{link.label}</span>
              </div>
              {link.badge && (
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-medium ${
                  link.badge === 'LIVE'
                    ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/40'
                    : 'bg-white/10 text-purple-200 border border-white/15'
                }`}>
                  {link.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Graph Engine Status Card */}
      <div className="p-4 rounded-2xl bg-[#280c2c]/80 border border-white/20 shadow-sm">
        <div className="flex items-center gap-2 mb-1.5 text-white">
          <Database className="w-3.5 h-3.5 text-fuchsia-300" />
          <span className="text-xs font-bold font-display">NetworkX Graph Engine</span>
        </div>
        <p className="text-[11px] text-purple-200 leading-relaxed mb-3">
          Betweenness & Louvain modularity clustering active in-memory.
        </p>
        <div className="flex items-center justify-between text-[10px] font-mono font-semibold text-emerald-300 pt-2 border-t border-white/10">
          <span>● 100% Synced</span>
          <span className="text-purple-300">SQLite 3.4</span>
        </div>
      </div>
    </aside>
  );
};
