import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const HumanInTheLoopBanner: React.FC = () => {
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    return sessionStorage.getItem('cnas_hitl_dismissed') === 'true';
  });

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('cnas_hitl_dismissed', 'true');
  };

  if (isDismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
        className="mb-4 rounded-2xl p-3.5 bg-amber-500/20 border border-amber-300/50 backdrop-blur-xl flex items-center justify-between gap-3 text-amber-100 text-xs shadow-glowAmber"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-400/30 text-amber-200 flex-shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <span className="font-medium leading-relaxed">
            <strong className="text-amber-200 font-bold">Investigative Compliance Notice:</strong> This system surfaces topological patterns and correlation anomalies only — it does not determine guilt. All leads require human investigator validation.
          </span>
        </div>
        <button
          onClick={handleDismiss}
          className="p-1 text-amber-200 hover:text-white hover:bg-amber-400/20 rounded-md transition-colors cursor-pointer"
          title="Dismiss notice"
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};
