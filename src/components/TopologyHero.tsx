import React from 'react';
import { clusters, statusColors, Cluster } from '@/data/platform';
import { Server, ArrowRight } from 'lucide-react';

interface TopologyHeroProps {
  onSelectCluster: (id: string) => void;
  onExplore: () => void;
}

const edges: [number, number][] = [
  [0, 1], [1, 2], [0, 3], [3, 4], [1, 4], [2, 4], [0, 1],
];

export default function TopologyHero({ onSelectCluster, onExplore }: TopologyHeroProps) {
  const [hovered, setHovered] = React.useState<Cluster | null>(null);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-[#1B2438] bg-gradient-to-br from-[#0B1120] via-[#0D1526] to-[#0B0F1A]">
      {/* grid backdrop */}
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: 'linear-gradient(#1E3A5F 1px, transparent 1px), linear-gradient(90deg, #1E3A5F 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      <div className="relative grid lg:grid-cols-5 gap-6 p-6 lg:p-10">
        <div className="lg:col-span-2 flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 text-[11px] font-mono text-[#00FF88] mb-4">
            <span className="w-2 h-2 rounded-full bg-[#00FF88] animate-pulse" />
            CONTROL PLANE CONNECTED · 5 CLUSTERS
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-white leading-tight">
            Enterprise Kubernetes,
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#00D9FF] to-[#00FF88]">
              orchestrated across every cloud.
            </span>
          </h1>
          <p className="mt-4 text-slate-400 text-sm leading-relaxed">
            GitOps-driven fleet management with ArgoCD sync, Istio service mesh observability,
            Helm release automation, and Prometheus monitoring — unified in a single ops plane.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={onExplore}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#00D9FF] text-[#04121A] font-semibold text-sm hover:bg-[#3AE3FF] transition-colors"
            >
              Explore Clusters <ArrowRight size={16} />
            </button>
            <button
              onClick={() => onSelectCluster('edge-onprem')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[#FF4D6D]/50 text-[#FF4D6D] font-semibold text-sm hover:bg-[#FF4D6D]/10 transition-colors"
            >
              1 Critical Cluster
            </button>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-4">
            {[
              { label: 'Total Nodes', value: clusters.reduce((s, c) => s + c.nodes, 0) },
              { label: 'Running Pods', value: clusters.reduce((s, c) => s + c.pods, 0).toLocaleString() },
              { label: 'Argo Apps', value: clusters.reduce((s, c) => s + c.argoTotal, 0) },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-bold font-mono text-white">{s.value}</div>
                <div className="text-[11px] text-slate-500 uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* topology svg */}
        <div className="lg:col-span-3 relative min-h-[320px]">
          <svg viewBox="0 0 100 90" className="w-full h-full absolute inset-0" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="edgeGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#00D9FF" stopOpacity="0.1" />
                <stop offset="50%" stopColor="#00D9FF" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#00D9FF" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            {edges.map(([a, b], i) => {
              const ca = clusters[a];
              const cb = clusters[b];
              return (
                <g key={i}>
                  <line x1={ca.x} y1={ca.y} x2={cb.x} y2={cb.y} stroke="url(#edgeGrad)" strokeWidth="0.35" />
                  <circle r="0.7" fill="#00D9FF">
                    <animateMotion
                      dur={`${3 + i * 0.7}s`}
                      repeatCount="indefinite"
                      path={`M${ca.x},${ca.y} L${cb.x},${cb.y}`}
                    />
                  </circle>
                </g>
              );
            })}
            {clusters.map((c) => {
              const color = statusColors[c.status];
              return (
                <g
                  key={c.id}
                  className="cursor-pointer"
                  onClick={() => onSelectCluster(c.id)}
                  onMouseEnter={() => setHovered(c)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <circle cx={c.x} cy={c.y} r="6" fill={color} opacity="0.12">
                    <animate attributeName="r" values="5;7;5" dur="3s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={c.x} cy={c.y} r="3.2" fill="#0B1120" stroke={color} strokeWidth="0.5" />
                  <circle cx={c.x} cy={c.y} r="1.1" fill={color} />
                  <text x={c.x} y={c.y + 6.5} textAnchor="middle" fill="#94A3B8" fontSize="2.4" fontFamily="monospace">
                    {c.name}
                  </text>
                </g>
              );
            })}
          </svg>
          {hovered && (
            <div
              className="absolute pointer-events-none bg-[#0B0F1A]/95 border border-[#1B2438] rounded-lg px-4 py-3 text-xs font-mono shadow-2xl z-10"
              style={{ left: `${hovered.x}%`, top: `${Math.max(0, hovered.y - 28)}%` }}
            >
              <div className="flex items-center gap-2 text-white font-bold">
                <Server size={12} style={{ color: statusColors[hovered.status] }} />
                {hovered.name}
              </div>
              <div className="mt-1 text-slate-400">{hovered.provider} · {hovered.region} · {hovered.version}</div>
              <div className="mt-1 flex gap-3 text-slate-300">
                <span>CPU {hovered.cpu}%</span>
                <span>MEM {hovered.memory}%</span>
                <span>{hovered.pods} pods</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
