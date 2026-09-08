import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Network, Lock, User, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { GlassPanel } from '../components/GlassPanel';
import { CyberBackground } from '../components/CyberBackground';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('demo');
  const [password, setPassword] = useState('demo');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(username, password)) {
      navigate('/');
    } else {
      setError('Invalid credentials. For hackathon demo, use "demo" / "demo"');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-[#A952B9] overflow-hidden">
      <CyberBackground />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative z-10 w-full max-w-md"
      >
        <GlassPanel glow="purple" className="p-8 border border-white/25 bg-[#2d0932]/90 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-fuchsia-600 to-purple-800 shadow-glassGlow border border-white/30 text-white mb-4">
              <Network className="w-8 h-8" />
            </div>

            <div className="flex items-center justify-center gap-2 mb-1">
              <h1 className="text-2xl font-extrabold tracking-wider text-white font-display">
                CNAS
              </h1>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/20 text-purple-100 border border-white/30 font-semibold">
                v1.0-RC
              </span>
            </div>
            <p className="text-xs text-purple-200 font-medium">
              Criminal Network Analysis System • Team Shadow Trace
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-300/40 text-rose-200 text-xs text-center font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-purple-100 mb-1.5 flex items-center justify-between">
                <span>Investigator ID / Username</span>
                <span className="text-[10px] text-purple-300 font-mono">Demo: demo</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-purple-300" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter badge ID or username"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/20 text-white text-sm focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all placeholder:text-purple-300/60 font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-purple-100 mb-1.5 flex items-center justify-between">
                <span>Security Clearance Key / Password</span>
                <span className="text-[10px] text-purple-300 font-mono">Demo: demo</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-purple-300" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/20 text-white text-sm focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all placeholder:text-purple-300/60 font-medium"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-3 py-3 px-4 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-700 hover:from-fuchsia-500 hover:to-purple-600 active:scale-[0.99] text-white text-sm font-semibold shadow-lg border border-white/30 flex items-center justify-center gap-2 transition-all cursor-pointer group"
            >
              <span>Access Intelligence Console</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </form>

          {/* SIH Hackathon Demo Callout */}
          <div className="mt-6 pt-4 border-t border-white/15 text-center">
            <div className="inline-flex items-center gap-1.5 text-[11px] text-emerald-300 font-semibold bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-400/40">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span>Official Intelligence Console • Pre-configured</span>
            </div>
            <p className="text-[10px] text-purple-200 mt-2">
              Gated with mock session context for hackathon judging. Production supports JWT & Role-Based Access Control.
            </p>
          </div>
        </GlassPanel>
      </motion.div>
    </div>
  );
};
