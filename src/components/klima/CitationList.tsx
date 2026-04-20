import { ExternalLink, Info } from "lucide-react";
import type { SourceCitation } from "@/types/domain";
import { cn } from "@/lib/utils";

interface CitationListProps {
  citations: SourceCitation[];
  title?: string;
  className?: string;
}

const SOURCE_TYPE_LABELS: Record<SourceCitation["sourceType"], string> = {
  program: "Volebný program",
  questionnaire: "Odpoveď na dotazník",
  social_post: "Sociálna sieť",
  council_vote: "Zápisnica zastupiteľstva",
  resolution: "Uznesenie",
  initiative: "Iniciatíva",
  manual_entry: "Dokumentovaný čin",
};

const TIER_LABELS = {
  1: "Explicitné",
  2: "Implicitné",
  3: "Vylúčené",
} as const;

const TIER_CLASSES = {
  1: "bg-badge-green-soft text-badge-green",
  2: "bg-badge-yellow-soft text-badge-yellow",
  3: "bg-badge-grey-soft text-badge-grey",
} as const;

export function CitationList({
  citations,
  title = "Zdroje a citácie",
  className,
}: CitationListProps) {
  if (citations.length === 0) {
    return (
      <div className={cn("rounded-lg border bg-card p-5", className)}>
        <h3 className="text-sm font-bold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground italic">
          Zatiaľ neboli pridané žiadne zdroje.
        </p>
      </div>
    );
  }

  // Tier 3 items are stored but never scored — displayed for transparency only.
  const scored = citations.filter((c) => c.climateRelevanceTier !== 3);
  const excluded = citations.filter((c) => c.climateRelevanceTier === 3);

  return (
    <section className={cn("rounded-lg border bg-card p-5", className)}>
      <h3 className="text-sm font-bold mb-4">{title}</h3>
      <ul className="space-y-4">
        {scored.map((c) => (
          <CitationItem key={c.id} citation={c} />
        ))}
      </ul>
      {excluded.length > 0 && (
        <details className="mt-5">
          <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
            Zobraziť vylúčené zdroje (Tier 3) — {excluded.length}
          </summary>
          <ul className="mt-3 space-y-3 opacity-70">
            {excluded.map((c) => (
              <CitationItem key={c.id} citation={c} />
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}

function CitationItem({ citation }: { citation: SourceCitation }) {
  const tier = citation.climateRelevanceTier;
  return (
    <li className="border-l-2 border-border pl-4">
      <div className="flex flex-wrap items-center gap-2 mb-1.5">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {SOURCE_TYPE_LABELS[citation.sourceType]}
        </span>
        <span
          className={cn(
            "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
            TIER_CLASSES[tier],
          )}
          title={`Klimatická relevancia — Tier ${tier}`}
        >
          Tier {tier} · {TIER_LABELS[tier]}
        </span>
      </div>
      <blockquote className="text-sm text-foreground mb-2 italic">
        „{citation.citationText}"
      </blockquote>
      {tier === 2 && citation.reviewerNote && (
        <div className="flex gap-2 text-xs text-muted-foreground bg-muted/50 rounded p-2 mb-2">
          <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" aria-hidden />
          <span>{citation.reviewerNote}</span>
        </div>
      )}
      <a
        href={citation.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
      >
        Zobraziť zdroj
        <ExternalLink className="h-3 w-3" aria-hidden />
      </a>
    </li>
  );
}
