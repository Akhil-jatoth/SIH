import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Activity,
  Network,
  MapPin,
  Bot,
  Briefcase,
  LogOut,
  FileCheck,
  Radio,
  Download,
  Menu,
  X,
  Shield,
  Layers,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { AuditLogModal } from './AuditLogModal';
import { SuspectRadarModal } from './SuspectRadarModal';
import { MissionTransferModal } from './MissionTransferModal';
import { IntruderAlertModal } from './IntruderAlertModal';
import { IntruderBreachAlert } from '../types';
import { api } from '../services/api';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isRadarOpen, setIsRadarOpen] = useState(false);
  const [isMissionModalOpen, setIsMissionModalOpen] = useState(false);
  const [activeIntruderAlert, setActiveIntruderAlert] = useState<IntruderBreachAlert | null>(null);
  const [isIntruderAlertOpen, setIsIntruderAlertOpen] = useState(false);
  const [lastSeenAlertId, setLastSeenAlertId] = useState<number>(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'connected' | 'checking' | 'disconnected'>('checking');

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

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

  // Poll for active intruder breach alerts across terminals
  useEffect(() => {
    const checkAlerts = async () => {
      try {
        const alerts = await api.getLatestBreachAlerts();
        if (alerts && alerts.length > 0) {
          const newest = alerts[0];
          if (newest.id > lastSeenAlertId && newest.status === 'ACTIVE_ALERT') {
            setLastSeenAlertId(newest.id);
            setActiveIntruderAlert(newest);
            setIsIntruderAlertOpen(true);
          }
        }
      } catch {
        // silent polling catch
      }
    };
    checkAlerts();
    const alertInterval = setInterval(checkAlerts, 4000);
    return () => clearInterval(alertInterval);
  }, [lastSeenAlertId]);

  const navItems = [
    { to: '/', label: 'Dashboard', icon: Activity, badge: 'LIVE' },
    { to: '/graph', label: 'Graph Explorer', icon: Network, badge: 'Neo4j' },
    { to: '/timeline-gis', label: 'Timeline & GIS', icon: MapPin, badge: '40 Locs' },
    { to: '/assistant', label: 'AI Assistant', icon: Bot, badge: 'NLP v1' },
    { to: '/cases', label: 'Cases', icon: Briefcase, badge: '15 Files' },
  ];

  return (
    <>
      <header className="w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl">
        <div className="w-full max-w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          
          {/* Brand Logo & System Title */}
          <div className="flex items-center gap-3 shrink-0">
            <NavLink to="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 shadow-glassGlow border border-white/20 text-white transition-transform group-hover:scale-105 shrink-0">
                <Network className="w-5 h-5" />
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900 shadow-xs" />
              </div>

              <div className="shrink-0 whitespace-nowrap">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-wider text-white font-display">
                    CNAS
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 font-semibold hidden xs:inline">
                    v2.4
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 hidden sm:block font-medium leading-none whitespace-nowrap">
                  Criminal Network Analysis & Link Intelligence
                </p>
              </div>
            </NavLink>
          </div>

          {/* Right Action Tools & User Profile (Desktop & Tablet) */}
          <div className="hidden sm:flex items-center gap-2.5 shrink-0">
            {/* Mission Transfer Protocol Button */}
            <button
              onClick={() => setIsMissionModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/20 text-amber-200 hover:bg-amber-500/30 border border-amber-400/40 shadow-sm transition-all cursor-pointer shrink-0 whitespace-nowrap"
              title="CBI Secure Mission Transfer & Handover Protocol"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Mission Transfer</span>
            </button>

            {/* Suspect & Telecom Radar Button */}
            <button
              onClick={() => setIsRadarOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-sky-500/20 text-sky-200 hover:bg-sky-500/30 border border-sky-400/40 shadow-sm transition-all cursor-pointer shrink-0 whitespace-nowrap"
              title="Search suspect name or phone number for live GPS/telecom ping and associates"
            >
              <Radio className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden md:inline">Suspect Radar</span>
            </button>

            {/* Evidence Ledger Button */}
            <button
              onClick={() => setIsAuditModalOpen(true)}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30 border border-emerald-400/40 shadow-sm transition-all cursor-pointer shrink-0 whitespace-nowrap"
              title="View cryptographic evidence chain-of-custody"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Evidence Ledger</span>
            </button>

            {/* Backend Status Indicator */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-mono bg-slate-900 border border-slate-800 shadow-xs shrink-0 whitespace-nowrap">
              <span
                className={`w-2 h-2 rounded-full ${
                  backendStatus === 'connected'
                    ? 'bg-emerald-400'
                    : backendStatus === 'checking'
                    ? 'bg-amber-400'
                    : 'bg-rose-400'
                }`}
              />
              <span className="text-slate-300 font-medium hidden xl:inline">
                {backendStatus === 'connected'
                  ? 'GRAPH READY'
                  : backendStatus === 'checking'
                  ? 'SYNCING...'
                  : 'OFFLINE'}
              </span>
            </div>

            {/* User Badge - Fixed Alignment & No Line Breaking */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-800 shrink-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-700 border border-amber-300/40 flex items-center justify-center text-slate-950 text-xs font-black shadow-sm shrink-0">
                {user?.name ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('') : 'CBI'}
              </div>
              <div className="text-left shrink-0 whitespace-nowrap">
                <div className="font-bold text-white leading-tight flex items-center gap-1.5 text-xs whitespace-nowrap">
                  <span className="whitespace-nowrap">{user?.name || user?.username || 'CBI Officer'}</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono font-bold shrink-0">
                    CBI
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 leading-tight font-mono whitespace-nowrap mt-0.5">
                  {user?.badgeNumber || user?.role || 'IO-CBI-7729'}
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="p-1.5 text-slate-400 hover:text-rose-300 hover:bg-rose-500/20 rounded-lg transition-colors cursor-pointer shrink-0 ml-0.5"
                title="Sign out of CBI Console"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile Hamburger Toggle Button (< lg) */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setIsMissionModalOpen(true)}
              className="p-2 rounded-xl bg-amber-500/20 text-amber-200 border border-amber-400/40 text-xs sm:hidden"
              title="Mission Transfer"
            >
              <Shield className="w-4 h-4 text-amber-400" />
            </button>

            <button
              onClick={() => setIsRadarOpen(true)}
              className="p-2 rounded-xl bg-sky-500/20 text-sky-200 border border-sky-400/40 text-xs sm:hidden"
              title="Suspect Radar"
            >
              <Radio className="w-4 h-4 text-sky-400" />
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22 }}
              className="lg:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur-2xl px-4 py-4 space-y-4 shadow-2xl"
            >
              {/* Mobile Nav Links */}
              <div className="space-y-1">
                <div className="text-[10px] font-mono uppercase text-slate-400 px-3 mb-1 font-bold">
                  Intelligence Modules
                </div>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === '/'}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-sky-500/25 text-sky-200 border border-sky-500/40'
                            : 'text-slate-300 hover:text-white hover:bg-slate-900'
                        }`
                      }
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        {item.badge}
                      </span>
                    </NavLink>
                  );
                })}
              </div>

              {/* Quick Action Tools */}
              <div className="pt-2 border-t border-slate-800/80 space-y-2">
                <div className="text-[10px] font-mono uppercase text-slate-400 px-3 mb-1 font-bold">
                  Field Tools & Dossiers
                </div>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsMissionModalOpen(true);
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-200 text-xs font-semibold"
                >
                  <div className="flex items-center gap-2.5">
                    <Shield className="w-4 h-4 text-amber-400" />
                    <span>Mission Transfer Protocol</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                </button>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsRadarOpen(true);
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-sky-500/15 border border-sky-400/30 text-sky-200 text-xs font-semibold"
                >
                  <div className="flex items-center gap-2.5">
                    <Radio className="w-4 h-4 text-sky-400" />
                    <span>Suspect Radar Locator</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-sky-400" />
                </button>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsAuditModalOpen(true);
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-200 text-xs font-semibold"
                >
                  <div className="flex items-center gap-2.5">
                    <FileCheck className="w-4 h-4 text-emerald-400" />
                    <span>Cryptographic Evidence Ledger</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />
                </button>


              </div>

              {/* User Information & Sign out */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between px-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-700 p-0.5 flex items-center justify-center text-slate-950 font-bold text-xs">
                    {user?.name ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('') : 'CBI'}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{user?.name || 'CBI Investigating Officer'}</span>
                      <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">CBI</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      {user?.badgeNumber || 'CBI-HQ-8841-DL'} • {user?.clearanceLevel || 'LEVEL-V'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="p-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Modals */}
      <MissionTransferModal
        isOpen={isMissionModalOpen}
        onClose={() => setIsMissionModalOpen(false)}
        onTriggerIntruderAlert={(alert) => {
          setActiveIntruderAlert(alert);
          setIsIntruderAlertOpen(true);
        }}
      />

      <IntruderAlertModal
        isOpen={isIntruderAlertOpen}
        alert={activeIntruderAlert}
        onClose={() => setIsIntruderAlertOpen(false)}
      />

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

