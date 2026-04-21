import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Save, Trash2, EyeOff } from "lucide-react";

import { KRAJS, getKraj } from "@/lib/krajs";
import {
  STATE_LABELS,
  nextStates,
  canTransition,
} from "@/lib/stateMachine";
import type { CandidateState, KrajId, Position } from "@/types/domain";
import { adminCandidatesRepo } from "@/lib/repository/adminCandidates";
import { getResponseForCandidate } from "@/lib/repository/questionnaire";
import { useSupabaseQuery } from "@/hooks/useSupabaseQuery";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge as UiBadge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { EvidenceSection } from "@/components/admin/EvidenceSection";
import { ScorePreview } from "@/components/admin/ScorePreview";
import { AuditLogPanel } from "@/components/admin/AuditLogPanel";
import { QuestionnaireLinkPanel } from "@/components/admin/QuestionnaireLinkPanel";
import { CandidatePhotoUpload } from "@/components/admin/CandidatePhotoUpload";
import { AIToolsPanel } from "@/components/admin/AIToolsPanel";
import { logAudit } from "@/lib/audit";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

const candidateSchema = z.object({
  name: z.string().trim().min(2, "Min. 2 znaky").max(120),
  position: z.enum(["zupan", "primator"]),
  krajId: z.enum(["BA", "TT", "TN", "NR", "ZA", "BB", "PO", "KE"]),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  party: z.string().trim().min(1, "Povinné").max(80),
  isIndependent: z.boolean(),
  incumbent: z.boolean(),
  year: z.number().int().min(2024).max(2030),
  photoUrl: z.string().trim().url("Neplatná URL").or(z.literal("")).optional(),
});

type FormValues = z.infer<typeof candidateSchema>;

