import { Link } from "react-router-dom";
import {
  Wind, Trees, Bus, Zap, Recycle, Heart, Wallet, Droplets, ArrowRight,
} from "lucide-react";
import { REGION_IMPACT } from "@/lib/regionImpactData";

const ICON: Record<string, JSX.Element> = {
  wind: <Wind className="h-5 w-5" />,
  trees: <Trees className="h-5 w-5" />,
  bus: <Bus className="h-5 w-5" />,
  zap: <Zap className="h-5 w-5" />,
  recycle: <Recycle className="h-5 w-5" />,
  heart: <Heart className="h-5 w-5" />,
  wallet: <Wallet className="h-5 w-5" />,
  drop: <Droplets className="h-5 w-5" />,
  air: <Wind className="h-5 w-5" />,
  health: <Heart className="h-5 w-5" />,
};

export function RegionImpact({ krajId, krajName }: { krajId: string; krajName: string }) {
  const data = REGION_IMPACT[krajId];
  if (!data) return null;

  return (
    <section className="mt-16 pt-12 border-t">
      <header className="mb-8 max-w-3xl">
        <div className="text-xs font-bold tracking-wider text-muted-foreground mb-2">
          PREČO NA TOM ZÁLEŽÍ V REGIÓNE
        </div>
        <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-3">
          {krajName} a {data.capital}: čo rozhodne najbližšie 4 roky
        </h2>
        <p className="text-muted-foreground leading-relaxed">{data.intro}</p>
      </header>

      {/* 3 stat cards */}
      <div className="grid gap-4 sm:grid-cols-3 mb-10">
        {data.stats.map((s, i) => (
          <div key={i} className="border bg-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-primary/10 text-primary rounded-full">
                {ICON[s.iconKey] ?? ICON.wind}
              </div>
              <span className="font-bold text-lg">{s.label}</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Impact rows — how local politicians affect daily life */}
      <h3 className="text-xl md:text-2xl font-bold tracking-tight mb-5">
        Ako župan a primátor {data.capital} ovplyvňujú váš každodenný život
      </h3>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto mb-8">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b-2 border-primary">
              <th className="text-left p-3 font-bold w-1/5">Oblasť</th>
              <th className="text-left p-3 font-bold w-2/5">Ako to ovplyvňujú politici</th>
              <th className="text-left p-3 font-bold w-2/5">Prečo je to dôležité pre vás</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, i) => (
              <tr key={i} className="border-b hover:bg-muted/40 transition-colors align-top">
                <td className="p-3 font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="text-primary">{ICON[row.iconKey] ?? ICON.wind}</span>
                    {row.issue}
                  </div>
                </td>
                <td className="p-3 text-muted-foreground">{row.influence}</td>
                <td className="p-3 text-muted-foreground">{row.matters}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-4 mb-8">
        {data.rows.map((row, i) => (
          <div key={i} className="border bg-card p-4 space-y-3">
            <div className="flex items-center gap-2 font-bold">
              <span className="text-primary">{ICON[row.iconKey] ?? ICON.wind}</span>
              {row.issue}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">
                Vplyv politikov
              </p>
              <p className="text-sm">{row.influence}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">
                Dopad na vás
              </p>
              <p className="text-sm">{row.matters}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Link back to general Why-Vote page */}
      <div className="rounded-lg border bg-muted/30 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="font-semibold">Chcete vedieť viac, prečo komunálne voľby rozhodujú?</p>
          <p className="text-sm text-muted-foreground">
            Pozrite si všeobecný sprievodca pre nových voličov.
          </p>
        </div>
        <Link
          to="/preco-volit"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md font-semibold text-sm hover:bg-primary/90 transition-colors shrink-0"
        >
          Prečo na tom záleží
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
