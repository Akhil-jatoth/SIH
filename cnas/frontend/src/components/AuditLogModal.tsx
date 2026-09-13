import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Hash, X, CheckCircle2, Clock, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { AuditLog } from '../types';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      api.getAuditLogs()
        .then((data) => setLogs(data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex flex-col sm:items-center sm:justify-center sm:p-4 sm:pt-[148px] bg-[#0c131f] sm:bg-black/75 sm:backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          className="w-full h-full sm:h-auto sm:max-w-3xl sm:max-h-[calc(100vh-165px)] flex flex-col sm:rounded-2xl bg-[#0c131f] sm:border sm:border-blue-500/40 shadow-glowBlue overflow-hidden"
        >
          {/* Header */}
          <div className="p-3.5 sm:p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-blue-950/40 to-slate-900/40 shrink-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors sm:hidden flex items-center gap-1 text-xs font-bold font-mono"
              >
                <span>← Back</span>
              </button>
              <div className="p-2 sm:p-2.5 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-400 shadow-sm hidden sm:block">
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h3 className="text-xs sm:text-base font-bold text-slate-100 flex items-center gap-2">
                  <span>Cryptographic Evidence Ledger</span>
                  <span className="text-[9px] sm:text-[10px] font-mono font-semibold px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    VERIFIED
                  </span>
                </h3>
                <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 hidden sm:block">
                  SHA-256 immutable intelligence action audit trails
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer hidden sm:block"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 overflow-y-auto space-y-3.5 flex-1 bg-[#0c131f]">
            {loading ? (
              <div className="py-12 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                Validating cryptographic hashes...
              </div>
            ) : (
              logs.map((log, idx) => (
                <div
                  key={log.id}
                  className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-blue-500/30 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                        BLOCK #{idx + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-200">
                        {log.action}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {log.timestamp}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mb-2.5 font-medium leading-relaxed">
                    {log.details}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Actor: <strong className="text-slate-200">{log.actor}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 font-mono text-slate-300 bg-slate-950 px-2.5 py-1 rounded-lg border border-white/10">
                      <Hash className="w-3.5 h-3.5 text-blue-400" />
                      <span className="truncate max-w-[280px]">Hash: {log.block_hash}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/10 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-400" />
              <span>Zero-knowledge validation ensures courtroom compliance and investigator accountability.</span>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-glowBlue transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
