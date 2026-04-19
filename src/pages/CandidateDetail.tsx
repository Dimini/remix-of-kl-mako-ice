import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { candidatesRepo } from "@/lib/repository/candidates";
import { getKraj } from "@/lib/krajs";
import type { Candidate } from "@/types/domain";
import {
  CandidateBadge,
  PillarBar,
  ScoreBreakdown,
  CitationList,
} from "@/components/klima";

export default function CandidateDetail() {
  const { id = "" } = useParams();
  const [candidate, setCandidate] = useState<Candidate | null | undefined>(undefined);

  useEffect(() => {
    candidatesRepo.getById(id).then(setCandidate);
  }, [id]);

  if (candidate === undefined) {
    return <main className="container py-12">Načítava sa…</main>;
  }
  if (candidate === null) {
    return (
      <main className="container py-12">
        <h1 className="text-2xl font-bold mb-4">Kandidát nenájdený</h1>
        <Link to="/" className="text-primary underline">Späť na úvod</Link>
      </main>
    );
  }

  const kraj = getKraj(candidate.krajId);
  const positionLabel =
    candidate.position === "zupan" ? "Predseda kraju (župan)" : "Primátor";

  return (
    <main className="container py-10 max-w-4xl">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-primary">Slovensko</Link>
        <span className="mx-2">/</span>
        <Link to={`/region/${candidate.krajId.toLowerCase()}`} className="hover:text-primary">
          {kraj?.name}
        </Link>
        <span className="mx-2">/</span>
        <span>{candidate.name}</span>
      </nav>

      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            {positionLabel}
            {candidate.city && ` — ${candidate.city}`}
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">
            {candidate.name}
          </h1>
          <div className="text-muted-foreground">{candidate.party}</div>
        </div>
        <CandidateBadge
          badge={candidate.score.badge}
          score={candidate.score.total}
          subtype={candidate.score.badgeSubtype}
          size="lg"
        />
      </header>

      <section className="rounded-lg border bg-card p-6 mb-6">
        <h2 className="text-sm font-bold tracking-wide mb-4">Klimatické skóre</h2>
        <PillarBar slova={candidate.score.slova} skutky={candidate.score.skutky} />
      </section>

      <section className="mb-6">
        <h2 className="text-sm font-bold tracking-wide mb-3">Detailný rozpis</h2>
        <ScoreBreakdown
          score={candidate.score}
          questionnaireResponded={candidate.questionnaireResponded}
        />
      </section>

      <CitationList citations={candidate.citations} className="mb-6" />

      <p className="text-xs text-muted-foreground border-t pt-4">
        Toto hodnotenie nie je odporúčaním na hlasovanie. Hodnotenie sociálnych
        sietí bude doplnené v ďalšej fáze.
      </p>
    </main>
  );
}
