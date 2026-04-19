import type {
  Badge,
  Candidate,
  KrajId,
  Position,
  ScoreBreakdown,
  SourceCitation,
} from "@/types/domain";
import { KRAJS } from "./krajs";

// ---------------------------------------------------------------------------
// Mock candidate fixture — Phase 1 frontend development.
// Generates 3–5 candidates per position × 2 positions × 8 krajs ≈ 60 records.
// All values are placeholders. Real data flows in via the repository layer
// once Supabase is wired up.
// ---------------------------------------------------------------------------

const FIRST_NAMES = [
  "Martin", "Peter", "Eva", "Zuzana", "Jana", "Tomáš", "Andrej", "Michal",
  "Katarína", "Marek", "Ľubomír", "Ivana", "Lucia", "Pavol", "Branislav",
  "Monika", "Stanislav", "Daniela", "Richard", "Veronika",
];
const LAST_NAMES = [
  "Novák", "Horváth", "Kováč", "Tóth", "Varga", "Balog", "Polák", "Šimko",
  "Mészároš", "Baláž", "Krajčí", "Hudec", "Sabol", "Mikuláš", "Lichvár",
  "Gajdoš", "Repka", "Sokol", "Vojtek", "Šuška",
];
const PARTIES = [
  "Nezávislý", "PS", "KDH", "SaS", "Smer-SD", "Hlas-SD", "OĽANO", "SNS",
  "Demokrati", "Modrí",
];

// Deterministic pseudo-random so mock data is stable across reloads.
function seeded(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function pick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

function badgeFromScore(score: number | null): Badge {
  if (score === null) return "grey";
  if (score >= 80) return "green";
  if (score >= 55) return "yellow";
  if (score >= 30) return "orange";
  return "red";
}

function buildScore(rng: () => number, hasData: boolean): ScoreBreakdown {
  if (!hasData) {
    return {
      programNorm: null,
      questionnaireNorm: null,
      socialNorm: null,
      votesNorm: null,
      actionsNorm: null,
      slova: null,
      skutky: null,
      total: null,
      badge: "grey",
      badgeSubtype: "GREY_NO_DATA",
      formulaVersion: "v1.0",
    };
  }
  const programNorm = Math.round(rng() * 100);
  const respondedQ = rng() > 0.35;
  const questionnaireNorm = respondedQ ? Math.round(rng() * 100) : null;
  const hasVotes = rng() > 0.4;
  const votesNorm = hasVotes ? Math.round(rng() * 100) : null;
  const actionsNorm = Math.round(rng() * 100);

  // SLOVÁ (MVP): program × 0.5 + questionnaire × 0.5 (or just program if Q missing)
  const slova =
    questionnaireNorm !== null
      ? Math.round(programNorm * 0.5 + questionnaireNorm * 0.5)
      : programNorm;

  // SKUTKY: votes × 0.417 + actions × 0.583 (or actions full if no votes)
  const skutky =
    votesNorm !== null
      ? Math.round(votesNorm * 0.417 + actionsNorm * 0.583)
      : actionsNorm;

  const total = Math.round(slova * 0.4 + skutky * 0.6);

  return {
    programNorm,
    questionnaireNorm,
    socialNorm: null,
    votesNorm,
    actionsNorm,
    slova,
    skutky,
    total,
    badge: badgeFromScore(total),
    formulaVersion: "v1.0",
  };
}

function buildCitations(rng: () => number, hasData: boolean): SourceCitation[] {
  if (!hasData) return [];
  const citations: SourceCitation[] = [
    {
      id: `c-${Math.floor(rng() * 1e9)}`,
      pillar: "slova",
      sourceType: "program",
      url: "https://example.sk/program.pdf",
      citationText:
        "Podporíme výstavbu cyklotrás a rozšírenie MHD s cieľom znížiť emisie CO₂ v krajskom meste.",
      climateRelevanceTier: 1,
      dateAccessed: "2026-09-15",
      confidence: 0.9,
    },
    {
      id: `c-${Math.floor(rng() * 1e9)}`,
      pillar: "skutky",
      sourceType: "vote",
      url: "https://example.sk/zapisnica-2024-03.pdf",
      citationText:
        "Hlasovanie o rozšírení autobusovej siete – zápisnica zastupiteľstva 12.03.2024.",
      climateRelevanceTier: 2,
      reviewerNote:
        "Environmentálna súvislosť: rozšírenie autobusovej siete znižuje podiel individuálnej automobilovej dopravy.",
      dateAccessed: "2026-09-20",
      confidence: 0.75,
    },
  ];
  return citations;
}

const POSITIONS: Position[] = ["zupan", "primator"];

function generateForKrajPosition(
  krajId: KrajId,
  position: Position,
  city: string,
): Candidate[] {
  const seed =
    krajId.charCodeAt(0) * 131 +
    krajId.charCodeAt(1) * 17 +
    (position === "zupan" ? 7 : 13);
  const rng = seeded(seed);
  const count = 3 + Math.floor(rng() * 3); // 3..5

  const candidates: Candidate[] = [];
  for (let i = 0; i < count; i++) {
    const first = pick(FIRST_NAMES, rng);
    const last = pick(LAST_NAMES, rng);
    const party = pick(PARTIES, rng);
    const isIndependent = party === "Nezávislý";
    const hasData = rng() > 0.15; // ~15% grey
    const score = buildScore(rng, hasData);
    const responded = score.questionnaireNorm !== null;

    candidates.push({
      id: `${krajId.toLowerCase()}-${position}-${i + 1}`,
      name: `${first} ${last}`,
      position,
      krajId,
      city: position === "primator" ? city : undefined,
      party,
      isIndependent,
      incumbent: i === 0 && rng() > 0.5,
      year: 2026,
      state: hasData ? "PUBLISHED" : "DATA_COLLECTION",
      score,
      citations: buildCitations(rng, hasData),
      questionnaireResponded: responded,
      isApproved: hasData,
    });
  }
  return candidates;
}

export const MOCK_CANDIDATES: Candidate[] = KRAJS.flatMap((kraj) =>
  POSITIONS.flatMap((pos) => generateForKrajPosition(kraj.id, pos, kraj.capital)),
);
