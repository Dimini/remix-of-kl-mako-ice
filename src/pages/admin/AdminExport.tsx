import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db/dexie";
import { Download } from "lucide-react";

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
      const payload = {
        exportedAt: new Date().toISOString(),
        schemaVersion: 3,
        candidates,
        evidence,
        auditLog,
        questionnaireResponses,
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
        <h1 className="text-xl font-semibold">Export dát</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Stiahnuť celý lokálny obsah ako JSON. Tento súbor slúži ako vstup pre Supabase migráciu (Phase G).
        </p>
      </div>
      <Button onClick={exportJson} disabled={busy}>
        <Download className="w-4 h-4 mr-1" /> {busy ? "Pripravujem…" : "Stiahnuť JSON"}
      </Button>
    </Card>
  );
}
