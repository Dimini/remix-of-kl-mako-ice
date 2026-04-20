import { useState } from "react";
import { Sparkles, Calculator, Loader2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const MAX_PDF_BYTES = 20 * 1024 * 1024; // 20 MB

export function AIToolsPanel({ candidateId, defaultProgramUrl, onComplete }: AIToolsPanelProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mode, setMode] = useState<"url" | "pdf">("url");
  const [programUrl, setProgramUrl] = useState(defaultProgramUrl ?? "");
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  function extractError(error: { message: string; context?: { body?: string } }): string {
    let msg = error.message;
    try {
      if (error.context?.body) {
        const parsed = JSON.parse(error.context.body);
        if (parsed?.error) msg = parsed.error;
      }
    } catch { /* ignore */ }
    return msg;
  }

  async function runAnalyzeUrl() {
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
      if (error) throw new Error(extractError(error as never));
      reportSuccess(data);
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

  async function runAnalyzePdf() {
    if (!pdfFile) {
      toast({ title: "Vyberte PDF súbor", variant: "destructive" });
      return;
    }
    if (pdfFile.size > MAX_PDF_BYTES) {
      toast({
        title: "Súbor je príliš veľký",
        description: "Maximálna veľkosť je 20 MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    const path = `${candidateId}/${Date.now()}-${pdfFile.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    try {
      const { error: upErr } = await supabase.storage
        .from("candidate-programs")
        .upload(path, pdfFile, {
          contentType: "application/pdf",
          upsert: false,
        });
      if (upErr) throw upErr;
    } catch (e) {
      setUploading(false);
      toast({
        title: "Nahranie PDF zlyhalo",
        description: e instanceof Error ? e.message : String(e),
        variant: "destructive",
      });
      return;
    }
    setUploading(false);
    setDialogOpen(false);
    setAnalyzing(true);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-program", {
        body: { candidate_id: candidateId, program_storage_path: path },
      });
      if (error) throw new Error(extractError(error as never));
      reportSuccess(data);
      setPdfFile(null);
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

  function reportSuccess(data: {
    normalizedScore?: number;
    confidence?: number;
    citationCount?: number;
  }) {
    toast({
      title: "Program analyzovaný",
      description: `Skóre: ${data?.normalizedScore?.toFixed?.(1) ?? "?"} • Spoľahlivosť: ${
        data?.confidence?.toFixed?.(2) ?? "?"
      } • Citácie: ${data?.citationCount ?? 0}`,
    });
  }

  async function runScore() {
    setScoring(true);
    try {
      const { data, error } = await supabase.functions.invoke("score-candidate", {
        body: { candidate_id: candidateId },
      });
      if (error) throw new Error(extractError(error as never));
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

  const busy = analyzing || scoring || uploading;

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
            {analyzing || uploading ? (
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
              Vyberte zdroj programu — verejnú URL alebo nahrajte PDF priamo. AI agent vyhodnotí
              klimatické záväzky podľa metodológie Carter et al.
            </DialogDescription>
          </DialogHeader>

          <Tabs value={mode} onValueChange={(v) => setMode(v as "url" | "pdf")} className="py-2">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="url">URL</TabsTrigger>
              <TabsTrigger value="pdf">Nahrať PDF</TabsTrigger>
            </TabsList>

            <TabsContent value="url" className="space-y-2 pt-3">
              <Label htmlFor="program-url">URL programu</Label>
              <Input
                id="program-url"
                type="url"
                placeholder="https://strana.sk/program.pdf"
                value={programUrl}
                onChange={(e) => setProgramUrl(e.target.value)}
              />
            </TabsContent>

            <TabsContent value="pdf" className="space-y-2 pt-3">
              <Label htmlFor="program-pdf">PDF súbor (max 20 MB)</Label>
              <Input
                id="program-pdf"
                type="file"
                accept="application/pdf,.pdf"
                onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
              />
              {pdfFile && (
                <p className="text-xs text-muted-foreground">
                  Vybraný súbor: {pdfFile.name} ({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>
              Zrušiť
            </Button>
            {mode === "url" ? (
              <Button onClick={runAnalyzeUrl} disabled={!programUrl.trim()}>
                <Sparkles className="w-4 h-4 mr-1" /> Spustiť analýzu
              </Button>
            ) : (
              <Button onClick={runAnalyzePdf} disabled={!pdfFile || uploading}>
                {uploading ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-1" />
                )}
                Nahrať a analyzovať
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
