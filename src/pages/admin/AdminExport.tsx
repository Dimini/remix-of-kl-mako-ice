import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db/dexie";
import { Download } from "lucide-react";
import {
  EXPORT_SCHEMA_VERSION,
  type ExportPayload,
  type ExportedCandidate,
  type ExportedEvidence,
  type ExportedAuditEntry,
  type ExportedQuestionnaireResponse,
} from "@/lib/export/exportSchema";

export default function AdminExport() {
  const [busy, setBusy] = useState(false);

  const exportJson = async () => {
    setBusy(true);
    try {
      const [candidates, evidence, auditLog, questionnaireResponses] = await Promise.all([
        db.candidates.toArray(),
        db.evidence.toArray(),
        db.auditLog.toArray(),
        db.questionnaireResponses.toArray(),
      ]);
      const payload: ExportPayload = {
        exportedAt: new Date().toISOString(),
        schemaVersion: EXPORT_SCHEMA_VERSION,
        candidates: candidates as ExportedCandidate[],
        evidence: evidence as ExportedEvidence[],
        auditLog: auditLog as ExportedAuditEntry[],
        questionnaireResponses: questionnaireResponses as ExportedQuestionnaireResponse[],
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `klima-kompas-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Export dát (Phase G handoff)</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Stiahnuť celý lokálny obsah ako JSON podľa kontraktu{" "}
          <code className="text-xs">src/lib/export/exportSchema.ts</code> (schemaVersion ={" "}
          {EXPORT_SCHEMA_VERSION}). Tento súbor + <code className="text-xs">supabase/seed-skeleton.sql</code> +{" "}
          <code className="text-xs">docs/SUPABASE_IMPORT.md</code> tvoria odovzdávku pre Claude Code,
          ktorý napíše reálnu Supabase migráciu.
        </p>
      </div>
      <Button onClick={exportJson} disabled={busy}>
        <Download className="w-4 h-4 mr-1" /> {busy ? "Pripravujem…" : "Stiahnuť JSON"}
      </Button>
    </Card>
  );
}
