import { useEffect, useState } from "react";
import { FileText, Loader2, Play, Eye, AlertTriangle, CheckCircle2, Info, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const MAX_PDF_BYTES = 20 * 1024 * 1024;

interface Jurisdiction {
  id: string;
  name: string;
  city: string | null;
}

interface ResolutionPreview {
  ref: string;
  topic: string;
  member_count: number;
  tier: 1 | 2 | 3;
  sentiment: "pro_climate" | "anti_climate" | "neutral";
  reviewer_note: string;
}

interface ImportResult {
  ok: boolean;
  dry_run: boolean;
  resolutions_total: number;
  keyword_matched: number;
  tier1: number;
  tier2: number;
  tier3: number;
  votes_inserted: number;
  vote_breakdown?: {
    for_beneficial: number;
    for_harmful: number;
    against_beneficial: number;
    against_harmful: number;
  };
  unmatched_members: string[];
  rescored_candidates: number;
  resolutions?: ResolutionPreview[];
}

const TIER_LABELS: Record<number, string> = { 1: "Explicitná", 2: "Implicitná", 3: "Vylúčená" };
const SENTIMENT_LABELS: Record<string, string> = {
  pro_climate: "Pro-klíma",
  anti_climate: "Anti-klíma",
  neutral: "Neutrálna",
};

export default function AdminVotingImport() {
  const [jurisdictions, setJurisdictions] = useState<Jurisdiction[]>([]);
  const [loadingJur, setLoadingJur] = useState(true);

  const [jurisdictionId, setJurisdictionId] = useState("");
  const [meetingDate, setMeetingDate] = useState("");

  // Hlasovanie source
  const [hlasovaineMode, setHlasovaineMode] = useState<"url" | "file">("url");
  const [hlasovaineUrl, setHlasovaineUrl] = useState("");
  const [hlasovaineFile, setHlasovaineFile] = useState<File | null>(null);

  // Uznesenia source
  const [uzneseniaMode, setUzneseniaMode] = useState<"url" | "file">("url");
  const [uzneseniaUrl, setUzneseniaUrl] = useState("");
  const [uzneseniaFile, setUzneseniaFile] = useState<File | null>(null);

  const [uploading, setUploading] = useState(false);
  const [runningDry, setRunningDry] = useState(false);
  const [runningImport, setRunningImport] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  useEffect(() => {
    supabase
      .from("jurisdictions")
      .select("id, name, city")
      .eq("is_active", true)
      .then(({ data, error }) => {
        if (error) {
          toast({ title: "Chyba pri načítaní zastupiteľstiev", variant: "destructive" });
        } else {
          setJurisdictions(data ?? []);
        }
        setLoadingJur(false);
      });
  }, []);

  async function uploadPdf(file: File, prefix: string): Promise<string> {
    const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${prefix}/${Date.now()}-${safe}`;
    const { error } = await supabase.storage
      .from("voting-records")
      .upload(path, file, { contentType: "application/pdf", upsert: false });
    if (error) throw error;
    return path;
  }

  function validateFile(file: File | null, label: string): boolean {
    if (!file) return true;
    if (file.size > MAX_PDF_BYTES) {
      toast({ title: `${label}: súbor je príliš veľký`, description: "Max 20 MB.", variant: "destructive" });
      return false;
    }
    return true;
  }

  async function run(dry: boolean) {
    const hlasovaineReady =
      hlasovaineMode === "url" ? !!hlasovaineUrl.trim() : !!hlasovaineFile;
    if (!jurisdictionId || !meetingDate || !hlasovaineReady) {
      toast({ title: "Vyplňte všetky povinné polia", variant: "destructive" });
      return;
    }
    if (!validateFile(hlasovaineFile, "Hlasovanie")) return;
    if (!validateFile(uzneseniaFile, "Uznesenia")) return;

    setUploading(true);
    setResult(null);

    let hlasovaineStoragePath: string | undefined;
    let uzneseniaStoragePath: string | undefined;
    try {
      if (hlasovaineMode === "file" && hlasovaineFile) {
        hlasovaineStoragePath = await uploadPdf(hlasovaineFile, jurisdictionId);
      }
      if (uzneseniaMode === "file" && uzneseniaFile) {
        uzneseniaStoragePath = await uploadPdf(uzneseniaFile, jurisdictionId);
      }
    } catch (e) {
      toast({
        title: "Nahranie PDF zlyhalo",
        description: e instanceof Error ? e.message : String(e),
        variant: "destructive",
      });
      setUploading(false);
      return;
    }
    setUploading(false);
    if (dry) setRunningDry(true);
    else setRunningImport(true);

    try {
      const { data, error } = await supabase.functions.invoke("parse-voting-record", {
        body: {
          jurisdiction_id: jurisdictionId,
          meeting_date: meetingDate,
          hlasovanie_url: hlasovaineMode === "url" ? hlasovaineUrl.trim() : undefined,
          hlasovanie_storage_path: hlasovaineStoragePath,
          uznesenia_url: uzneseniaMode === "url" && uzneseniaUrl.trim() ? uzneseniaUrl.trim() : undefined,
          uznesenia_storage_path: uzneseniaStoragePath,
          dry_run: dry,
        },
      });
      if (error) {
        let msg = error.message;
        try {
          const parsed = JSON.parse((error as { context?: { body?: string } }).context?.body ?? "");
          if (parsed?.error) msg = parsed.error;
        } catch { /* ignore */ }
        throw new Error(msg);
      }
      setResult(data as ImportResult);
      if (!dry) {
        toast({
          title: "Import dokončený",
          description: `${data.votes_inserted} hlasovaní importovaných, ${data.rescored_candidates} kandidátov prepočítaných`,
        });
      }
    } catch (e) {
      toast({
        title: dry ? "Dry run zlyhal" : "Import zlyhal",
        description: e instanceof Error ? e.message : String(e),
        variant: "destructive",
      });
    } finally {
      if (dry) setRunningDry(false);
      else setRunningImport(false);
    }
  }

  const busy = uploading || runningDry || runningImport;
  const hlasovaineReady =
    hlasovaineMode === "url" ? !!hlasovaineUrl.trim() : !!hlasovaineFile;
  const canSubmit = !!jurisdictionId && !!meetingDate && hlasovaineReady;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-semibold">Import hlasovaní zastupiteľstva</h1>
        <p className="text-sm text-muted-foreground mt-1">
          CAP-03 — Načíta PDF záznamy z hlasovaní, klasifikuje klimatickú relevanciu a vloží hlasovanie do databázy.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-4 h-4" /> Zdroj hlasovaní
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Jurisdiction */}
          <div className="space-y-1.5">
            <Label htmlFor="jurisdiction">Zastupiteľstvo *</Label>
            {loadingJur ? (
              <div className="text-sm text-muted-foreground">Načítavam…</div>
            ) : (
              <Select value={jurisdictionId} onValueChange={setJurisdictionId}>
                <SelectTrigger id="jurisdiction">
                  <SelectValue placeholder="Vyberte zastupiteľstvo" />
                </SelectTrigger>
                <SelectContent>
                  {jurisdictions.map((j) => (
                    <SelectItem key={j.id} value={j.id}>
                      {j.name}
                      {j.city ? ` (${j.city})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Meeting date */}
          <div className="space-y-1.5">
            <Label htmlFor="meeting-date">Dátum zasadania *</Label>
            <Input
              id="meeting-date"
              type="date"
              value={meetingDate}
              onChange={(e) => setMeetingDate(e.target.value)}
              className="max-w-xs"
            />
          </div>

          {/* Hlasovanie PDF — required */}
          <div className="space-y-1.5">
            <Label>Hlasovanie PDF *</Label>
            <p className="text-xs text-muted-foreground -mt-0.5">
              Tabuľka hlasovaní — kto hlasoval ako za každé uznesenie.
            </p>
            <Tabs
              value={hlasovaineMode}
              onValueChange={(v) => {
                setHlasovaineMode(v as "url" | "file");
                setHlasovaineFile(null);
              }}
            >
              <TabsList className="grid w-52 grid-cols-2">
                <TabsTrigger value="url">URL</TabsTrigger>
                <TabsTrigger value="file">Nahrať PDF</TabsTrigger>
              </TabsList>
              <TabsContent value="url" className="pt-2">
                <Input
                  type="url"
                  placeholder="https://www.mckvp.sk/…/hlasovanie.pdf"
                  value={hlasovaineUrl}
                  onChange={(e) => setHlasovaineUrl(e.target.value)}
                />
              </TabsContent>
              <TabsContent value="file" className="pt-2">
                <Input
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={(e) => setHlasovaineFile(e.target.files?.[0] ?? null)}
                />
                {hlasovaineFile && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {hlasovaineFile.name} ({(hlasovaineFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Uznesenia PDF — optional */}
          <div className="space-y-1.5">
            <Label>Uznesenia PDF <span className="text-muted-foreground">(voliteľné)</span></Label>
            <p className="text-xs text-muted-foreground -mt-0.5">
              Text uznesení — zlepší presnosť klasifikácie.
            </p>
            <Tabs
              value={uzneseniaMode}
              onValueChange={(v) => {
                setUzneseniaMode(v as "url" | "file");
                setUzneseniaFile(null);
              }}
            >
              <TabsList className="grid w-52 grid-cols-2">
                <TabsTrigger value="url">URL</TabsTrigger>
                <TabsTrigger value="file">Nahrať PDF</TabsTrigger>
              </TabsList>
              <TabsContent value="url" className="pt-2">
                <Input
                  type="url"
                  placeholder="https://www.mckvp.sk/…/uznesenia.pdf"
                  value={uzneseniaUrl}
                  onChange={(e) => setUzneseniaUrl(e.target.value)}
                />
              </TabsContent>
              <TabsContent value="file" className="pt-2">
                <Input
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={(e) => setUzneseniaFile(e.target.files?.[0] ?? null)}
                />
                {uzneseniaFile && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {uzneseniaFile.name} ({(uzneseniaFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Action buttons — text never changes; only the active button shows a spinner. */}
          <div className="flex gap-3 pt-1">
            <Button
              variant="outline"
              onClick={() => run(true)}
              disabled={!canSubmit || busy}
            >
              {runningDry || (uploading && !runningImport) ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Eye className="w-4 h-4 mr-1" />
              )}
              Dry run (náhľad)
            </Button>
            <Button onClick={() => run(false)} disabled={!canSubmit || busy}>
              {runningImport ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : uploading && !runningDry ? (
                <Upload className="w-4 h-4 mr-1" />
              ) : (
                <Play className="w-4 h-4 mr-1" />
              )}
              Importovať hlasovanie
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && <ImportResultPanel result={result} />}
    </div>
  );
}

function ImportResultPanel({ result }: { result: ImportResult }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            {result.dry_run
              ? <><Eye className="w-4 h-4" /> Výsledok dry run</>
              : <><CheckCircle2 className="w-4 h-4 text-green-600" /> Import dokončený</>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <Stat label="Uznesenia celkom" value={result.resolutions_total} />
            <Stat label="Klíma relevanté" value={result.keyword_matched} />
            <Stat
              label={result.dry_run ? "Po importe sa vloží hlasovaní" : "Hlasovaní vložených"}
              value={result.votes_inserted}
            />
            {!result.dry_run && <Stat label="Kandidátov prepočítaných" value={result.rescored_candidates} />}
          </div>
          <div className="flex gap-2 mt-4 flex-wrap">
            <Badge variant="secondary">Tier 1 (explicitná): {result.tier1}</Badge>
            <Badge variant="outline">Tier 2 (implicitná): {result.tier2}</Badge>
            <Badge variant="outline" className="text-muted-foreground">
              Tier 3 (vylúčená, nevkladané): {result.tier3}
            </Badge>
          </div>

          {result.vote_breakdown && (
            <div className="mt-5 pt-4 border-t">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Rozpis hlasov (klíma relevantné)
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <Stat label="ZA prospešné opatrenie" value={result.vote_breakdown.for_beneficial} />
                <Stat label="PROTI škodlivému opatreniu" value={result.vote_breakdown.against_harmful} />
                <Stat label="ZA škodlivé opatrenie" value={result.vote_breakdown.for_harmful} />
                <Stat label="PROTI prospešnému opatreniu" value={result.vote_breakdown.against_beneficial} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {result.unmatched_members.length > 0 && (
        <Card className="border-yellow-300">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-yellow-700">
              <AlertTriangle className="w-4 h-4" /> Nespárované mená ({result.unmatched_members.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              Tieto mená z PDF neboli spárované so žiadnym kandidátom (Jaro-Winkler &lt; 0.90).
              Vytvorte kandidátske záznamy a spustite import znovu.
            </p>
            <ul className="text-sm space-y-1">
              {result.unmatched_members.map((name) => (
                <li key={name} className="font-mono bg-muted px-2 py-0.5 rounded">{name}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {result.dry_run && result.resolutions && result.resolutions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="w-4 h-4" /> Uznesenia — klimatická klasifikácia
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Ref</TableHead>
                  <TableHead>Téma</TableHead>
                  <TableHead className="w-28">Relevancia</TableHead>
                  <TableHead className="w-28">Smer</TableHead>
                  <TableHead className="w-16 text-right">Člen.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.resolutions.map((r) => (
                  <TableRow key={r.ref} className={r.tier === 3 ? "opacity-50" : undefined}>
                    <TableCell className="font-mono text-xs">{r.ref}</TableCell>
                    <TableCell className="text-xs max-w-xs">
                      <span className="line-clamp-2">{r.topic}</span>
                      {r.tier === 2 && r.reviewer_note && (
                        <span className="block text-muted-foreground italic text-xs mt-0.5">
                          {r.reviewer_note}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={r.tier === 1 ? "default" : r.tier === 2 ? "secondary" : "outline"}
                        className="text-xs"
                      >
                        {TIER_LABELS[r.tier]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {r.tier !== 3 ? SENTIMENT_LABELS[r.sentiment] : "—"}
                    </TableCell>
                    <TableCell className="text-right text-xs">{r.member_count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
