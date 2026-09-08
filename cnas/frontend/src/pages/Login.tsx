import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  CreditCard,
  KeyRound,
  Fingerprint,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ArrowRight,
  Sparkles,
  QrCode,
  Radio,
  Cpu,
  BadgeCheck,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, CBI_OFFICER_PRESETS, CbiOfficerPreset } from '../context/AuthContext';
import { GlassPanel } from '../components/GlassPanel';
import { CyberBackground } from '../components/CyberBackground';

export const Login: React.FC = () => {
  const [authMode, setAuthMode] = useState<'card_scan' | 'manual_pin'>('card_scan');
  const [selectedPreset, setSelectedPreset] = useState<CbiOfficerPreset>(CBI_OFFICER_PRESETS[0]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState<string>('');
  const [badgeInput, setBadgeInput] = useState('CBI-HQ-8841-DL');
  const [pinInput, setPinInput] = useState('7729');
  const [error, setError] = useState('');
  
  const { loginWithCbiCard, login } = useAuth();
  const navigate = useNavigate();

  // Execute interactive CBI Smart ID Card Scanning Sequence
  const handleScanCard = (presetToScan: CbiOfficerPreset = selectedPreset) => {
    setError('');
    setIsScanning(true);
    setScanStep('Engaging NFC Smart Card Reader...');

    setTimeout(() => {
      setScanStep('Reading 256-bit Cryptographic EMV Chip...');
    }, 450);

    setTimeout(() => {
      setScanStep('Verifying CBI NATGRID Security Clearance (LEVEL-V)...');
    }, 900);

    setTimeout(() => {
      setScanStep('Identity Verified! Access Granted.');
      loginWithCbiCard(presetToScan);
      setTimeout(() => {
        navigate('/');
      }, 500);
    }, 1400);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!badgeInput.trim() || !pinInput.trim()) {
      setError('Please provide your CBI Officer Badge ID and Security PIN.');
      return;
    }

    const success = login(badgeInput, pinInput);
    if (success) {
      navigate('/');
    } else {
      setError('Unauthorized access attempt. Invalid CBI credentials.');
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-[#12071f] overflow-x-hidden text-slate-100">
      <CyberBackground />

      {/* Official Government Top Classification Header */}
      <div className="relative z-10 w-full max-w-4xl mb-4 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold tracking-wider mb-2 shadow-lg backdrop-blur-md">
          <Shield className="w-4 h-4 text-amber-400" />
          <span>CENTRAL BUREAU OF INVESTIGATION • GOVT OF INDIA</span>
          <span className="text-slate-400">|</span>
          <span className="text-rose-400 font-bold">TOP SECRET // LES</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide font-display drop-shadow-md">
          CBI Criminal Network Analysis System
        </h1>
        <p className="text-xs text-purple-200 mt-1 max-w-lg font-medium">
          Official High-Security Portal • Restricted strictly to verified Central Bureau of Investigation officers and authorized cyber intelligence cells.
        </p>
      </div>

      {/* Main Card & Auth Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
      >
        {/* LEFT COLUMN: THE OFFICIAL CBI SMART ID CARD (5 cols) */}
        <div className="lg:col-span-6 flex flex-col justify-between">
          <GlassPanel glow="purple" className="p-5 sm:p-6 border border-amber-500/30 bg-[#240c2e]/90 shadow-2xl relative overflow-hidden flex flex-col justify-between h-full">
            {/* Holographic Tricolor Header Accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />

            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/15">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-700 p-0.5 flex items-center justify-center shadow-md">
                    <Shield className="w-5 h-5 text-slate-950 font-bold" />
                  </div>
                  <div>
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-amber-300 font-display">
                      Central Bureau of Investigation
                    </div>
                    <div className="text-[9px] text-slate-300 font-mono tracking-tight">
                      DEPARTMENT OF PERSONNEL & TRAINING • GOVT. OF INDIA
                    </div>
                  </div>
                </div>

                <div className="px-2 py-0.5 rounded bg-rose-500/20 border border-rose-400/40 text-[9px] font-mono text-rose-300 font-bold uppercase">
                  OFFICIAL ID
                </div>
              </div>

              {/* ID Card Visual Body */}
              <div className="relative mt-4 p-4 rounded-xl bg-gradient-to-br from-[#1b0a24] via-[#2a0e38] to-[#16061f] border border-amber-400/30 shadow-inner overflow-hidden">
                {/* Laser Scanning Animation Line */}
                <AnimatePresence>
                  {isScanning && (
                    <motion.div
                      initial={{ top: '0%' }}
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                      className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#00f2fe] z-30 pointer-events-none"
                    />
                  )}
                </AnimatePresence>

                {/* Card Watermark Seal */}
                <div className="absolute right-2 bottom-2 opacity-5 pointer-events-none">
                  <Shield className="w-36 h-36 text-amber-400" />
                </div>

                <div className="flex gap-3.5 items-start">
                  {/* Officer Avatar with Rank Ring */}
                  <div className="flex flex-col items-center">
                    <div className={`w-20 h-24 rounded-lg bg-gradient-to-b ${selectedPreset.photoColor} border-2 border-amber-400/60 p-1 flex flex-col items-center justify-center shadow-lg relative`}>
                      <span className="text-xl font-black text-white font-mono tracking-wider">
                        {selectedPreset.initials}
                      </span>
                      <span className="text-[8px] font-bold text-amber-200 mt-1 uppercase text-center px-1">
                        CBI OFFICER
                      </span>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border border-black flex items-center justify-center">
                        <BadgeCheck className="w-3 h-3 text-white" />
                      </div>
                    </div>
                    
                    <div className="mt-2 text-[9px] font-mono text-amber-300 font-bold">
                      {selectedPreset.serviceNo}
                    </div>
                  </div>

                  {/* Officer Credentials Details */}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-amber-400 font-mono font-bold tracking-wider">
                      {selectedPreset.rank}
                    </div>
                    <div className="text-base font-extrabold text-white font-display truncate">
                      {selectedPreset.name}
                    </div>
                    
                    <div className="mt-2 space-y-1 text-[10px] font-mono">
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="text-slate-400">BADGE NO:</span>
                        <span className="text-amber-200 font-bold">{selectedPreset.badgeNumber}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="text-slate-400">CLEARANCE:</span>
                        <span className="text-emerald-300 font-bold">{selectedPreset.clearance}</span>
                      </div>
                      <div className="flex flex-col text-slate-300">
                        <span className="text-slate-400 text-[9px]">BRANCH:</span>
                        <span className="text-purple-200 truncate font-semibold">{selectedPreset.branch}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* EMV Microchip & Barcode Strip */}
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* Gold Smart Chip */}
                    <div className="w-8 h-6 rounded bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-600 border border-yellow-200 shadow-sm flex items-center justify-center p-0.5">
                      <Cpu className="w-4 h-4 text-slate-900" />
                    </div>
                    <div className="text-[9px] font-mono text-slate-400">
                      <div>EMV-256 ENCRYPTED</div>
                      <div className="text-emerald-400 font-bold">ACTIVE // VERIFIED</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-slate-400">
                    <QrCode className="w-6 h-6 text-amber-300" />
                  </div>
                </div>
              </div>
            </div>

            {/* Officer Preset Selection Carousel */}
            <div className="mt-4">
              <label className="block text-[11px] font-semibold text-purple-200 mb-2 flex items-center justify-between">
                <span>Select Verified CBI Officer ID Card:</span>
                <span className="text-[10px] text-amber-300 font-mono">3 Officers Active</span>
              </label>

              <div className="grid grid-cols-3 gap-2">
                {CBI_OFFICER_PRESETS.map((preset) => {
                  const isSelected = selectedPreset.id === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setSelectedPreset(preset);
                        setBadgeInput(preset.badgeNumber);
                      }}
                      className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/25 border-amber-400 text-white shadow-lg ring-1 ring-amber-400'
                          : 'bg-white/5 border-white/15 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      <div className="text-[10px] font-bold truncate text-amber-200">
                        {preset.name.split(',')[0]}
                      </div>
                      <div className="text-[8px] font-mono text-slate-400 truncate">
                        {preset.badgeNumber}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </GlassPanel>
        </div>

        {/* RIGHT COLUMN: INTERACTIVE AUTHENTICATION GATEWAY (6 cols) */}
        <div className="lg:col-span-6 flex flex-col justify-between">
          <GlassPanel glow="purple" className="p-6 border border-white/25 bg-[#2d0932]/95 shadow-2xl flex flex-col justify-between h-full">
            <div>
              {/* Auth Mode Toggle Tabs */}
              <div className="flex rounded-xl p-1 bg-black/40 border border-white/15 mb-5">
                <button
                  type="button"
                  onClick={() => setAuthMode('card_scan')}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    authMode === 'card_scan'
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 shadow-md font-bold'
                      : 'text-purple-200 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>CBI Smart Card Tap / Scan</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAuthMode('manual_pin')}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    authMode === 'manual_pin'
                      ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-md font-bold'
                      : 'text-purple-200 hover:text-white'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Manual Service PIN</span>
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-300/40 text-rose-200 text-xs text-center font-medium flex items-center justify-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-300 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* MODE 1: SMART CARD NFC TAP & SCAN */}
              {authMode === 'card_scan' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs leading-relaxed">
                    <div className="font-bold text-amber-300 flex items-center gap-1.5 mb-1">
                      <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
                      <span>Contactless RFID / NFC Smart Card Sensor Ready</span>
                    </div>
                    Hold or tap the officer's smart card over the terminal scanner. Authentication validates cryptographic credentials with the National Intelligence Grid (NATGRID).
                  </div>

                  {/* Visual Scanner Status Display */}
                  <div className="p-4 rounded-xl bg-black/50 border border-white/15 flex flex-col items-center justify-center text-center min-h-[140px]">
                    {isScanning ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full border-4 border-amber-400 border-t-transparent animate-spin flex items-center justify-center">
                          <Fingerprint className="w-6 h-6 text-amber-300 animate-pulse" />
                        </div>
                        <div className="text-xs font-mono font-bold text-amber-300 mt-2">
                          {scanStep}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Target: {selectedPreset.name} ({selectedPreset.badgeNumber})
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-md">
                          <CreditCard className="w-6 h-6" />
                        </div>
                        <div className="text-xs font-bold text-white mt-1">
                          {selectedPreset.name}
                        </div>
                        <div className="text-[11px] font-mono text-amber-300 font-semibold">
                          Badge: {selectedPreset.badgeNumber}
                        </div>
                        <div className="text-[10px] text-purple-200">
                          {selectedPreset.branch}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Big Tap to Scan Button */}
                  <button
                    type="button"
                    disabled={isScanning}
                    onClick={() => handleScanCard(selectedPreset)}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-500 active:scale-[0.99] text-slate-950 text-sm font-extrabold shadow-xl border border-amber-300/60 flex items-center justify-center gap-2.5 transition-all cursor-pointer group disabled:opacity-60"
                  >
                    <Fingerprint className="w-5 h-5 text-slate-950 group-hover:scale-110 transition-transform" />
                    <span>{isScanning ? 'Verifying CBI Officer Card...' : 'TAP & AUTHENTICATE CBI ID CARD'}</span>
                    <ArrowRight className="w-4 h-4 text-slate-950 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              )}

              {/* MODE 2: MANUAL BADGE & PIN FORM */}
              {authMode === 'manual_pin' && (
                <form onSubmit={handleManualSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-purple-100 mb-1.5 flex items-center justify-between">
                      <span>CBI Officer Badge ID / Service No</span>
                      <span className="text-[10px] text-amber-300 font-mono">Demo: {selectedPreset.badgeNumber}</span>
                    </label>
                    <div className="relative">
                      <UserCheck className="absolute left-3.5 top-3 w-4 h-4 text-purple-300" />
                      <input
                        type="text"
                        value={badgeInput}
                        onChange={(e) => setBadgeInput(e.target.value)}
                        placeholder="e.g. CBI-HQ-8841-DL"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/50 border border-white/20 text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-purple-100 mb-1.5 flex items-center justify-between">
                      <span>Security Clearance Key / Officer PIN</span>
                      <span className="text-[10px] text-amber-300 font-mono">PIN: 7729 (or demo)</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 w-4 h-4 text-purple-300" />
                      <input
                        type="password"
                        value={pinInput}
                        onChange={(e) => setPinInput(e.target.value)}
                        placeholder="Enter 4-digit Security PIN"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/50 border border-white/20 text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all font-mono"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 active:scale-[0.99] text-white text-sm font-bold shadow-lg border border-white/30 flex items-center justify-center gap-2 transition-all cursor-pointer group"
                  >
                    <span>Verify Credentials & Enter Console</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </form>
              )}
            </div>

            {/* Statutory Compliance Footer */}
            <div className="mt-6 pt-4 border-t border-white/15">
              <div className="flex items-center justify-between text-[11px] text-slate-300 mb-1">
                <span className="font-semibold text-amber-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Official Secrets Act (OSA) Protected
                </span>
                <span className="font-mono text-[10px] text-slate-400">SHA-256 AUDIT LOGGED</span>
              </div>
              <p className="text-[9.5px] text-slate-400 leading-tight">
                Unauthorized access or tampering is strictly prohibited and punishable under Sec 43/66 of the IT Act, 2000 & Indian Penal Code.
              </p>
            </div>
          </GlassPanel>
        </div>
      </motion.div>
    </div>
  );
};
