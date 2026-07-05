import React from 'react';
import { LayoutDashboard, GitBranch, Network, Package, Activity, Bell, Boxes, Hexagon, ChevronLeft, ChevronRight, Settings } from 'lucide-react';

export type ViewKey = 'overview' | 'clusters' | 'gitops' | 'mesh' | 'helm' | 'metrics' | 'alerts';

interface SidebarProps {
  active: ViewKey;
  onNavigate: (v: ViewKey) => void;
  alertCount: number;
  collapsed: boolean;
  onToggle: () => void;
}

const navItems: { key: ViewKey; label: string; icon: React.ElementType }[] = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'clusters', label: 'Clusters', icon: Boxes },
  { key: 'gitops', label: 'GitOps · ArgoCD', icon: GitBranch },
  { key: 'mesh', label: 'Service Mesh', icon: Network },
  { key: 'helm', label: 'Helm Charts', icon: Package },
  { key: 'metrics', label: 'Prometheus', icon: Activity },
  { key: 'alerts', label: 'Alert Center', icon: Bell },
];

export default function Sidebar({ active, onNavigate, alertCount, collapsed, onToggle }: SidebarProps) {
  return (
    <aside className={`${collapsed ? 'w-16' : 'w-60'} shrink-0 bg-[#0B0F1A] border-r border-[#1B2438] flex flex-col transition-all duration-300 sticky top-0 h-screen z-30`}>
      <div className="flex items-center gap-3 px-4 h-16 border-b border-[#1B2438]">
        <div className="relative">
          <Hexagon className="w-8 h-8 text-[#00D9FF]" strokeWidth={1.5} />
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[#00D9FF] font-mono">K8</span>
        </div>
        {!collapsed && (
          <div>
            <div className="text-sm font-bold text-white tracking-wide">FLEETCTL</div>
            <div className="text-[10px] text-slate-500 font-mono">multi-cluster platform</div>
          </div>
        )}
      </div>

      <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
        {navItems.map(({ key, label, icon: Icon }) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              onClick={() => onNavigate(key)}
              title={label}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors relative ${
                isActive
                  ? 'bg-[#00D9FF]/10 text-[#00D9FF] border border-[#00D9FF]/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon className="w-4.5 h-4.5 shrink-0" size={18} />
              {!collapsed && <span className="truncate">{label}</span>}
              {key === 'alerts' && alertCount > 0 && (
                <span className={`${collapsed ? 'absolute -top-0.5 -right-0.5' : 'ml-auto'} bg-[#FF4D6D] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1`}>
                  {alertCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="px-2 pb-4 space-y-1">
        <button
          onClick={() => onNavigate('clusters')}
          title="Settings"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <Settings size={18} className="shrink-0" />
          {!collapsed && <span>Cluster Settings</span>}
        </button>
        <button
          onClick={onToggle}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <><ChevronLeft size={18} /><span>Collapse</span></>}
        </button>
      </div>
    </aside>
  );
}
