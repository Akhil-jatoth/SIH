import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Activity,
  Network,
  MapPin,
  Bot,
  Briefcase,
  LogOut,
  FileCheck,
  Radio,
  Search,
  Download,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AuditLogModal } from './AuditLogModal';
import { SuspectRadarModal } from './SuspectRadarModal';
import { api } from '../services/api';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isRadarOpen, setIsRadarOpen] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'connected' | 'checking' | 'disconnected'>('checking');

  useEffect(() => {
    const checkHealth = async () => {
      try {
        await api.getHealth();
        setBackendStatus('connected');
      } catch {
        setBackendStatus('disconnected');
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { to: '/', label: 'Dashboard', icon: Activity },
    { to: '/graph', label: 'Graph Explorer', icon: Network },
    { to: '/timeline-gis', label: 'Timeline & GIS', icon: MapPin },
    { to: '/assistant', label: 'AI Assistant', icon: Bot },
    { to: '/cases', label: 'Cases', icon: Briefcase },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-white/20 bg-[#341038]/85 backdrop-blur-xl shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-600 to-purple-800 shadow-glassGlow border border-white/30 text-white">
              <Network className="w-5 h-5" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#341038]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-wider text-white font-display">
                  CNAS
                </span>
              </div>
              <p className="text-[11px] text-purple-200 hidden sm:block font-medium">
                Criminal Network Analysis & Link Intelligence Platform
              </p>
            </div>
          </div>

          {/* Nav Items (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 bg-white/10 p-1 rounded-xl border border-white/15">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-white/25 text-white border border-white/30 shadow-glass'
                        : 'text-purple-100 hover:text-white hover:bg-white/10'
                    }`
                  }
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Right Action Tools & User Profile */}
          <div className="flex items-center gap-3">
            {/* Suspect & Telecom Radar Button */}
            <button
              onClick={() => setIsRadarOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-sky-500/20 text-sky-200 hover:bg-sky-500/30 border border-sky-400/40 shadow-sm transition-all cursor-pointer"
              title="Search suspect name or phone number for live GPS/telecom ping and associates"
            >
              <Radio className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
              <span>Suspect Radar</span>
            </button>

            {/* Evidence Ledger Button */}
            <button
              onClick={() => setIsAuditModalOpen(true)}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30 border border-emerald-400/40 shadow-sm transition-all cursor-pointer"
              title="View cryptographic evidence chain-of-custody"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Evidence Ledger</span>
            </button>

            {/* Download Dataset Button */}
            <a
              href="/cnas_complete_dataset.zip"
              download="cnas_complete_dataset.zip"
              className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-500/20 text-purple-200 hover:bg-purple-500/35 border border-purple-400/40 shadow-sm transition-all cursor-pointer"
              title="Download full SIH dataset (all CSV files bundled in ZIP)"
            >
              <Download className="w-3.5 h-3.5 text-purple-300" />
              <span>Download Dataset</span>
            </a>

            {/* Backend Status Pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono bg-[#280c2c] border border-white/20">
              <span
                className={`w-2 h-2 rounded-full ${
                  backendStatus === 'connected'
                    ? 'bg-emerald-400 animate-pulse'
                    : backendStatus === 'checking'
                    ? 'bg-amber-400 animate-ping'
                    : 'bg-rose-400'
                }`}
              />
              <span className="text-purple-200 font-medium hidden sm:inline">
                {backendStatus === 'connected'
                  ? 'GRAPH READY'
                  : backendStatus === 'checking'
                  ? 'SYNCING...'
                  : 'OFFLINE'}
              </span>
            </div>

            {/* User Badge */}
            <div className="flex items-center gap-2 pl-2 border-l border-white/20">
              <div className="w-8 h-8 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {user?.username?.charAt(0).toUpperCase() || 'I'}
              </div>
              <div className="hidden xl:block text-left text-xs">
                <div className="font-bold text-white leading-tight">
                  {user?.username || 'Officer'}
                </div>
                <div className="text-[10px] text-purple-200 leading-tight font-medium">
                  {user?.role || 'Investigator'}
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="p-1.5 text-purple-200 hover:text-rose-300 hover:bg-rose-500/20 rounded-lg transition-colors cursor-pointer"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <AuditLogModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
      />

      <SuspectRadarModal
        isOpen={isRadarOpen}
        onClose={() => setIsRadarOpen(false)}
      />
    </>
  );
};
