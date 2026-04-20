import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, X } from "lucide-react";

import type { EvidenceRecord } from "@/lib/repository/types";
import {
  ALL_EVIDENCE_TYPES,
  PILLAR_FOR_SOURCE,
  TIER_DESCRIPTIONS,
  TIER_LABELS,
  getEvidenceType,
} from "@/lib/evidenceTypes";
import { adminEvidenceRepo } from "@/lib/repository/adminCandidates";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge as UiBadge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

// ---------------------------------------------------------------------------
// Evidence entry form — shared for create + edit.
// SLOVÁ vs SKUTKY split:
//   - SLOVÁ types (program / questionnaire / social_post): NO point input.
//     Shows informational note about sub-score aggregation.
//   - SKUTKY types: shows the pre-computed fixed point value from the catalog.
// Tier 2 enforces a non-empty reviewerNote (zod superRefine).
// Tier 3 is captured but the scoring engine excludes it.
// ---------------------------------------------------------------------------

const baseSchema = z.object({
  evidenceType: z.string().min(1, "Vyberte typ dôkazu"),
  url: z.string().trim().url("Neplatná URL"),
  citationText: z
    .string()
    .trim()
    .min(10, "Citácia min. 10 znakov")
    .max(2000, "Max 2000 znakov"),
  climateRelevanceTier: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  reviewerNote: z.string().trim().max(2000).optional().or(z.literal("")),
  dateAccessed: z.string().min(8, "Dátum je povinný"),
  confidence: z.number().min(0).max(1).optional(),
});

const schema = baseSchema.superRefine((val, ctx) => {
  if (val.climateRelevanceTier === 2 && (!val.reviewerNote || val.reviewerNote.trim().length < 10)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["reviewerNote"],
      message: "Tier 2 vyžaduje vysvetlenie environmentálnej väzby (min. 10 znakov).",
    });
  }
});

export type EvidenceFormValues = z.infer<typeof schema>;

interface EvidenceFormProps {
  candidateId: string;
  initial?: EvidenceRecord;
  onSaved: () => void;
  onCancel: () => void;
}

