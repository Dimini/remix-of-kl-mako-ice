import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { candidatesRepo } from "@/lib/repository/candidates";
import { getKraj } from "@/lib/krajs";
import type { Candidate } from "@/types/domain";
import { CandidateBadge } from "@/components/klima";

export default function RegionPage() {
  const { krajId = "" } = useParams();
  const kraj = getKraj(krajId);
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  useEffect(() => {
    if (!kraj) return;
    candidatesRepo.getByKraj(kraj.id).then(setCandidates);
  }, [kraj]);

  if (!kraj) {
    return (
      <main className="container py-12">
        <h1 className="text-2xl font-bold mb-4">Kraj nenájdený</h1>
        <Link to="/" className="text-primary underline">Späť na úvod</Link>
      </main>
    );
  }

  const zupani = candidates.filter((c) => c.position === "zupan");
  const primatori = candidates.filter((c) => c.position === "primator");

  return (
    <main className="container py-10">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-primary">Slovensko</Link>
        <span className="mx-2">/</span>
        <span>{kraj.name}</span>
      </nav>

      <header className="mb-10">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">
          {kraj.name}
        </h1>
        <p className="text-muted-foreground">
          Krajské mesto: <strong>{kraj.capital}</strong>
        </p>
      </header>

      <PositionSection
        title="Kandidáti na predsedu kraju (župana)"
        candidates={zupani}
      />
      <PositionSection
        title={`Kandidáti na primátora — ${kraj.capital}`}
        candidates={primatori}
      />
    </main>
  );
}

function PositionSection({
  title,
  candidates,
}: {
  title: string;
  candidates: Candidate[];
}) {
  // Sort: scored candidates first (by score desc), grey at the end.
  const sorted = [...candidates].sort((a, b) => {
    if (a.score.total === null && b.score.total === null) return 0;
    if (a.score.total === null) return 1;
    if (b.score.total === null) return -1;
    return b.score.total - a.score.total;
  });

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-4">
        {title}{" "}
        <span className="text-base font-normal text-muted-foreground">
          ({candidates.length})
        </span>
      </h2>
      {sorted.length === 0 ? (
        <p className="text-muted-foreground">Žiadni kandidáti.</p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sorted.map((c) => (
            <li key={c.id}>
              <Link
                to={`/kandidat/${c.id}`}
                className="block rounded-lg border bg-card p-4 hover:shadow-md hover:border-primary/40 transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="font-bold text-lg leading-tight">{c.name}</div>
                    <div className="text-sm text-muted-foreground mt-0.5">
                      {c.party}
                      {c.incumbent && " · súčasný"}
                    </div>
                  </div>
                </div>
                <CandidateBadge
                  badge={c.score.badge}
                  score={c.score.total}
                  subtype={c.score.badgeSubtype}
                  size="sm"
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
