import type { Badge, GreySubtype } from "@/types/domain";
import { cn } from "@/lib/utils";

const BADGE_LABELS: Record<Badge, string> = {
  green: "Klimatický líder",
  yellow: "Čiastočne aktívny",
  orange: "Slabá podpora klímy",
  red: "Proti klimatickej politike",
  grey: "Nedostatok údajov",
};

const GREY_SUBTYPE_LABELS: Record<GreySubtype, string> = {
  GREY_NO_DATA: "Údaje sa zbierajú",
  GREY_REFUSED: "Neodpovedal/a na dotazník",
  GREY_NEW_CANDIDATE: "Nový kandidát bez histórie",
  GREY_LOW_CONFIDENCE: "Nízka spoľahlivosť údajov",
};

const BADGE_CLASSES: Record<Badge, string> = {
  green: "bg-badge-green text-badge-green-foreground",
  yellow: "bg-badge-yellow text-badge-yellow-foreground",
  orange: "bg-badge-orange text-badge-orange-foreground",
  red: "bg-badge-red text-badge-red-foreground",
  grey: "bg-badge-grey text-badge-grey-foreground",
};

interface CandidateBadgeProps {
  badge: Badge;
  score: number | null;
  subtype?: GreySubtype;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function CandidateBadge({
  badge,
  score,
  subtype,
  size = "md",
  showLabel = true,
  className,
}: CandidateBadgeProps) {
  const sizeCls = {
    sm: "text-xs px-2 py-0.5 gap-1.5",
    md: "text-sm px-3 py-1 gap-2",
    lg: "text-base px-4 py-1.5 gap-2.5",
  }[size];

  const label =
    badge === "grey" && subtype ? GREY_SUBTYPE_LABELS[subtype] : BADGE_LABELS[badge];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-bold",
        BADGE_CLASSES[badge],
        sizeCls,
        className,
      )}
      aria-label={`Klimatické skóre: ${label}${score !== null ? `, ${score} zo 100` : ""}`}
    >
      <span className="font-black tabular-nums">
        {score !== null ? `${score}/100` : "—"}
      </span>
      {showLabel && <span className="font-semibold">{label}</span>}
    </span>
  );
}
