import React from 'react';
import { Cluster, statusColors } from '@/data/platform';
import Sparkline from '@/components/Sparkline';
import { Server, Cpu, MemoryStick, Network, ChevronUp, GitBranch, Shield, Trash2 } from 'lucide-react';

interface ClusterCardProps {
  cluster: Cluster;
  cpuSeries: number[];
  expanded: boolean;
  onToggle: () => void;
  onRemove: () => void;
}

function Bar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-1.5 rounded-full bg-[#1B2438] overflow-hidden">
      <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${value}%`, backgroundColor: color }} />
    </div>
  );
}

export default function ClusterCard({ cluster: c, cpuSeries, expanded, onToggle, onRemove }: ClusterCardProps) {
  const color = statusColors[c.status];
  const cpuColor = c.cpu > 80 ? '#FF4D6D' : c.cpu > 65 ? '#FFB800' : '#00D9FF';
  const memColor = c.memory > 80 ? '#FF4D6D' : c.memory > 65 ? '#FFB800' : '#00FF88';

  return (
    <div className="rounded-xl border border-[#1B2438] bg-[#0D1424] hover:border-[#2A3A5C] transition-colors overflow-hidden">
      <button onClick={onToggle} className="w-full text-left p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15`, border: `1px solid ${color}40` }}>
              <Server size={18} style={{ color }} />
            </div>
            <div>
              <div className="font-bold text-white font-mono text-sm">{c.name}</div>
              <div className="text-[11px] text-slate-500">{c.provider} · {c.region} · {c.version}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full"
              style={{ color, backgroundColor: `${color}15` }}
            >
              {c.status}
            </span>
            {expanded ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
          </div>
        </div>

        <div className="mt-4">
          <Sparkline data={cpuSeries} color={cpuColor} height={36} />
        </div>

        <div className="mt-3 space-y-2.5 text-xs">
          <div>
            <div className="flex justify-between mb-1 text-slate-400">
              <span className="flex items-center gap-1.5"><Cpu size={12} /> CPU</span>
              <span className="font-mono" style={{ color: cpuColor }}>{c.cpu}%</span>
            </div>
            <Bar value={c.cpu} color={cpuColor} />
          </div>
          <div>
            <div className="flex justify-between mb-1 text-slate-400">
              <span className="flex items-center gap-1.5"><MemoryStick size={12} /> Memory</span>
              <span className="font-mono" style={{ color: memColor }}>{c.memory}%</span>
            </div>
            <Bar value={c.memory} color={memColor} />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <span>{c.nodes} nodes</span>
          <span>{c.pods} pods</span>
          <span>{c.namespaces} ns</span>
          <span className="flex items-center gap-1" style={{ color: c.argoSynced === c.argoTotal ? '#00FF88' : '#FFB800' }}>
            <GitBranch size={11} /> {c.argoSynced}/{c.argoTotal}
          </span>
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 pt-1 border-t border-[#1B2438] animate-in fade-in duration-300">
          <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
            <div className="rounded-lg bg-[#0B0F1A] border border-[#1B2438] p-3">
              <div className="text-slate-500 flex items-center gap-1.5 mb-1"><Network size={12} /> Network I/O</div>
              <div className="font-mono text-white text-lg">{c.network} <span className="text-xs text-slate-500">MB/s</span></div>
            </div>
            <div className="rounded-lg bg-[#0B0F1A] border border-[#1B2438] p-3">
              <div className="text-slate-500 flex items-center gap-1.5 mb-1"><Shield size={12} /> Istio Mesh</div>
              <div className="font-mono text-lg" style={{ color: c.istioEnabled ? '#00FF88' : '#64748B' }}>
                {c.istioEnabled ? 'ENABLED' : 'DISABLED'}
              </div>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[#FF4D6D]/40 text-[#FF4D6D] hover:bg-[#FF4D6D]/10 transition-colors"
            >
              <Trash2 size={12} /> Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
