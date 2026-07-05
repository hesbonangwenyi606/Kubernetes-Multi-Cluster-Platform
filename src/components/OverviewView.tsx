import React from 'react';
import { Cluster, argoApps, deployments, statusColors } from '@/data/platform';
import TopologyHero from '@/components/TopologyHero';
import { ViewKey } from '@/components/Sidebar';
import { GitBranch, Package, Activity, Network, ArrowRight, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface OverviewViewProps {
  clusterList: Cluster[];
  onNavigate: (v: ViewKey) => void;
  onSelectCluster: (id: string) => void;
  unackedAlerts: number;
}

export default function OverviewView({ clusterList, onNavigate, onSelectCluster, unackedAlerts }: OverviewViewProps) {
  const synced = argoApps.filter((a) => a.syncStatus === 'Synced').length;

  const quickLinks: { key: ViewKey; label: string; desc: string; icon: React.ElementType; stat: string; color: string }[] = [
    { key: 'gitops', label: 'GitOps · ArgoCD', desc: 'Sync status & pipelines', icon: GitBranch, stat: `${synced}/${argoApps.length} synced`, color: '#00D9FF' },
    { key: 'mesh', label: 'Service Mesh', desc: 'Istio traffic topology', icon: Network, stat: '9 services · mTLS', color: '#A78BFA' },
    { key: 'helm', label: 'Helm Charts', desc: 'Curated repository', icon: Package, stat: '18 charts', color: '#00FF88' },
    { key: 'metrics', label: 'Prometheus', desc: 'Federated metrics', icon: Activity, stat: `${unackedAlerts} firing alerts`, color: '#FFB800' },
  ];

  return (
    <div className="space-y-8">
      <TopologyHero onSelectCluster={onSelectCluster} onExplore={() => onNavigate('clusters')} />

      {/* quick links */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {quickLinks.map((q) => {
          const Icon = q.icon;
          return (
            <button
              key={q.key}
              onClick={() => onNavigate(q.key)}
              className="rounded-xl border border-[#1B2438] bg-[#0D1424] p-5 text-left hover:border-[#2A3A5C] transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${q.color}12`, border: `1px solid ${q.color}35` }}>
                  <Icon size={18} style={{ color: q.color }} />
                </div>
                <ArrowRight size={15} className="text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
              <div className="mt-3 font-semibold text-white text-sm">{q.label}</div>
              <div className="text-xs text-slate-500">{q.desc}</div>
              <div className="mt-2 text-[11px] font-mono" style={{ color: q.color }}>{q.stat}</div>
            </button>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* cluster health summary */}
        <div className="rounded-xl border border-[#1B2438] bg-[#0D1424] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Cluster Health</h3>
            <button onClick={() => onNavigate('clusters')} className="text-xs text-[#00D9FF] hover:underline">Manage fleet →</button>
          </div>
          <div className="space-y-2.5">
            {clusterList.map((c) => (
              <button
                key={c.id}
                onClick={() => onSelectCluster(c.id)}
                className="w-full flex items-center gap-3 rounded-lg bg-[#0B0F1A] border border-[#131B2E] px-4 py-3 hover:border-[#2A3A5C] transition-colors text-left"
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: statusColors[c.status] }} />
                <span className="font-mono text-xs text-white flex-1 truncate">{c.name}</span>
                <span className="text-[11px] font-mono text-slate-500 hidden sm:block">{c.region}</span>
                <span className="text-[11px] font-mono text-slate-400 w-16 text-right">CPU {c.cpu}%</span>
                <span className="text-[11px] font-mono text-slate-400 w-16 text-right">{c.pods} pods</span>
              </button>
            ))}
          </div>
        </div>

        {/* recent deployments */}
        <div className="rounded-xl border border-[#1B2438] bg-[#0D1424] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Recent Deployments</h3>
            <button onClick={() => onNavigate('gitops')} className="text-xs text-[#00D9FF] hover:underline">View pipelines →</button>
          </div>
          <div className="space-y-2.5">
            {deployments.map((d) => {
              const failed = d.stages.some((s) => s.status === 'failed');
              const active = d.stages.some((s) => s.status === 'active');
              const Icon = failed ? XCircle : active ? Loader2 : CheckCircle2;
              const color = failed ? '#FF4D6D' : active ? '#00D9FF' : '#00FF88';
              return (
                <div key={d.id} className="flex items-center gap-3 rounded-lg bg-[#0B0F1A] border border-[#131B2E] px-4 py-3">
                  <Icon size={15} style={{ color }} className={active ? 'animate-spin' : ''} />
                  <span className="font-mono text-xs text-white flex-1 truncate">{d.app} <span className="text-[#00D9FF]">{d.version}</span></span>
                  <span className="text-[11px] font-mono text-slate-500 hidden sm:block">{d.cluster}</span>
                  <span className="text-[11px] font-mono text-slate-500">{d.time}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
