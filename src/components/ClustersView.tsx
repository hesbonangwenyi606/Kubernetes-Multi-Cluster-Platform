import React from 'react';
import { Cluster, genSeries } from '@/data/platform';
import ClusterCard from '@/components/ClusterCard';
import { useAuth } from '@/contexts/AuthContext';
import { Boxes, Plus, X, Loader2, ShieldCheck } from 'lucide-react';

interface ClustersViewProps {
  clusterList: Cluster[];
  onAdd: (name: string, provider: Cluster['provider'], region: string) => void;
  onRemove: (id: string) => void;
}

const rbacPolicies = [
  { role: 'platform-admin', subjects: 'group:sre-team', verbs: 'get, list, create, update, delete', scope: 'cluster-wide' },
  { role: 'app-developer', subjects: 'group:eng-payments, group:eng-storefront', verbs: 'get, list, update', scope: 'namespace-scoped' },
  { role: 'read-only-auditor', subjects: 'group:security-audit', verbs: 'get, list, watch', scope: 'cluster-wide' },
  { role: 'ci-deployer', subjects: 'sa:argocd-application-controller', verbs: 'get, create, patch, delete', scope: 'namespace-scoped' },
];

export default function ClustersView({ clusterList, onAdd, onRemove }: ClustersViewProps) {
  const { requireAuth } = useAuth();
  const [expanded, setExpanded] = React.useState<string | null>(null);
  const [showAdd, setShowAdd] = React.useState(false);
  const [name, setName] = React.useState('');
  const [provider, setProvider] = React.useState<Cluster['provider']>('AWS');
  const [region, setRegion] = React.useState('');
  const [connecting, setConnecting] = React.useState(false);
  const [error, setError] = React.useState('');

  // stable series per cluster
  const seriesRef = React.useRef<Record<string, number[]>>({});
  clusterList.forEach((c) => {
    if (!seriesRef.current[c.id]) seriesRef.current[c.id] = genSeries(c.cpu, 15);
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !region.trim()) {
      setError('Cluster name and region are required.');
      return;
    }
    setError('');
    setConnecting(true);
    setTimeout(() => {
      onAdd(name.trim().toLowerCase().replace(/\s+/g, '-'), provider, region.trim());
      setConnecting(false);
      setShowAdd(false);
      setName('');
      setRegion('');
    }, 1500);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><Boxes className="text-[#00D9FF]" size={20} /> Cluster Fleet</h2>
          <p className="text-sm text-slate-500 mt-1">{clusterList.length} clusters registered · click a card to expand details</p>
        </div>
        <button
          onClick={() => requireAuth(() => setShowAdd(true))}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00D9FF] text-[#04121A] font-semibold text-sm hover:bg-[#3AE3FF] transition-colors"
        >
          <Plus size={15} /> Register Cluster
        </button>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {clusterList.map((c) => (
          <ClusterCard
            key={c.id}
            cluster={c}
            cpuSeries={seriesRef.current[c.id]}
            expanded={expanded === c.id}
            onToggle={() => setExpanded(expanded === c.id ? null : c.id)}
            onRemove={() => requireAuth(() => onRemove(c.id))}
          />
        ))}
      </div>

      {/* RBAC */}
      <div>
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
          <ShieldCheck size={15} className="text-[#00FF88]" /> Fleet RBAC Policies
        </h3>
        <div className="rounded-xl border border-[#1B2438] bg-[#0D1424] overflow-x-auto">
          <table className="w-full text-sm min-w-[680px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-slate-500 border-b border-[#1B2438]">
                <th className="px-5 py-3 font-medium">ClusterRole</th>
                <th className="px-4 py-3 font-medium">Subjects</th>
                <th className="px-4 py-3 font-medium">Verbs</th>
                <th className="px-4 py-3 font-medium">Scope</th>
              </tr>
            </thead>
            <tbody>
              {rbacPolicies.map((p) => (
                <tr key={p.role} className="border-b border-[#131B2E] last:border-0 hover:bg-white/[0.02]">
                  <td className="px-5 py-3.5 font-mono text-[#00D9FF] text-xs">{p.role}</td>
                  <td className="px-4 py-3.5 font-mono text-xs text-slate-300">{p.subjects}</td>
                  <td className="px-4 py-3.5 font-mono text-xs text-slate-400">{p.verbs}</td>
                  <td className="px-4 py-3.5">
                    <span className={`text-[10px] font-mono px-2 py-1 rounded-full ${p.scope === 'cluster-wide' ? 'bg-[#A78BFA]/10 text-[#A78BFA]' : 'bg-[#00FF88]/10 text-[#00FF88]'}`}>
                      {p.scope}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* add modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => !connecting && setShowAdd(false)}>
          <form onSubmit={handleAdd} className="w-full max-w-md rounded-2xl border border-[#1B2438] bg-[#0D1424] p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-white">Register New Cluster</h3>
              <button type="button" onClick={() => setShowAdd(false)} className="text-slate-500 hover:text-white"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Cluster name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="prod-us-west"
                  className="w-full px-3 py-2.5 rounded-lg bg-[#0B0F1A] border border-[#1B2438] text-sm text-white font-mono placeholder:text-slate-600 focus:border-[#00D9FF] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Provider</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['AWS', 'GCP', 'Azure', 'On-Prem'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setProvider(p)}
                      className={`py-2 rounded-lg text-xs font-mono border transition-colors ${provider === p ? 'border-[#00D9FF] text-[#00D9FF] bg-[#00D9FF]/10' : 'border-[#1B2438] text-slate-400'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Region</label>
                <input
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="us-west-2"
                  className="w-full px-3 py-2.5 rounded-lg bg-[#0B0F1A] border border-[#1B2438] text-sm text-white font-mono placeholder:text-slate-600 focus:border-[#00D9FF] focus:outline-none"
                />
              </div>
              {error && <p className="text-xs text-[#FF4D6D]">{error}</p>}
              <div className="rounded-lg bg-[#0B0F1A] border border-[#1B2438] p-3 font-mono text-[10px] text-slate-500">
                $ fleetctl register --name {name || '<name>'} --context {provider.toLowerCase()}:{region || '<region>'}
              </div>
              <button
                type="submit"
                disabled={connecting}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#00D9FF] text-[#04121A] font-semibold text-sm hover:bg-[#3AE3FF] disabled:opacity-60 transition-colors"
              >
                {connecting ? <><Loader2 size={15} className="animate-spin" /> Establishing tunnel...</> : 'Connect Cluster'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
