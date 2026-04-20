import { useCallback, useEffect, useState } from "react";
import { Copy, ExternalLink, Mail, Check } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ensureUuid, getResponseForCandidate } from "@/lib/repository/questionnaire";
import { useSupabaseQuery } from "@/hooks/useSupabaseQuery";
import { toast } from "@/hooks/use-toast";

interface Props {
  candidateId: string;
}

export function QuestionnaireLinkPanel({ candidateId }: Props) {
  const [uuid, setUuid] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetcher = useCallback(() => getResponseForCandidate(candidateId), [candidateId]);
  const { data: response } = useSupabaseQuery(fetcher, [candidateId], ["questionnaire_responses"]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const u = await ensureUuid(candidateId);
      if (!cancelled) setUuid(u);
    })();
    return () => { cancelled = true; };
  }, [candidateId]);

  if (!uuid) return null;

  const url = `${window.location.origin}/dotaznik/${uuid}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      toast({ title: "Skopírované", description: "Odkaz je v schránke." });
    } catch {
      toast({ title: "Skopírujte ručne", description: url, variant: "destructive" });
    }
  }

  const status = response?.status;

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="font-semibold">Odkaz na dotazník</h2>
          <p className="text-xs text-muted-foreground">
            Pošlite tento jedinečný odkaz kandidátovi e-mailom. Odpovede sa
            automaticky priradia k jeho karte.
          </p>
        </div>
        {status === "submitted" ? (
          <Badge>
            <Check className="w-3 h-3 mr-1" />
            Odoslaný{" "}
            {response?.submittedAt
              ? new Date(response.submittedAt).toLocaleDateString("sk-SK")
              : ""}
          </Badge>
        ) : status === "draft" ? (
          <Badge variant="secondary">Rozpísaný koncept</Badge>
        ) : (
          <Badge variant="outline">Nevyplnený</Badge>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <Input value={url} readOnly className="font-mono text-xs" />
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={copyLink} className="shrink-0">
            <Copy className="w-4 h-4 mr-1" /> {copied ? "Skopírované" : "Kopírovať"}
          </Button>
          <Button asChild variant="outline" size="sm" className="shrink-0">
            <a href={url} target="_blank" rel="noreferrer">
              <ExternalLink className="w-4 h-4 mr-1" /> Otvoriť
            </a>
          </Button>
        </div>
      </div>

      {response?.status === "submitted" && (
        <div className="rounded-md border bg-muted/30 p-3 space-y-2 text-sm">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Mail className="w-3 h-3" /> {response.email} · raw skóre:{" "}
            <span className="font-mono">{response.rawScore ?? "—"}</span>
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-1">
              Konkrétne opatrenia (verbatim):
            </div>
            <p className="text-sm whitespace-pre-wrap">{response.priorityActions}</p>
          </div>
          {response.additionalNotes && (
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-1">
                Doplňujúci komentár:
              </div>
              <p className="text-sm whitespace-pre-wrap">{response.additionalNotes}</p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
