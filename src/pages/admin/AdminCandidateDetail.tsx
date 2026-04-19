import { useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Save, Trash2 } from "lucide-react";

import { db } from "@/lib/db/dexie";
import { KRAJS, getKraj } from "@/lib/krajs";
import {
  STATE_LABELS,
  nextStates,
  canTransition,
} from "@/lib/stateMachine";
import type {
  CandidateState,
  KrajId,
  Position,
  ScoreBreakdown,
} from "@/types/domain";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge as UiBadge } from "@/components/ui/badge";
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

const EMPTY_SCORE: ScoreBreakdown = {
  programNorm: null,
  questionnaireNorm: null,
  socialNorm: null,
  votesNorm: null,
  actionsNorm: null,
  slova: null,
  skutky: null,
  total: null,
  badge: "grey",
  badgeSubtype: "GREY_NO_DATA",
  formulaVersion: "v1.0",
};

export default function AdminCandidateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === "new";
  const { reviewer } = useAdminAuth();

  const existing = useLiveQuery(
    () => (isNew ? Promise.resolve(undefined) : db.candidates.get(id!)),
    [id, isNew],
  );

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

  // Hydrate form once existing record loads.
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

  // Auto-fill city for primátor when kraj changes & city empty.
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

  async function onSubmit(values: FormValues) {
    const now = new Date().toISOString();
    if (isNew) {
      const newId = `${values.krajId.toLowerCase()}-${values.position}-${Date.now().toString(36)}`;
      await db.candidates.put({
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
        score: EMPTY_SCORE,
        questionnaireResponded: false,
        isApproved: false,
        createdAt: now,
        updatedAt: now,
      });
      toast({ title: "Vytvorené", description: `Kandidát ${values.name} bol pridaný.` });
      navigate(`/admin/candidate/${newId}`, { replace: true });
      return;
    }

    if (!existing) return;
    await db.candidates.put({
      ...existing,
      name: values.name,
      position: values.position as Position,
      krajId: values.krajId as KrajId,
      city: values.city || undefined,
      party: values.party,
      isIndependent: values.isIndependent,
      incumbent: values.incumbent,
      year: values.year,
      photoUrl: values.photoUrl || undefined,
      updatedAt: now,
    });
    toast({ title: "Uložené", description: "Zmeny sú uložené lokálne." });
  }

  async function handleTransition(to: CandidateState) {
    if (!existing) return;
    const guard = canTransition(existing.state, to);
    if (!guard.ok) {
      toast({ title: "Chyba", description: guard.reason, variant: "destructive" });
      return;
    }
    const updates: Partial<typeof existing> = {
      state: to,
      updatedAt: new Date().toISOString(),
    };
    if (to === "APPROVED") updates.isApproved = true;
    if (to === "NEEDS_REVISION") updates.isApproved = false;
    await db.candidates.update(existing.id, updates);
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
  }

  async function handleDelete() {
    if (!existing) return;
    if (!confirm(`Naozaj zmazať kandidáta „${existing.name}"? Vymažú sa aj všetky dôkazy.`)) return;
    await db.candidates.delete(existing.id);
    await db.evidence.where("candidateId").equals(existing.id).delete();
    toast({ title: "Zmazané", description: "Kandidát bol odstránený z lokálnej evidencie." });
    navigate("/admin", { replace: true });
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
            Linear progression. Spätný prechod len IN_REVIEW → NEEDS_REVISION → ANALYZED.
          </p>
          <div className="flex flex-wrap gap-2">
            {transitions.map((t) => (
              <Button
                key={t.to}
                size="sm"
                variant={t.variant ?? "default"}
                onClick={() => handleTransition(t.to)}
              >
                {t.label}
              </Button>
            ))}
          </div>
        </Card>
      )}

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
                  <FormLabel>URL fotografie (voliteľné)</FormLabel>
                  <FormControl><Input {...field} placeholder="https://…" /></FormControl>
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
      {!isNew && existing && <ScorePreview candidateId={existing.id} />}
      {!isNew && existing && <EvidenceSection candidateId={existing.id} />}
      {!isNew && existing && <AuditLogPanel candidateId={existing.id} />}
    </div>
  );
}
