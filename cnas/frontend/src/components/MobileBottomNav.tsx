import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Activity,
  Network,
  MapPin,
  Bot,
  Briefcase
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: Activity },
    { to: '/graph', label: 'Network', icon: Network },
    { to: '/timeline-gis', label: 'GIS Track', icon: MapPin },
    { to: '/assistant', label: 'AI Intel', icon: Bot },
    { to: '/cases', label: 'Cases', icon: Briefcase },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-2xl border-t border-slate-800/80 px-2 py-1.5 flex items-center justify-around shadow-2xl">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                isActive
                  ? 'text-sky-400 bg-sky-500/15 border border-sky-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`
            }
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-semibold tracking-tight">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
