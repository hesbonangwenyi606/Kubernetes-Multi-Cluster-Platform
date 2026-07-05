import React from 'react';
import { Alert, statusColors } from '@/data/platform';
import { Bell, AlertOctagon, AlertTriangle, Info, Check, CheckCheck, Plug } from 'lucide-react';

const sevCfg = {
  critical: { color: '#FF4D6D', icon: AlertOctagon },
  warning: { color: '#FFB800', icon: AlertTriangle },
  info: { color: '#00D9FF', icon: Info },
} as const;

const integrations = [
  { name: 'PagerDuty', status: 'connected' },
  { name: 'Slack #ops-alerts', status: 'connected' },
  { name: 'Opsgenie', status: 'connected' },
  { name: 'Webhook (custom)', status: 'error' },
];

interface AlertsViewProps {
  alerts: Alert[];
  onAcknowledge: (id: string) => void;
  onAcknowledgeAll: () => void;
}

export default function AlertsView({ alerts, onAcknowledge, onAcknowledgeAll }: AlertsViewProps) {
  const [sevFilter, setSevFilter] = React.useState<'all' | Alert['severity']>('all');
  const filtered = alerts.filter((a) => sevFilter === 'all' || a.severity === sevFilter);
  const counts = {
    critical: alerts.filter((a) => a.severity === 'critical' && !a.acknowledged).length,
    warning: alerts.filter((a) => a.severity === 'warning' && !a.acknowledged).length,
    info: alerts.filter((a) => a.severity === 'info' && !a.acknowledged).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><Bell className="text-[#00D9FF]" size={20} /> Alert Center</h2>
          <p className="text-sm text-slate-500 mt-1">{alerts.filter((a) => !a.acknowledged).length} unacknowledged · routed via Alertmanager</p>
        </div>
        <button
          onClick={onAcknowledgeAll}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#00FF88]/40 text-[#00FF88] text-xs font-semibold hover:bg-[#00FF88]/10 transition-colors"
        >
          <CheckCheck size={14} /> Acknowledge All
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {(['critical', 'warning', 'info'] as const).map((sev) => {
          const cfg = sevCfg[sev];
          const Icon = cfg.icon;
          return (
            <button
              key={sev}
              onClick={() => setSevFilter(sevFilter === sev ? 'all' : sev)}
              className={`rounded-xl border p-4 text-left transition-colors ${sevFilter === sev ? 'bg-white/[0.04]' : 'bg-[#0D1424] hover:bg-white/[0.02]'}`}
              style={{ borderColor: sevFilter === sev ? cfg.color : '#1B2438' }}
            >
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider" style={{ color: cfg.color }}>
                <Icon size={14} /> {sev}
              </div>
              <div className="text-3xl font-bold font-mono text-white mt-2">{counts[sev]}</div>
            </button>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* timeline */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Incident Timeline</h3>
          {filtered.map((a) => {
            const cfg = sevCfg[a.severity];
            const Icon = cfg.icon;
            return (
              <div
                key={a.id}
                className={`rounded-xl border bg-[#0D1424] p-4 flex gap-4 transition-opacity ${a.acknowledged ? 'opacity-50' : ''}`}
                style={{ borderColor: a.acknowledged ? '#1B2438' : `${cfg.color}40` }}
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${cfg.color}12` }}>
                  <Icon size={16} style={{ color: cfg.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-white text-sm">{a.title}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1B2438] text-slate-400">{a.source}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1B2438] text-slate-400">{a.cluster}</span>
                    <span className="text-[11px] text-slate-500 font-mono ml-auto">{a.time}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{a.description}</p>
                </div>
                {!a.acknowledged && (
                  <button
                    onClick={() => onAcknowledge(a.id)}
                    className="self-center shrink-0 inline-flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-lg border border-[#1B2438] text-slate-300 hover:border-[#00FF88]/50 hover:text-[#00FF88] transition-colors"
                  >
                    <Check size={12} /> Ack
                  </button>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && <div className="text-center text-slate-500 text-sm py-12">No alerts in this category.</div>}
        </div>

        {/* integrations */}
        <div>
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">Integrations</h3>
          <div className="rounded-xl border border-[#1B2438] bg-[#0D1424] divide-y divide-[#131B2E]">
            {integrations.map((i) => (
              <div key={i.name} className="flex items-center justify-between px-4 py-3.5">
                <span className="flex items-center gap-2.5 text-sm text-slate-300">
                  <Plug size={14} className="text-slate-500" /> {i.name}
                </span>
                <span
                  className="text-[10px] font-mono uppercase px-2 py-1 rounded-full"
                  style={{
                    color: i.status === 'connected' ? statusColors.healthy : statusColors.critical,
                    backgroundColor: i.status === 'connected' ? `${statusColors.healthy}12` : `${statusColors.critical}12`,
                  }}
                >
                  {i.status}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-[#1B2438] bg-[#0D1424] p-4">
            <div className="text-[11px] uppercase tracking-wider text-slate-500 mb-2">Alertmanager Config</div>
            <pre className="text-[10px] font-mono text-slate-400 leading-relaxed overflow-x-auto">{`route:
  receiver: pagerduty-critical
  group_by: [cluster, alertname]
  routes:
    - match: {severity: warning}
      receiver: slack-ops
    - match: {severity: info}
      receiver: slack-ops`}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
