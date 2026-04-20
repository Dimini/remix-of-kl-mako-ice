import { useCallback, useState } from "react";
import { ShieldCheck, Shield, UserPlus, X } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useSupabaseQuery } from "@/hooks/useSupabaseQuery";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge as UiBadge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

// ---------------------------------------------------------------------------
// Admin-only user/role management.
// Uses SECURITY DEFINER RPCs (admin_list_users / admin_grant_role /
// admin_revoke_role) — all gated server-side on has_role(...,'admin').
// Non-admins see "Forbidden" empty state because the RPC throws.
// ---------------------------------------------------------------------------

type AppRole = "admin" | "reviewer" | "user";

interface UserRow {
  user_id: string;
  email: string;
  created_at: string;
  roles: AppRole[];
}

const ROLE_LABEL: Record<AppRole, string> = {
  admin: "admin",
  reviewer: "reviewer",
  user: "user",
};

export default function AdminUsers() {
  const { user: currentUser, isReviewer } = useAdminAuth();
  const [busy, setBusy] = useState<string | null>(null);

  const fetcher = useCallback(async (): Promise<UserRow[]> => {
    const { data, error } = await supabase.rpc("admin_list_users");
    if (error) throw error;
    return (data ?? []) as UserRow[];
  }, []);

  const { data: users, error, refetch, loading } = useSupabaseQuery(
    fetcher,
    [],
    [],
  );

  async function grant(userId: string, role: AppRole) {
    setBusy(`${userId}:${role}:grant`);
    const { error } = await supabase.rpc("admin_grant_role", {
      _user_id: userId,
      _role: role,
    });
    setBusy(null);
    if (error) {
      toast({
        title: "Chyba",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    toast({ title: "Rola pridelená", description: `${ROLE_LABEL[role]}` });
    refetch();
  }

  async function revoke(userId: string, role: AppRole) {
    setBusy(`${userId}:${role}:revoke`);
    const { error } = await supabase.rpc("admin_revoke_role", {
      _user_id: userId,
      _role: role,
    });
    setBusy(null);
    if (error) {
      toast({
        title: "Chyba",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    toast({ title: "Rola odobratá", description: `${ROLE_LABEL[role]}` });
    refetch();
  }

  if (!isReviewer) {
    return (
      <div className="text-sm text-muted-foreground">
        Nemáte oprávnenie na túto stránku.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Používatelia & role</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Spravujte prístupy k administrácii. <strong>reviewer</strong> môže pridávať
          dôkazy a posúvať stavy. <strong>admin</strong> navyše spravuje
          používateľov a scoring konfiguráciu.
        </p>
      </div>

      {error && (
        <Card className="p-4 border-destructive/40 bg-destructive/5 text-sm">
          {error.message.toLowerCase().includes("forbidden")
            ? "Iba admini majú prístup k zoznamu používateľov."
            : `Chyba načítania: ${error.message}`}
        </Card>
      )}

      {loading && !users && (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          Načítavam…
        </Card>
      )}

      {users && users.length === 0 && (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          Žiadni používatelia.
        </Card>
      )}

      {users && users.length > 0 && (
        <div className="space-y-2">
          {users.map((u) => {
            const isSelf = currentUser?.id === u.user_id;
            const hasAdmin = u.roles.includes("admin");
            const hasReviewer = u.roles.includes("reviewer");
            return (
              <Card key={u.user_id} className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold truncate">
                      {u.email || "(bez emailu)"}
                      {isSelf && (
                        <UiBadge variant="secondary" className="ml-2 text-xs">
                          ja
                        </UiBadge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Registrácia: {new Date(u.created_at).toLocaleDateString("sk-SK")}
                      {" · "}
                      {u.roles.length === 0 ? (
                        <span className="italic">žiadne role</span>
                      ) : (
                        u.roles.map((r) => (
                          <UiBadge key={r} variant="outline" className="ml-1">
                            {ROLE_LABEL[r]}
                          </UiBadge>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <RoleToggleButton
                      label="reviewer"
                      icon={<Shield className="w-3.5 h-3.5 mr-1" />}
                      granted={hasReviewer}
                      busy={busy === `${u.user_id}:reviewer:${hasReviewer ? "revoke" : "grant"}`}
                      onGrant={() => grant(u.user_id, "reviewer")}
                      onRevoke={() => revoke(u.user_id, "reviewer")}
                    />
                    <RoleToggleButton
                      label="admin"
                      icon={<ShieldCheck className="w-3.5 h-3.5 mr-1" />}
                      granted={hasAdmin}
                      disabled={isSelf && hasAdmin}
                      disabledReason={
                        isSelf && hasAdmin
                          ? "Nemôžete si odobrať vlastný admin (ochrana proti uzamknutiu)."
                          : undefined
                      }
                      busy={busy === `${u.user_id}:admin:${hasAdmin ? "revoke" : "grant"}`}
                      onGrant={() => grant(u.user_id, "admin")}
                      onRevoke={() => revoke(u.user_id, "admin")}
                    />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Card className="p-4 bg-muted/40 text-xs text-muted-foreground">
        <UserPlus className="w-3.5 h-3.5 inline mr-1" />
        Noví používatelia sa registrujú cez <strong>/admin/login</strong>. Po registrácii
        im tu prideľte rolu, inak nebudú mať prístup do administrácie.
      </Card>
    </div>
  );
}

function RoleToggleButton({
  label,
  icon,
  granted,
  busy,
  disabled,
  disabledReason,
  onGrant,
  onRevoke,
}: {
  label: string;
  icon: React.ReactNode;
  granted: boolean;
  busy?: boolean;
  disabled?: boolean;
  disabledReason?: string;
  onGrant: () => void;
  onRevoke: () => void;
}) {
  if (granted) {
    return (
      <Button
        size="sm"
        variant="outline"
        disabled={busy || disabled}
        onClick={onRevoke}
        title={disabledReason}
      >
        <X className="w-3.5 h-3.5 mr-1" />
        Odobrať {label}
      </Button>
    );
  }
  return (
    <Button size="sm" disabled={busy || disabled} onClick={onGrant} title={disabledReason}>
      {icon}
      Prideliť {label}
    </Button>
  );
}
