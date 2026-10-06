'use client';

import React from 'react';

interface ProgressBarProps {
  progress: number;
  textColor?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ProgressBar({
  progress,
  textColor,
  showLabel = true,
  size = 'md',
  className = '',
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, Math.round(progress)));

  // Height configurations
  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  // Color gradient depending on completion
  const getGradient = (pct: number) => {
    if (pct >= 100) return 'from-emerald-500 to-teal-400';
    if (pct >= 60) return 'from-indigo-500 to-cyan-400';
    if (pct >= 25) return 'from-amber-500 to-indigo-500';
    return 'from-rose-500 to-amber-500';
  };

  return (
    <div className={`w-full flex items-center gap-3 ${className}`}>
      <div className={`flex-1 bg-black/30 backdrop-blur-sm rounded-full overflow-hidden p-0.5 border border-white/10 ${heightClasses[size]}`}>
        <div
          className={`h-full rounded-full bg-gradient-to-r ${getGradient(
            clamped
          )} transition-all duration-500 ease-out shadow-sm`}
          style={{ width: `${clamped}%` }}
        />
      </div>

      {showLabel && (
        <span
          className="text-xs font-semibold tabular-nums min-w-[38px] text-right"
          style={{ color: textColor || 'currentColor' }}
        >
          {clamped}%
        </span>
      )}
    </div>
  );
}
