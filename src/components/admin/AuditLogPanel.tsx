import { useLiveQuery } from "dexie-react-hooks";
import { History } from "lucide-react";

import { db } from "@/lib/db/dexie";
import { Card } from "@/components/ui/card";
import { Badge as UiBadge } from "@/components/ui/badge";
import { STATE_LABELS } from "@/lib/stateMachine";
import type { CandidateState } from "@/types/domain";

interface AuditLogPanelProps {
  candidateId: string;
}

const ACTION_LABELS: Record<string, string> = {
  STATE_CHANGE: "Zmena stavu",
  APPROVED: "Schválené",
  NEEDS_REVISION: "Vrátené na úpravy",
  SCORE_SAVED: "Uložené skóre",
  ADJUSTMENT: "Úprava recenzentom",
};

const ACTION_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  APPROVED: "default",
  NEEDS_REVISION: "destructive",
  STATE_CHANGE: "secondary",
  SCORE_SAVED: "outline",
  ADJUSTMENT: "outline",
};

function fmt(iso: string) {
  return new Date(iso).toLocaleString("sk-SK", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function stateLabel(s?: string) {
  return s && (STATE_LABELS as Record<string, string>)[s] ? STATE_LABELS[s as CandidateState] : s;
}

export function AuditLogPanel({ candidateId }: AuditLogPanelProps) {
  const entries =
    useLiveQuery(
      () =>
        db.auditLog
          .where("candidateId")
          .equals(candidateId)
          .reverse()
          .sortBy("at"),
      [candidateId],
    ) ?? [];

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-3">
        <History className="w-4 h-4 text-muted-foreground" />
        <h2 className="font-semibold">Auditný záznam</h2>
        <span className="text-xs text-muted-foreground">({entries.length})</span>
      </div>
      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Zatiaľ žiadne záznamy. Každá zmena stavu, schválenie a uloženie skóre sa zaeviduje sem.
        </p>
      ) : (
        <ul className="divide-y">
          {entries.map((e) => (
            <li key={e.id} className="py-2 text-sm flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <UiBadge variant={ACTION_VARIANT[e.action] ?? "outline"}>
                    {ACTION_LABELS[e.action] ?? e.action}
                  </UiBadge>
                  {e.fromState && e.toState && (
                    <span className="text-xs text-muted-foreground">
                      {stateLabel(e.fromState)} → {stateLabel(e.toState)}
                    </span>
                  )}
                </div>
                {e.note && (
                  <p className="text-xs text-muted-foreground mt-0.5">{e.note}</p>
                )}
              </div>
              <div className="text-xs text-muted-foreground text-right shrink-0">
                <div className="font-medium text-foreground">{e.reviewer}</div>
                <div>{fmt(e.at)}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
