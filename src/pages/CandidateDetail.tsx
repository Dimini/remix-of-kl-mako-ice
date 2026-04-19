import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { candidatesRepo } from "@/lib/repository/candidates";
import { getKraj } from "@/lib/krajs";
import type { Candidate, GreySubtype } from "@/types/domain";
import {
  CandidateBadge,
  PillarBar,
  ScoreBreakdown,
  CitationList,
} from "@/components/klima";
import { ArrowLeft, AlertTriangle, ChevronDown, User2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const GREY_EXPLANATIONS: Record<GreySubtype, { title: string; body: string }> = {
  GREY_NO_DATA: {
    title: "Údaje sa zbierajú",
    body:
      "Pre tohto kandidáta zatiaľ nemáme dostatok overených zdrojov. Skóre bude doplnené po analýze programu, dotazníka a hlasovaní.",
  },
  GREY_REFUSED: {
    title: "Kandidát neodpovedal na dotazník",
    body:
      "Dotazník bol odoslaný, ale kandidát naň neodpovedal a nemá doložiteľnú históriu hlasovaní v zastupiteľstve. Skóre nemožno zodpovedne vypočítať.",
  },
  GREY_NEW_CANDIDATE: {
    title: "Nový kandidát bez histórie",
    body:
      "Kandidát nemá doterajšiu prax v zastupiteľstve a počet dokumentovaných činov je príliš nízky pre spoľahlivý výpočet skóre.",
  },
  GREY_LOW_CONFIDENCE: {
    title: "Nízka spoľahlivosť údajov",
    body:
      "Dostupné zdroje majú nízku spoľahlivosť alebo si navzájom protirečia. Skóre zatiaľ nezverejňujeme, aby sme nezavádzali voličov.",
  },
};

export default function CandidateDetail() {
  const { id = "" } = useParams();
  const [candidate, setCandidate] = useState<Candidate | null | undefined>(undefined);

  useEffect(() => {
    setCandidate(undefined);
    candidatesRepo.getById(id).then(setCandidate);
  }, [id]);

  if (candidate === undefined) {
    return (
      <main className="container py-12 max-w-4xl">
        <div className="space-y-4">
          <div className="h-6 w-40 bg-muted animate-pulse rounded" />
          <div className="h-12 w-3/4 bg-muted animate-pulse rounded" />
          <div className="h-32 w-full bg-muted/60 animate-pulse rounded-lg" />
        </div>
      </main>
    );
  }
  if (candidate === null) {
    return (
      <main className="container py-12 max-w-4xl">
        <h1 className="text-2xl font-bold mb-4">Kandidát nenájdený</h1>
        <Link to="/" className="inline-flex items-center gap-1 text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" /> Späť na úvod
        </Link>
      </main>
    );
  }

  const kraj = getKraj(candidate.krajId);
  const positionLabel =
    candidate.position === "zupan" ? "Predseda kraju (župan)" : "Primátor";
  const isGrey = candidate.score.badge === "grey";
  const greyInfo = isGrey && candidate.score.badgeSubtype
    ? GREY_EXPLANATIONS[candidate.score.badgeSubtype]
    : null;

  return (
    <main className="container py-8 md:py-12 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-muted-foreground flex items-center gap-1.5 flex-wrap">
        <Link to="/" className="inline-flex items-center gap-1 hover:text-primary">
          <ArrowLeft className="h-3.5 w-3.5" />
          Slovensko
        </Link>
        <span>/</span>
        <Link
          to={`/region/${candidate.krajId.toLowerCase()}`}
          className="hover:text-primary"
        >
          {kraj?.name}
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium truncate">{candidate.name}</span>
      </nav>

      {/* Header card: photo, identity, score */}
      <header className="mb-8 rounded-xl border bg-card overflow-hidden">
        <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6">
          {/* Photo / placeholder */}
          <div className="shrink-0">
            {candidate.photoUrl ? (
              <img
                src={candidate.photoUrl}
                alt={`Portrét: ${candidate.name}`}
                className="h-28 w-28 md:h-32 md:w-32 rounded-lg object-cover border"
              />
            ) : (
              <div
                className="h-28 w-28 md:h-32 md:w-32 rounded-lg bg-muted flex items-center justify-center border"
                aria-hidden
              >
                <User2 className="h-12 w-12 text-muted-foreground/50" />
              </div>
            )}
          </div>

          {/* Identity */}
          <div className="flex-1 min-w-0">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-2">
              {positionLabel}
              {candidate.city && ` · ${candidate.city}`}
              {kraj && ` · ${kraj.id}`}
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight mb-2 text-balance">
              {candidate.name}
            </h1>
            <div className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>{candidate.party}</span>
              {candidate.isIndependent && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-muted text-xs font-semibold text-foreground">
                  nezávislý
                </span>
              )}
              {candidate.incumbent && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-muted text-xs font-semibold text-foreground">
                  súčasný
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Score banner — large badge with whole-number percent */}
        <div className="border-t bg-muted/30 px-6 md:px-8 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="text-xs font-bold tracking-wider text-muted-foreground mb-1">
              KLIMATICKÉ SKÓRE
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl md:text-6xl font-black tabular-nums leading-none">
                {candidate.score.total !== null ? candidate.score.total : "—"}
              </span>
              {candidate.score.total !== null && (
                <span className="text-xl font-bold text-muted-foreground">/ 100</span>
              )}
            </div>
          </div>
          <CandidateBadge
            badge={candidate.score.badge}
            score={candidate.score.total}
            subtype={candidate.score.badgeSubtype}
            size="lg"
          />
        </div>
      </header>

      {/* Grey sub-type explanation */}
      {greyInfo && (
        <div className="mb-6 rounded-lg border border-badge-grey/40 bg-badge-grey/10 p-5">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 mt-0.5 shrink-0 text-foreground/60" />
            <div>
              <h2 className="font-bold mb-1">{greyInfo.title}</h2>
              <p className="text-sm text-foreground/80 leading-relaxed">{greyInfo.body}</p>
            </div>
          </div>
        </div>
      )}

      {/* Pillar bars */}
      {!isGrey && (
        <section className="rounded-lg border bg-card p-5 md:p-6 mb-6">
          <h2 className="text-sm font-bold tracking-wide mb-4">Rozdelenie skóre</h2>
          <PillarBar slova={candidate.score.slova} skutky={candidate.score.skutky} />
        </section>
      )}

      {/* Score breakdown grid */}
      <section className="mb-6">
        <h2 className="text-sm font-bold tracking-wide mb-3 text-muted-foreground uppercase">
          Detailný rozpis komponentov
        </h2>
        <ScoreBreakdown
          score={candidate.score}
          questionnaireResponded={candidate.questionnaireResponded}
        />
      </section>

      {/* Citations grouped by pillar */}
      <CitationsByPillar candidate={candidate} />

      {/* Methodology summary (collapsible) */}
      <details className="mb-6 rounded-lg border bg-card group">
        <summary className="flex items-center justify-between cursor-pointer px-5 py-4 text-sm font-bold hover:bg-muted/30 transition-colors">
          <span>Ako vzniklo toto skóre? — Zhrnutie metodológie</span>
          <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
        </summary>
        <div className="px-5 pb-5 text-sm text-foreground/80 space-y-3 border-t pt-4">
          <p>
            Klimatické skóre kombinuje <strong>SLOVÁ</strong> (40 %) a{" "}
            <strong>SKUTKY</strong> (60 %). Slová zahŕňajú volebný program a odpovede na
            klimatický dotazník. Skutky zahŕňajú hlasovania v zastupiteľstve a
            dokumentované klimatické činy s overiteľnými zdrojmi.
          </p>
          <p>
            Každá zložka je normalizovaná na škálu 0–100 podľa pevne stanovených minimálnych
            a maximálnych hodnôt (formula v{candidate.score.formulaVersion}).
          </p>
          <p>
            Hranice odznakov:{" "}
            <span className="font-semibold">Líder ≥ 80</span>,{" "}
            <span className="font-semibold">Čiastočný ≥ 55</span>,{" "}
            <span className="font-semibold">Slabý ≥ 30</span>,{" "}
            <span className="font-semibold">Proti &lt; 30</span>,{" "}
            <span className="font-semibold">Sivý</span> = nedostatok údajov.
          </p>
          <Link
            to="/metodologia"
            className="inline-flex items-center gap-1 text-primary font-semibold hover:underline"
          >
            Celá metodológia →
          </Link>
        </div>
      </details>

      {/* Mandatory disclaimers */}
      <div className="mt-8 space-y-3 border-t pt-6">
        <div className="flex items-start gap-2 text-sm text-foreground/80">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-badge-orange-foreground/70" />
          <p>
            <strong>Toto hodnotenie nie je odporúčaním na hlasovanie.</strong> Voličov
            informujeme o klimatických postojoch a činoch kandidátov; rozhodnutie
            zostáva výlučne na voličovi.
          </p>
        </div>
        <p className="text-xs text-muted-foreground italic">
          Hodnotenie sociálnych sietí bude doplnené v ďalšej fáze.
        </p>
      </div>
    </main>
  );
}

function CitationsByPillar({ candidate }: { candidate: Candidate }) {
  const slova = candidate.citations.filter((c) => c.pillar === "slova");
  const skutky = candidate.citations.filter((c) => c.pillar === "skutky");

  return (
    <div className="space-y-6 mb-6">
      <PillarCitationGroup
        label="SLOVÁ"
        weight="40 %"
        sublabel="Program a dotazník"
        citations={slova}
      />
      <PillarCitationGroup
        label="SKUTKY"
        weight="60 %"
        sublabel="Hlasovania a dokumentované činy"
        citations={skutky}
      />
    </div>
  );
}

function PillarCitationGroup({
  label,
  weight,
  sublabel,
  citations,
}: {
  label: string;
  weight: string;
  sublabel: string;
  citations: Parameters<typeof CitationList>[0]["citations"];
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2 px-1">
        <h3 className={cn("text-sm font-black tracking-wider")}>
          {label}{" "}
          <span className="text-muted-foreground font-semibold">· {weight}</span>
        </h3>
        <span className="text-xs text-muted-foreground">{sublabel}</span>
      </div>
      <CitationList citations={citations} title={`Zdroje — ${label}`} />
    </div>
  );
}
