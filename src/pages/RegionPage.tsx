import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { candidatesRepo } from "@/lib/repository/candidates";
import { getKraj } from "@/lib/krajs";
import type { Candidate } from "@/types/domain";

// Placeholder region page. Phase 6 will rebuild with full layout, badges,
// pillar bars, and source citations. Handles variable candidate counts per position.
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
        <Link to="/" className="text-primary underline">
          Späť na úvod
        </Link>
      </main>
    );
  }

  const zupani = candidates.filter((c) => c.position === "zupan");
  const primatori = candidates.filter((c) => c.position === "primator");

  return (
    <main className="container py-10">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-primary">
          Slovensko
        </Link>
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
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-4">
        {title}{" "}
        <span className="text-base font-normal text-muted-foreground">
          ({candidates.length})
        </span>
      </h2>
      {candidates.length === 0 ? (
        <p className="text-muted-foreground">Žiadni kandidáti.</p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {candidates.map((c) => (
            <li
              key={c.id}
              className="rounded-lg border bg-card p-4 hover:shadow-md transition-shadow"
            >
              <Link to={`/kandidat/${c.id}`} className="block">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-bold text-lg">{c.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {c.party}
                      {c.incumbent && " · súčasný"}
                    </div>
                  </div>
                  <BadgeChip badge={c.score.badge} score={c.score.total} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function BadgeChip({
  badge,
  score,
}: {
  badge: Candidate["score"]["badge"];
  score: number | null;
}) {
  const cls = {
    green: "bg-badge-green text-badge-green-foreground",
    yellow: "bg-badge-yellow text-badge-yellow-foreground",
    orange: "bg-badge-orange text-badge-orange-foreground",
    red: "bg-badge-red text-badge-red-foreground",
    grey: "bg-badge-grey text-badge-grey-foreground",
  }[badge];
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${cls}`}>
      {score !== null ? `${score}/100` : "—"}
    </span>
  );
}
