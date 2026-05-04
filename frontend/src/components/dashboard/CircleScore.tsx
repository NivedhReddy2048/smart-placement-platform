import React from 'react';

const CIRC = 2 * Math.PI * 44;

interface CircleScoreProps {
  value: number;
  label: string;
  size?: number;
}

function getColor(value: number): string {
  if (value >= 80) return '#10b981'; // emerald
  if (value >= 60) return '#f59e0b'; // amber
  return '#f43f5e'; // rose
}

export default function CircleScore({ value, label, size = 110 }: CircleScoreProps) {
  const r = 44;
  const strokeWidth = 8;
  const circ = 2 * Math.PI * r;
  const offset = circ - (circ * Math.min(value, 100)) / 100;
  const color = getColor(value);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          className="-rotate-90"
        >
          {/* Track */}
          <circle
            cx="50"
            cy="50"
            r={r}
            strokeWidth={strokeWidth}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
          />
          {/* Progress */}
          <circle
            cx="50"
            cy="50"
            r={r}
            strokeWidth={strokeWidth}
            fill="none"
            stroke={color}
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-black text-white leading-none">
            {value > 0 ? `${value}` : '–'}
          </span>
        </div>
      </div>
      <span className="text-xs font-bold text-white/60 uppercase tracking-widest text-center leading-tight">
        {label}
      </span>
    </div>
  );
}
