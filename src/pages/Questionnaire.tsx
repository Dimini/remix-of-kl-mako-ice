import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, FileText, ShieldCheck, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";

// ---------------------------------------------------------------------------
// Climate questionnaire — Slovak labels
// 10 questions covering core regional/municipal climate competences.
// Scale: súhlas 1 (vôbec nesúhlasím) → 5 (úplne súhlasím)
// ---------------------------------------------------------------------------

type AgreeScale = "1" | "2" | "3" | "4" | "5";

interface ScaleQuestion {
  id: string;
  label: string;
  hint?: string;
}

const SCALE_QUESTIONS: ScaleQuestion[] = [
  {
    id: "q1_climate_priority",
    label:
      "Klíma a životné prostredie patria medzi top 3 priority môjho programu pre kraj/mesto.",
  },
  {
    id: "q2_emission_target",
    label:
      "Podporím prijatie merateľného cieľa zníženia emisií skleníkových plynov pre kraj/mesto do roku 2030.",
    hint: "Napr. klimatický plán so záväznými míľnikmi.",
  },
  {
    id: "q3_public_transport",
    label:
      "Presadím rozšírenie a zatraktívnenie verejnej dopravy ako alternatívy k individuálnej automobilovej doprave.",
  },
  {
    id: "q4_renewables",
    label:
      "Aktívne podporím rozvoj obnoviteľných zdrojov energie (slnko, vietor, geotermál) na území kraja/mesta.",
  },
  {
    id: "q5_building_renovation",
    label:
      "Vyhradím prostriedky na hĺbkovú obnovu verejných budov so zameraním na energetickú efektívnosť.",
  },
  {
    id: "q6_green_infrastructure",
    label:
      "Budem zvyšovať podiel zelene a vodozádržných prvkov v zastavanom území (parky, stromoradia, dažďové záhrady).",
  },
  {
    id: "q7_waste",
    label:
      "Podporím opatrenia na výrazné zvýšenie miery triedenia a recyklácie odpadu.",
  },
  {
    id: "q8_just_transition",
    label:
      "Súhlasím, že klimatické opatrenia musia byť spravodlivé voči nízkopríjmovým domácnostiam.",
  },
  {
    id: "q9_adaptation",
    label:
      "Považujem prípravu kraja/mesta na dopady klimatickej zmeny (horúčavy, sucho, povodne) za naliehavú úlohu.",
  },
  {
    id: "q10_transparency",
    label:
      "Zaviažem sa zverejňovať pokrok v plnení klimatických cieľov minimálne raz ročne.",
  },
];

const scaleEnum = z.enum(["1", "2", "3", "4", "5"], {
  message: "Vyberte odpoveď na škále 1–5.",
});