export function EvidenceForm({ candidateId, initial, onSaved, onCancel }: EvidenceFormProps) {
  const form = useForm<EvidenceFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      evidenceType: initial?.evidenceType ?? "",
      url: initial?.url ?? "",
      citationText: initial?.citationText ?? "",
      climateRelevanceTier: (initial?.climateRelevanceTier ?? 1) as 1 | 2 | 3,
      reviewerNote: initial?.reviewerNote ?? "",
      dateAccessed: initial?.dateAccessed ?? new Date().toISOString().slice(0, 10),
      confidence: initial?.confidence,
    },
  });

  const evidenceType = form.watch("evidenceType");
  const tier = form.watch("climateRelevanceTier");

  const def = useMemo(() => getEvidenceType(evidenceType), [evidenceType]);
  const pillar = def?.pillar;

  // Reset reviewerNote when leaving Tier 2 to keep state clean.
  useEffect(() => {
    if (tier !== 2 && form.getValues("reviewerNote")) {
      // keep value but no enforcement; intentionally no clear
    }
  }, [tier, form]);

  async function onSubmit(values: EvidenceFormValues) {
    const definition = getEvidenceType(values.evidenceType);
    if (!definition) {
      toast({ title: "Chyba", description: "Neznámy typ dôkazu.", variant: "destructive" });
      return;
    }
    const now = new Date().toISOString();
    const record: EvidenceRecord = {
      id: initial?.id ?? crypto.randomUUID(),
      candidateId,
      pillar: definition.pillar,
      sourceType: definition.sourceType,
      evidenceType: definition.key,
      pointValue: definition.pillar === "skutky" ? definition.points ?? 0 : null,
      url: values.url,
      citationText: values.citationText,
      climateRelevanceTier: values.climateRelevanceTier,
      reviewerNote: values.reviewerNote?.trim() || undefined,
      dateAccessed: values.dateAccessed,
      confidence: values.confidence,
      createdAt: initial?.createdAt ?? now,
      updatedAt: now,
    };
    await adminEvidenceRepo.upsert(record);
    toast({
      title: initial ? "Dôkaz upravený" : "Dôkaz pridaný",
      description: `${definition.label} · ${PILLAR_FOR_SOURCE[definition.sourceType].toUpperCase()}`,
    });
    onSaved();
  }

  return (
    <Card className="p-5 border-primary/30">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="evidenceType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Typ dôkazu</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Vyberte typ…" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>SLOVÁ (deklarácie)</SelectLabel>
                      {ALL_EVIDENCE_TYPES.filter((t) => t.pillar === "slova").map((t) => (
                        <SelectItem key={t.key} value={t.key}>{t.label}</SelectItem>
                      ))}
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>SKUTKY (činy)</SelectLabel>
                      {ALL_EVIDENCE_TYPES.filter((t) => t.pillar === "skutky").map((t) => (
                        <SelectItem key={t.key} value={t.key}>
                          {t.label} ({(t.points ?? 0) > 0 ? "+" : ""}{t.points} b.)
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {def && <FormDescription>{def.description}</FormDescription>}
                <FormMessage />
              </FormItem>
            )}
          />

          {def && (
            <div className="rounded-md border bg-muted/40 p-3 text-sm">
              {pillar === "skutky" ? (
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <UiBadge variant="secondary" className="mr-2">SKUTKY</UiBadge>
                    Pevný bodový zisk z katalógu evidence_type.
                  </div>
                  <span className="font-mono text-base font-semibold">
                    {(def.points ?? 0) > 0 ? "+" : ""}{def.points} b.
                  </span>
                </div>
              ) : (
                <div className="space-y-1">
                  <UiBadge variant="secondary">SLOVÁ</UiBadge>
                  <p className="text-muted-foreground">
                    Tento záznam prispieva do <strong>SLOVÁ sub-skóre</strong>, ktoré sa vypočíta
                    z celej množiny dôkazov (program / dotazník / sociálne siete) — nemá fixnú
                    bodovú hodnotu.
                  </p>
                </div>
              )}
            </div>
          )}

          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL zdroja</FormLabel>
                <FormControl><Input {...field} placeholder="https://…" /></FormControl>
                <FormDescription>Každý bod skóre musí mať verejne dostupný zdroj.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="citationText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Citácia / verbatim text</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={4} placeholder="Doslovná citácia zo zdroja…" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="climateRelevanceTier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Klimatická relevancia</FormLabel>
                <Select
                  value={String(field.value)}
                  onValueChange={(v) => field.onChange(Number(v) as 1 | 2 | 3)}
                >
                  <FormControl>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {[1, 2, 3].map((t) => (
                      <SelectItem key={t} value={String(t)}>{TIER_LABELS[t as 1 | 2 | 3]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>{TIER_DESCRIPTIONS[tier as 1 | 2 | 3]}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {tier === 2 && (
            <FormField
              control={form.control}
              name="reviewerNote"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Poznámka recenzenta <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={3}
                      placeholder="Environmentálna väzba: napr. „rozšírenie autobusovej siete znižuje podiel individuálnej automobilovej dopravy.“"
                    />
                  </FormControl>
                  <FormDescription>
                    Povinné pre Tier 2. Vysvetlite environmentálnu väzbu — text bude verejne publikovaný spolu s citáciou.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {tier === 3 && (
            <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm">
              <strong>Tier 3 — vylúčené zo skóre.</strong> Záznam sa uloží pre transparentnosť,
              ale skórovací engine ho ignoruje.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="dateAccessed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dátum prístupu k zdroju</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confidence"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confidence (0–1, voliteľné)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.05"
                      min={0}
                      max={1}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(e.target.value === "" ? undefined : Number(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onCancel}>
              <X className="w-4 h-4 mr-1" /> Zrušiť
            </Button>
            <Button type="submit">
              <Save className="w-4 h-4 mr-1" /> {initial ? "Uložiť zmeny" : "Pridať dôkaz"}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}
