import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";

// Wraps every /admin route. The questionnaire route (/dotaznik/:uuid) is NOT
// wrapped — candidates fill it without auth.
//
// Two checks:
//   1. Authenticated session (otherwise → /admin/login).
//   2. Has role 'reviewer' OR 'admin' in public.user_roles (otherwise →
//      "no access" screen with sign-out button).
export function AdminGate({ children }: { children: ReactNode }) {
  const { session, loading, isReviewer, signOut, user } = useAdminAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Načítavam…</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  if (!isReviewer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md p-6 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-destructive" />
            <h1 className="text-lg font-semibold">Prístup zamietnutý</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Účet <span className="font-medium">{user?.email}</span> nemá rolu{" "}
            <span className="font-medium">reviewer</span> ani{" "}
            <span className="font-medium">admin</span>. Kontaktujte správcu, aby vám priradil
            prístup v tabuľke <code>public.user_roles</code>.
          </p>
          <Button variant="outline" onClick={() => void signOut()} className="w-full">
            Odhlásiť sa
          </Button>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
