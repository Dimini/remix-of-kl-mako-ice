import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Calculator,
  Scale,
  Award,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  CircleDot,
  XCircle,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Badge } from "@/types/domain";

const FORMULA_VERSION = "v1.0";

const NORM_CAPS: {
  component: string;
  pillar: string;
  min: string;
  max: string;
  source: string;
}[] = [
  {
    component: "Volebný program",
    pillar: "SLOVÁ",
    min: "−35,30",
    max: "+17,31",
    source: "Carter et al. — globálny rozsah skóre klimatickej politiky",
  },
  {
    component: "Klimatický dotazník",
    pillar: "SLOVÁ",
    min: "0",
    max: "54",
    source: "NRSR 2023 — strana PS dosiahla 54 b.",
  },
  {
    component: "Hlasovania v zastupiteľstve",
    pillar: "SKUTKY",
    min: "−(n × 2)",
    max: "+(n × 2)",
    source: "n = počet klimaticky relevantných hlasovaní vo volebnom období",
  },
  {
    component: "Dokumentované činy",
    pillar: "SKUTKY",
    min: "−10",
    max: "+15",
    source: "Pevný rozsah definovaný metodológiou",
  },
];

const BADGE_ROWS: {
  badge: Badge;
  label: string;
  range: string;
  desc: string;
}[] = [
  {
    badge: "green",
    label: "Klimatický líder",
    range: "≥ 80 / 100",
    desc: "Konzistentné záväzky aj činy v prospech klimatickej politiky.",
  },
  {
    badge: "yellow",
    label: "Čiastočne aktívny",
    range: "55 – 79",
    desc: "Niektoré klimatické opatrenia podporuje, iné ignoruje alebo blokuje.",
  },
  {
    badge: "orange",
    label: "Slabá podpora klímy",
    range: "30 – 54",
    desc: "Klimatické témy okrajovo, prevažujú nesúvisiace alebo regresívne kroky.",
  },
  {
    badge: "red",
    label: "Proti klimatickej politike",
    range: "< 30",
    desc: "Verejne sa stavia proti klimatickým opatreniam alebo ich systematicky blokuje.",
  },
  {
    badge: "grey",
    label: "Nedostatok údajov",
    range: "—",
    desc: "Neexistuje dostatok overených zdrojov pre zodpovedný výpočet skóre.",
  },
];

const BADGE_DOT: Record<Badge, string> = {
  green: "bg-badge-green",
  yellow: "bg-badge-yellow",
  orange: "bg-badge-orange",
  red: "bg-badge-red",
  grey: "bg-badge-grey",
};

const TIER_ROWS = [
  {
    tier: 1,
    label: "Explicitné",
    icon: CheckCircle2,
    klass: "bg-badge-green/10 border-badge-green/40 text-foreground",
    iconKlass: "text-badge-green",
    desc:
      "Environmentálne prepojenie je výslovne uvedené v zdrojovom dokumente — napr. v dôvodovej správe, návrhu hlasovania alebo vyhlásení kandidáta. Recenzent vkladá doslovnú citáciu zo zdroja.",
    example:
      "Hlasovanie o cyklo-infraštruktúre, kde návrh výslovne uvádza zníženie emisií PM10 a CO₂.",
    requirement: "Žiadne dodatočné odôvodnenie sa nevyžaduje.",
  },
  {
    tier: 2,
    label: "Implicitné",
    icon: CircleDot,
    klass: "bg-badge-yellow/10 border-badge-yellow/40 text-foreground",
    iconKlass: "text-badge-orange-foreground",
    desc:
      "Environmentálne prepojenie je reálne a preukázateľné, ale zdrojový dokument ho neuvádza environmentálnym jazykom. Recenzent prepojenie zdokumentuje.",
    example:
      "Hlasovanie o rozšírení MHD bez zmienky o klíme — recenzent doloží: „Rozšírenie autobusovej siete znižuje podiel individuálnej automobilovej dopravy.\"",
    requirement:
      "Pole reviewer_note je POVINNÉ, zverejňuje sa verejne pri citácii.",
  },
  {
    tier: 3,
    label: "Vylúčené",
    icon: XCircle,
    klass: "bg-badge-grey/10 border-badge-grey/40 text-foreground",
    iconKlass: "text-muted-foreground",
    desc:
      "Žiadne dôveryhodné environmentálne prepojenie — buď neexistuje, alebo je príliš nepriame na čestné zdokumentovanie.",
    example:
      "Bežná oprava cestnej komunikácie bez environmentálneho rozmeru.",
    requirement:
      "Položka je v databáze pre transparentnosť, NIKDY sa nezapočítava do skóre.",
  },
];

