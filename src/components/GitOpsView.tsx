import React from 'react';
import { argoApps, deployments, ArgoApp, PipelineStage } from '@/data/platform';
import { useAuth } from '@/contexts/AuthContext';
import { GitBranch, GitCommit, RefreshCw, CheckCircle2, XCircle, Loader2, HelpCircle, Circle, User } from 'lucide-react';

const syncStyle: Record<ArgoApp['syncStatus'], { color: string; icon: React.ElementType }> = {
  Synced: { color: '#00FF88', icon: CheckCircle2 },
  OutOfSync: { color: '#FFB800', icon: RefreshCw },
  Progressing: { color: '#00D9FF', icon: Loader2 },
  Unknown: { color: '#64748B', icon: HelpCircle },
};

const healthColor: Record<ArgoApp['health'], string> = {
  Healthy: '#00FF88',
  Degraded: '#FF4D6D',
  Progressing: '#00D9FF',
  Missing: '#FFB800',
};

function StageNode({ stage, isLast }: { stage: PipelineStage; isLast: boolean }) {
  const cfg = {
    done: { color: '#00FF88', icon: CheckCircle2, pulse: false },
    active: { color: '#00D9FF', icon: Loader2, pulse: true },
    failed: { color: '#FF4D6D', icon: XCircle, pulse: false },
    pending: { color: '#334155', icon: Circle, pulse: false },
  }[stage.status];
  const Icon = cfg.icon;
  return (
    <div className="flex items-center flex-1 min-w-0 last:flex-none">
      <div className="flex flex-col items-center gap-1.5 shrink-0">
        <Icon
          size={20}
          style={{ color: cfg.color }}
          className={stage.status === 'active' ? 'animate-spin' : ''}
        />
        <span className="text-[9px] font-mono whitespace-nowrap" style={{ color: stage.status === 'pending' ? '#475569' : cfg.color }}>
          {stage.name}
        </span>
      </div>
      {!isLast && (
        <div className="flex-1 h-px mx-2 mb-4 relative overflow-hidden" style={{ backgroundColor: stage.status === 'done' ? '#00FF8840' : '#1B2438' }}>
          {stage.status === 'done' && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00FF88] to-transparent w-1/2 animate-[shimmer_2s_infinite]" />}
        </div>
      )}
    </div>
  );
}

export default function GitOpsView() {
  const { requireAuth } = useAuth();
  const [apps, setApps] = React.useState(argoApps);
  const [syncing, setSyncing] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState<'all' | 'Synced' | 'OutOfSync'>('all');

  const handleSync = (id: string) => {
    if (!requireAuth()) return;
    setSyncing(id);
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, syncStatus: 'Progressing' as const, health: 'Progressing' as const } : a)));
    setTimeout(() => {
      setApps((prev) => prev.map((a) => (a.id === id ? { ...a, syncStatus: 'Synced' as const, health: 'Healthy' as const, lastSync: 'just now' } : a)));
      setSyncing(null);
    }, 2500);
  };

  const filtered = apps.filter((a) => filter === 'all' || a.syncStatus === filter);
  const outOfSync = apps.filter((a) => a.syncStatus === 'OutOfSync').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><GitBranch className="text-[#00D9FF]" size={20} /> GitOps · ArgoCD</h2>
          <p className="text-sm text-slate-500 mt-1">Declarative sync status across {new Set(apps.map((a) => a.cluster)).size} clusters · {outOfSync} apps drifted</p>
        </div>
        <div className="flex gap-2">
          {(['all', 'Synced', 'OutOfSync'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-colors ${
                filter === f ? 'border-[#00D9FF] text-[#00D9FF] bg-[#00D9FF]/10' : 'border-[#1B2438] text-slate-400 hover:text-white'
              }`}
            >
              {f === 'all' ? `All (${apps.length})` : f}
            </button>
          ))}
        </div>
      </div>

      {/* Deployment pipelines */}
      <div>
        <h3 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">Active Pipelines</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {deployments.map((d) => (
            <div key={d.id} className="rounded-xl border border-[#1B2438] bg-[#0D1424] p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="font-mono text-sm text-white font-bold">{d.app}</span>
                  <span className="ml-2 text-xs font-mono text-[#00D9FF]">{d.version}</span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2">
                  <User size={11} /> {d.author} · {d.time}
                </div>
              </div>
              <div className="flex items-start">
                {d.stages.map((s, i) => (
                  <StageNode key={s.name} stage={s} isLast={i === d.stages.length - 1} />
                ))}
              </div>
              <div className="mt-3 text-[11px] font-mono text-slate-600">→ {d.cluster}</div>
            </div>
          ))}
        </div>
      </div>

      {/* App table */}
      <div>
        <h3 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">Applications</h3>
        <div className="rounded-xl border border-[#1B2438] bg-[#0D1424] overflow-x-auto">
          <table className="w-full text-sm min-w-[820px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-slate-500 border-b border-[#1B2438]">
                <th className="px-5 py-3 font-medium">Application</th>
                <th className="px-4 py-3 font-medium">Cluster / Namespace</th>
                <th className="px-4 py-3 font-medium">Sync</th>
                <th className="px-4 py-3 font-medium">Health</th>
                <th className="px-4 py-3 font-medium">Revision</th>
                <th className="px-4 py-3 font-medium">Last Sync</th>
                <th className="px-4 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => {
                const sync = syncStyle[a.syncStatus];
                const SyncIcon = sync.icon;
                return (
                  <tr key={a.id} className="border-b border-[#131B2E] hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-mono text-white">{a.name}</div>
                      <div className="text-[11px] text-slate-600 truncate max-w-[200px]">{a.repo}</div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-slate-400">{a.cluster}<span className="text-slate-600"> / {a.namespace}</span></td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1.5 text-xs font-mono" style={{ color: sync.color }}>
                        <SyncIcon size={13} className={a.syncStatus === 'Progressing' ? 'animate-spin' : ''} /> {a.syncStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-mono" style={{ color: healthColor[a.health] }}>{a.health}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 text-xs font-mono text-[#A78BFA]"><GitCommit size={12} /> {a.revision}</span>
                    </td>
                    <td className="px-4 py-3.5 text-xs font-mono text-slate-500">{a.lastSync}</td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => handleSync(a.id)}
                        disabled={syncing === a.id || a.syncStatus === 'Synced'}
                        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[#00D9FF]/40 text-[#00D9FF] hover:bg-[#00D9FF]/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <RefreshCw size={12} className={syncing === a.id ? 'animate-spin' : ''} /> Sync
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
