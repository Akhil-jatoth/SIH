import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

interface GlassPanelProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  glow?: 'blue' | 'green' | 'red' | 'amber' | 'purple' | 'violet' | 'none';
  interactive?: boolean;
  className?: string;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  glow = 'none',
  interactive = false,
  className,
  ...props
}) => {
  const glowClasses = {
    none: '',
    blue: 'glow-blue hover:border-sky-400',
    green: 'glow-green hover:border-emerald-400',
    red: 'glow-red hover:border-rose-400',
    amber: 'glow-amber hover:border-amber-400',
    purple: 'glow-purple hover:border-fuchsia-300',
    violet: 'glow-purple hover:border-violet-300',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={twMerge(
        'glass-panel p-5 relative overflow-hidden',
        interactive && 'glass-panel-hover cursor-pointer',
        glowClasses[glow],
        className
      )}
      {...props}
    >
      {/* Subtle top edge highlight */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />
      {children}
    </motion.div>
  );
};
