// ---------------------------------------------------------------------------
// Klima Kompas — Scoring Engine v1.0 (LOCKED)
//
// Pure TypeScript. No I/O. Given a candidate + their evidence, returns a
// fully-populated ScoreBreakdown. Mirrors the formula in CLAUDE.md.
//
// IMPORTANT: do not modify the formula or caps without bumping FORMULA_VERSION
// AND coordinating with the NGO. Caps will eventually live in Supabase
// `scoring_config`; for the local-first admin UI we hardcode them here so the
// engine stays pure and offline.
// ---------------------------------------------------------------------------
import type {
  Badge,
  GreySubtype,
  ScoreBreakdown,
  SourceCitation,
} from "@/types/domain";
import type { EvidenceRecord } from "@/lib/repository/types";
import { getEvidenceType, PILLAR_FOR_SOURCE } from "@/lib/evidenceTypes";

export const FORMULA_VERSION = "v1.0";

// Absolute caps — see CLAUDE.md "Normalisation".
export const SCORING_CAPS = {
  program: { min: -35.30, max: 17.31 },        // Carter et al. global range
  questionnaire: { min: 0, max: 54 },          // NRSR 2023, PS top score
  actions: { min: -10, max: 15 },              // designed cap
  // votes: cap is per-candidate ±n×2 — derived from evidence count
} as const;

// Pillar / total weights.
const W_SLOVA = 0.40;
const W_SKUTKY = 0.60;

// MVP SLOVÁ: program 50% + questionnaire 50%. Social = Phase 2 (null).
const W_PROGRAM_MVP = 0.50;
const W_QUESTIONNAIRE_MVP = 0.50;

// SKUTKY: votes 0.417 + actions 0.583. If votes_norm null → actions full weight.
const W_VOTES = 0.417;
const W_ACTIONS = 0.583;

// Badge thresholds (CLAUDE.md).
const BADGE_THRESHOLDS = { green: 80, yellow: 55, orange: 30 } as const;

// ---------------------------------------------------------------------------

export interface ScoreInput {
  evidence: EvidenceRecord[];
  /** Used for grey sub-typing — null votes_norm with newCandidate=true → GREY_NEW_CANDIDATE */
  isNewCandidate?: boolean;
  /** Aggregate confidence across all evidence; if < 0.40 → GREY_LOW_CONFIDENCE */
  overallConfidence?: number;
  /** Whether the candidate responded to the questionnaire */
  questionnaireResponded?: boolean;
  /**
   * Raw NRSR score (0–54) from the analyze-questionnaire Edge Function.
   * When provided, used directly for questionnaireNorm instead of the
   * confidence-proxy fallback (which ignores pro/anti direction).
   */
  questionnaireRawScore?: number | null;
}

export interface ScoreDebug {
  /** Number of climate-relevant votes recorded (Tier 1+2) */
  n: number;
  /** Sum of vote points (raw) */
  rawVotes: number;
  /** Sum of action points (raw) */
  rawActions: number;
  /** Tier 3 items excluded from scoring */
  excludedTier3: number;
  /** Count of program evidence items contributing to programNorm */
  programCount: number;
  /** Count of questionnaire evidence items */
  questionnaireCount: number;
}

export interface ScoreResult extends ScoreBreakdown {
  debug: ScoreDebug;
}

// ---------------------------------------------------------------------------

function clampNorm(raw: number, min: number, max: number): number {
  if (max === min) return 0;
  const v = ((raw - min) / (max - min)) * 100;
  return Math.min(100, Math.max(0, v));
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((s, n) => s + n, 0) / nums.length;
}

// ---------------------------------------------------------------------------

