import React from 'react';
import { meshServices, meshEdges, MeshService } from '@/data/platform';
import { Network, Zap, AlertTriangle, Lock } from 'lucide-react';

function latencyColor(ms: number) {
  if (ms <= 5) return '#00FF88';
  if (ms <= 15) return '#00D9FF';
  if (ms <= 30) return '#FFB800';
  return '#FF4D6D';
}

const tierColor: Record<MeshService['tier'], string> = {
  gateway: '#A78BFA',
  service: '#00D9FF',
  data: '#00FF88',
};

export default function MeshView() {
  const [selected, setSelected] = React.useState<MeshService | null>(null);
  const [showLatency, setShowLatency] = React.useState(true);

  const byId = React.useMemo(() => Object.fromEntries(meshServices.map((s) => [s.id, s])), []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><Network className="text-[#00D9FF]" size={20} /> Service Mesh · Istio</h2>
          <p className="text-sm text-slate-500 mt-1">prod-us-east mesh · {meshServices.length} services · {meshEdges.length} routes · mTLS strict</p>
        </div>
        <button
          onClick={() => setShowLatency((v) => !v)}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-colors ${showLatency ? 'border-[#FFB800] text-[#FFB800] bg-[#FFB800]/10' : 'border-[#1B2438] text-slate-400'}`}
        >
          Latency Heatmap: {showLatency ? 'ON' : 'OFF'}
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* topology */}
        <div className="lg:col-span-2 rounded-xl border border-[#1B2438] bg-[#0B1120] relative overflow-hidden min-h-[420px]">
          <div
            className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(#1E3A5F 1px, transparent 1px)', backgroundSize: '24px 24px' }}
          />
          <svg viewBox="0 0 100 95" className="w-full h-full absolute inset-0 p-2" preserveAspectRatio="xMidYMid meet">
            {meshEdges.map((e, i) => {
              const a = byId[e.from];
              const b = byId[e.to];
              const color = showLatency ? latencyColor(e.latency) : '#2A3A5C';
              return (
                <g key={i}>
                  <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={color} strokeWidth="0.3" opacity="0.5" />
                  <circle r="0.55" fill={color}>
                    <animateMotion dur={`${1.5 + (e.latency / 10)}s`} repeatCount="indefinite" path={`M${a.x},${a.y} L${b.x},${b.y}`} />
                  </circle>
                  {showLatency && (
                    <text x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 - 1} textAnchor="middle" fontSize="1.8" fontFamily="monospace" fill={color}>
                      {e.latency}ms
                    </text>
                  )}
                </g>
              );
            })}
            {meshServices.map((s) => {
              const color = tierColor[s.tier];
              const isSel = selected?.id === s.id;
              const hasErrors = s.errorRate > 1;
              return (
                <g key={s.id} className="cursor-pointer" onClick={() => setSelected(s)}>
                  {hasErrors && (
                    <circle cx={s.x} cy={s.y} r="5" fill="#FF4D6D" opacity="0.15">
                      <animate attributeName="r" values="4;6;4" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <rect
                    x={s.x - 4} y={s.y - 2.6} width="8" height="5.2" rx="1"
                    fill="#0D1424"
                    stroke={isSel ? '#FFFFFF' : hasErrors ? '#FF4D6D' : color}
                    strokeWidth={isSel ? 0.5 : 0.35}
                  />
                  <circle cx={s.x - 2.6} cy={s.y - 1.2} r="0.6" fill={hasErrors ? '#FF4D6D' : color} />
                  <text x={s.x} y={s.y + 0.7} textAnchor="middle" fontSize="1.7" fontFamily="monospace" fill="#E2E8F0">
                    {s.name.length > 14 ? s.name.slice(0, 13) + '…' : s.name}
                  </text>
                  <text x={s.x} y={s.y + 5.5} textAnchor="middle" fontSize="1.5" fontFamily="monospace" fill="#64748B">
                    {s.rps.toLocaleString()} rps
                  </text>
                </g>
              );
            })}
          </svg>
          <div className="absolute bottom-3 left-4 flex gap-4 text-[10px] font-mono">
            {Object.entries(tierColor).map(([tier, color]) => (
              <span key={tier} className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} /> {tier}
              </span>
            ))}
          </div>
        </div>

        {/* detail panel */}
        <div className="rounded-xl border border-[#1B2438] bg-[#0D1424] p-5">
          {selected ? (
            <div className="animate-in fade-in duration-300">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tierColor[selected.tier] }} />
                <h3 className="font-mono font-bold text-white">{selected.name}</h3>
              </div>
              <div className="text-xs text-slate-500 font-mono mb-5">namespace/{selected.namespace}</div>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-[#0B0F1A] border border-[#1B2438] p-3">
                  <span className="text-xs text-slate-400 flex items-center gap-2"><Zap size={13} className="text-[#FFB800]" /> Requests/sec</span>
                  <span className="font-mono text-white">{selected.rps.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-[#0B0F1A] border border-[#1B2438] p-3">
                  <span className="text-xs text-slate-400">P99 Latency</span>
                  <span className="font-mono" style={{ color: latencyColor(selected.latencyP99) }}>{selected.latencyP99}ms</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-[#0B0F1A] border border-[#1B2438] p-3">
                  <span className="text-xs text-slate-400 flex items-center gap-2">
                    {selected.errorRate > 1 && <AlertTriangle size={13} className="text-[#FF4D6D]" />} Error Rate
                  </span>
                  <span className="font-mono" style={{ color: selected.errorRate > 1 ? '#FF4D6D' : '#00FF88' }}>{selected.errorRate}%</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-[#0B0F1A] border border-[#1B2438] p-3">
                  <span className="text-xs text-slate-400 flex items-center gap-2"><Lock size={13} className="text-[#00FF88]" /> mTLS</span>
                  <span className="font-mono text-[#00FF88]">STRICT</span>
                </div>
              </div>
              <div className="mt-5">
                <div className="text-[11px] uppercase tracking-wider text-slate-500 mb-2">Connections</div>
                {meshEdges
                  .filter((e) => e.from === selected.id || e.to === selected.id)
                  .map((e, i) => {
                    const other = e.from === selected.id ? byId[e.to] : byId[e.from];
                    const dir = e.from === selected.id ? '→' : '←';
                    return (
                      <div key={i} className="flex items-center justify-between text-xs font-mono py-1.5 border-b border-[#131B2E] last:border-0">
                        <span className="text-slate-300">{dir} {other.name}</span>
                        <span style={{ color: latencyColor(e.latency) }}>{e.latency}ms</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-16">
              <Network size={32} className="text-slate-700 mb-3" />
              <p className="text-sm text-slate-500">Select a service node to inspect traffic, latency, and mTLS status.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
