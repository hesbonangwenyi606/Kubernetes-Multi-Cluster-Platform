import React from 'react';
import { ViewKey } from '@/components/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Bell, Terminal, LogIn, LogOut, ChevronDown } from 'lucide-react';

const viewTitles: Record<ViewKey, string> = {
  overview: 'Fleet Overview',
  clusters: 'Cluster Management',
  gitops: 'GitOps Workflows',
  mesh: 'Service Mesh Topology',
  helm: 'Helm Repository',
  metrics: 'Metrics & Observability',
  alerts: 'Alert Center',
};

interface TopBarProps {
  active: ViewKey;
  alertCount: number;
  onAlertsClick: () => void;
  searchValue: string;
  onSearch: (v: string) => void;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function TopBar({ active, alertCount, onAlertsClick, searchValue, onSearch }: TopBarProps) {
  const { user, profile, loading, openAuthModal, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const displayName = profile?.full_name || user?.email?.split('@')[0] || '';
  const displayRole = profile?.role || 'platform-operator';

  return (
    <header className="h-16 border-b border-[#1B2438] bg-[#0B0F1A]/80 backdrop-blur sticky top-0 z-20 flex items-center gap-4 px-6">
      <div className="min-w-0">
        <div className="text-sm font-bold text-white truncate">{viewTitles[active]}</div>
        <div className="text-[10px] font-mono text-slate-500">fleetctl v2.8.1 · context: fleet-hub</div>
      </div>
      <div className="flex-1" />
      <div className="relative hidden md:block">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          value={searchValue}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="kubectl get ... (search resources)"
          className="pl-9 pr-4 py-2 rounded-lg bg-[#0D1424] border border-[#1B2438] text-xs text-white placeholder:text-slate-600 focus:border-[#00D9FF] focus:outline-none w-72 font-mono"
        />
      </div>
      <button
        onClick={onAlertsClick}
        className="relative p-2 rounded-lg border border-[#1B2438] text-slate-400 hover:text-white hover:border-[#2A3A5C] transition-colors"
        title="Alerts"
      >
        <Bell size={16} />
        {alertCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-[#FF4D6D] text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
            {alertCount}
          </span>
        )}
      </button>

      <div className="pl-3 border-l border-[#1B2438]">
        {loading ? (
          <div className="w-8 h-8 rounded-full bg-[#1B2438] animate-pulse" />
        ) : user ? (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2.5 rounded-lg px-1.5 py-1 hover:bg-white/5 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00D9FF] to-[#A78BFA] flex items-center justify-center text-[#04121A] text-xs font-bold">
                {initials(displayName || 'OP')}
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs text-white font-medium truncate max-w-[120px]">{displayName}</div>
                <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                  <Terminal size={9} /> {displayRole}
                </div>
              </div>
              <ChevronDown size={13} className="text-slate-500 hidden lg:block" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-12 w-56 rounded-xl border border-[#1B2438] bg-[#0D1424] shadow-2xl z-40 overflow-hidden">
                <div className="px-4 py-3 border-b border-[#131B2E]">
                  <div className="text-xs text-white font-medium truncate">{displayName}</div>
                  <div className="text-[10px] font-mono text-slate-500 truncate">{user.email}</div>
                  <span className="inline-block mt-1.5 text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#00D9FF]/10 text-[#00D9FF]">
                    {displayRole}
                  </span>
                </div>
                <button
                  onClick={() => { setMenuOpen(false); signOut(); }}
                  className="w-full flex items-center gap-2 px-4 py-3 text-xs text-slate-300 hover:bg-white/5 hover:text-[#FF4D6D] transition-colors"
                >
                  <LogOut size={13} /> Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={openAuthModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00D9FF] text-[#04121A] font-semibold text-xs hover:bg-[#3AE3FF] transition-colors"
          >
            <LogIn size={14} /> Sign In
          </button>
        )}
      </div>
    </header>
  );
}
