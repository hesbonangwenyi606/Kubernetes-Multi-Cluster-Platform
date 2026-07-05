import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { X, Loader2, LogIn, UserPlus, ShieldCheck, MailCheck } from 'lucide-react';

export default function AuthModal() {
  const { authModalOpen, closeAuthModal, signIn, signUp } = useAuth();
  const [mode, setMode] = React.useState<'signin' | 'signup'>('signin');
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [needsConfirmation, setNeedsConfirmation] = React.useState(false);

  React.useEffect(() => {
    if (authModalOpen) {
      setError('');
      setNeedsConfirmation(false);
      setLoading(false);
    }
  }, [authModalOpen]);

  if (!authModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (mode === 'signup' && !name.trim()) {
      setError('Please enter your name.');
      return;
    }
    setLoading(true);
    if (mode === 'signin') {
      const res = await signIn(email, password);
      setLoading(false);
      if (res.error) setError(res.error);
    } else {
      const res = await signUp(name.trim(), email, password);
      setLoading(false);
      if (res.error) setError(res.error);
      else if (res.needsConfirmation) setNeedsConfirmation(true);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={() => !loading && closeAuthModal()}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-[#1B2438] bg-[#0D1424] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold text-white flex items-center gap-2">
            <ShieldCheck size={18} className="text-[#00D9FF]" />
            {mode === 'signin' ? 'Operator Sign In' : 'Create Operator Account'}
          </h3>
          <button onClick={closeAuthModal} className="text-slate-500 hover:text-white"><X size={18} /></button>
        </div>
        <p className="text-xs text-slate-500 mb-5 font-mono">
          Authentication required for fleet mutations (register, sync, deploy).
        </p>

        {needsConfirmation ? (
          <div className="rounded-lg border border-[#00FF88]/30 bg-[#00FF88]/5 p-4 text-sm text-[#00FF88] flex items-start gap-3">
            <MailCheck size={18} className="shrink-0 mt-0.5" />
            <div>
              Account created. Check <span className="font-mono">{email}</span> to confirm your address, then sign in.
              <button
                onClick={() => { setMode('signin'); setNeedsConfirmation(false); }}
                className="block mt-2 text-xs underline text-[#00D9FF]"
              >
                Back to sign in
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2 mb-5">
              <button
                type="button"
                onClick={() => { setMode('signin'); setError(''); }}
                className={`py-2 rounded-lg text-xs font-mono border transition-colors ${mode === 'signin' ? 'border-[#00D9FF] text-[#00D9FF] bg-[#00D9FF]/10' : 'border-[#1B2438] text-slate-400 hover:text-white'}`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); setError(''); }}
                className={`py-2 rounded-lg text-xs font-mono border transition-colors ${mode === 'signup' ? 'border-[#00D9FF] text-[#00D9FF] bg-[#00D9FF]/10' : 'border-[#1B2438] text-slate-400 hover:text-white'}`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === 'signup' && (
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">Full name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Sarah Chen"
                    className="w-full px-3 py-2.5 rounded-lg bg-[#0B0F1A] border border-[#1B2438] text-sm text-white font-mono placeholder:text-slate-600 focus:border-[#00D9FF] focus:outline-none"
                  />
                </div>
              )}
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ops@yourcompany.com"
                  className="w-full px-3 py-2.5 rounded-lg bg-[#0B0F1A] border border-[#1B2438] text-sm text-white font-mono placeholder:text-slate-600 focus:border-[#00D9FF] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 rounded-lg bg-[#0B0F1A] border border-[#1B2438] text-sm text-white font-mono placeholder:text-slate-600 focus:border-[#00D9FF] focus:outline-none"
                />
              </div>
              {error && <p className="text-xs text-[#FF4D6D]">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#00D9FF] text-[#04121A] font-semibold text-sm hover:bg-[#3AE3FF] disabled:opacity-60 transition-colors"
              >
                {loading ? (
                  <><Loader2 size={15} className="animate-spin" /> Authenticating...</>
                ) : mode === 'signin' ? (
                  <><LogIn size={15} /> Sign In</>
                ) : (
                  <><UserPlus size={15} /> Create Account</>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