export default function Metodologia() {
  useEffect(() => {
    document.title = "Metodológia | Volím klímu 2026";
  }, []);

  return (
    <main className="container py-8 md:py-12 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-muted-foreground flex items-center gap-1.5">
        <Link to="/" className="inline-flex items-center gap-1 hover:text-primary">
          <ArrowLeft className="h-3.5 w-3.5" />
          Slovensko
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">Metodológia</span>
      </nav>

      {/* Header */}
      <header className="mb-10">
        <div className="text-xs font-bold tracking-wider text-muted-foreground mb-2">
          KLIMA KOMPAS · FORMULA {FORMULA_VERSION}
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">
          Ako počítame klimatické skóre
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Každé skóre kombinuje to, <strong className="text-foreground">čo kandidát hovorí</strong>,
          a to, <strong className="text-foreground">čo skutočne robí</strong>. Dôraz dávame na
          činy. Každý bod skóre má overiteľný zdroj.
        </p>
      </header>

      {/* Section: Formula */}
      <section className="mb-12">
        <SectionHeader icon={Calculator} title="Vzorec" />
        <div className="rounded-xl border bg-card p-6 mb-4">
          <div className="font-mono text-sm md:text-base bg-muted/50 rounded p-4 mb-5 leading-relaxed">
            <div>
              <span className="font-bold text-primary">KLIMA_SCORE</span> ={" "}
              (<strong>SLOVÁ</strong> × 0,40) + (<strong>SKUTKY</strong> × 0,60)
            </div>
            <div className="mt-3 text-foreground/80">
              <strong>SLOVÁ</strong> = (program × 0,50) + (dotazník × 0,50){" "}
              <span className="text-muted-foreground">— MVP</span>
            </div>
            <div className="text-foreground/80">
              <strong>SKUTKY</strong> = (hlasovania × 0,417) + (činy × 0,583)
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Ak kandidát nemá históriu v zastupiteľstve: SKUTKY = činy (plná váha).
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PillarCard
              label="SLOVÁ"
              weight="40 %"
              title="Čo kandidát hovorí"
              body="Volebný program a odpovede na klimatický dotazník. Hodnotíme konkrétne záväzky, opatrenia a ciele."
            />
            <PillarCard
              label="SKUTKY"
              weight="60 %"
              title="Čo kandidát robí"
              body="Hlasovania v zastupiteľstve a dokumentované klimatické činy s overiteľnými zdrojmi. Skutky vážia viac ako slová."
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground italic">
          Hodnotenie sociálnych sietí bude doplnené v ďalšej fáze (váhy sa upravia na
          37,5 % program / 37,5 % dotazník / 25 % social).
        </p>
      </section>

      {/* Section: Normalisation */}
      <section className="mb-12">
        <SectionHeader icon={Scale} title="Normalizácia" />
        <p className="text-foreground/80 leading-relaxed mb-5">
          Každá zložka sa normalizuje na jednotnú škálu <strong>0 – 100</strong> podľa
          pevne stanovených minimálnych a maximálnych hodnôt:
        </p>
        <div className="font-mono text-sm bg-muted/50 rounded p-4 mb-5">
          normalised = min(100, max(0, (raw − min) ÷ (max − min) × 100))
        </div>

        <div className="overflow-x-auto rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-4 py-3 font-bold">Komponent</th>
                <th className="px-4 py-3 font-bold">Pilier</th>
                <th className="px-4 py-3 font-bold tabular-nums">Min</th>
                <th className="px-4 py-3 font-bold tabular-nums">Max</th>
                <th className="px-4 py-3 font-bold">Zdroj rozsahu</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {NORM_CAPS.map((row) => (
                <tr key={row.component}>
                  <td className="px-4 py-3 font-semibold">{row.component}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.pillar}</td>
                  <td className="px-4 py-3 tabular-nums">{row.min}</td>
                  <td className="px-4 py-3 tabular-nums">{row.max}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{row.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Section: Badge thresholds */}
      <section className="mb-12">
        <SectionHeader icon={Award} title="Hranice odznakov" />
        <div className="space-y-2">
          {BADGE_ROWS.map((row) => (
            <div
              key={row.badge}
              className="rounded-lg border bg-card p-4 flex items-start gap-4"
            >
              <div
                className={cn(
                  "shrink-0 h-10 w-10 rounded-full flex items-center justify-center font-black text-xs uppercase",
                  BADGE_DOT[row.badge],
                  row.badge === "yellow" || row.badge === "grey"
                    ? "text-foreground"
                    : "text-white",
                )}
                aria-hidden
              >
                {row.badge === "grey" ? "—" : row.range.replace(/[^\d]/g, "").slice(0, 2) || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1">
                  <h3 className="font-bold">{row.label}</h3>
                  <span className="text-sm font-mono text-muted-foreground tabular-nums">
                    {row.range}
                  </span>
                </div>
                <p className="text-sm text-foreground/80">{row.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          Sivý odznak má štyri pod-typy (zbierajú sa údaje, kandidát neodpovedal, nový
          kandidát, nízka spoľahlivosť). Pod-typ je viditeľný na detailovej stránke
          kandidáta.
        </p>
      </section>

      {/* Section: Climate Relevance Tiers */}
      <section className="mb-12">
        <SectionHeader icon={ShieldCheck} title="Klimatická relevancia (Tier 1 – 3)" />
        <p className="text-foreground/80 leading-relaxed mb-5">
          Každá citácia má pridelený <strong>Tier</strong> podľa toho, ako bol jej
          environmentálny dosah <em>zarámcovaný v zdroji</em> — nie podľa témy. Rovnaké
          hlasovanie o MHD môže byť Tier 1, 2 alebo 3 v závislosti od formulácie zdroja.
        </p>
        <div className="space-y-4">
          {TIER_ROWS.map((tier) => {
            const Icon = tier.icon;
            return (
              <article
                key={tier.tier}
                className={cn("rounded-lg border-2 p-5", tier.klass)}
              >
                <header className="flex items-center gap-3 mb-3">
                  <Icon className={cn("h-5 w-5 shrink-0", tier.iconKlass)} />
                  <h3 className="font-black text-lg">
                    Tier {tier.tier} ·{" "}
                    <span className="font-bold">{tier.label}</span>
                  </h3>
                </header>
                <p className="text-sm leading-relaxed mb-3">{tier.desc}</p>
                <div className="text-xs space-y-1.5">
                  <div>
                    <span className="font-bold uppercase tracking-wider text-muted-foreground">
                      Príklad:
                    </span>{" "}
                    <em className="text-foreground/80">{tier.example}</em>
                  </div>
                  <div>
                    <span className="font-bold uppercase tracking-wider text-muted-foreground">
                      Pravidlo:
                    </span>{" "}
                    <span className="text-foreground/80">{tier.requirement}</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Section: Guarantees */}
      <section className="mb-12">
        <SectionHeader icon={FileText} title="Záruky a obmedzenia" />
        <ul className="space-y-3">
          {[
            "Žiadne skóre nie je zverejnené bez schválenia človekom z #klimatapotrebuje.",
            "Každý bod skóre má overiteľný URL zdroj.",
            "Tier 3 položky sú viditeľné pre transparentnosť, ale NIKDY sa nezapočítavajú do skóre.",
            "Tier 2 položky vyžadujú verejne zobrazenú poznámku recenzenta.",
            "Odpovede na dotazník zverejňujeme nezmenené.",
            "Všetkých 16 kandidátov je vždy viditeľných — aj tí so sivým odznakom.",
          ].map((item, i) => (
            <li key={i} className="flex gap-3 items-start text-sm">
              <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-badge-green" />
              <span className="text-foreground/80">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Mandatory disclaimer */}
      <div className="rounded-lg border border-badge-yellow/40 bg-badge-yellow/10 p-4 text-sm flex items-start gap-3">
        <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-badge-orange-foreground/70" />
        <div>
          <p className="text-foreground/90">
            <strong>Toto hodnotenie nie je odporúčaním na hlasovanie.</strong> Klima
            Kompas informuje voličov o klimatických postojoch a činoch kandidátov;
            rozhodnutie zostáva výlučne na voličovi.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Hodnotenie sociálnych sietí bude doplnené v ďalšej fáze.
          </p>
        </div>
      </div>

      <div className="mt-10 text-center">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Späť na mapu Slovenska
        </Link>
      </div>
    </main>
  );
}

function SectionHeader({
  icon: Icon,
  title,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-4 pb-3 border-b">
      <Icon className="h-5 w-5 text-primary" />
      <h2 className="text-2xl md:text-3xl font-black tracking-tight">{title}</h2>
    </div>
  );
}

function PillarCard({
  label,
  weight,
  title,
  body,
}: {
  label: string;
  weight: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-lg border bg-background p-4">
      <div className="text-xs font-bold tracking-wider text-muted-foreground mb-1">
        {label} · {weight}
      </div>
      <div className="font-bold mb-1.5">{title}</div>
      <p className="text-sm text-foreground/80 leading-relaxed">{body}</p>
    </div>
  );
}
