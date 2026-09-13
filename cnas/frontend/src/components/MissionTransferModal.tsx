import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  Lock,
  Unlock,
  Key,
  Eye,
  EyeOff,
  UserCheck,
  AlertTriangle,
  FileText,
  Clock,
  CheckCircle2,
  Trash2,
  Download,
  X,
  Camera,
  ArrowRight,
  Sparkles,
  Flame,
  Search,
  Radio,
  Share2,
  FileCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassPanel } from './GlassPanel';
import { useAuth, CBI_OFFICER_PRESETS } from '../context/AuthContext';
import { api } from '../services/api';
import { MissionTransfer, CaseItem, IntruderBreachAlert } from '../types';

interface MissionTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedCaseId?: number;
  onTriggerIntruderAlert?: (alert: IntruderBreachAlert) => void;
}

export const MissionTransferModal: React.FC<MissionTransferModalProps> = ({
  isOpen,
  onClose,
  preselectedCaseId,
  onTriggerIntruderAlert
}) => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'transfer' | 'claim' | 'vault'>('transfer');
  const [transfers, setTransfers] = useState<MissionTransfer[]>([]);
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'warning' | 'purged'; message: string; importantNote?: string } | null>(null);

  // Transfer Form State
  const [operationName, setOperationName] = useState('');
  const [codeWord, setCodeWord] = useState('');
  const [showCodeWord, setShowCodeWord] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<number | undefined>(preselectedCaseId);
  const [targetOfficerPreset, setTargetOfficerPreset] = useState<string>(CBI_OFFICER_PRESETS[1]?.id || '');
  const [customTargetName, setCustomTargetName] = useState('');
  const [customTargetBadge, setCustomTargetBadge] = useState('');
  const [handoverNotes, setHandoverNotes] = useState('');

  // Claim Form State
  const [claimOperationName, setClaimOperationName] = useState('');
  const [claimCodeWord, setClaimCodeWord] = useState('');
  const [showClaimCodeWord, setShowClaimCodeWord] = useState(false);
  const [unlockedMission, setUnlockedMission] = useState<MissionTransfer | null>(null);
  const [selfDestructTriggered, setSelfDestructTriggered] = useState(false);

  // Camera & Canvas Capture Elements
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  // Load active transfers and cases on modal open
  const loadData = async () => {
    try {
      setLoading(true);
      const [transfersList, casesList] = await Promise.all([
        api.getMissionTransfers(),
        api.getCases(),
      ]);
      setTransfers(transfersList);
      setCases(casesList);

      if (preselectedCaseId) {
        setSelectedCaseId(preselectedCaseId);
        const matched = casesList.find((c) => c.id === preselectedCaseId);
        if (matched && !operationName) {
          setOperationName(`OP-${matched.title.replace(/[^a-zA-Z0-9]/g, '-').toUpperCase()}`);
        }
      }
    } catch (err) {
      console.error('Failed to load mission transfers data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
      setFeedback(null);
      setUnlockedMission(null);
      setSelfDestructTriggered(false);
      startCamera();
    } else {
      stopCamera();
    }
  }, [isOpen]);

  // Handle webcam setup for security verification
  const startCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
        });
        setCameraStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }
    } catch (err) {
      // Camera access may be denied or unsupported in iframe/environment; fallback snapshot will be generated
      console.log('Webcam permission not active; simulated biometric snapshot will be used if needed.');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
  };

  // Helper to capture face photo from camera or fallback generated canvas
  const captureIntruderSnapshot = (): string => {
    try {
      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 240;
      const ctx = canvas.getContext('2d');
      if (!ctx) return '';

      if (videoRef.current && cameraStream && videoRef.current.readyState >= 2) {
        ctx.drawImage(videoRef.current, 0, 0, 320, 240);
      } else {
        // Generate simulated tactical biometric infrared capture frame
        ctx.fillStyle = '#060a12';
        ctx.fillRect(0, 0, 320, 240);

        // Gradient overlay
        const grad = ctx.createRadialGradient(160, 120, 10, 160, 120, 120);
        grad.addColorStop(0, 'rgba(239, 68, 68, 0.45)');
        grad.addColorStop(0.7, 'rgba(220, 38, 38, 0.2)');
        grad.addColorStop(1, 'rgba(15, 23, 42, 0.9)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 320, 240);

        // Biometric Face Wireframe
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(160, 100, 50, 0, Math.PI * 2);
        ctx.stroke();

        // Crosshairs & Facial Mesh Points
        ctx.fillStyle = '#f87171';
        ctx.fillRect(140, 90, 6, 6); // Left eye
        ctx.fillRect(174, 90, 6, 6); // Right eye
        ctx.fillRect(157, 110, 6, 6); // Nose
        ctx.fillRect(145, 128, 30, 4); // Mouth

        // HUD Text overlay
        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = '#fca5a5';
        ctx.fillText('INTRUDER_IR_CAPTURE // RECON-4092', 15, 25);
        ctx.fillText(`TIME: ${new Date().toLocaleTimeString()} IST`, 15, 225);
      }

      return canvas.toDataURL('image/jpeg', 0.85);
    } catch (e) {
      console.warn('Snapshot capture fallback:', e);
      return '';
    }
  };

  // Submit Mission Transfer (Officer Handover)
  const handleCreateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!operationName.trim()) {
      setFeedback({ type: 'error', message: 'Please enter a public Operation Name.' });
      return;
    }
    if (!codeWord.trim()) {
      setFeedback({ type: 'error', message: 'Please set a secret Code Word for decryption.' });
      return;
    }

    const selectedTargetPreset = CBI_OFFICER_PRESETS.find((p) => p.id === targetOfficerPreset);
    const targetName = customTargetName.trim() || selectedTargetPreset?.name || 'Incoming CBI Officer';
    const targetBadge = customTargetBadge.trim() || selectedTargetPreset?.badgeNumber || 'CBI-SEC-991';

    try {
      setSubmitting(true);
      setFeedback(null);

      const res = await api.createMissionTransfer({
        operation_name: operationName.trim(),
        code_word: codeWord.trim(),
        case_id: selectedCaseId ? Number(selectedCaseId) : undefined,
        outgoing_officer_name: user?.name || 'SP Kabir Rao, IPS',
        outgoing_officer_badge: user?.badgeNumber || 'CBI-HQ-8841-DL',
        outgoing_officer_rank: user?.role || 'Superintendent of Police',
        outgoing_officer_department: user?.department || 'Special Crime & Cyber Forensics Wing',
        outgoing_officer_clearance: user?.clearanceLevel || 'LEVEL-V TOP SECRET // LES',
        outgoing_officer_zone: user?.zone || 'CBI HQ, New Delhi',
        outgoing_officer_service_no: 'IPS-2012-7729',
        handover_notes: handoverNotes.trim() || 'Official Special Operations Mission Handover Dossier.',
        target_officer_name: targetName,
        target_officer_badge: targetBadge,
      });

      setFeedback({
        type: 'success',
        message: `Operation '${res.transfer.operation_name}' successfully sealed and placed in Transfer Vault for Officer ${res.transfer.target_officer_name}.`,
      });

      // Clear fields and refresh
      setOperationName('');
      setCodeWord('');
      setHandoverNotes('');
      await loadData();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Failed to create mission transfer dossier.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Claim / Decrypt Transferred Mission
  const handleUnlockMission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimOperationName.trim()) {
      setFeedback({ type: 'error', message: 'Please enter or select the Operation Name.' });
      return;
    }
    if (!claimCodeWord.trim()) {
      setFeedback({ type: 'error', message: 'Please enter the secret Code Word.' });
      return;
    }

    try {
      setSubmitting(true);
      setFeedback(null);

      // Silently capture face snapshot from camera to record biometric intercept
      const faceSnapshot = captureIntruderSnapshot();

      const res = await api.unlockMissionTransfer({
        operation_name: claimOperationName.trim(),
        code_word: claimCodeWord.trim(),
        face_snapshot_base64: faceSnapshot,
        attempted_by_name: user?.name || 'Terminal User',
        ip_address: '10.0.12.84 (CBI Secure Terminal)',
        user_agent: navigator.userAgent
      });

      if (res.success && res.mission) {
        // ACCESS GRANTED
        setUnlockedMission(res.mission);
        setFeedback({
          type: 'success',
          message: res.message,
        });
        await loadData();
      } else {
        // INCORRECT CODE - ALERT (DO NOT DESTROY FILE)
        setUnlockedMission(null);
        setFeedback({
          type: 'warning',
          message: res.message,
          importantNote: res.important_note,
        });

        // Trigger Intruder Siren Alert on Officer Terminal
        if (onTriggerIntruderAlert) {
          onTriggerIntruderAlert({
            id: res.alert_id || Date.now(),
            operation_name: res.operation_name || claimOperationName,
            attempt_number: res.attempt || 1,
            face_snapshot_base64: faceSnapshot,
            timestamp: new Date().toLocaleString(),
            ip_address: '10.0.12.84 (CBI Intranet)',
            user_agent: 'CBI Browser Terminal',
            severity: 'CRITICAL_BREACH',
            status: 'ACTIVE_ALERT',
          });
        }
        await loadData();
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Error communicating with security vault.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Download Decrypted Mission File
  const handleDownloadDecryptedFile = (mission: MissionTransfer) => {
    const fileContent = JSON.stringify(
      {
        header: 'CENTRAL BUREAU OF INVESTIGATION // TOP SECRET MISSION DOSSIER',
        operation_name: mission.operation_name,
        security_classification: 'LEVEL-V TOP SECRET // DIGITAL CIPHER SEALED',
        transferred_by: {
          name: mission.outgoing_officer_name,
          badge: mission.outgoing_officer_badge,
          rank: mission.outgoing_officer_rank,
          department: mission.outgoing_officer_department,
          clearance: mission.outgoing_officer_clearance,
          zone: mission.outgoing_officer_zone,
        },
        transferred_to: {
          name: mission.target_officer_name,
          badge: mission.target_officer_badge,
        },
        handover_directives: mission.handover_notes,
        created_at: mission.created_at,
        claimed_at: mission.claimed_at,
        payload: mission.payload,
        cryptographic_seal: `CBI-SEAL-${mission.id}-${Date.now()}-AUTH_OK`,
      },
      null,
      2
    );

    const blob = new Blob([fileContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${mission.operation_name.replace(/\s+/g, '_')}_HANDOVER_DOSSIER.cbi.mission`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 pt-[144px] pb-6 sm:pt-[148px] bg-black/85 backdrop-blur-md overflow-y-auto">
      {/* Hidden Video & Canvas for WebCam Verification */}
      <video ref={videoRef} autoPlay playsInline muted className="hidden" />
      <canvas ref={canvasRef} className="hidden" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-4xl max-h-[calc(100vh-165px)] rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl flex flex-col overflow-hidden text-slate-100 font-sans"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-700 flex items-center justify-center text-slate-950 shadow-md">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white font-display">
                  CBI Secure Mission Transfer & Handover Protocol
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                  PROT-v2.4
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Chain-of-Custody Handover • Hidden Code Word Authentication • Real-Time Intruder Camera Intercept
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-900/40 px-4 pt-2 gap-2">
          <button
            onClick={() => {
              setActiveTab('transfer');
              setFeedback(null);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition-all cursor-pointer ${activeTab === 'transfer'
                ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>1. Initiate Mission Handover</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('claim');
              setFeedback(null);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition-all cursor-pointer ${activeTab === 'claim'
                ? 'border-sky-400 text-sky-300 bg-sky-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>2. Unlock / Claim Transferred Dossier</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('vault');
              setFeedback(null);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition-all cursor-pointer ${activeTab === 'vault'
                ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Transfer Vault Registry ({transfers.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Status / Feedback Banner */}
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl border ${feedback.type === 'purged'
                  ? 'bg-rose-950/60 border-rose-500 text-rose-100 shadow-lg shadow-rose-950/40'
                  : feedback.type === 'warning'
                    ? 'bg-amber-950/50 border-amber-500/60 text-amber-200'
                    : feedback.type === 'error'
                      ? 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                      : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                }`}
            >
              <div className="flex items-start gap-3">
                {feedback.type === 'purged' ? (
                  <Flame className="w-5 h-5 text-rose-400 shrink-0 mt-0.5 animate-pulse" />
                ) : feedback.type === 'warning' ? (
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-bounce" />
                ) : feedback.type === 'error' ? (
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-semibold">{feedback.message}</p>
                  {feedback.importantNote && (
                    <div className="mt-2 pt-2 border-t border-white/10 text-[11px] font-mono text-amber-200 font-medium">
                      <span className="font-bold text-amber-400 uppercase">IMPORTANT NOTE: </span>
                      {feedback.importantNote}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 1: INITIATE MISSION TRANSFER */}
          {activeTab === 'transfer' && (
            <form onSubmit={handleCreateTransfer} className="space-y-6">
              {/* Outgoing CBI Officer Profile Card (Present Officer Stored) */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
                    <UserCheck className="w-4 h-4" />
                    <span>Present CBI Officer Manifest (Transmitting Custody)</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    AUTHENTICATED & SEALED
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Officer Name & Rank</span>
                    <span className="font-bold text-white text-xs mt-0.5 block">
                      {user?.name || 'SP Kabir Rao, IPS'}
                    </span>
                    <span className="text-[10px] text-slate-400">{user?.role || 'Superintendent of Police'}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Badge & Service ID</span>
                    <span className="font-bold text-amber-300 font-mono text-xs mt-0.5 block">
                      {user?.badgeNumber || 'CBI-HQ-8841-DL'}
                    </span>
                    <span className="text-[10px] text-slate-400">Govt. of India</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Clearance & Station</span>
                    <span className="font-bold text-sky-300 text-xs mt-0.5 block">
                      {user?.clearanceLevel || 'LEVEL-V TOP SECRET'}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate block">{user?.zone || 'CBI HQ, New Delhi'}</span>
                  </div>
                </div>
              </div>

              {/* Transfer Parameters Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Public Operation Name */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-200">
                      Operation Name <span className="text-rose-400">*</span>
                    </label>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded border border-emerald-500/30">
                      PUBLICLY VISIBLE TO ANYONE
                    </span>
                  </div>
                  <input
                    type="text"
                    value={operationName}
                    onChange={(e) => setOperationName(e.target.value.toUpperCase())}
                    placeholder="e.g. OPERATION CHAKRAVYUH, OP-GARUDA-X"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-amber-400 uppercase tracking-wider"
                    required
                  />
                  <p className="text-[10px] text-slate-400">
                    This operation codename is visible in the CBI transfer registry so officers can identify the mission.
                  </p>
                </div>

                {/* Hidden Secret Code Word */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-200">
                      Secret Code Word <span className="text-rose-400">*</span>
                    </label>
                    <span className="text-[10px] font-mono text-rose-400 bg-rose-500/15 px-1.5 py-0.5 rounded border border-rose-500/30">
                      🔒 HIDDEN // CIPHER HASHED
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type={showCodeWord ? 'text' : 'password'}
                      value={codeWord}
                      onChange={(e) => setCodeWord(e.target.value)}
                      placeholder="Enter strong secret passcode (e.g. GARUDA#9941)"
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCodeWord(!showCodeWord)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showCodeWord ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Zero-knowledge: Salted SHA-256 hash stored. Incorrect access attempts trigger emergency siren alarms and camera face captures!
                  </p>
                </div>

                {/* Target Recipient CBI Officer */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-200">
                    Recipient CBI Officer <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={targetOfficerPreset}
                    onChange={(e) => {
                      setTargetOfficerPreset(e.target.value);
                      if (e.target.value !== 'custom') {
                        setCustomTargetName('');
                        setCustomTargetBadge('');
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    {CBI_OFFICER_PRESETS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.rank} • {p.badgeNumber})
                      </option>
                    ))}
                    <option value="custom">+ Specify Other CBI Officer / Unit</option>
                  </select>

                  {targetOfficerPreset === 'custom' && (
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <input
                        type="text"
                        value={customTargetName}
                        onChange={(e) => setCustomTargetName(e.target.value)}
                        placeholder="Officer Full Name"
                        className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                        required
                      />
                      <input
                        type="text"
                        value={customTargetBadge}
                        onChange={(e) => setCustomTargetBadge(e.target.value)}
                        placeholder="Badge No / Unit"
                        className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                        required
                      />
                    </div>
                  )}
                </div>

                {/* Associated Case Dossier */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-200">
                    Attach Case Dossier Intelligence
                  </label>
                  <select
                    value={selectedCaseId || ''}
                    onChange={(e) => setSelectedCaseId(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="">Standalone Strategic Operation Handover (No attached case)</option>
                    {cases.map((c) => (
                      <option key={c.id} value={c.id}>
                        Case #{c.id}: {c.title} ({c.status})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-400">
                    Bundles linked suspects, phone intercept logs, and geo coordinates into the encrypted handover file.
                  </p>
                </div>
              </div>

              {/* Handover Directives & Strategic Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200">
                  Operational Directives & Handover Notes for Incoming Officer
                </label>
                <textarea
                  rows={3}
                  value={handoverNotes}
                  onChange={(e) => setHandoverNotes(e.target.value)}
                  placeholder="Enter strategic directives, target asset locations, undercover assets, or special instructions for the incoming officer..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400 leading-relaxed"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-950/50 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                >
                  <Lock className="w-4 h-4" />
                  <span>{submitting ? 'Encrypting & Sealing...' : 'Seal & Transfer Mission Package'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: CLAIM / DECRYPT TRANSFERRED MISSION */}
          {activeTab === 'claim' && (
            <div className="space-y-6">
              {!unlockedMission ? (
                <form onSubmit={handleUnlockMission} className="max-w-xl mx-auto space-y-5">
                  <div className="text-center space-y-1">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-400/30 mb-2">
                      <Key className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-white font-display">
                      Unlock Transferred Mission Dossier
                    </h3>
                    <p className="text-xs text-slate-400">
                      Enter the public Operation Name and the secret Code Word provided by the outgoing officer.
                    </p>
                  </div>

                  {/* Operation Name selector or text input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
                      <span>Operation Name</span>
                      <span className="text-[10px] font-mono text-slate-400">Visible in Public Registry</span>
                    </label>

                    {transfers.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pb-2">
                        {transfers
                          .map((t) => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => setClaimOperationName(t.operation_name)}
                              className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${claimOperationName === t.operation_name
                                  ? 'bg-sky-500/30 text-sky-200 border-sky-400'
                                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                                }`}
                            >
                              {t.operation_name}
                            </button>
                          ))}
                      </div>
                    )}

                    <input
                      type="text"
                      value={claimOperationName}
                      onChange={(e) => setClaimOperationName(e.target.value.toUpperCase())}
                      placeholder="e.g. OPERATION CHAKRAVYUH"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs uppercase tracking-wider focus:outline-none focus:border-sky-400"
                      required
                    />
                  </div>

                  {/* Secret Code Word Input */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-200">
                        Secret Code Word <span className="text-rose-400">*</span>
                      </label>
                      <span className="text-[10px] font-mono text-slate-400">
                        🔒 Salted SHA-256 Hashed
                      </span>
                    </div>

                    <div className="relative">
                      <input
                        type={showClaimCodeWord ? 'text' : 'password'}
                        value={claimCodeWord}
                        onChange={(e) => setClaimCodeWord(e.target.value)}
                        placeholder="Enter secret code word..."
                        className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-sky-400"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowClaimCodeWord(!showClaimCodeWord)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        {showClaimCodeWord ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Security Camera & Biometric Notice */}
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 space-y-1 flex items-start gap-2.5">
                    <Camera className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-300">Biometric Intercept Verification:</span> If an incorrect code is entered, the system will record an optical face snapshot and sound an instant siren alarm on the commanding officer's terminal.
                    </div>
                  </div>

                  {/* Decrypt Button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white font-bold text-xs shadow-lg shadow-sky-950/50 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                  >
                    <Unlock className="w-4 h-4" />
                    <span>{submitting ? 'Decrypting Mission Dossier...' : 'Authenticate & Decrypt Dossier'}</span>
                  </button>
                </form>
              ) : (
                /* UNLOCKED SUCCESS VIEW */
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-white font-display">
                            {unlockedMission.operation_name}
                          </h3>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                            ACCESS GRANTED // CUSTODY ACCEPTED
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-mono">
                          Transferred by: {unlockedMission.outgoing_officer_name} ({unlockedMission.outgoing_officer_badge})
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDownloadDecryptedFile(unlockedMission)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download .cbi.mission Dossier</span>
                    </button>
                  </div>

                  {/* Dossier Contents Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Outgoing Officer Manifest */}
                    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
                      <h4 className="font-bold text-slate-300 uppercase tracking-wider font-mono text-[10px] text-amber-400">
                        Originating Investigating Officer
                      </h4>
                      <div className="space-y-1 text-slate-300">
                        <p><strong className="text-white">Name:</strong> {unlockedMission.outgoing_officer_name}</p>
                        <p><strong className="text-white">Rank:</strong> {unlockedMission.outgoing_officer_rank}</p>
                        <p><strong className="text-white">Badge:</strong> {unlockedMission.outgoing_officer_badge}</p>
                        <p><strong className="text-white">Department:</strong> {unlockedMission.outgoing_officer_department}</p>
                        <p><strong className="text-white">Clearance:</strong> {unlockedMission.outgoing_officer_clearance}</p>
                        <p><strong className="text-white">Station:</strong> {unlockedMission.outgoing_officer_zone}</p>
                      </div>
                    </div>

                    {/* Operational Handover Directives */}
                    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
                      <h4 className="font-bold text-slate-300 uppercase tracking-wider font-mono text-[10px] text-sky-400">
                        Strategic Handover Directives
                      </h4>
                      <p className="text-slate-200 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800 font-mono text-[11px]">
                        {unlockedMission.handover_notes || 'No specific notes recorded.'}
                      </p>
                    </div>
                  </div>

                  {/* Attached Case Snapshot */}
                  {unlockedMission.payload && (
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                      <h4 className="font-bold text-white text-xs uppercase font-display flex items-center gap-2">
                        <FileText className="w-4 h-4 text-sky-400" />
                        <span>Attached Investigation Dossier Snapshot</span>
                      </h4>
                      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-sm">
                            {unlockedMission.payload.case_title || 'Case Intelligence'}
                          </span>
                          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-sky-500/20 text-sky-300">
                            {unlockedMission.payload.status || 'Active'}
                          </span>
                        </div>
                        <p className="text-slate-300 text-xs">
                          {unlockedMission.payload.description}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="text-center pt-2">
                    <button
                      onClick={() => {
                        setUnlockedMission(null);
                        setClaimOperationName('');
                        setClaimCodeWord('');
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
                    >
                      Close Decrypted View
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* TAB 3: TRANSFER REGISTRY */}
          {activeTab === 'vault' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-400 font-mono">
                  All Operation Packages in Central Transfer Registry
                </div>
                <button
                  onClick={loadData}
                  className="text-xs text-sky-400 hover:text-sky-300 font-bold font-mono cursor-pointer"
                >
                  ↻ Refresh Registry
                </button>
              </div>

              {transfers.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No mission transfers found in the repository.
                </div>
              ) : (
                <div className="space-y-3">
                  {transfers.map((t) => (
                    <div
                      key={t.id}
                      className={`p-4 rounded-xl border transition-all ${t.status === 'DESTROYED_PURGED'
                          ? 'bg-rose-950/20 border-rose-900/40 opacity-75'
                          : t.status === 'CLAIMED'
                            ? 'bg-emerald-950/20 border-emerald-900/40'
                            : t.status === 'COMPROMISED_ALERT'
                              ? 'bg-amber-950/30 border-amber-500/40 shadow-sm'
                              : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                        }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm font-display tracking-wider">
                            {t.operation_name}
                          </span>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${t.status === 'DESTROYED_PURGED'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : t.status === 'CLAIMED'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : t.status === 'COMPROMISED_ALERT'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                                  : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                            }`}>
                            {t.status.replace('_', ' ')}
                          </span>
                          {t.failed_attempts > 0 && t.status !== 'DESTROYED_PURGED' && (
                            <span className="text-[10px] font-mono text-rose-400 font-bold">
                              ({t.failed_attempts}/3 Failed Attempts)
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] font-mono text-slate-400">
                          {t.created_at}
                        </div>
                      </div>

                      {/* Outgoing -> Incoming Overview */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs py-2 text-slate-300 font-mono">
                        <div className="p-2 rounded-lg bg-slate-950/50 border border-slate-800/60">
                          <span className="text-[10px] text-slate-400 uppercase block font-sans">Outgoing CBI Officer</span>
                          <span className="font-bold text-white">{t.outgoing_officer_name}</span>
                          <span className="text-[10px] text-slate-400 block">{t.outgoing_officer_badge} • {t.outgoing_officer_rank}</span>
                        </div>

                        <div className="p-2 rounded-lg bg-slate-950/50 border border-slate-800/60">
                          <span className="text-[10px] text-slate-400 uppercase block font-sans">Target Recipient Officer</span>
                          <span className="font-bold text-white">{t.target_officer_name}</span>
                          <span className="text-[10px] text-slate-400 block">{t.target_officer_badge || 'Designated Recipient'}</span>
                        </div>
                      </div>

                      {/* Handover Note Preview */}
                      {t.handover_notes_preview && (
                        <p className="text-[11px] text-slate-400 italic pt-1 truncate">
                          "{t.handover_notes_preview}"
                        </p>
                      )}

                      {/* Action Bar */}
                      <div className="pt-3 mt-2 border-t border-slate-800/80 flex items-center justify-between">
                        <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
                          <Lock className="w-3 h-3 text-slate-400" />
                          <span>Secret Code Word: [SALTED SHA-256 CIPHER HIDDEN]</span>
                        </div>

                        {t.status !== 'DESTROYED_PURGED' && (
                          <button
                            onClick={() => {
                              setClaimOperationName(t.operation_name);
                              setActiveTab('claim');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-sky-600/30 hover:bg-sky-600/50 text-sky-200 border border-sky-400/40 text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                          >
                            <Key className="w-3.5 h-3.5" />
                            <span>Unlock This Mission</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>CBI High-Security Cryptographic Protocol Active</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            Close Window
          </button>
        </div>
      </motion.div>
    </div>
  );
};
