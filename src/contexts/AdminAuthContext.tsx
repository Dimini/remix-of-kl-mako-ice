import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

// ---------------------------------------------------------------------------
// Supabase-backed admin auth.
//
// - `session`/`user` come from supabase.auth (email + password).
// - `isReviewer` is true if the user has role 'reviewer' OR 'admin' in
//   public.user_roles (checked via the has_role RPC, RLS-safe).
// - `reviewer` is the display name used in audit log entries — derived
//   from user.email; consumers may keep using it as-is.
//
// Bootstrap:
//   1. Sign up via /admin/login (creates an auth.users row).
//   2. Run in Supabase SQL editor (one-shot, requires service role):
//        INSERT INTO public.user_roles (user_id, role)
//        VALUES ('<your-uuid>', 'admin');
//      Get <your-uuid> from the Supabase Dashboard → Authentication → Users.
// ---------------------------------------------------------------------------

interface AdminAuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isReviewer: boolean;
  reviewer: string;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AdminAuthState | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isReviewer, setIsReviewer] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up listener BEFORE getSession (per Supabase auth guidance).
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      // Defer role check — never call other supabase APIs synchronously
      // inside the auth callback.
      if (newSession?.user) {
        setTimeout(() => {
          void checkReviewer(newSession.user.id).then(setIsReviewer);
        }, 0);
      } else {
        setIsReviewer(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session: existing } }) => {
      setSession(existing);
      setUser(existing?.user ?? null);
      if (existing?.user) {
        void checkReviewer(existing.user.id).then((ok) => {
          setIsReviewer(ok);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/admin` },
    });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const reviewer = user?.email ?? "";

  return (
    <Ctx.Provider
      value={{ session, user, loading, isReviewer, reviewer, signIn, signUp, signOut }}
    >
      {children}
    </Ctx.Provider>
  );
}

async function checkReviewer(userId: string): Promise<boolean> {
  // Check 'reviewer' first; if not found, check 'admin'.
  const reviewerRes = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "reviewer",
  });
  if (reviewerRes.data === true) return true;
  const adminRes = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  return adminRes.data === true;
}

export function useAdminAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAdminAuth must be used inside AdminAuthProvider");
  return v;
}
