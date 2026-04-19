import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

// ---------------------------------------------------------------------------
// Lightweight password gate for the admin UI.
//
// Phase A: env-var password (VITE_ADMIN_PASSWORD), session-storage flag.
// This is intentionally minimal — Supabase Auth replaces it once the
// backend is online. Do NOT use this to protect anything sensitive in
// production; it only keeps the local-first dev UI out of casual hands.
// ---------------------------------------------------------------------------

const STORAGE_KEY = "kk_admin_unlocked";
const ENV_PASSWORD = (import.meta.env.VITE_ADMIN_PASSWORD as string | undefined) ?? "klima2026";

interface AdminAuthState {
  unlocked: boolean;
  unlock: (password: string) => boolean;
  lock: () => void;
}

const Ctx = createContext<AdminAuthState | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    setUnlocked(sessionStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  const unlock = (password: string) => {
    if (password === ENV_PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, "1");
      setUnlocked(true);
      return true;
    }
    return false;
  };

  const lock = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setUnlocked(false);
  };

  return <Ctx.Provider value={{ unlocked, unlock, lock }}>{children}</Ctx.Provider>;
}

export function useAdminAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAdminAuth must be used inside AdminAuthProvider");
  return v;
}
