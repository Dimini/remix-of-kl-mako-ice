import { cn } from "@/lib/utils";

interface PillarBarProps {
  /** Score 0..100 or null */
  slova: number | null;
  /** Score 0..100 or null */
  skutky: number | null;
  className?: string;
}

// Visualises the two pillars with their formula weights:
//   SLOVÁ 40% (program + dotazník)
//   SKUTKY 60% (hlasovania + dokumentované činy)
export function PillarBar({ slova, skutky, className }: PillarBarProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <PillarRow
        label="SLOVÁ"
        weight="40%"
        sublabel="Program + dotazník"
        value={slova}
      />
      <PillarRow
        label="SKUTKY"
        weight="60%"
        sublabel="Hlasovania + činy"
        value={skutky}
      />
    </div>
  );
}

function PillarRow({
  label,
  weight,
  sublabel,
  value,
}: {
  label: string;
  weight: string;
  sublabel: string;
  value: number | null;
}) {
  const pct = value === null ? 0 : Math.max(0, Math.min(100, value));
  const barColor =
    value === null
      ? "bg-badge-grey"
      : value >= 80
        ? "bg-badge-green"
        : value >= 55
          ? "bg-badge-yellow"
          : value >= 30
            ? "bg-badge-orange"
            : "bg-badge-red";

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-bold tracking-wide">{label}</span>
          <span className="text-xs text-muted-foreground">{weight}</span>
          <span className="text-xs text-muted-foreground">· {sublabel}</span>
        </div>
        <span className="text-sm font-bold tabular-nums">
          {value !== null ? `${value}/100` : "—"}
        </span>
      </div>
      <div
        className="h-2.5 w-full rounded-full bg-muted overflow-hidden"
        role="progressbar"
        aria-valuenow={value ?? 0}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label}: ${value ?? "nedostupné"}`}
      >
        <div
          className={cn("h-full rounded-full transition-all", barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
