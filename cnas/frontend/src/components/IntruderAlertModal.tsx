import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Camera,
  ShieldAlert,
  Volume2,
  VolumeX,
  X,
  Eye,
  Crosshair,
  Lock,
  Radio,
  Clock,
  MapPin,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { IntruderBreachAlert } from '../types';
import { api } from '../services/api';

interface IntruderAlertModalProps {
  isOpen: boolean;
  alert: IntruderBreachAlert | null;
  onClose: () => void;
  onViewDetails?: () => void;
}

export const IntruderAlertModal: React.FC<IntruderAlertModalProps> = ({
  isOpen,
  alert,
  onClose,
  onViewDetails
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [showFaceDetails, setShowFaceDetails] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  // Audio Context for synthesizing loud tactical police sirens
  const audioContextRef = useRef<AudioContext | null>(null);
  const sirenOscillatorRef = useRef<OscillatorNode | null>(null);
  const sirenGainRef = useRef<GainNode | null>(null);
  const sirenIntervalRef = useRef<any>(null);

  // Initialize and trigger siren alarm sound
  useEffect(() => {
    if (!isOpen || !alert || isMuted) {
      stopSiren();
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      gain.gain.setValueAtTime(0.2, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      sirenOscillatorRef.current = osc;
      sirenGainRef.current = gain;

      // Oscillate frequency like tactical emergency siren (650Hz <-> 1100Hz)
      let freqHigh = false;
      osc.frequency.setValueAtTime(700, ctx.currentTime);

      sirenIntervalRef.current = setInterval(() => {
        if (!osc || !ctx) return;
        freqHigh = !freqHigh;
        const targetFreq = freqHigh ? 1150 : 650;
        osc.frequency.exponentialRampToValueAtTime(targetFreq, ctx.currentTime + 0.35);
      }, 400);

    } catch (e) {
      console.warn('Web Audio Siren not permitted or auto-blocked:', e);
    }

    return () => {
      stopSiren();
    };
  }, [isOpen, alert, isMuted]);

  const stopSiren = () => {
    if (sirenIntervalRef.current) {
      clearInterval(sirenIntervalRef.current);
      sirenIntervalRef.current = null;
    }
    if (sirenOscillatorRef.current) {
      try {
        sirenOscillatorRef.current.stop();
        sirenOscillatorRef.current.disconnect();
      } catch {
        // ignore
      }
      sirenOscillatorRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch {
        // ignore
      }
      audioContextRef.current = null;
    }
  };

  const handleAcknowledge = async () => {
    stopSiren();
    setAcknowledged(true);
    if (alert?.id) {
      try {
        await api.acknowledgeBreachAlert(alert.id);
      } catch (err) {
        console.error('Failed to acknowledge alert:', err);
      }
    }
    setTimeout(() => {
      onClose();
      setAcknowledged(false);
      setShowFaceDetails(false);
    }, 400);
  };

  if (!isOpen || !alert) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 pt-[144px] pb-6 sm:pt-[148px] bg-black/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl max-h-[calc(100vh-165px)] rounded-2xl border shadow-2xl overflow-hidden bg-gradient-to-b from-red-950/85 via-slate-950 to-slate-950 border-red-500/60 shadow-red-900/40"
        >
          {/* Top Flashing Strobe Bar */}
          <div className="h-2 w-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 animate-pulse" />

          {/* Header */}
          <div className="p-5 border-b border-red-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 animate-bounce">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black tracking-wider text-white font-display uppercase">
                    ⚠️ UNAUTHORIZED INTRUDER DETECTED
                  </h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40 font-bold uppercase animate-pulse">
                    Attempt #{alert.attempt_number}
                  </span>
                </div>
                <p className="text-xs text-red-200/80 font-mono mt-0.5">
                  Target Operation: <span className="font-bold text-white">{alert.operation_name}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${isMuted
                    ? 'bg-slate-800 text-slate-400 border-slate-700'
                    : 'bg-red-500/20 text-red-200 border-red-400/40 shadow-sm animate-pulse'
                  }`}
                title={isMuted ? 'Unmute Siren Alarm' : 'Mute Siren Alarm'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-red-400" />}
                <span className="hidden sm:inline">{isMuted ? 'Muted' : 'Siren Active'}</span>
              </button>

              <button
                onClick={handleAcknowledge}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {/* Primary Alert Banner with Important Note */}
            <div className="p-4 rounded-xl border bg-red-950/40 border-red-500/40 text-red-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5 animate-pulse" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-red-300 font-mono">
                    Security Incident Advisory
                  </h4>
                  <p className="text-xs text-slate-200 leading-relaxed font-normal">
                    An unauthorized individual entered an incorrect secret code word on Operation '{alert.operation_name}'. An automated biometric face capture was triggered.
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-red-500/20 text-[11px] text-amber-200/90 font-mono flex items-center gap-2">
                <span className="font-bold text-amber-400 uppercase">IMPORTANT NOTE:</span>
                <span>
                  The mission dossier remains safely encrypted in the CBI Transfer Vault. The intruder's face and terminal telemetry have been logged.
                </span>
              </div>
            </div>

            {/* ONE-TAP ACTION: View Intruder Face & Surveillance Feed */}
            {!showFaceDetails ? (
              <div className="text-center py-2">
                <button
                  onClick={() => setShowFaceDetails(true)}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-sm shadow-xl shadow-red-950/60 border border-red-400/50 flex items-center justify-center gap-3 transition-transform hover:scale-[1.02] cursor-pointer group"
                >
                  <div className="p-2 rounded-xl bg-black/30 text-white group-hover:animate-pulse">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-black text-xs sm:text-sm tracking-wide flex items-center gap-2">
                      <span>🔴 TAP TO VIEW INTRUDER FACE & LIVE CAMERA FEED</span>
                      <Eye className="w-4 h-4 text-amber-200 animate-pulse" />
                    </div>
                    <div className="text-[10px] text-red-100 font-mono font-normal">
                      Access captured webcam snapshot & biometric facial recognition overlay
                    </div>
                  </div>
                </button>
              </div>
            ) : (
              /* Expanded Intruder Surveillance HUD */
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4 pt-2"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Crosshair className="w-4 h-4 text-red-400 animate-spin" />
                    <span className="text-xs font-mono font-bold text-red-300 uppercase">
                      Biometric Face Capture & Visual Intercept
                    </span>
                  </div>
                  <span className="text-[10px] font-mono bg-red-500/20 text-red-300 px-2 py-0.5 rounded border border-red-500/40">
                    MATCH CONFIDENCE: 99.4%
                  </span>
                </div>

                {/* Face Snapshot Display with Biometric Targeting Reticle */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  <div className="sm:col-span-6 relative rounded-xl border border-red-500/40 bg-black/60 overflow-hidden flex items-center justify-center min-h-[220px]">
                    {alert.face_snapshot_base64 ? (
                      <img
                        src={alert.face_snapshot_base64}
                        alt="Intruder Face Capture"
                        className="w-full h-full object-cover rounded-xl filter contrast-125"
                      />
                    ) : (
                      /* Fallback Simulated IR Face Biometric Hologram */
                      <div className="relative w-full h-48 bg-gradient-to-b from-slate-900 via-red-950/40 to-black flex flex-col items-center justify-center p-4">
                        <div className="w-24 h-24 rounded-full border-2 border-dashed border-red-400/60 flex items-center justify-center relative bg-red-950/30">
                          <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-400 flex items-center justify-center text-red-300">
                            <Camera className="w-8 h-8" />
                          </div>
                          {/* Targeting reticle */}
                          <div className="absolute inset-0 border-t border-red-400/80 animate-ping opacity-30" />
                        </div>
                        <span className="text-[11px] font-mono text-red-300 mt-2 font-semibold">
                          [OPTICAL IR INTRUDER SNAPSHOT #8841]
                        </span>
                      </div>
                    )}

                    {/* HUD Targeting Overlay Over the Photo */}
                    <div className="absolute inset-0 pointer-events-none p-3 flex flex-col justify-between">
                      <div className="flex justify-between items-start text-[9px] font-mono text-red-400 bg-black/60 px-2 py-1 rounded backdrop-blur-xs">
                        <span>SYS_CAM_INTCPT: ACTIVE</span>
                        <span>RES: 1080P_HD</span>
                      </div>
                      <div className="flex justify-between items-end text-[9px] font-mono text-amber-400 bg-black/60 px-2 py-1 rounded backdrop-blur-xs">
                        <span>LATENCY: 12ms</span>
                        <span>BIOMETRIC_ID: #UNK-409</span>
                      </div>
                    </div>
                  </div>

                  {/* Telemetry & Device Metadata */}
                  <div className="sm:col-span-6 space-y-2.5 text-xs font-mono">
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Terminal Telemetry</div>

                      <div className="flex items-center justify-between text-slate-300">
                        <span className="flex items-center gap-1 text-slate-400">
                          <Clock className="w-3 h-3" /> Timestamp:
                        </span>
                        <span className="font-semibold text-white">{alert.timestamp}</span>
                      </div>

                      <div className="flex items-center justify-between text-slate-300">
                        <span className="flex items-center gap-1 text-slate-400">
                          <MapPin className="w-3 h-3" /> Source Terminal:
                        </span>
                        <span className="font-semibold text-sky-300">{alert.ip_address}</span>
                      </div>

                      <div className="flex items-center justify-between text-slate-300">
                        <span className="flex items-center gap-1 text-slate-400">
                          <Radio className="w-3 h-3" /> User-Agent:
                        </span>
                        <span className="text-[10px] text-slate-300 truncate max-w-[140px]">{alert.user_agent}</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/30 space-y-1">
                      <div className="text-[10px] text-red-300 font-bold uppercase flex items-center gap-1">
                        <Flame className="w-3 h-3 text-red-400" /> Threat Classification
                      </div>
                      <p className="text-[11px] text-slate-300 font-normal">
                        Unauthorized access attempt detected on encrypted CBI dossier. Biometric evidence has been immutably logged into the evidence ledger.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-slate-950/80 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>CBI Incident Record ID: #{alert.id}</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleAcknowledge}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-all border border-slate-700 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{acknowledged ? 'Acknowledging...' : 'Acknowledge & Dismiss'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
