import React from 'react';
import { helmCharts, helmCategories, clusters, HelmChart } from '@/data/platform';
import { useAuth } from '@/contexts/AuthContext';
import { Package, Star, Search, Download, CheckCircle2, X, Loader2 } from 'lucide-react';

const catColor: Record<HelmChart['category'], string> = {
  Monitoring: '#00D9FF',
  Networking: '#A78BFA',
  Database: '#00FF88',
  Security: '#FF4D6D',
  'CI/CD': '#FFB800',
  Storage: '#38BDF8',
  Messaging: '#F472B6',
};

export default function HelmView() {
  const { requireAuth } = useAuth();
  const [search, setSearch] = React.useState('');
  const [category, setCategory] = React.useState<string>('All');
  const [installTarget, setInstallTarget] = React.useState<HelmChart | null>(null);
  const [selectedCluster, setSelectedCluster] = React.useState(clusters[0].id);
  const [installing, setInstalling] = React.useState(false);
  const [installedMap, setInstalledMap] = React.useState<Record<string, string[]>>(
    Object.fromEntries(helmCharts.map((c) => [c.id, c.installed]))
  );
  const [toast, setToast] = React.useState<string | null>(null);

  const filtered = helmCharts.filter(
    (c) =>
      (category === 'All' || c.category === category) &&
      (c.name.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase()))
  );

  const handleInstall = () => {
    if (!installTarget) return;
    setInstalling(true);
    setTimeout(() => {
      setInstalledMap((prev) => ({
        ...prev,
        [installTarget.id]: [...new Set([...(prev[installTarget.id] || []), selectedCluster])],
      }));
      setInstalling(false);
      setToast(`helm install ${installTarget.name} → ${selectedCluster} succeeded`);
      setInstallTarget(null);
      setTimeout(() => setToast(null), 3500);
    }, 1800);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><Package className="text-[#00D9FF]" size={20} /> Helm Chart Repository</h2>
          <p className="text-sm text-slate-500 mt-1">{helmCharts.length} curated charts · one-click deployment to any cluster</p>
        </div>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search charts..."
            className="pl-9 pr-4 py-2 rounded-lg bg-[#0D1424] border border-[#1B2438] text-sm text-white placeholder:text-slate-600 focus:border-[#00D9FF] focus:outline-none w-64 font-mono"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {helmCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-mono border transition-colors ${
              category === cat ? 'border-[#00D9FF] text-[#00D9FF] bg-[#00D9FF]/10' : 'border-[#1B2438] text-slate-400 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((chart) => {
          const installed = installedMap[chart.id] || [];
          const color = catColor[chart.category];
          return (
            <div key={chart.id} className="rounded-xl border border-[#1B2438] bg-[#0D1424] p-5 hover:border-[#2A3A5C] transition-colors flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}12`, border: `1px solid ${color}35` }}>
                  <Package size={18} style={{ color }} />
                </div>
                <span className="text-[10px] font-mono px-2 py-1 rounded-full" style={{ color, backgroundColor: `${color}12` }}>{chart.category}</span>
              </div>
              <div className="font-mono font-bold text-white">{chart.name}</div>
              <div className="text-[11px] font-mono text-slate-600 mb-2">{chart.repo}/{chart.name} · v{chart.version}</div>
              <p className="text-xs text-slate-400 leading-relaxed flex-1">{chart.description}</p>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#131B2E]">
                <span className="flex items-center gap-1 text-[11px] text-[#FFB800] font-mono"><Star size={11} fill="#FFB800" /> {chart.stars.toLocaleString()}</span>
                <span className="text-[11px] font-mono text-slate-500">{installed.length}/{clusters.length} clusters</span>
                <button
                  onClick={() => requireAuth(() => { setInstallTarget(chart); setSelectedCluster(clusters.find((c) => !installed.includes(c.id))?.id || clusters[0].id); })}
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-[#00D9FF]/10 border border-[#00D9FF]/40 text-[#00D9FF] hover:bg-[#00D9FF]/20 transition-colors"
                >
                  <Download size={12} /> Deploy
                </button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16 text-slate-500 text-sm">No charts match "{search}"</div>
        )}
      </div>

      {/* install modal */}
      {installTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => !installing && setInstallTarget(null)}>
          <div className="w-full max-w-md rounded-2xl border border-[#1B2438] bg-[#0D1424] p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white font-mono">helm install {installTarget.name}</h3>
              <button onClick={() => setInstallTarget(null)} className="text-slate-500 hover:text-white"><X size={18} /></button>
            </div>
            <div className="rounded-lg bg-[#0B0F1A] border border-[#1B2438] p-3 font-mono text-[11px] text-slate-400 mb-4">
              $ helm install {installTarget.name} {installTarget.repo}/{installTarget.name} \<br />
              &nbsp;&nbsp;--version {installTarget.version} --namespace {installTarget.name} --create-namespace
            </div>
            <label className="text-xs text-slate-400 mb-2 block">Target cluster</label>
            <div className="space-y-2 mb-5">
              {clusters.map((c) => {
                const already = (installedMap[installTarget.id] || []).includes(c.id);
                return (
                  <button
                    key={c.id}
                    disabled={already}
                    onClick={() => setSelectedCluster(c.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm font-mono transition-colors ${
                      already
                        ? 'border-[#1B2438] text-slate-600 cursor-not-allowed'
                        : selectedCluster === c.id
                        ? 'border-[#00D9FF] text-[#00D9FF] bg-[#00D9FF]/10'
                        : 'border-[#1B2438] text-slate-300 hover:border-[#2A3A5C]'
                    }`}
                  >
                    <span>{c.name}</span>
                    {already ? <span className="flex items-center gap-1 text-[11px] text-[#00FF88]"><CheckCircle2 size={12} /> installed</span> : <span className="text-[11px] text-slate-500">{c.region}</span>}
                  </button>
                );
              })}
            </div>
            <button
              onClick={handleInstall}
              disabled={installing}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#00D9FF] text-[#04121A] font-semibold text-sm hover:bg-[#3AE3FF] disabled:opacity-60 transition-colors"
            >
              {installing ? <><Loader2 size={15} className="animate-spin" /> Installing release...</> : <><Download size={15} /> Deploy Release</>}
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg border border-[#00FF88]/40 bg-[#0D1424] px-4 py-3 text-sm font-mono text-[#00FF88] shadow-2xl animate-in slide-in-from-bottom duration-300">
          <CheckCircle2 size={15} /> {toast}
        </div>
      )}
    </div>
  );
}
