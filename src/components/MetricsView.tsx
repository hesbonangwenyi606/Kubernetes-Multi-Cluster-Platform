import React from 'react';
import { metricPanels, clusters, genSeries } from '@/data/platform';
import Sparkline from '@/components/Sparkline';
import { Activity, Pause, Play, RefreshCw } from 'lucide-react';

export default function MetricsView() {
  const [clusterFilter, setClusterFilter] = React.useState('all');
  const [live, setLive] = React.useState(true);
  const [series, setSeries] = React.useState<Record<string, number[]>>(() =>
    Object.fromEntries(metricPanels.map((p) => [p.id, genSeries(p.base, p.variance)]))
  );

  React.useEffect(() => {
    if (!live) return;
    const t = setInterval(() => {
      setSeries((prev) => {
        const next: Record<string, number[]> = {};
        for (const p of metricPanels) {
          const arr = prev[p.id].slice(1);
          const last = arr[arr.length - 1];
          let v = last + (Math.random() - 0.5) * p.variance * 0.6;
          v = Math.max(0, Math.min(p.base + p.variance, v));
          next[p.id] = [...arr, Number(v.toFixed(2))];
        }
        return next;
      });
    }, 2000);
    return () => clearInterval(t);
  }, [live]);

  const refresh = () => setSeries(Object.fromEntries(metricPanels.map((p) => [p.id, genSeries(p.base, p.variance)])));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><Activity className="text-[#00D9FF]" size={20} /> Prometheus Metrics</h2>
          <p className="text-sm text-slate-500 mt-1 font-mono">scrape_interval: 15s · retention: 30d · {live ? 'streaming live' : 'paused'}</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={clusterFilter}
            onChange={(e) => setClusterFilter(e.target.value)}
            className="bg-[#0D1424] border border-[#1B2438] rounded-lg px-3 py-2 text-xs font-mono text-slate-300 focus:border-[#00D9FF] focus:outline-none"
          >
            <option value="all">All clusters (federated)</option>
            {clusters.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <button
            onClick={() => setLive((v) => !v)}
            className={`p-2 rounded-lg border transition-colors ${live ? 'border-[#00FF88]/40 text-[#00FF88]' : 'border-[#1B2438] text-slate-400'}`}
            title={live ? 'Pause streaming' : 'Resume streaming'}
          >
            {live ? <Pause size={15} /> : <Play size={15} />}
          </button>
          <button onClick={refresh} className="p-2 rounded-lg border border-[#1B2438] text-slate-400 hover:text-white transition-colors" title="Refresh">
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {metricPanels.map((p) => {
          const data = series[p.id];
          const current = data[data.length - 1];
          const prev = data[data.length - 2];
          const delta = ((current - prev) / (prev || 1)) * 100;
          return (
            <div key={p.id} className="rounded-xl border border-[#1B2438] bg-[#0D1424] p-4 hover:border-[#2A3A5C] transition-colors">
              <div className="flex items-start justify-between mb-1">
                <div className="text-xs text-slate-400 font-medium">{p.title}</div>
                {live && <span className="w-1.5 h-1.5 rounded-full bg-[#00FF88] animate-pulse mt-1" />}
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-2xl font-bold font-mono" style={{ color: p.color }}>
                  {current >= 1000 ? current.toLocaleString(undefined, { maximumFractionDigits: 0 }) : current}
                </span>
                <span className="text-xs text-slate-500 font-mono">{p.unit}</span>
                <span className={`text-[10px] font-mono ml-auto ${delta >= 0 ? 'text-[#00FF88]' : 'text-[#FF4D6D]'}`}>
                  {delta >= 0 ? '▲' : '▼'} {Math.abs(delta).toFixed(1)}%
                </span>
              </div>
              <Sparkline data={data} color={p.color} height={44} />
              <div className="mt-2 text-[10px] font-mono text-slate-600 truncate" title={p.query}>{p.query}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
