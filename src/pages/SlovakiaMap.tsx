import { Link } from "react-router-dom";
import { KRAJS } from "@/lib/krajs";

// Placeholder Slovakia overview — Phase 5 will replace with interactive SVG map.
export default function SlovakiaMap() {
  return (
    <main className="container py-12">
      <header className="mb-10 max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
          Volím klímu 2026
        </h1>
        <p className="lead-text text-muted-foreground">
          Vyberte si kraj a pozrite si klimatické hodnotenie kandidátov na župana
          a primátora krajského mesta.
        </p>
      </header>

      <section aria-label="Zoznam krajov" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {KRAJS.map((kraj) => (
          <Link
            key={kraj.id}
            to={`/region/${kraj.id.toLowerCase()}`}
            className="group block rounded-lg border bg-card p-5 transition-all hover:border-primary hover:shadow-md"
          >
            <div className="text-xs font-semibold text-muted-foreground tracking-wider mb-2">
              {kraj.id}
            </div>
            <div className="text-lg font-bold mb-1 group-hover:text-primary">
              {kraj.name}
            </div>
            <div className="text-sm text-muted-foreground">{kraj.capital}</div>
          </Link>
        ))}
      </section>

      <p className="mt-10 text-xs text-muted-foreground max-w-2xl">
        Toto hodnotenie nie je odporúčaním na hlasovanie. Hodnotenie sociálnych
        sietí bude doplnené v ďalšej fáze.
      </p>
    </main>
  );
}
