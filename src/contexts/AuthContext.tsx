import React from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  full_name: string;
  role: string;
}

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  authModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  /** Runs fn if authenticated, otherwise opens the auth modal. Returns whether fn ran. */
  requireAuth: (fn?: () => void) => boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (name: string, email: string, password: string) => Promise<{ error?: string; needsConfirmation?: boolean }>;
  signOut: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [authModalOpen, setAuthModalOpen] = React.useState(false);

  const loadProfile = React.useCallback(async (u: User | null) => {
    if (!u) {
      setProfile(null);
      return;
    }
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .eq('id', u.id)
      .maybeSingle();
    if (data) {
      setProfile(data as Profile);
    } else {
      // fallback if trigger hasn't run yet
      setProfile({
        id: u.id,
        full_name: (u.user_metadata?.full_name as string) || u.email?.split('@')[0] || 'operator',
        role: 'platform-operator',
      });
    }
  }, []);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      loadProfile(session?.user ?? null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      loadProfile(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    setAuthModalOpen(false);
    return {};
  };

  const signUp = async (name: string, email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    if (error) return { error: error.message };
    if (!data.session) return { needsConfirmation: true };
    setAuthModalOpen(false);
    return {};
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const requireAuth = (fn?: () => void) => {
    if (user) {
      fn?.();
      return true;
    }
    setAuthModalOpen(true);
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        authModalOpen,
        openAuthModal: () => setAuthModalOpen(true),
        closeAuthModal: () => setAuthModalOpen(false),
        requireAuth,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
