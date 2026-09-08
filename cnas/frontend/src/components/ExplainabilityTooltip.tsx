import React, { useState } from 'react';
import { HelpCircle, Sparkles, X, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ExplainabilityTooltipProps {
  reason?: string;
  title?: string;
  entityName?: string;
}

export const ExplainabilityTooltip: React.FC<ExplainabilityTooltipProps> = ({
  reason = 'Pattern detected via graph connectivity, betweenness metrics, and high-frequency transaction links.',
  title = 'AI & Link Reasoning',
  entityName,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white border border-white/30 transition-all cursor-pointer font-semibold shadow-xs"
        title="View AI and graph evidence reasoning"
      >
        <HelpCircle className="w-3.5 h-3.5 text-purple-200" />
        <span>Why?</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px]"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -4 }}
              transition={{ duration: 0.18 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute z-50 right-0 mt-2 w-72 sm:w-84 p-4 rounded-2xl bg-[#2d0932] border border-white/30 shadow-2xl text-slate-100"
            >
              <div className="flex items-start justify-between gap-2 mb-2 pb-2.5 border-b border-white/15">
                <div className="flex items-center gap-1.5 text-fuchsia-300">
                  <Sparkles className="w-4 h-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                    {title}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-purple-300 hover:text-white p-0.5 rounded hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {entityName && (
                <div className="text-xs font-bold text-emerald-300 mb-1.5">
                  Target: {entityName}
                </div>
              )}

              <p className="text-xs text-purple-100 leading-relaxed font-normal">
                {reason}
              </p>

              <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center gap-2 text-[10px] text-purple-200 font-medium">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-300 flex-shrink-0" />
                <span>Requires human investigative verification prior to evidence submission.</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
