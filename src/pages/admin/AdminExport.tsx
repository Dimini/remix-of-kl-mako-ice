import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function AdminExport() {
  const [busy, setBusy] = useState(false);

  const exportJson = async () => {
    setBusy(true);
    try {
      const [c, sc, da, v, p, ar, q, s] = await Promise.all([
        supabase.from("candidates").select("*"),
        supabase.from("source_citations").select("*"),
        supabase.from("documented_actions").select("*"),
        supabase.from("votes").select("*"),
        supabase.from("programs").select("*"),
        supabase.from("review_audit_log").select("*"),
        supabase.from("questionnaire_responses").select("*"),
        supabase.from("scores").select("*"),
      ]);
      const payload = {
        exportedAt: new Date().toISOString(),
        schemaVersion: "supabase-1",
        candidates: c.data ?? [],
        source_citations: sc.data ?? [],
        documented_actions: da.data ?? [],
        votes: v.data ?? [],
        programs: p.data ?? [],
        review_audit_log: ar.data ?? [],
        questionnaire_responses: q.data ?? [],
        scores: s.data ?? [],
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
          Stiahnuť celý obsah Supabase databázy ako JSON snapshot (zálohovanie / debug).
        </p>
      </div>
      <Button onClick={exportJson} disabled={busy}>
        <Download className="w-4 h-4 mr-1" /> {busy ? "Pripravujem…" : "Stiahnuť JSON"}
      </Button>
    </Card>
  );
}
