import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { candidatesRepo } from "@/lib/repository/candidates";
import { getKraj } from "@/lib/krajs";
import type { Badge, Candidate } from "@/types/domain";
import { CandidateBadge } from "@/components/klima";
import { ArrowLeft, AlertTriangle, Users } from "lucide-react";
import { cn } from "@/lib/utils";

type SortKey = "score-desc" | "score-asc" | "name" | "party";
type BadgeFilter = "all" | Badge;

const BADGE_DOT: Record<Badge, string> = {
  green: "bg-badge-green",
  yellow: "bg-badge-yellow",
  orange: "bg-badge-orange",
  red: "bg-badge-red",
  grey: "bg-badge-grey",
};

const BADGE_FILTER_LABELS: Record<BadgeFilter, string> = {
  all: "Všetci",
  green: "Lídri",
  yellow: "Čiastoční",
  orange: "Slabí",
  red: "Proti",
  grey: "Bez údajov",
};

export default function RegionPage() {
  const { krajId = "" } = useParams();
  const kraj = getKraj(krajId);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("score-desc");
  const [badgeFilter, setBadgeFilter] = useState<BadgeFilter>("all");

  useEffect(() => {
    if (!kraj) return;
    setLoading(true);
    candidatesRepo.getByKraj(kraj.id).then((rows) => {
      setCandidates(rows);
      setLoading(false);
    });
  }, [kraj]);

  const filtered = useMemo(
    () => (badgeFilter === "all" ? candidates : candidates.filter((c) => c.score.badge === badgeFilter)),
    [candidates, badgeFilter],
  );

  const badgeCounts = useMemo(() => {
    const counts: Record<Badge, number> = { green: 0, yellow: 0, orange: 0, red: 0, grey: 0 };
    for (const c of candidates) counts[c.score.badge]++;
    return counts;
  }, [candidates]);

  if (!kraj) {
    return (
      <main className="container py-12">
        <h1 className="text-2xl font-bold mb-4">Kraj nenájdený</h1>
        <Link to="/" className="text-primary underline">Späť na úvod</Link>
      </main>
    );
  }

  const zupani = filtered.filter((c) => c.position === "zupan");
  const primatori = filtered.filter((c) => c.position === "primator");

  return (
    <main className="container py-8 md:py-12 max-w-6xl">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-muted-foreground flex items-center gap-1.5">
        <Link to="/" className="inline-flex items-center gap-1 hover:text-primary">
          <ArrowLeft className="h-3.5 w-3.5" />
          Slovensko
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">{kraj.name}</span>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <div className="text-xs font-bold tracking-wider text-muted-foreground mb-2">
          KRAJ {kraj.id}
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">
          {kraj.name}
        </h1>
        <p className="text-muted-foreground text-lg">
          Krajské mesto: <strong className="text-foreground">{kraj.capital}</strong>
          <span className="mx-2">·</span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            <strong className="text-foreground">{candidates.length}</strong> kandidátov
          </span>
        </p>
      </header>

      {/* Mandatory disclaimer */}
      <div className="mb-8 rounded-lg border border-badge-yellow/40 bg-badge-yellow/10 p-3 text-sm flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-badge-orange-foreground/70" />
        <p className="text-foreground/80">
          <strong>Toto hodnotenie nie je odporúčaním na hlasovanie.</strong>{" "}
          Hodnotenie sociálnych sietí bude doplnené v ďalšej fáze.
        </p>
      </div>

      {/* Controls */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end gap-4 sm:justify-between border-b pb-6">
        <div>
          <label className="block text-xs font-bold tracking-wider text-muted-foreground mb-2">
            FILTROVAŤ PODĽA HODNOTENIA
          </label>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(BADGE_FILTER_LABELS) as BadgeFilter[]).map((key) => {
              const count = key === "all" ? candidates.length : badgeCounts[key];
              const active = badgeFilter === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setBadgeFilter(key)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors",
                    active
                      ? "bg-foreground text-background border-foreground"
                      : "bg-card text-muted-foreground border-border hover:border-foreground/50 hover:text-foreground",
                  )}
                >
                  {key !== "all" && (
                    <span className={cn("inline-block h-2 w-2 rounded-full", BADGE_DOT[key as Badge])} />
                  )}
                  {BADGE_FILTER_LABELS[key]}
                  <span className="opacity-60">({count})</span>
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <label htmlFor="sort" className="block text-xs font-bold tracking-wider text-muted-foreground mb-2">
            ZORADIŤ
          </label>
          <select
            id="sort"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="rounded-md border bg-card px-3 py-1.5 text-sm font-medium hover:border-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="score-desc">Najvyššie skóre</option>
            <option value="score-asc">Najnižšie skóre</option>
            <option value="name">Meno (A→Z)</option>
            <option value="party">Strana (A→Z)</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-lg bg-muted/50 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <PositionSection
            title="Predseda kraju (župan)"
            subtitle={`Volený za celý ${kraj.name.toLowerCase()}`}
            candidates={zupani}
            sortKey={sortKey}
          />
          <PositionSection
            title={`Primátor — ${kraj.capital}`}
            subtitle="Volený obyvateľmi krajského mesta"
            candidates={primatori}
            sortKey={sortKey}
          />
        </>
      )}
    </main>
  );
}