export default function AdminCandidateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === "new";
  const { reviewer } = useAdminAuth();

  const fetcher = useCallback(
    () => (isNew ? Promise.resolve(null) : adminCandidatesRepo.getById(id!)),
    [id, isNew],
  );
  const { data: existing, refetch } = useSupabaseQuery(fetcher, [id, isNew], isNew ? [] : ["candidates"]);

  const questionnaireFetcher = useCallback(
    () => (isNew ? Promise.resolve(null) : getResponseForCandidate(id!)),
    [id, isNew],
  );
  const { data: questionnaireResponse, refetch: refetchQuestionnaire } = useSupabaseQuery(
    questionnaireFetcher,
    [id, isNew, "q-response"],
    isNew ? [] : ["questionnaire_responses"],
  );

  const handleQuestionnaireRefresh = useCallback(() => {
    refetch();
    refetchQuestionnaire();
  }, [refetch, refetchQuestionnaire]);


  const form = useForm<FormValues>({
    resolver: zodResolver(candidateSchema),
    defaultValues: {
      name: "",
      position: "zupan",
      krajId: "BA",
      city: "",
      party: "",
      isIndependent: false,
      incumbent: false,
      year: 2026,
      photoUrl: "",
    },
  });

  useEffect(() => {
    if (!existing) return;
    form.reset({
      name: existing.name,
      position: existing.position,
      krajId: existing.krajId,
      city: existing.city ?? "",
      party: existing.party,
      isIndependent: existing.isIndependent,
      incumbent: existing.incumbent ?? false,
      year: existing.year,
      photoUrl: existing.photoUrl ?? "",
    });
  }, [existing, form]);

  const position = form.watch("position");
  const krajId = form.watch("krajId");

  useEffect(() => {
    if (position === "primator" && !form.getValues("city")) {
      const k = getKraj(krajId);
      if (k) form.setValue("city", k.capital);
    }
  }, [position, krajId, form]);

  const transitions = useMemo(
    () => (existing ? nextStates(existing.state) : []),
    [existing],
  );

  const [unpublishDialogOpen, setUnpublishDialogOpen] = useState(false);
  const [unpublishNote, setUnpublishNote] = useState("");
  const [unpublishing, setUnpublishing] = useState(false);

  async function onSubmit(values: FormValues) {
    try {
      if (isNew) {
        const newId = crypto.randomUUID();
        await adminCandidatesRepo.upsert({
          id: newId,
          name: values.name,
          position: values.position as Position,
          krajId: values.krajId as KrajId,
          city: values.city || undefined,
          party: values.party,
          isIndependent: values.isIndependent,
          incumbent: values.incumbent,
          year: values.year,
          photoUrl: values.photoUrl || undefined,
          state: "REGISTERED",
          score: undefined as never,
          questionnaireResponded: false,
          isApproved: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        toast({ title: "Vytvorené", description: `Kandidát ${values.name} bol pridaný.` });
        navigate(`/admin/candidate/${newId}`, { replace: true });
        return;
      }

      if (!existing) return;
      await adminCandidatesRepo.update(existing.id, {
        name: values.name,
        position: values.position as Position,
        krajId: values.krajId as KrajId,
        city: values.city || undefined,
        party: values.party,
        isIndependent: values.isIndependent,
        incumbent: values.incumbent,
        year: values.year,
        photoUrl: values.photoUrl || undefined,
      });
      toast({ title: "Uložené", description: "Zmeny sú uložené." });
      refetch();
    } catch (e) {
      toast({
        title: "Chyba pri ukladaní",
        description: e instanceof Error ? e.message : String(e),
        variant: "destructive",
      });
    }
  }

  async function handleTransition(to: CandidateState) {
    if (!existing) return;
    const guard = canTransition(existing.state, to);
    if (!guard.ok) {
      toast({ title: "Chyba", description: guard.reason, variant: "destructive" });
      return;
    }
    const patch: Parameters<typeof adminCandidatesRepo.update>[1] = { state: to };
    if (to === "APPROVED") patch.isApproved = true;
    if (to === "NEEDS_REVISION") patch.isApproved = false;
    await adminCandidatesRepo.update(existing.id, patch);
    await logAudit({
      candidateId: existing.id,
      reviewer: reviewer || "neznámy",
      action:
        to === "APPROVED" ? "APPROVED" : to === "NEEDS_REVISION" ? "NEEDS_REVISION" : "STATE_CHANGE",
      fromState: existing.state,
      toState: to,
    });
    toast({
      title: "Stav zmenený",
      description: `${STATE_LABELS[existing.state]} → ${STATE_LABELS[to]}`,
    });
    refetch();
  }

  async function handleDelete() {
    if (!existing) return;
    if (!confirm(`Naozaj zmazať kandidáta „${existing.name}"? Vymažú sa aj všetky dôkazy.`)) return;
    await adminCandidatesRepo.remove(existing.id);
    toast({ title: "Zmazané", description: "Kandidát bol odstránený." });
    navigate("/admin", { replace: true });
  }

  async function handleUnpublish() {
    if (!existing || !unpublishNote.trim()) return;
    setUnpublishing(true);
    try {
      // Demote all approved scores so the public site stops serving them.
      const { error: scoreErr } = await supabase
        .from("scores")
        .update({ is_approved: false })
        .eq("candidate_id", existing.id)
        .eq("is_approved", true);
      if (scoreErr) throw scoreErr;
      // Pull candidate off public site and send back to review queue.
      await adminCandidatesRepo.update(existing.id, {
        state: "NEEDS_REVISION",
        isApproved: false,
      });
      await logAudit({
        candidateId: existing.id,
        reviewer: reviewer || "neznámy",
        action: "NEEDS_REVISION",
        fromState: "PUBLISHED",
        toState: "NEEDS_REVISION",
        note: unpublishNote.trim(),
      });
      setUnpublishDialogOpen(false);
      setUnpublishNote("");
      toast({
        title: "Publikovanie zrušené",
        description: `${existing.name} bol odstránený z verejného webu a vrátený do frontu.`,
      });
      refetch();
    } catch (e) {
      toast({
        title: "Chyba",
        description: e instanceof Error ? e.message : String(e),
        variant: "destructive",
      });
    } finally {
      setUnpublishing(false);
    }
  }

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/admin"><ArrowLeft className="w-4 h-4 mr-1" /> Späť na zoznam</Link>
      </Button>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isNew ? "Nový kandidát" : existing?.name ?? "Načítavam…"}
          </h1>
          {existing && (
            <div className="flex items-center gap-2 mt-2 text-sm">
              <UiBadge variant="secondary" className="font-mono">{existing.state}</UiBadge>
              <span className="text-muted-foreground">{STATE_LABELS[existing.state]}</span>
              {existing.isApproved && <UiBadge>Schválené</UiBadge>}
            </div>
          )}
        </div>
        {!isNew && existing && (
          <Button variant="ghost" size="sm" onClick={handleDelete} className="text-destructive">
            <Trash2 className="w-4 h-4 mr-1" /> Zmazať
          </Button>
        )}
      </div>

      {!isNew && existing && transitions.length > 0 && (
        <Card className="p-4">
          <div className="text-sm font-medium mb-2">Stav kandidáta</div>
          <p className="text-xs text-muted-foreground mb-3">
            Linear progression. Spätný prechod: IN_REVIEW → NEEDS_REVISION → ANALYZED.
            Publikované karty možno zrušiť tlačidlom nižšie — kandidát sa vráti do frontu kontroly.
          </p>
          <div className="flex flex-wrap gap-2">
            {transitions.map((t) => (
              <Button
                key={t.to}
                size="sm"
                variant={t.variant ?? "default"}
                onClick={() =>
                  existing.state === "PUBLISHED" && t.to === "NEEDS_REVISION"
                    ? setUnpublishDialogOpen(true)
                    : handleTransition(t.to)
                }
              >
                {t.to === "NEEDS_REVISION" && existing.state === "PUBLISHED" && (
                  <EyeOff className="w-4 h-4 mr-1" />
                )}
                {t.label}
              </Button>
            ))}
          </div>
        </Card>
      )}

      {/* Unpublish confirmation dialog */}
      <Dialog open={unpublishDialogOpen} onOpenChange={(open) => { setUnpublishDialogOpen(open); if (!open) setUnpublishNote(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <EyeOff className="w-5 h-5 text-destructive" />
              Zrušiť publikovanie
            </DialogTitle>
            <DialogDescription>
              Kandidát <strong>{existing?.name}</strong> bude okamžite odstránený z verejného webu.
              Skóre bude označené ako neschválené. Kandidát sa vráti do frontu kontroly (stav: Vyžaduje úpravy).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="unpublish-note" className="text-sm font-medium">
              Dôvod zrušenia publikovania <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="unpublish-note"
              rows={3}
              value={unpublishNote}
              onChange={(e) => setUnpublishNote(e.target.value)}
              placeholder="Napr.: Chybné skóre — program nebol analyzovaný správne. / Kandidát stiahol kandidatúru."
            />
            <p className="text-xs text-muted-foreground">
              Dôvod bude zaznamenaný v audit logu a viditeľný pre všetkých recenzentov.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setUnpublishDialogOpen(false); setUnpublishNote(""); }}>
              Zrušiť
            </Button>
            <Button
              variant="destructive"
              disabled={!unpublishNote.trim() || unpublishing}
              onClick={handleUnpublish}
            >
              {unpublishing ? "Odstraňujem…" : "Potvrdiť zrušenie"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meno a priezvisko</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pozícia</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="zupan">Predseda kraju (župan)</SelectItem>
                        <SelectItem value="primator">Primátor krajského mesta</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="krajId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kraj</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {KRAJS.map((k) => (
                          <SelectItem key={k.id} value={k.id}>{k.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {position === "primator" && (
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mesto</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormDescription>Krajské mesto pre primátorské voľby.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="party"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Strana / hnutie</FormLabel>
                    <FormControl><Input {...field} placeholder="Nezávislý / PS / KDH …" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rok volieb</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="photoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fotografia kandidáta (voliteľné)</FormLabel>
                  <FormControl>
                    <CandidatePhotoUpload
                      candidateId={isNew ? null : (existing?.id ?? null)}
                      value={field.value || undefined}
                      onChange={(url) => {
                        field.onChange(url);
                        // Persist immediately so the public scorecard reflects it
                        // without requiring a separate "Save" click.
                        if (existing) {
                          void adminCandidatesRepo.update(existing.id, {
                            photoUrl: url || undefined,
                          });
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-wrap gap-6 pt-2">
              <FormField
                control={form.control}
                name="isIndependent"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3 space-y-0">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <Label>Nezávislý kandidát</Label>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="incumbent"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3 space-y-0">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <Label>Súčasný držiteľ pozície</Label>
                  </FormItem>
                )}
              />
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit"><Save className="w-4 h-4 mr-1" /> {isNew ? "Vytvoriť" : "Uložiť zmeny"}</Button>
            </div>
          </form>
        </Form>
      </Card>

      {!isNew && existing && <QuestionnaireLinkPanel candidateId={existing.id} />}
      {!isNew && existing && (
        <AIToolsPanel
          candidateId={existing.id}
          questionnaireSubmitted={questionnaireResponse?.status === "submitted"}
          onComplete={handleQuestionnaireRefresh}
        />
      )}
      {!isNew && existing && <ScorePreview candidateId={existing.id} />}
      {!isNew && existing && <EvidenceSection candidateId={existing.id} />}
      {!isNew && existing && <AuditLogPanel candidateId={existing.id} />}
    </div>
  );
}
