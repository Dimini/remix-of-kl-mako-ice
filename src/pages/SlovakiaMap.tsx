import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { KRAJS } from "@/lib/krajs";
import { candidatesRepo } from "@/lib/repository/candidates";
import type { Candidate, KrajId, Badge } from "@/types/domain";
import { ArrowRight, MapPin, Users, AlertTriangle } from "lucide-react";
import { SlovakiaInteractiveMap } from "@/components/klima/SlovakiaInteractiveMap";

interface KrajStats {
  total: number;
  byBadge: Record<Badge, number>;
  topScore: number | null;
}

const BADGE_DOT: Record<Badge, string> = {
  green: "bg-badge-green",
  yellow: "bg-badge-yellow",
  orange: "bg-badge-orange",
  red: "bg-badge-red",
  grey: "bg-badge-grey",
};

function computeStats(candidates: Candidate[]): KrajStats {
  const byBadge: Record<Badge, number> = { green: 0, yellow: 0, orange: 0, red: 0, grey: 0 };
  let topScore: number | null = null;
  for (const c of candidates) {
    byBadge[c.score.badge]++;
    if (c.score.total !== null && (topScore === null || c.score.total > topScore)) {
      topScore = c.score.total;
    }
  }
  return { total: candidates.length, byBadge, topScore };
}

export default function SlovakiaMap() {
  const [statsByKraj, setStatsByKraj] = useState<Record<KrajId, KrajStats> | null>(null);
  const [totalCandidates, setTotalCandidates] = useState(0);

  useEffect(() => {
    candidatesRepo.list().then((all) => {
      const map = {} as Record<KrajId, KrajStats>;
      for (const k of KRAJS) {
        map[k.id] = computeStats(all.filter((c) => c.krajId === k.id));
      }
      setStatsByKraj(map);
      setTotalCandidates(all.length);
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80" />
        <div className="relative container py-16 md:py-24 lg:py-32 max-w-5xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-3 py-1 text-xs font-semibold tracking-wider uppercase mb-6 backdrop-blur">
            <MapPin className="h-3 w-3" />
            Komunálne voľby 2026
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter mb-6 text-balance">
            Tvoj kraj. Tvoje voľby. Tvoja klíma.
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl leading-relaxed mb-8 max-w-3xl opacity-90">
            25. októbra rozhoduješ, kto bude štyri roky riadiť tvoj kraj a krajské mesto.
            Pozri si, ako sú na tom kandidáti — jednoducho a podľa faktov.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="#regions"
              className="inline-flex items-center gap-2 bg-primary-foreground text-primary px-6 py-3 font-semibold hover:bg-primary-foreground/90 transition-colors"
            >
              Nájdi svojich kandidátov
              <ArrowRight className="h-4 w-4" />
            </a>
            <Link
              to="/preco-volit"
              className="inline-flex items-center gap-2 border-2 border-primary-foreground text-primary-foreground px-6 py-3 font-semibold hover:bg-primary-foreground hover:text-primary transition-colors"
            >
              Prečo na tom záleží?
            </Link>
          </div>
        </div>
      </section>

      {/* Disclaimer band */}
      <section className="bg-badge-yellow/20 border-y border-badge-yellow/40">
        <div className="container py-4 max-w-5xl flex items-start gap-3 text-sm">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-badge-orange-foreground/70" />
          <p className="text-foreground/80">
            <strong>Toto hodnotenie nie je odporúčaním na hlasovanie.</strong>{" "}
            Hodnotenie sociálnych sietí bude doplnené v ďalšej fáze.
          </p>
        </div>
      </section>

      {/* Interactive map */}
      <section id="regions" className="container py-16 md:py-20">
        <div className="max-w-3xl mb-8">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3">
            8 krajov, {totalCandidates || "—"} kandidátov
          </h2>
          <p className="text-muted-foreground text-lg">
            Kliknite na svoj kraj a pozrite si hodnotenie kandidátov na župana aj primátora
            krajského mesta. Farba kraja zobrazuje prevažujúce hodnotenie kandidátov.
          </p>
          <p className="mt-3 text-sm">
            <Link to="/preco-volit" className="text-primary font-semibold hover:underline inline-flex items-center gap-1">
              Nový volič? Začni tu
              <ArrowRight className="h-3 w-3" />
            </Link>
          </p>
        </div>

        <div className="rounded-xl border bg-card p-4 sm:p-6 mb-10">
          <SlovakiaInteractiveMap statsByKraj={statsByKraj} />
        </div>

        {/* Accessible region list — also serves mobile users who prefer tapping a list */}
        <details className="mb-2">
          <summary className="cursor-pointer text-sm font-semibold text-muted-foreground hover:text-foreground">
            Zobraziť kraje ako zoznam
          </summary>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            {KRAJS.map((kraj) => {
            const stats = statsByKraj?.[kraj.id];
            return (
              <Link
                key={kraj.id}
                to={`/region/${kraj.id.toLowerCase()}`}
                className="group block rounded-lg border bg-card p-5 transition-all hover:border-primary hover:shadow-lg hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    {kraj.id}
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
                <h3 className="text-lg font-bold mb-1 group-hover:text-primary transition-colors">
                  {kraj.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 flex items-center gap-1.5">
                  <MapPin className="h-3 w-3" />
                  {kraj.capital}
                </p>

                {stats ? (
                  <>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                      <Users className="h-3 w-3" />
                      <span className="font-semibold text-foreground">{stats.total}</span>
                      kandidátov
                      {stats.topScore !== null && (
                        <span className="ml-auto font-bold text-foreground tabular-nums">
                          max {stats.topScore}/100
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-muted">
                      {(["green", "yellow", "orange", "red", "grey"] as Badge[]).map((b) =>
                        stats.byBadge[b] > 0 ? (
                          <div
                            key={b}
                            className={BADGE_DOT[b]}
                            style={{ flex: stats.byBadge[b] }}
                            title={`${stats.byBadge[b]}× ${b}`}
                          />
                        ) : null,
                      )}
                    </div>
                  </>
                ) : (
                  <div className="h-8 bg-muted/50 rounded animate-pulse" />
                )}
              </Link>
            );
          })}
          </div>
        </details>
      </section>

      {/* How it works */}
      <section className="bg-muted/30 border-t">
        <div className="container py-16 md:py-20 max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-10 text-center">
            Ako počítame skóre
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-lg border bg-card p-6">
              <div className="text-xs font-bold tracking-wider text-muted-foreground mb-2">
                SLOVÁ — 40 %
              </div>
              <h3 className="text-xl font-bold mb-2">Čo kandidát hovorí</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Volebný program a odpovede na klimatický dotazník. Analyzujeme konkrétne
                záväzky, opatrenia a ciele.
              </p>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <div className="text-xs font-bold tracking-wider text-muted-foreground mb-2">
                SKUTKY — 60 %
              </div>
              <h3 className="text-xl font-bold mb-2">Čo kandidát robí</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Hlasovania v zastupiteľstve a dokumentované činy s overiteľnými zdrojmi.
                Skutky vážia viac ako slová.
              </p>
            </div>
          </div>
          <div className="mt-8 text-center">
            <Link
              to="/metodologia"
              className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
            >
              Celá metodológia a vzorce
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
