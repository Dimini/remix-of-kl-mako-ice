import type { ScoreBreakdown as ScoreBreakdownType } from "@/types/domain";

interface ScoreBreakdownProps {
  score: ScoreBreakdownType;
  questionnaireResponded: boolean;
}

// Detailed sub-score grid shown on candidate detail page.
// Displays all normalised components feeding into SLOVÁ and SKUTKY.
export function ScoreBreakdown({
  score,
  questionnaireResponded,
}: ScoreBreakdownProps) {
  return (
    <div className="rounded-lg border bg-card divide-y">
      <Section title="SLOVÁ — čo kandidát hovorí" weight="40%">
        <Row label="Program" value={score.programNorm} />
        <Row
          label="Dotazník"
          value={score.questionnaireNorm}
          fallback={questionnaireResponded ? undefined : "Neodpovedal/a"}
        />
        <Row
          label="Sociálne siete"
          value={score.socialNorm}
          fallback="Doplnené v ďalšej fáze"
        />
      </Section>
      <Section title="SKUTKY — čo kandidát robí" weight="60%">
        <Row
          label="Hlasovania v zastupiteľstve"
          value={score.votesNorm}
          fallback="Bez histórie v zastupiteľstve"
        />
        <Row label="Dokumentované činy" value={score.actionsNorm} />
      </Section>
    </div>
  );
}

function Section({
  title,
  weight,
  children,
}: {
  title: string;
  weight: string;
  children: React.ReactNode;
}) {
  return (
    <div className="p-5">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-sm font-bold tracking-wide">{title}</h3>
        <span className="text-xs text-muted-foreground font-semibold">{weight}</span>
      </div>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
        {children}
      </dl>
    </div>
  );
}

function Row({
  label,
  value,
  fallback,
}: {
  label: string;
  value: number | null;
  fallback?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-semibold tabular-nums">
        {value !== null ? (
          `${value}/100`
        ) : (
          <span className="italic font-normal text-muted-foreground">
            {fallback ?? "—"}
          </span>
        )}
      </dd>
    </div>
  );
}