function sortCandidates(list: Candidate[], key: SortKey): Candidate[] {
  const arr = [...list];
  switch (key) {
    case "score-desc":
      return arr.sort((a, b) => {
        if (a.score.total === null && b.score.total === null) return a.name.localeCompare(b.name, "sk");
        if (a.score.total === null) return 1;
        if (b.score.total === null) return -1;
        return b.score.total - a.score.total;
      });
    case "score-asc":
      return arr.sort((a, b) => {
        if (a.score.total === null && b.score.total === null) return a.name.localeCompare(b.name, "sk");
        if (a.score.total === null) return 1;
        if (b.score.total === null) return -1;
        return a.score.total - b.score.total;
      });
    case "name":
      return arr.sort((a, b) => a.name.localeCompare(b.name, "sk"));
    case "party":
      return arr.sort((a, b) => a.party.localeCompare(b.party, "sk") || a.name.localeCompare(b.name, "sk"));
  }
}

function PositionSection({
  title,
  subtitle,
  candidates,
  sortKey,
}: {
  title: string;
  subtitle: string;
  candidates: Candidate[];
  sortKey: SortKey;
}) {
  const sorted = useMemo(() => sortCandidates(candidates, sortKey), [candidates, sortKey]);

  return (
    <section className="mb-12">
      <div className="mb-5">
        <h2 className="text-2xl md:text-3xl font-black tracking-tight">
          {title}
          <span className="ml-2 text-base font-semibold text-muted-foreground">
            ({candidates.length})
          </span>
        </h2>
        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-lg border border-dashed bg-muted/20 p-8 text-center text-muted-foreground text-sm">
          Žiadni kandidáti zodpovedajúci filtru.
        </div>
      ) : (
        <ul className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {sorted.map((c) => (
            <li key={c.id}>
              <CandidateCard candidate={c} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function CandidateCard({ candidate: c }: { candidate: Candidate }) {
  return (
    <Link
      to={`/kandidat/${c.id}`}
      className="group block rounded-lg border bg-card p-5 hover:shadow-md hover:border-primary/40 hover:-translate-y-0.5 transition-all h-full"
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <div className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
            {c.name}
          </div>
          <div className="text-sm text-muted-foreground mt-0.5 truncate">
            {c.party}
            {c.incumbent && (
              <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded bg-muted text-xs font-semibold text-foreground">
                súčasný
              </span>
            )}
          </div>
        </div>
        <CandidateBadge
          badge={c.score.badge}
          score={c.score.total}
          subtype={c.score.badgeSubtype}
          size="sm"
          showLabel={false}
        />
      </div>

      {c.score.total !== null ? (
        <div className="space-y-1.5">
          <CompactPillar label="Slová" weight="40%" value={c.score.slova} />
          <CompactPillar label="Skutky" weight="60%" value={c.score.skutky} />
        </div>
      ) : (
        <div className="text-xs text-muted-foreground italic">
          Zatiaľ nedostatok údajov pre výpočet skóre.
        </div>
      )}
    </Link>
  );
}

function CompactPillar({ label, weight, value }: { label: string; weight: string; value: number | null }) {
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
      <div className="flex items-baseline justify-between text-xs mb-0.5">
        <span className="font-semibold text-foreground">
          {label} <span className="text-muted-foreground font-normal">{weight}</span>
        </span>
        <span className="font-bold tabular-nums text-foreground">
          {value !== null ? `${value}/100` : "—"}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", barColor)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
