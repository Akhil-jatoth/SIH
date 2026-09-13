import React, { useState, useEffect, useRef } from 'react';
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
  UserCheck,
  Camera,
  Upload,
  Eye,
  EyeOff,
  RefreshCw,
  Scan,
  Check,
  X,
  FileText,
  User,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, CBI_OFFICER_PRESETS, CbiOfficerPreset } from '../context/AuthContext';
import { GlassPanel } from '../components/GlassPanel';
import { CyberBackground } from '../components/CyberBackground';

export const Login: React.FC = () => {
  const { loginWithCbiCard, login } = useAuth();
  const navigate = useNavigate();

  // Multi-step Authentication Stage: 1 = Credentials, 2 = ID Upload, 3 = Face Recognition, 4 = Final Smart Card Tap
  const [currentStage, setCurrentStage] = useState<1 | 2 | 3 | 4>(1);

  // --- STAGE 1: CREDENTIALS & PASSWORD STRENGTH ---
  const [username, setUsername] = useState('sp.kabir.rao');
  const [password, setPassword] = useState('Cbi@Security2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [stage1Error, setStage1Error] = useState('');

  // Password strength calculation
  const calculatePasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score += 25;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score += 25;
    if (/\d/.test(pwd)) score += 25;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) score += 25;

    let label: 'VERY WEAK' | 'WEAK' | 'MODERATE' | 'STRONG' | 'MILITARY GRADE';
    let color: string;
    let barColor: string;

    if (score <= 25) {
      label = 'VERY WEAK';
      color = 'text-rose-400';
      barColor = 'bg-rose-500';
    } else if (score <= 50) {
      label = 'WEAK';
      color = 'text-orange-400';
      barColor = 'bg-orange-500';
    } else if (score <= 75) {
      label = 'MODERATE';
      color = 'text-amber-400';
      barColor = 'bg-amber-500';
    } else if (score < 100) {
      label = 'STRONG';
      color = 'text-sky-400';
      barColor = 'bg-sky-500';
    } else {
      label = 'MILITARY GRADE';
      color = 'text-emerald-400';
      barColor = 'bg-emerald-500';
    }

    return {
      score,
      label,
      color,
      barColor,
      hasLength: pwd.length >= 8,
      hasUpperLower: /[a-z]/.test(pwd) && /[A-Z]/.test(pwd),
      hasNumber: /\d/.test(pwd),
      hasSymbol: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    };
  };

  const strength = calculatePasswordStrength(password);

  const handleStage1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setStage1Error('');
    if (!username.trim()) {
      setStage1Error('Please provide your official CBI username or service handle.');
      return;
    }
    if (strength.score < 50) {
      setStage1Error('Password too weak for CBI Classified Systems. Minimum 8 characters with upper/lowercase, numbers & symbols required.');
      return;
    }
    setCurrentStage(2);
  };

  // --- STAGE 2: CBI ID CARD UPLOAD & SELECTION ---
  const [selectedPreset, setSelectedPreset] = useState<CbiOfficerPreset>(CBI_OFFICER_PRESETS[0]);
  const [uploadedCardImage, setUploadedCardImage] = useState<string | null>(null);
  const [uploadedCardName, setUploadedCardName] = useState<string | null>(null);
  const [isVerifyingCard, setIsVerifyingCard] = useState(false);
  const [cardVerified, setCardVerified] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedCardImage(reader.result as string);
        setUploadedCardName(file.name);
        setIsVerifyingCard(true);
        setTimeout(() => {
          setIsVerifyingCard(false);
          setCardVerified(true);
        }, 1200);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStage2Submit = () => {
    setCurrentStage(3);
  };

  // --- STAGE 3: LIVE BIOMETRIC FACE RECOGNITION ---
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [capturedFaceImage, setCapturedFaceImage] = useState<string | null>(null);
  const [isScanningFace, setIsScanningFace] = useState(false);
  const [faceMatchResult, setFaceMatchResult] = useState<{
    matched: boolean;
    confidence: number;
    timestamp: string;
  } | null>(null);

  // Initialize camera stream when entering Stage 3
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (currentStage === 3) {
      setCapturedFaceImage(null);
      setFaceMatchResult(null);
      navigator.mediaDevices
        ?.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            videoRef.current.play();
            setCameraActive(true);
            setCameraError(false);
          }
        })
        .catch((err) => {
          console.warn('Webcam not available or denied:', err);
          setCameraActive(false);
          setCameraError(true);
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [currentStage]);

  const handleCaptureFace = () => {
    setIsScanningFace(true);
    let capturedDataUrl = '';

    if (videoRef.current && canvasRef.current && cameraActive) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        capturedDataUrl = canvas.toDataURL('image/jpeg');
        setCapturedFaceImage(capturedDataUrl);
      }
    } else {
      // Fallback captured snapshot for environments without physical camera
      capturedDataUrl = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&fit=crop&q=80';
      setCapturedFaceImage(capturedDataUrl);
    }

    // Simulate AI Facial Feature Extraction & Neural Biometric Match
    setTimeout(() => {
      setIsScanningFace(false);
      setFaceMatchResult({
        matched: true,
        confidence: 98.9,
        timestamp: new Date().toLocaleTimeString(),
      });
    }, 1500);
  };

  const handleStage3Submit = () => {
    setCurrentStage(4);
  };

  // --- STAGE 4: FINAL SMART CARD NFC SCAN / PIN TERMINAL (THE SCREENSHOT UI) ---
  const [authMode, setAuthMode] = useState<'card_scan' | 'manual_pin'>('card_scan');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState<string>('');
  const [badgeInput, setBadgeInput] = useState(selectedPreset.badgeNumber);
  const [pinInput, setPinInput] = useState('7729');
  const [error, setError] = useState('');

  const handleScanCard = (presetToScan: CbiOfficerPreset = selectedPreset) => {
    setError('');
    setIsScanning(true);
    setScanStep('Engaging Contactless NFC Sensor...');

    setTimeout(() => {
      setScanStep('Validating 256-bit Cryptographic EMV Credentials...');
    }, 450);

    setTimeout(() => {
      setScanStep('Verifying CBI NATGRID Security Clearance (LEVEL-V)...');
    }, 900);

    setTimeout(() => {
      setScanStep('Security Verified! Access Granted to CNAS Portal.');
      loginWithCbiCard(presetToScan);
      setTimeout(() => {
        navigate('/');
      }, 600);
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
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-[#080c14] overflow-x-hidden text-slate-100">
      <CyberBackground />
      <canvas ref={canvasRef} className="hidden" />

      {/* Top Official Government Classification Header */}
      <div className="relative z-10 w-full max-w-4xl mb-3 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold tracking-wider mb-2 shadow-lg backdrop-blur-md">
          <Shield className="w-4 h-4 text-amber-400" />
          <span>CENTRAL BUREAU OF INVESTIGATION • GOVT OF INDIA</span>
          <span className="text-slate-400">|</span>
          <span className="text-rose-400 font-bold">TOP SECRET // LES</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide font-display drop-shadow-md">
          CBI Criminal Network Analysis System
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-lg font-medium">
          Official High-Security Portal • Restricted strictly to verified Central Bureau of Investigation officers and authorized cyber intelligence cells.
        </p>

        {/* 4-Stage Interactive Progress Bar */}
        <div className="w-full max-w-3xl mt-4 grid grid-cols-4 gap-2 bg-slate-950/80 p-2 rounded-2xl border border-slate-800/90 shadow-inner">
          {[
            { stage: 1, label: '1. Credentials & Password', icon: Lock },
            { stage: 2, label: '2. Upload CBI ID Card', icon: CreditCard },
            { stage: 3, label: '3. Biometric Face Match', icon: Camera },
            { stage: 4, label: '4. Smart Card Tap', icon: Fingerprint },
          ].map((item) => {
            const Icon = item.icon;
            const isCompleted = currentStage > item.stage;
            const isCurrent = currentStage === item.stage;
            return (
              <div
                key={item.stage}
                onClick={() => {
                  if (item.stage < currentStage) setCurrentStage(item.stage as any);
                }}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-[11px] font-mono font-bold transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-amber-500/25 border border-amber-400 text-amber-300 shadow-glass'
                    : isCompleted
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                    : 'bg-slate-900/60 border border-slate-800 text-slate-500'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`} />
                )}
                <span className="truncate hidden sm:inline">{item.label}</span>
                <span className="sm:hidden">S{item.stage}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="relative z-10 w-full max-w-4xl">
        <AnimatePresence mode="wait">
          {/* ============================================================ */}
          {/* STAGE 1: USERNAME & PASSWORD WITH LIVE STRENGTH DETECTION    */}
          {/* ============================================================ */}
          {currentStage === 1 && (
            <motion.div
              key="stage1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
            >
              {/* Left Info Box */}
              <div className="lg:col-span-5">
                <GlassPanel glow="blue" className="p-6 border border-slate-800 bg-slate-900/90 shadow-2xl h-full flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-md mb-4">
                      <ShieldCheck className="w-7 h-7" />
                    </div>
                    <h3 className="text-base font-bold text-white font-display">
                      Officer Primary Authentication
                    </h3>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                      Enter your authorized CBI service handle and high-entropy security passphrase. All access attempts are cryptographically signed and logged on the government audit ledger.
                    </p>

                    <div className="mt-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-[11px] font-mono">
                      <div className="text-amber-300 font-bold flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5" />
                        <span>Security Level: LEVEL-V TOP SECRET</span>
                      </div>
                      <div className="text-slate-400">
                        Protocol: Section 43/66 IT Act & National Intelligence Grid Compliance.
                      </div>
                    </div>
                  </div>

                  <div className="text-[10px] font-mono text-slate-500 pt-4 border-t border-slate-800">
                    Host: CBI-NATGRID-SECURE-NODE-01
                  </div>
                </GlassPanel>
              </div>

              {/* Right Form with Real-time Strength Meter */}
              <div className="lg:col-span-7">
                <GlassPanel glow="blue" className="p-6 border border-slate-800 bg-slate-900/95 shadow-2xl">
                  <form onSubmit={handleStage1Submit} className="space-y-4">
                    {stage1Error && (
                      <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-300/40 text-rose-200 text-xs flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-300 shrink-0" />
                        <span>{stage1Error}</span>
                      </div>
                    )}

                    {/* Username Input */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        CBI Officer Username / Service ID
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="e.g. sp.kabir.rao or officer handle"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-400 font-mono shadow-inner"
                          required
                        />
                      </div>
                    </div>

                    {/* Password Input */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-slate-300">
                          Security Passphrase
                        </label>
                        <span className={`text-[10px] font-mono font-bold ${strength.color}`}>
                          STRENGTH: {strength.label} ({strength.score}%)
                        </span>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your secure password..."
                          className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-400 font-mono shadow-inner"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-3 text-slate-400 hover:text-white cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Live Password Strength Meter Bar */}
                      <div className="w-full bg-slate-950 h-2 rounded-full mt-2.5 overflow-hidden border border-slate-800">
                        <div
                          className={`h-full ${strength.barColor} transition-all duration-300`}
                          style={{ width: `${Math.max(5, strength.score)}%` }}
                        />
                      </div>

                      {/* Strength Validation Badges Grid */}
                      <div className="grid grid-cols-2 gap-2 mt-3 text-[11px] font-mono">
                        <div className={`flex items-center gap-1.5 p-1.5 rounded-lg border ${
                          strength.hasLength ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' : 'bg-slate-950/60 border-slate-800 text-slate-500'
                        }`}>
                          {strength.hasLength ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                          <span>At least 8 characters</span>
                        </div>

                        <div className={`flex items-center gap-1.5 p-1.5 rounded-lg border ${
                          strength.hasUpperLower ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' : 'bg-slate-950/60 border-slate-800 text-slate-500'
                        }`}>
                          {strength.hasUpperLower ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                          <span>Upper & Lowercase</span>
                        </div>

                        <div className={`flex items-center gap-1.5 p-1.5 rounded-lg border ${
                          strength.hasNumber ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' : 'bg-slate-950/60 border-slate-800 text-slate-500'
                        }`}>
                          {strength.hasNumber ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                          <span>Includes Numbers (0-9)</span>
                        </div>

                        <div className={`flex items-center gap-1.5 p-1.5 rounded-lg border ${
                          strength.hasSymbol ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' : 'bg-slate-950/60 border-slate-800 text-slate-500'
                        }`}>
                          {strength.hasSymbol ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                          <span>Special Symbols (@#$)</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 text-sm font-extrabold shadow-xl border border-amber-300/60 flex items-center justify-center gap-2 transition-all cursor-pointer group"
                    >
                      <span>Proceed to Step 2: CBI ID Card Verification</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  </form>
                </GlassPanel>
              </div>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* STAGE 2: UPLOAD & VERIFY OFFICIAL CBI ID CARD                */}
          {/* ============================================================ */}
          {currentStage === 2 && (
            <motion.div
              key="stage2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
            >
              {/* Left Column: Visual Official CBI ID Card */}
              <div className="lg:col-span-6">
                <GlassPanel glow="blue" className="p-5 sm:p-6 border border-slate-800 bg-slate-900/90 shadow-2xl relative overflow-hidden flex flex-col justify-between h-full">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />

                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-700 p-0.5 flex items-center justify-center shadow-md">
                          <Shield className="w-5 h-5 text-slate-950 font-bold" />
                        </div>
                        <div>
                          <div className="text-[11px] font-extrabold uppercase tracking-wider text-amber-300 font-display">
                            Central Bureau of Investigation
                          </div>
                          <div className="text-[9px] text-slate-400 font-mono tracking-tight">
                            DEPARTMENT OF PERSONNEL & TRAINING • GOVT. OF INDIA
                          </div>
                        </div>
                      </div>

                      <div className="px-2 py-0.5 rounded bg-rose-500/20 border border-rose-400/40 text-[9px] font-mono text-rose-300 font-bold uppercase">
                        OFFICIAL ID
                      </div>
                    </div>

                    {/* ID Card Visual Body */}
                    <div className="relative mt-4 p-4 rounded-xl bg-gradient-to-br from-[#0c1322] via-[#111c30] to-[#0a0f1a] border border-slate-800 shadow-inner overflow-hidden">
                      {isVerifyingCard && (
                        <motion.div
                          initial={{ top: '0%' }}
                          animate={{ top: ['0%', '100%', '0%'] }}
                          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                          className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#00f2fe] z-30 pointer-events-none"
                        />
                      )}

                      <div className="flex gap-3.5 items-start">
                        {/* Photo Box */}
                        <div className="flex flex-col items-center">
                          {uploadedCardImage ? (
                            <div className="w-20 h-24 rounded-lg overflow-hidden border-2 border-emerald-400 shadow-lg relative bg-black">
                              <img src={uploadedCardImage} alt="Uploaded Officer ID" className="w-full h-full object-cover" />
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border border-black flex items-center justify-center">
                                <BadgeCheck className="w-3 h-3 text-white" />
                              </div>
                            </div>
                          ) : (
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
                          )}

                          <div className="mt-2 text-[9px] font-mono text-amber-300 font-bold">
                            {selectedPreset.serviceNo}
                          </div>
                        </div>

                        {/* Officer Info */}
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

                      {/* EMV Chip & QR Code */}
                      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-6 rounded bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-600 border border-yellow-200 shadow-sm flex items-center justify-center p-0.5">
                            <Cpu className="w-4 h-4 text-slate-900" />
                          </div>
                          <div className="text-[9px] font-mono text-slate-400">
                            <div>EMV-256 ENCRYPTED</div>
                            <div className="text-emerald-400 font-bold">ACTIVE // VERIFIED</div>
                          </div>
                        </div>
                        <QrCode className="w-6 h-6 text-amber-300" />
                      </div>
                    </div>
                  </div>

                  {/* Card Select Presets Carousel */}
                  <div className="mt-4">
                    <label className="block text-[11px] font-semibold text-purple-200 mb-2 flex items-center justify-between">
                      <span>Select Verified CBI Officer ID Card:</span>
                      <span className="text-[10px] text-amber-300 font-mono">3 Officers Active</span>
                    </label>

                    <div className="grid grid-cols-3 gap-2">
                      {CBI_OFFICER_PRESETS.map((preset) => {
                        const isSelected = selectedPreset.id === preset.id && !uploadedCardImage;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => {
                              setSelectedPreset(preset);
                              setUploadedCardImage(null);
                              setUploadedCardName(null);
                              setCardVerified(true);
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

              {/* Right Column: Upload Card Controls */}
              <div className="lg:col-span-6 flex flex-col justify-between">
                <GlassPanel glow="blue" className="p-6 border border-slate-800 bg-slate-900/95 shadow-2xl flex flex-col justify-between h-full">
                  <div>
                    <h3 className="text-sm font-bold text-white font-display flex items-center gap-2 mb-2">
                      <CreditCard className="w-4 h-4 text-amber-400" />
                      <span>Upload & Verify Official CBI ID Card</span>
                    </h3>
                    <p className="text-xs text-slate-400 mb-4">
                      Upload your physical CBI Smart Card scan or photo (`.png`, `.jpg`, `.pdf`) or use one of the pre-verified officer cards on the left.
                    </p>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    {/* Drag & Drop Upload Zone */}
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={`p-6 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                        uploadedCardImage
                          ? 'border-emerald-500/60 bg-emerald-950/20'
                          : 'border-slate-700 hover:border-amber-400/60 bg-slate-950/60 hover:bg-slate-950'
                      }`}
                    >
                      {uploadedCardImage ? (
                        <div className="flex flex-col items-center gap-2">
                          <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                          <div className="text-xs font-bold text-emerald-300">
                            CBI ID Card Successfully Uploaded & OCR Scanned!
                          </div>
                          <div className="text-[10px] font-mono text-slate-400">
                            File: {uploadedCardName}
                          </div>
                          <span className="text-[10px] text-sky-400 underline mt-1">
                            Click to upload a different ID photo
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                            <Upload className="w-6 h-6" />
                          </div>
                          <div className="text-xs font-bold text-white">
                            Click to Browse or Drag & Drop CBI ID Card
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Supports Official High-Res Scans (PNG, JPG, PDF up to 25MB)
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Verified Status Banner */}
                    <div className="mt-4 p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <BadgeCheck className="w-4 h-4 text-emerald-400" />
                        <span className="text-slate-300">CBI Holographic Watermark:</span>
                      </div>
                      <span className="text-emerald-400 font-bold">VALIDATED // SECURE</span>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setCurrentStage(1)}
                      className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleStage2Submit}
                      className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 text-xs font-extrabold shadow-md border border-amber-300/60 flex items-center justify-center gap-2 transition-all cursor-pointer group"
                    >
                      <span>Proceed to Step 3: Biometric Face Recognition</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </GlassPanel>
              </div>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* STAGE 3: LIVE BIOMETRIC FACE RECOGNITION (WEBCAM SCAN)       */}
          {/* ============================================================ */}
          {currentStage === 3 && (
            <motion.div
              key="stage3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
            >
              {/* Left Column: Live Camera Video Stream */}
              <div className="lg:col-span-7">
                <GlassPanel glow="blue" className="p-6 border border-slate-800 bg-slate-900/90 shadow-2xl flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Camera className="w-4 h-4 text-sky-400 animate-pulse" />
                        <h3 className="text-sm font-bold text-white font-display">
                          Live Biometric Camera Feed
                        </h3>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40">
                        {cameraActive ? 'LIVE WEBCAM ACTIVE' : 'SIMULATED OPTICAL FEED'}
                      </span>
                    </div>

                    {/* Camera Video Viewport with HUD Overlay */}
                    <div className="relative w-full aspect-video rounded-2xl bg-black border-2 border-sky-500/40 overflow-hidden shadow-2xl flex items-center justify-center">
                      <video
                        ref={videoRef}
                        playsInline
                        muted
                        className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
                      />

                      {!cameraActive && (
                        <div className="flex flex-col items-center justify-center p-6 text-center">
                          <div className="w-16 h-16 rounded-full bg-sky-500/20 border border-sky-400 flex items-center justify-center text-sky-400 mb-3 shadow-lg">
                            <UserCheck className="w-8 h-8" />
                          </div>
                          <div className="text-xs font-bold text-white">
                            Optical Sensor Standby
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono mt-1">
                            Click 'Capture Face' below to perform biometric iris & facial mesh extraction.
                          </div>
                        </div>
                      )}

                      {/* High-tech Face Reticle Overlay */}
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        {/* Target Box */}
                        <div className="w-48 h-56 border-2 border-sky-400/70 rounded-3xl relative shadow-[0_0_20px_rgba(56,189,248,0.3)]">
                          {/* Corner brackets */}
                          <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-amber-400" />
                          <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-amber-400" />
                          <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-amber-400" />
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-amber-400" />

                          {/* Center scan line */}
                          {isScanningFace && (
                            <motion.div
                              initial={{ top: '0%' }}
                              animate={{ top: ['0%', '100%', '0%'] }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981]"
                            />
                          )}

                          <div className="absolute bottom-2 left-0 right-0 text-center text-[9px] font-mono text-sky-300 font-bold bg-black/60 py-0.5 rounded-full mx-4">
                            ALIGN FACE IN RETICLE
                          </div>
                        </div>
                      </div>

                      {/* HUD Diagnostics telemetry */}
                      <div className="absolute top-3 left-3 text-[9px] font-mono text-sky-300 bg-black/75 px-2 py-1 rounded border border-sky-500/30">
                        <div>LANDMARKS: 68 POINTS</div>
                        <div>LIVENESS: ACTIVE</div>
                      </div>
                    </div>
                  </div>

                  {/* Capture Button */}
                  <div className="mt-4 flex gap-3">
                    <button
                      type="button"
                      disabled={isScanningFace}
                      onClick={handleCaptureFace}
                      className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-bold shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isScanningFace ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Extracting Neural Biometrics...</span>
                        </>
                      ) : (
                        <>
                          <Camera className="w-4 h-4" />
                          <span>Capture Live Face & Match ID</span>
                        </>
                      )}
                    </button>
                  </div>
                </GlassPanel>
              </div>

              {/* Right Column: Biometric Match Verification Panel */}
              <div className="lg:col-span-5 flex flex-col justify-between">
                <GlassPanel glow="blue" className="p-6 border border-slate-800 bg-slate-900/95 shadow-2xl flex flex-col justify-between h-full">
                  <div>
                    <h3 className="text-sm font-bold text-white font-display flex items-center gap-2 mb-2">
                      <Scan className="w-4 h-4 text-emerald-400" />
                      <span>Biometric Comparison Engine</span>
                    </h3>
                    <p className="text-xs text-slate-400 mb-4">
                      Neural comparison between the official CBI ID card photo and the live captured officer face.
                    </p>

                    {/* Side-by-Side Comparison */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {/* Left: ID Photo */}
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center text-center">
                        <div className="text-[10px] font-mono text-slate-400 mb-1.5 font-bold">
                          1. CBI ID PHOTO
                        </div>
                        {uploadedCardImage ? (
                          <img src={uploadedCardImage} alt="ID Photo" className="w-16 h-20 object-cover rounded-lg border border-amber-400" />
                        ) : (
                          <div className={`w-16 h-20 rounded-lg bg-gradient-to-b ${selectedPreset.photoColor} border border-amber-400 flex items-center justify-center text-white font-black font-mono`}>
                            {selectedPreset.initials}
                          </div>
                        )}
                        <div className="text-[9px] font-mono text-amber-300 mt-1 truncate max-w-full">
                          {selectedPreset.name.split(',')[0]}
                        </div>
                      </div>

                      {/* Right: Captured Live Face */}
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center text-center">
                        <div className="text-[10px] font-mono text-slate-400 mb-1.5 font-bold">
                          2. LIVE CAPTURE
                        </div>
                        {capturedFaceImage ? (
                          <img src={capturedFaceImage} alt="Captured Face" className="w-16 h-20 object-cover rounded-lg border border-emerald-400 shadow-md" />
                        ) : (
                          <div className="w-16 h-20 rounded-lg bg-slate-900 border border-dashed border-slate-700 flex items-center justify-center text-slate-500 text-[10px] font-mono text-center p-1">
                            Awaiting Capture
                          </div>
                        )}
                        <div className="text-[9px] font-mono text-emerald-400 mt-1">
                          {capturedFaceImage ? 'Frame Acquired' : 'Pending'}
                        </div>
                      </div>
                    </div>

                    {/* Match Result Display */}
                    {faceMatchResult ? (
                      <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-500/50 text-emerald-200 text-xs space-y-2">
                        <div className="flex items-center gap-2 font-bold text-emerald-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>BIOMETRIC MATCH CONFIRMED (98.9%)</span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-300 leading-snug">
                          Officer identity verified against CBI National Biometric Repository (Aadhaar / NATGRID C-DAT node).
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-2">
                        <Fingerprint className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Take a snapshot from the live camera to compute match confidence.</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setCurrentStage(2)}
                      className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      disabled={!faceMatchResult?.matched}
                      onClick={handleStage3Submit}
                      className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-40 text-slate-950 text-xs font-extrabold shadow-md border border-emerald-300/60 flex items-center justify-center gap-2 transition-all cursor-pointer group"
                    >
                      <span>Proceed to Step 4: Smart Card Authorization</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </GlassPanel>
              </div>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* STAGE 4: FINAL SMART CARD TAP / TERMINAL (MATCHING SCREENSHOT)*/}
          {/* ============================================================ */}
          {currentStage === 4 && (
            <motion.div
              key="stage4"
              initial={{ opacity: 0, scale: 0.97, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
            >
              {/* LEFT COLUMN: THE OFFICIAL CBI SMART ID CARD */}
              <div className="lg:col-span-6 flex flex-col justify-between">
                <GlassPanel glow="blue" className="p-5 sm:p-6 border border-slate-800 bg-slate-900/90 shadow-2xl relative overflow-hidden flex flex-col justify-between h-full">
                  {/* Holographic Tricolor Header Accent */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />

                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-700 p-0.5 flex items-center justify-center shadow-md">
                          <Shield className="w-5 h-5 text-slate-950 font-bold" />
                        </div>
                        <div>
                          <div className="text-[11px] font-extrabold uppercase tracking-wider text-amber-300 font-display">
                            Central Bureau of Investigation
                          </div>
                          <div className="text-[9px] text-slate-400 font-mono tracking-tight">
                            DEPARTMENT OF PERSONNEL & TRAINING • GOVT. OF INDIA
                          </div>
                        </div>
                      </div>

                      <div className="px-2 py-0.5 rounded bg-rose-500/20 border border-rose-400/40 text-[9px] font-mono text-rose-300 font-bold uppercase">
                        OFFICIAL ID
                      </div>
                    </div>

                    {/* ID Card Visual Body */}
                    <div className="relative mt-4 p-4 rounded-xl bg-gradient-to-br from-[#0c1322] via-[#111c30] to-[#0a0f1a] border border-slate-800 shadow-inner overflow-hidden">
                      {isScanning && (
                        <motion.div
                          initial={{ top: '0%' }}
                          animate={{ top: ['0%', '100%', '0%'] }}
                          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                          className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#00f2fe] z-30 pointer-events-none"
                        />
                      )}

                      <div className="flex gap-3.5 items-start">
                        {/* Officer Avatar */}
                        <div className="flex flex-col items-center">
                          {uploadedCardImage ? (
                            <div className="w-20 h-24 rounded-lg overflow-hidden border-2 border-emerald-400 shadow-lg relative bg-black">
                              <img src={uploadedCardImage} alt="Uploaded Officer ID" className="w-full h-full object-cover" />
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border border-black flex items-center justify-center">
                                <BadgeCheck className="w-3 h-3 text-white" />
                              </div>
                            </div>
                          ) : (
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
                          )}

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
                          <div className="w-8 h-6 rounded bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-600 border border-yellow-200 shadow-sm flex items-center justify-center p-0.5">
                            <Cpu className="w-4 h-4 text-slate-900" />
                          </div>
                          <div className="text-[9px] font-mono text-slate-400">
                            <div>EMV-256 ENCRYPTED</div>
                            <div className="text-emerald-400 font-bold">ACTIVE // VERIFIED</div>
                          </div>
                        </div>
                        <QrCode className="w-6 h-6 text-amber-300" />
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

              {/* RIGHT COLUMN: INTERACTIVE AUTHENTICATION GATEWAY */}
              <div className="lg:col-span-6 flex flex-col justify-between">
                <GlassPanel glow="blue" className="p-6 border border-slate-800 bg-slate-900/95 shadow-2xl flex flex-col justify-between h-full">
                  <div>
                    {/* Auth Mode Toggle Tabs */}
                    <div className="flex rounded-xl p-1 bg-black/40 border border-slate-800 mb-5">
                      <button
                        type="button"
                        onClick={() => setAuthMode('card_scan')}
                        className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          authMode === 'card_scan'
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 shadow-md font-bold'
                            : 'text-slate-400 hover:text-white'
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
                            ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-md font-bold'
                            : 'text-slate-400 hover:text-white'
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
                            <span className="text-[10px] text-amber-300 font-mono">PIN: 7729</span>
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
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                      <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Official Secrets Act (OSA) Protected
                      </span>
                      <span>SHA-256 AUDIT LOGGED</span>
                    </div>
                    <p className="text-[9px] text-slate-400 font-medium">
                      Unauthorized access or tampering is strictly prohibited and punishable under Sec 43/66 of the IT Act, 2000 & Indian Penal Code.
                    </p>
                  </div>
                </GlassPanel>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