export function computeScore(input: ScoreInput): ScoreResult {
  const all = input.evidence ?? [];

  // 1) Tier 3 NEVER enters scoring.
  const scoring = all.filter((e) => e.climateRelevanceTier !== 3);
  const excludedTier3 = all.length - scoring.length;

  // 2) Bucket by source type → pillar.
  const program = scoring.filter((e) => e.sourceType === "program");
  const questionnaire = scoring.filter((e) => e.sourceType === "questionnaire");
  // Social = Phase 2; not used in MVP scoring.
  const votes = scoring.filter((e) => e.sourceType === "council_vote");
  // Actions = everything in SKUTKY pillar that isn't a council vote.
  const actions = scoring.filter(
    (e) =>
      e.pillar === "skutky" &&
      e.sourceType !== "council_vote",
  );

  // 3) Sub-scores ----------------------------------------------------------
  // PROGRAM: average of available evidence confidence-weighted into the
  // program cap range. Each evidence item carries an optional confidence
  // (0..1); we treat each item as a normalised contribution within the cap.
  // For MVP we average normalised "raw" values derived from confidence × max.
  const programNorm =
    program.length === 0
      ? null
      : (() => {
          const rawAvg = avg(
            program.map((e) => {
              // Use confidence as weight in [0..1]; a Tier-1 explicit citation
              // with confidence 1 maps to the max cap, lower confidence scales
              // linearly toward zero.
              const conf = e.confidence ?? (e.climateRelevanceTier === 1 ? 1 : 0.6);
              return conf * SCORING_CAPS.program.max;
            }),
          );
          return clampNorm(rawAvg, SCORING_CAPS.program.min, SCORING_CAPS.program.max);
        })();

  // QUESTIONNAIRE: use the NRSR raw score (0–54) from the Edge Function when
  // available. The confidence-proxy fallback (confidence × 54) cannot capture
  // the pro/anti direction of individual measures and must not be used when the
  // AI-derived score is present.
  const questionnaireNorm =
    input.questionnaireRawScore !== null && input.questionnaireRawScore !== undefined
      ? clampNorm(input.questionnaireRawScore, SCORING_CAPS.questionnaire.min, SCORING_CAPS.questionnaire.max)
      : questionnaire.length === 0
        ? null
        : (() => {
            const rawAvg = avg(
              questionnaire.map((e) => {
                const conf = e.confidence ?? 1;
                return conf * SCORING_CAPS.questionnaire.max;
              }),
            );
            return clampNorm(rawAvg, SCORING_CAPS.questionnaire.min, SCORING_CAPS.questionnaire.max);
          })();

  // SOCIAL: Phase 2 — always null in MVP per CLAUDE.md.
  const socialNorm: number | null = null;

  // VOTES: per-candidate jurisdictional cap n = count of climate-relevant votes.
  // n is derived from evidence (Tier 1+2 only — Tier 3 already filtered).
  const n = votes.length;
  const rawVotes = votes.reduce((s, e) => s + (e.pointValue ?? lookupPoints(e) ?? 0), 0);
  const votesNorm =
    n === 0 ? null : clampNorm(rawVotes, -(n * 2), n * 2);

  // ACTIONS: sum of point values, normalised against the designed cap.
  const rawActions = actions.reduce(
    (s, e) => s + (e.pointValue ?? lookupPoints(e) ?? 0),
    0,
  );
  const actionsNorm =
    actions.length === 0
      ? null
      : clampNorm(rawActions, SCORING_CAPS.actions.min, SCORING_CAPS.actions.max);

  // 4) Pillar aggregates ---------------------------------------------------
  // SLOVÁ — MVP weights: program 50% + questionnaire 50%. Drop missing parts
  // and renormalise the remaining weights so a candidate with only a program
  // is not penalised simply for the questionnaire being absent.
  const slovaParts: Array<{ value: number; weight: number }> = [];
  if (programNorm !== null) slovaParts.push({ value: programNorm, weight: W_PROGRAM_MVP });
  if (questionnaireNorm !== null) slovaParts.push({ value: questionnaireNorm, weight: W_QUESTIONNAIRE_MVP });
  const slova =
    slovaParts.length === 0
      ? null
      : slovaParts.reduce((s, p) => s + p.value * p.weight, 0) /
        slovaParts.reduce((s, p) => s + p.weight, 0);

  // SKUTKY — votes 0.417 + actions 0.583. If votes_norm null → actions full weight.
  let skutky: number | null;
  if (votesNorm === null && actionsNorm === null) {
    skutky = null;
  } else if (votesNorm === null) {
    skutky = actionsNorm; // full weight shifts to actions
  } else if (actionsNorm === null) {
    // Symmetric: if no actions yet, votes carry full weight.
    skutky = votesNorm;
  } else {
    skutky = votesNorm * W_VOTES + actionsNorm * W_ACTIONS;
  }

  // 5) Total ---------------------------------------------------------------
  let total: number | null;
  if (slova === null && skutky === null) {
    total = null;
  } else if (slova === null) {
    total = skutky;
  } else if (skutky === null) {
    total = slova;
  } else {
    total = slova * W_SLOVA + skutky * W_SKUTKY;
  }

  // 6) Badge ---------------------------------------------------------------
  const { badge, badgeSubtype } = deriveBadge({
    total,
    n,
    actionsCount: actions.length,
    overallConfidence: input.overallConfidence,
    questionnaireResponded: input.questionnaireResponded ?? false,
    isNewCandidate: input.isNewCandidate ?? false,
  });

  return {
    programNorm: programNorm === null ? null : round(programNorm),
    questionnaireNorm: questionnaireNorm === null ? null : round(questionnaireNorm),
    socialNorm,
    votesNorm: votesNorm === null ? null : round(votesNorm),
    actionsNorm: actionsNorm === null ? null : round(actionsNorm),
    slova: slova === null ? null : round(slova),
    skutky: skutky === null ? null : round(skutky),
    total: total === null ? null : round(total),
    badge,
    badgeSubtype,
    formulaVersion: FORMULA_VERSION,
    debug: {
      n,
      rawVotes,
      rawActions,
      excludedTier3,
      programCount: program.length,
      questionnaireCount: questionnaire.length,
    },
  };
}

