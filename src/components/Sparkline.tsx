import React from 'react';

interface SparklineProps {
  data: number[];
  color: string;
  height?: number;
  filled?: boolean;
}

export default function Sparkline({ data, color, height = 40, filled = true }: SparklineProps) {
  if (data.length < 2) return null;
  const w = 100;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = height - 4 - ((v - min) / range) * (height - 8);
    return `${x},${y}`;
  });
  const path = `M${pts.join(' L')}`;
  const area = `${path} L${w},${height} L0,${height} Z`;
  const gid = React.useId();

  return (
    <svg viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" className="w-full" style={{ height }}>
      {filled && (
        <>
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.35" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill={`url(#${gid})`} />
        </>
      )}
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </svg>
  );
}
