import React from 'react';
import { Hexagon, CheckCircle2, Loader2 } from 'lucide-react';
import { ViewKey } from '@/components/Sidebar';

interface FooterProps {
  onNavigate: (v: ViewKey) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [smsOptIn, setSmsOptIn] = React.useState(true);
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [error, setError] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setStatus('loading');
    try {
      await fetch('https://famous.ai/api/crm/6a4a25eddb732c691135cec8/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          phone: phone.trim() || undefined,
          sms_opt_in: smsOptIn === true,
          source: 'footer-signup',
          tags: ['newsletter', 'platform-updates'],
        }),
      });
      setStatus('done');
    } catch {
      setStatus('error');
      setError('Something went wrong. Please try again.');
    }
  };

  const links: { label: string; view: ViewKey }[] = [
    { label: 'Cluster Fleet', view: 'clusters' },
    { label: 'GitOps Workflows', view: 'gitops' },
    { label: 'Service Mesh', view: 'mesh' },
    { label: 'Helm Repository', view: 'helm' },
    { label: 'Prometheus Metrics', view: 'metrics' },
    { label: 'Alert Center', view: 'alerts' },
  ];

  return (
    <footer className="mt-12 border-t border-[#1B2438] bg-[#0B0F1A]">
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-4 gap-10">
        <div className="md:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="relative">
              <Hexagon className="w-7 h-7 text-[#00D9FF]" strokeWidth={1.5} />
              <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-[#00D9FF] font-mono">K8</span>
            </div>
            <span className="font-bold text-white">FLEETCTL</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Enterprise Kubernetes multi-cluster platform. GitOps-native, mesh-aware, observability-first.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {['Kubernetes', 'ArgoCD', 'Istio', 'Helm', 'Prometheus'].map((t) => (
              <span key={t} className="text-[10px] font-mono px-2 py-1 rounded-full border border-[#1B2438] text-slate-400">{t}</span>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-4">Platform</h4>
          <ul className="space-y-2.5">
            {links.map((l) => (
              <li key={l.view + l.label}>
                <button onClick={() => onNavigate(l.view)} className="text-sm text-slate-500 hover:text-[#00D9FF] transition-colors">
                  {l.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-4">Status</h4>
          <ul className="space-y-2.5 text-sm font-mono">
            <li className="flex items-center gap-2 text-slate-500"><span className="w-1.5 h-1.5 rounded-full bg-[#00FF88]" /> Control plane: operational</li>
            <li className="flex items-center gap-2 text-slate-500"><span className="w-1.5 h-1.5 rounded-full bg-[#00FF88]" /> ArgoCD hub: operational</li>
            <li className="flex items-center gap-2 text-slate-500"><span className="w-1.5 h-1.5 rounded-full bg-[#FFB800]" /> ap-south-1: degraded</li>
            <li className="flex items-center gap-2 text-slate-500"><span className="w-1.5 h-1.5 rounded-full bg-[#FF4D6D]" /> edge-onprem: incident</li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-4">Release Notes & Incident Digest</h4>
          {status === 'done' ? (
            <div className="flex items-center gap-2 text-sm text-[#00FF88] rounded-lg border border-[#00FF88]/30 bg-[#00FF88]/5 px-4 py-3">
              <CheckCircle2 size={16} /> Subscribed. Welcome aboard, operator.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ops@yourcompany.com"
                className="w-full px-3 py-2.5 rounded-lg bg-[#0D1424] border border-[#1B2438] text-sm text-white font-mono placeholder:text-slate-600 focus:border-[#00D9FF] focus:outline-none"
              />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number (optional)"
                className="w-full px-3 py-2.5 rounded-lg bg-[#0D1424] border border-[#1B2438] text-sm text-white font-mono placeholder:text-slate-600 focus:border-[#00D9FF] focus:outline-none"
              />
              <label className="flex items-start gap-2 text-[11px] text-slate-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={smsOptIn}
                  onChange={(e) => setSmsOptIn(e.target.checked)}
                  className="mt-0.5 accent-[#00D9FF]"
                />
                <span>Text me critical incident updates. Msg & data rates may apply. Reply STOP to unsubscribe.</span>
              </label>
              {error && <p className="text-xs text-[#FF4D6D]">{error}</p>}
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#00D9FF] text-[#04121A] font-semibold text-sm hover:bg-[#3AE3FF] disabled:opacity-60 transition-colors"
              >
                {status === 'loading' ? <><Loader2 size={14} className="animate-spin" /> Subscribing...</> : 'Subscribe'}
              </button>
            </form>
          )}
        </div>
      </div>
      <div className="border-t border-[#131B2E] py-5 text-center text-[11px] font-mono text-slate-600">
        © 2026 FLEETCTL Platform · SOC2 Type II · Built for operators, by operators
      </div>
    </footer>
  );
}