function round(n: number): number {
  return Math.round(n * 10) / 10;
}

// Resolve point value from evidence_type catalog when not stored on the row.
function lookupPoints(e: SourceCitation & { evidenceType?: string }): number | null {
  if (!e.evidenceType) return null;
  const def = getEvidenceType(e.evidenceType);
  return def?.points ?? null;
}

interface BadgeInput {
  total: number | null;
  n: number;
  actionsCount: number;
  overallConfidence?: number;
  questionnaireResponded: boolean;
  isNewCandidate: boolean;
}

function deriveBadge(input: BadgeInput): { badge: Badge; badgeSubtype?: GreySubtype } {
  const { total, n, actionsCount, overallConfidence, questionnaireResponded, isNewCandidate } = input;

  // GREY logic — order matters.
  if (total === null) {
    return { badge: "grey", badgeSubtype: "GREY_NO_DATA" };
  }
  if (isNewCandidate && n === 0 && actionsCount < 2) {
    return { badge: "grey", badgeSubtype: "GREY_NEW_CANDIDATE" };
  }
  if (!questionnaireResponded && n === 0 && actionsCount === 0) {
    return { badge: "grey", badgeSubtype: "GREY_REFUSED" };
  }
  if (overallConfidence !== undefined && overallConfidence < 0.40) {
    return { badge: "grey", badgeSubtype: "GREY_LOW_CONFIDENCE" };
  }

  if (total >= BADGE_THRESHOLDS.green) return { badge: "green" };
  if (total >= BADGE_THRESHOLDS.yellow) return { badge: "yellow" };
  if (total >= BADGE_THRESHOLDS.orange) return { badge: "orange" };
  return { badge: "red" };
}

// Convenience: aggregate confidence across evidence items (mean, ignoring undefined).
export function meanConfidence(evidence: EvidenceRecord[]): number | undefined {
  const conf = evidence
    .filter((e) => e.climateRelevanceTier !== 3)
    .map((e) => e.confidence)
    .filter((c): c is number => typeof c === "number");
  if (conf.length === 0) return undefined;
  return conf.reduce((s, n) => s + n, 0) / conf.length;
}

// Re-export pillar resolver for callers that build their own debug views.
export { PILLAR_FOR_SOURCE };
