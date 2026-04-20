import { useState } from "react";
import { Sparkles, Calculator, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AIToolsPanelProps {
  candidateId: string;
  defaultProgramUrl?: string;
  onComplete?: () => void;
}

export function AIToolsPanel({ candidateId, defaultProgramUrl, onComplete }: AIToolsPanelProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [programUrl, setProgramUrl] = useState(defaultProgramUrl ?? "");

  async function runAnalyze() {
    if (!programUrl.trim()) {
      toast({ title: "Chýba URL", description: "Zadajte URL programu.", variant: "destructive" });
      return;
    }
    setDialogOpen(false);
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-program", {
        body: { candidate_id: candidateId, program_url: programUrl.trim() },
      });
      if (error) {
        // Try to extract structured error from response
        let msg = error.message;
        try {
          const ctx = (error as { context?: { body?: string } }).context;
          if (ctx?.body) {
            const parsed = JSON.parse(ctx.body);
            if (parsed?.error) msg = parsed.error;
          }
        } catch { /* ignore */ }
        throw new Error(msg);
      }
      const citations = Array.isArray(data?.citations) ? data.citations.length : 0;
      toast({
        title: "Program analyzovaný",
        description: `Skóre: ${data?.normalizedScore?.toFixed?.(1) ?? "?"} • Spoľahlivosť: ${
          data?.confidence?.toFixed?.(2) ?? "?"
        } • Citácie: ${citations}`,
      });
      onComplete?.();
    } catch (e) {
      toast({
        title: "Analýza zlyhala",
        description: e instanceof Error ? e.message : String(e),
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  }

  async function runScore() {
    setScoring(true);
    try {
      const { data, error } = await supabase.functions.invoke("score-candidate", {
        body: { candidate_id: candidateId },
      });
      if (error) {
        let msg = error.message;
        try {
          const ctx = (error as { context?: { body?: string } }).context;
          if (ctx?.body) {
            const parsed = JSON.parse(ctx.body);
            if (parsed?.error) msg = parsed.error;
          }
        } catch { /* ignore */ }
        throw new Error(msg);
      }
      const sub = data?.badgeSubtype ? ` (${data.badgeSubtype})` : "";
      toast({
        title: `Skóre prepočítané (v${data?.version ?? "?"})`,
        description: `Slová: ${data?.pillar1?.toFixed?.(1) ?? "?"} • Skutky: ${
          data?.pillar2?.toFixed?.(1) ?? "?"
        } • Celkom: ${data?.total?.toFixed?.(1) ?? "?"} • Odznak: ${data?.badge ?? "?"}${sub}`,
      });
      onComplete?.();
    } catch (e) {
      toast({
        title: "Prepočet skóre zlyhal",
        description: e instanceof Error ? e.message : String(e),
        variant: "destructive",
      });
    } finally {
      setScoring(false);
    }
  }

  const busy = analyzing || scoring;

  return (
    <>
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold">AI nástroje</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Analýza programu trvá ~30–90 s. Výstupy sú návrhy — vyžadujú ľudské schválenie.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() => {
              setProgramUrl(defaultProgramUrl ?? programUrl);
              setDialogOpen(true);
            }}
          >
            {analyzing ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-1" />
            )}
            Analyzovať program
          </Button>
          <Button size="sm" variant="outline" disabled={busy} onClick={runScore}>
            {scoring ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <Calculator className="w-4 h-4 mr-1" />
            )}
            Prepočítať skóre
          </Button>
        </div>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Analyzovať program kandidáta</DialogTitle>
            <DialogDescription>
              Zadajte URL volebného programu. AI agent stiahne text a vyhodnotí klimatické záväzky
              podľa metodológie Carter et al.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="program-url">URL programu</Label>
            <Input
              id="program-url"
              type="url"
              placeholder="https://strana.sk/program.pdf"
              value={programUrl}
              onChange={(e) => setProgramUrl(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>
              Zrušiť
            </Button>
            <Button onClick={runAnalyze} disabled={!programUrl.trim()}>
              <Sparkles className="w-4 h-4 mr-1" /> Spustiť analýzu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
