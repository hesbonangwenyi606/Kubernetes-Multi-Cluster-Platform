import React from 'react';
import Sidebar, { ViewKey } from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import Footer from '@/components/Footer';
import OverviewView from '@/components/OverviewView';
import ClustersView from '@/components/ClustersView';
import GitOpsView from '@/components/GitOpsView';
import MeshView from '@/components/MeshView';
import HelmView from '@/components/HelmView';
import MetricsView from '@/components/MetricsView';
import AlertsView from '@/components/AlertsView';
import AuthModal from '@/components/AuthModal';
import {
  clusters as initialClusters,
  initialAlerts,
  argoApps,
  helmCharts,
  meshServices,
  Cluster,
  Alert,
} from '@/data/platform';
import { Server, GitBranch, Package, Network } from 'lucide-react';

interface SearchResult {
  type: string;
  name: string;
  detail: string;
  view: ViewKey;
  icon: React.ElementType;
}

export default function AppLayout() {
  const [view, setView] = React.useState<ViewKey>('overview');
  const [collapsed, setCollapsed] = React.useState(false);
  const [clusterList, setClusterList] = React.useState<Cluster[]>(initialClusters);
  const [alerts, setAlerts] = React.useState<Alert[]>(initialAlerts);
  const [search, setSearch] = React.useState('');

  const unacked = alerts.filter((a) => !a.acknowledged).length;

  const navigate = (v: ViewKey) => {
    setView(v);
    setSearch('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddCluster = (name: string, provider: Cluster['provider'], region: string) => {
    setClusterList((prev) => [
      ...prev,
      {
        id: name,
        name,
        provider,
        region,
        version: 'v1.30.1',
        status: 'healthy',
        nodes: 3,
        pods: 24,
        namespaces: 4,
        cpu: 12,
        memory: 18,
        network: 8,
        argoSynced: 0,
        argoTotal: 0,
        istioEnabled: false,
        x: 50,
        y: 50,
      },
    ]);
  };

  const handleRemoveCluster = (id: string) => {
    setClusterList((prev) => prev.filter((c) => c.id !== id));
  };

  const handleAcknowledge = (id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a)));
  };

  const handleAcknowledgeAll = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, acknowledged: true })));
  };

  // global search results
  const results: SearchResult[] = React.useMemo(() => {
    if (search.trim().length < 2) return [];
    const q = search.toLowerCase();
    const out: SearchResult[] = [];
    clusterList.forEach((c) => {
      if (c.name.toLowerCase().includes(q) || c.region.toLowerCase().includes(q))
        out.push({ type: 'cluster', name: c.name, detail: `${c.provider} · ${c.region}`, view: 'clusters', icon: Server });
    });
    argoApps.forEach((a) => {
      if (a.name.toLowerCase().includes(q))
        out.push({ type: 'argo app', name: a.name, detail: `${a.cluster} · ${a.syncStatus}`, view: 'gitops', icon: GitBranch });
    });
    helmCharts.forEach((h) => {
      if (h.name.toLowerCase().includes(q))
        out.push({ type: 'helm chart', name: h.name, detail: `${h.repo} · v${h.version}`, view: 'helm', icon: Package });
    });
    meshServices.forEach((s) => {
      if (s.name.toLowerCase().includes(q))
        out.push({ type: 'mesh service', name: s.name, detail: `ns/${s.namespace} · ${s.rps} rps`, view: 'mesh', icon: Network });
    });
    return out.slice(0, 8);
  }, [search, clusterList]);

  return (
    <div className="min-h-screen bg-[#080B14] text-slate-200 flex" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Sidebar
        active={view}
        onNavigate={navigate}
        alertCount={unacked}
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
      />
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="relative">
          <TopBar
            active={view}
            alertCount={unacked}
            onAlertsClick={() => navigate('alerts')}
            searchValue={search}
            onSearch={setSearch}
          />
          {results.length > 0 && (
            <div className="absolute right-6 top-14 w-80 rounded-xl border border-[#1B2438] bg-[#0D1424] shadow-2xl z-40 overflow-hidden">
              {results.map((r, i) => {
                const Icon = r.icon;
                return (
                  <button
                    key={i}
                    onClick={() => navigate(r.view)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left border-b border-[#131B2E] last:border-0"
                  >
                    <Icon size={14} className="text-[#00D9FF] shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-mono text-white truncate">{r.name}</div>
                      <div className="text-[10px] text-slate-500 truncate">{r.detail}</div>
                    </div>
                    <span className="text-[9px] font-mono uppercase text-slate-600">{r.type}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <main className="flex-1 px-6 py-8 max-w-7xl w-full mx-auto">
          {view === 'overview' && (
            <OverviewView
              clusterList={clusterList}
              onNavigate={navigate}
              onSelectCluster={() => navigate('clusters')}
              unackedAlerts={unacked}
            />
          )}
          {view === 'clusters' && (
            <ClustersView clusterList={clusterList} onAdd={handleAddCluster} onRemove={handleRemoveCluster} />
          )}
          {view === 'gitops' && <GitOpsView />}
          {view === 'mesh' && <MeshView />}
          {view === 'helm' && <HelmView />}
          {view === 'metrics' && <MetricsView />}
          {view === 'alerts' && (
            <AlertsView alerts={alerts} onAcknowledge={handleAcknowledge} onAcknowledgeAll={handleAcknowledgeAll} />
          )}
        </main>

        <Footer onNavigate={navigate} />
      </div>
      <AuthModal />
    </div>
  );
}