const formSchema = z.object({
  candidateName: z
    .string()
    .trim()
    .min(2, "Zadajte celé meno (min. 2 znaky).")
    .max(120, "Maximálne 120 znakov."),
  email: z
    .string()
    .trim()
    .email("Neplatná e-mailová adresa.")
    .max(255, "Maximálne 255 znakov."),
  ...Object.fromEntries(
    SCALE_QUESTIONS.map((q) => [q.id, scaleEnum]),
  ) as Record<(typeof SCALE_QUESTIONS)[number]["id"], typeof scaleEnum>,
  priorityActions: z
    .string()
    .trim()
    .min(20, "Opíšte aspoň jedno konkrétne opatrenie (min. 20 znakov).")
    .max(2000, "Maximálne 2000 znakov."),
  additionalNotes: z
    .string()
    .trim()
    .max(2000, "Maximálne 2000 znakov.")
    .optional()
    .or(z.literal("")),
  consentPublish: z.literal(true, {
    message: "Pre odoslanie je potrebný súhlas so zverejnením odpovedí.",
  }),
  consentTruthful: z.literal(true, {
    message: "Potvrďte, prosím, pravdivosť uvedených údajov.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

const SCALE_LABELS: Record<AgreeScale, string> = {
  "1": "Vôbec nesúhlasím",
  "2": "Skôr nesúhlasím",
  "3": "Neviem / neutrálne",
  "4": "Skôr súhlasím",
  "5": "Úplne súhlasím",
};

export default function Questionnaire() {
  const { uuid = "" } = useParams();
  const [submitted, setSubmitted] = useState(false);

  const defaultValues = useMemo(
    () =>
      ({
        candidateName: "",
        email: "",
        priorityActions: "",
        additionalNotes: "",
        consentPublish: false as unknown as true,
        consentTruthful: false as unknown as true,
        ...Object.fromEntries(SCALE_QUESTIONS.map((q) => [q.id, undefined])),
      }) as unknown as FormValues,
    [],
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onTouched",
  });

  const onSubmit = (values: FormValues) => {
    // MVP: log to console; backend wiring (Supabase) lands in CAP-05.
    // eslint-disable-next-line no-console
    console.info("[questionnaire:submit]", { uuid, values });
    toast({
      title: "Odpovede odoslané",
      description: "Ďakujeme. Vaše odpovede sme bezpečne zaznamenali.",
    });
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (submitted) {
    return (
      <main className="container py-12 max-w-2xl">
        <Card className="border-primary/30">
          <CardHeader className="items-center text-center">
            <div className="rounded-full bg-primary/10 p-4 mb-2">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-3xl font-black tracking-tight">
              Ďakujeme za vaše odpovede
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              Vaše odpovede boli prijaté a budú v súlade s metodikou{" "}
              <Link to="/metodologia" className="text-primary underline">
                Klima Kompas
              </Link>{" "}
              vyhodnotené nezávislou redakciou. Zverejníme ich verbatim,
              bez úprav, spolu s hodnotením vášho klimatického skóre.
            </p>
            <p>
              Na e-mail, ktorý ste uviedli, vám pošleme potvrdenie a neskôr
              informáciu o zverejnení vašej karty kandidáta.
            </p>
            <div className="rounded-md bg-muted/40 p-3 text-xs">
              ID pozvánky:{" "}
              <code className="bg-background px-1.5 py-0.5 rounded">
                {uuid || "—"}
              </code>
            </div>
            <div className="pt-2">
              <Button asChild variant="outline">
                <Link to="/">Späť na úvod</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="container py-10 max-w-3xl">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
          Klima Kompas · Voľby 2026
        </p>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-3">
          Klimatický dotazník pre kandidáta/kandidátku
        </h1>
        <p className="text-muted-foreground">
          Tento dotazník je súčasťou hodnotenia kandidátov v rámci pilieru{" "}
          <strong>SLOVÁ</strong>. Vaše odpovede budú zverejnené{" "}
          <strong>verbatim, bez redakčných úprav</strong>, v súlade s{" "}
          <Link to="/metodologia" className="text-primary underline">
            metodikou
          </Link>
          . Vyplnenie zaberie cca 8–12 minút.
        </p>
      </header>

      <div className="rounded-md border bg-muted/30 px-4 py-3 mb-8 text-xs text-muted-foreground flex items-start gap-2">
        <ShieldCheck className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
        <span>
          ID pozvánky:{" "}
          <code className="bg-background px-1.5 py-0.5 rounded">
            {uuid || "—"}
          </code>
          . Tento odkaz je jedinečný a viazaný na vašu kandidatúru.
        </span>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Identita ----------------------------------------------------- */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Identifikácia
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <FormField
                control={form.control}
                name="candidateName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Celé meno</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="napr. Mária Nováková"
                        autoComplete="name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kontaktný e-mail</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="meno@priklad.sk"
                        autoComplete="email"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Použijeme len na potvrdenie a komunikáciu k zverejneniu.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Postoje ------------------------------------------------------ */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Postoje a záväzky</CardTitle>
              <p className="text-sm text-muted-foreground">
                Pri každom tvrdení vyberte mieru súhlasu na škále 1 (vôbec
                nesúhlasím) – 5 (úplne súhlasím).
              </p>
            </CardHeader>
            <CardContent className="space-y-7">
              {SCALE_QUESTIONS.map((q, idx) => (
                <FormField
                  key={q.id}
                  control={form.control}
                  name={q.id as keyof FormValues}
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="block text-sm leading-relaxed">
                        <span className="text-muted-foreground mr-2">
                          {idx + 1}.
                        </span>
                        {q.label}
                      </FormLabel>
                      {q.hint && (
                        <FormDescription>{q.hint}</FormDescription>
                      )}
                      <FormControl>
                        <RadioGroup
                          value={(field.value as string) ?? ""}
                          onValueChange={field.onChange}
                          className="grid grid-cols-1 sm:grid-cols-5 gap-2"
                        >
                          {(["1", "2", "3", "4", "5"] as AgreeScale[]).map(
                            (val) => (
                              <label
                                key={val}
                                className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-xs cursor-pointer hover:bg-accent transition-colors"
                              >
                                <RadioGroupItem value={val} id={`${q.id}-${val}`} />
                                <span className="font-semibold">{val}</span>
                                <span className="text-muted-foreground truncate">
                                  {SCALE_LABELS[val]}
                                </span>
                              </label>
                            ),
                          )}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </CardContent>
          </Card>

          {/* Otvorené odpovede ------------------------------------------- */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Vaše konkrétne opatrenia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <FormField
                control={form.control}
                name="priorityActions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tri konkrétne klimatické/environmentálne opatrenia, ktoré
                      presadíte v prvom roku v úrade
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        rows={6}
                        placeholder="1) … 2) … 3) …"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Buďte konkrétni — uveďte cieľ, časový rámec a zodpovedný
                      orgán.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="additionalNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Doplňujúci komentár (nepovinné)</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder="Čokoľvek, čo by ste radi doplnili k vyššie uvedeným odpovediam."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Súhlasy ------------------------------------------------------ */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Súhlasy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="consentPublish"
                render={({ field }) => (
                  <FormItem className="flex items-start gap-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value as unknown as boolean}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1">
                      <FormLabel className="text-sm font-normal leading-snug">
                        Súhlasím so zverejnením mojich odpovedí v plnom znení na
                        verejnej stránke Klima Kompas.
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="consentTruthful"
                render={({ field }) => (
                  <FormItem className="flex items-start gap-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value as unknown as boolean}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1">
                      <FormLabel className="text-sm font-normal leading-snug">
                        Potvrdzujem, že odpovede som vyplnil(a) ja osobne a
                        zodpovedajú skutočnosti.
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="rounded-md border border-dashed bg-muted/20 p-4 text-xs text-muted-foreground flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <p>
              Toto hodnotenie nie je odporúčaním na hlasovanie. Hodnotenie
              sociálnych sietí bude doplnené v ďalšej fáze.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset(defaultValues)}
            >
              Vyčistiť formulár
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting
                ? "Odosielam…"
                : "Odoslať odpovede"}
            </Button>
          </div>
        </form>
      </Form>
    </main>
  );
}
