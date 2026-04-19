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
const REVIEWER_KEY = "kk_admin_reviewer";
const ENV_PASSWORD = (import.meta.env.VITE_ADMIN_PASSWORD as string | undefined) ?? "klima2026";

interface AdminAuthState {
  unlocked: boolean;
  reviewer: string;
  setReviewer: (name: string) => void;
  unlock: (password: string, reviewer?: string) => boolean;
  lock: () => void;
}

const Ctx = createContext<AdminAuthState | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [reviewer, setReviewerState] = useState<string>("");

  useEffect(() => {
    setUnlocked(sessionStorage.getItem(STORAGE_KEY) === "1");
    setReviewerState(localStorage.getItem(REVIEWER_KEY) ?? "");
  }, []);

  const setReviewer = (name: string) => {
    const trimmed = name.trim();
    setReviewerState(trimmed);
    if (trimmed) localStorage.setItem(REVIEWER_KEY, trimmed);
    else localStorage.removeItem(REVIEWER_KEY);
  };

  const unlock = (password: string, reviewerName?: string) => {
    if (password === ENV_PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, "1");
      setUnlocked(true);
      if (reviewerName !== undefined) setReviewer(reviewerName);
      return true;
    }
    return false;
  };

  const lock = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setUnlocked(false);
  };

  return (
    <Ctx.Provider value={{ unlocked, reviewer, setReviewer, unlock, lock }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAdminAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAdminAuth must be used inside AdminAuthProvider");
  return v;
}
