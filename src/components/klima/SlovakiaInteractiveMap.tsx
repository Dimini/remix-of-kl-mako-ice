import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { KRAJ_SHAPES, MAP_VIEWBOX } from "@/lib/skKrajShapes";
import { KRAJS } from "@/lib/krajs";
import type { Badge, KrajId } from "@/types/domain";
import { cn } from "@/lib/utils";

interface KrajStats {
  total: number;
  byBadge: Record<Badge, number>;
  topScore: number | null;
}

interface Props {
  statsByKraj: Record<KrajId, KrajStats> | null;
}

const BADGE_FILL: Record<Badge, string> = {
  green: "hsl(var(--badge-green))",
  yellow: "hsl(var(--badge-yellow))",
  orange: "hsl(var(--badge-orange))",
  red: "hsl(var(--badge-red))",
  grey: "hsl(var(--badge-grey))",
};

// Pick the dominant (most-frequent) non-grey badge for a region; fall back to grey.
function dominantBadge(stats: KrajStats | undefined): Badge {
  if (!stats || stats.total === 0) return "grey";
  const order: Badge[] = ["green", "yellow", "orange", "red", "grey"];
  let best: Badge = "grey";
  let bestCount = -1;
  for (const b of order) {
    if (stats.byBadge[b] > bestCount) {
      best = b;
      bestCount = stats.byBadge[b];
    }
  }
  return best;
}

export function SlovakiaInteractiveMap({ statsByKraj }: Props) {
  const navigate = useNavigate();
  const [hoveredId, setHoveredId] = useState<KrajId | null>(null);

  const hoveredKraj = hoveredId ? KRAJS.find((k) => k.id === hoveredId) : null;
  const hoveredStats = hoveredId ? statsByKraj?.[hoveredId] : null;

  return (
    <div className="relative">
      <svg
        viewBox={MAP_VIEWBOX}
        role="img"
        aria-label="Mapa Slovenska — vyberte kraj"
        className="w-full h-auto"
      >
        <g>
          {KRAJ_SHAPES.map((shape) => {
            const stats = statsByKraj?.[shape.id];
            const badge = dominantBadge(stats);
            const isHovered = hoveredId === shape.id;
            const fill = statsByKraj ? BADGE_FILL[badge] : "hsl(var(--muted))";

            return (
              <path
                key={shape.id}
                d={shape.d}
                fill={fill}
                stroke="hsl(var(--background))"
                strokeWidth={isHovered ? 2.5 : 1.5}
                className={cn(
                  "cursor-pointer transition-all duration-150 outline-none",
                  isHovered ? "opacity-100" : "opacity-90 hover:opacity-100",
                )}
                style={{
                  filter: isHovered ? "brightness(1.08)" : undefined,
                }}
                tabIndex={0}
                role="link"
                aria-label={`${shape.name}${stats ? ` — ${stats.total} kandidátov` : ""}`}
                onMouseEnter={() => setHoveredId(shape.id)}
                onMouseLeave={() => setHoveredId(null)}
                onFocus={() => setHoveredId(shape.id)}
                onBlur={() => setHoveredId(null)}
                onClick={() => navigate(`/region/${shape.id.toLowerCase()}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    navigate(`/region/${shape.id.toLowerCase()}`);
                  }
                }}
              />
            );
          })}
        </g>
        {/* Region code labels */}
        <g pointerEvents="none">
          {KRAJ_SHAPES.map((shape) => (
            <text
              key={`${shape.id}-label`}
              x={shape.cx}
              y={shape.cy}
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-foreground font-black select-none"
              style={{ fontSize: 18, paintOrder: "stroke", stroke: "hsl(var(--background))", strokeWidth: 3 }}
            >
              {shape.id}
            </text>
          ))}
        </g>
      </svg>

      {/* Hover tooltip — pinned to map corner on mobile, follows badge on desktop */}
      <div
        aria-live="polite"
        className={cn(
          "absolute top-2 right-2 sm:top-4 sm:right-4 max-w-[220px] rounded-lg border bg-card/95 backdrop-blur p-3 shadow-lg transition-opacity",
          hoveredKraj ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
      >
        {hoveredKraj && (
          <>
            <div className="text-xs font-bold tracking-wider text-muted-foreground mb-0.5">
              {hoveredKraj.id} · {hoveredKraj.capital}
            </div>
            <div className="font-bold text-sm mb-2">{hoveredKraj.name}</div>
            {hoveredStats ? (
              <>
                <div className="text-xs text-muted-foreground mb-1.5">
                  <span className="font-semibold text-foreground">{hoveredStats.total}</span>{" "}
                  kandidátov
                  {hoveredStats.topScore !== null && (
                    <> · max <span className="font-semibold text-foreground tabular-nums">{hoveredStats.topScore}/100</span></>
                  )}
                </div>
                <div className="flex gap-1 h-1.5 rounded-full overflow-hidden bg-muted">
                  {(["green", "yellow", "orange", "red", "grey"] as Badge[]).map((b) =>
                    hoveredStats.byBadge[b] > 0 ? (
                      <div
                        key={b}
                        style={{ flex: hoveredStats.byBadge[b], background: BADGE_FILL[b] }}
                      />
                    ) : null,
                  )}
                </div>
              </>
            ) : (
              <div className="h-3 bg-muted/50 rounded animate-pulse" />
            )}
            <div className="text-xs text-primary font-semibold mt-2">
              Kliknite pre detail →
            </div>
          </>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">Prevažujúce hodnotenie:</span>
        {(
          [
            ["green", "Líder"],
            ["yellow", "Čiastočný"],
            ["orange", "Slabý"],
            ["red", "Proti"],
            ["grey", "Bez údajov"],
          ] as [Badge, string][]
        ).map(([b, label]) => (
          <span key={b} className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-3 w-3 rounded-sm"
              style={{ background: BADGE_FILL[b] }}
            />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
