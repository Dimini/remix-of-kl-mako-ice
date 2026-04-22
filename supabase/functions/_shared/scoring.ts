// Mirrors the locked v1.0 formula from src/lib/scoring/computeScore.ts.
// Re-implemented here so the Edge Function has no frontend @/ imports.
// Do not change the formula without bumping formula_version in scoring_config.

// deno-lint-ignore-file no-explicit-any

import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

// ---------------------------------------------------------------------------
// Config

export interface ScoringConfig {
  formulaVersion: string;
  weightSlova: number;
  weightSkutky: number;
  mvpWeightProgram: number;
  mvpWeightQuestionnaire: number;
  skutkyWeightVotes: number;
  skutkyWeightActions: number;
  capProgramMin: number;
  capProgramMax: number;
  capQuestionnaireMin: number;
  capQuestionnaireMax: number;
  capActionsMin: number;
  capActionsMax: number;
  badgeGreenMin: number;
  badgeYellowMin: number;
  badgeOrangeMin: number;
  greyLowConfidenceBelow: number;
}

export async function loadScoringConfig(
  svc: SupabaseClient,
): Promise<ScoringConfig> {
  const { data, error } = await svc
    .from("scoring_config")
    .select("key, value");
  if (error) throw error;
  const rows = (data ?? []) as Array<{ key: string; value: any }>;
  const num = (key: string, fallback: number) => {
    const row = rows.find((r) => r.key === key);
    return row ? Number(row.value) : fallback;
  };
  const fvRow = rows.find((r) => r.key === "formula_version");
  const formulaVersion = fvRow
    ? String(fvRow.value).replace(/"/g, "")
    : "1.0";
  return {
    formulaVersion,
    weightSlova: num("weight_slova", 0.40),
    weightSkutky: num("weight_skutky", 0.60),
    mvpWeightProgram: num("mvp_weight_program", 0.50),
    mvpWeightQuestionnaire: num("mvp_weight_questionnaire", 0.50),
    skutkyWeightVotes: num("skutky_weight_votes", 0.417),
    skutkyWeightActions: num("skutky_weight_actions", 0.583),
    capProgramMin: num("cap_program_min", -35.30),
    capProgramMax: num("cap_program_max", 17.31),
    capQuestionnaireMin: num("cap_questionnaire_min", 0),
    capQuestionnaireMax: num("cap_questionnaire_max", 54),
    capActionsMin: num("cap_actions_min", -10),
    capActionsMax: num("cap_actions_max", 15),
    badgeGreenMin: num("badge_green_min", 80),
    badgeYellowMin: num("badge_yellow_min", 55),
    badgeOrangeMin: num("badge_orange_min", 30),
    greyLowConfidenceBelow: num("grey_low_confidence_below", 0.40),
  };
}

// ---------------------------------------------------------------------------
// Math helpers

export function clampNorm(raw: number, min: number, max: number): number {
  if (max === min) return 0;
  const v = ((raw - min) / (max - min)) * 100;
  return Math.min(100, Math.max(0, v));
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

// ---------------------------------------------------------------------------
// Row types (DB shape, snake_case)

export interface ProgramRow {
  normalized_score: number | null;
  confidence: number | null;
}

export interface QuestionnaireRow {
  questionnaire_score: number | null;
}

export interface VoteRow {
  points: number | null;
  confidence: number | null;
  climate_relevance_tier: number;
}

export interface ActionRow {
  points: number | null;
  climate_relevance_tier: number;
}

export interface CandidateMeta {
  isNewCandidate: boolean;
  questionnaireResponded: boolean;
}

// ---------------------------------------------------------------------------
// Output

type Badge = "green" | "yellow" | "orange" | "red" | "grey";
type GreySubtype =
  | "GREY_NO_DATA"
  | "GREY_NEW_CANDIDATE"
  | "GREY_REFUSED"
  | "GREY_LOW_CONFIDENCE";

export interface ScoreBreakdown {
  programNorm: number | null;
  questionnaireNorm: number | null;
  socialNorm: null;
  votesNorm: number | null;
  actionsNorm: number | null;
  slova: number | null;
  skutky: number | null;
  total: number | null;
  badge: Badge;
  badgeSubtype: GreySubtype | null;
  formulaVersion: string;
  overallConfidence: number | null;
  debug: {
    n: number;
    rawVotes: number;
    rawActions: number;
    programCount: number;
    questionnaireCount: number;
  };
}

// ---------------------------------------------------------------------------
// Core computation

export function buildScoreBreakdown(
  programs: ProgramRow[],
  questionnaires: QuestionnaireRow[],
  votes: VoteRow[],
  actions: ActionRow[],
  meta: CandidateMeta,
  cfg: ScoringConfig,
): ScoreBreakdown {
  // Tier 3 already filtered by DB query; belt-and-suspenders guard here.
  const scorableVotes = votes.filter((v) => v.climate_relevance_tier !== 3);
  const scorableActions = actions.filter((a) => a.climate_relevance_tier !== 3);

  // PROGRAM: average normalized_score across rows (CAP-02 pre-normalizes to 0-100).
  const programsWithScore = programs.filter((p) => p.normalized_score !== null);
  const programNorm =
    programsWithScore.length === 0
      ? null
      : round1(
          programsWithScore.reduce((s, p) => s + p.normalized_score!, 0) /
            programsWithScore.length,
        );

  // QUESTIONNAIRE: clampNorm the raw score from the latest submitted response.
  const qRow = questionnaires[0] ?? null;
  const questionnaireNorm =
    meta.questionnaireResponded === false || qRow?.questionnaire_score == null
      ? null
      : round1(
          clampNorm(
            qRow.questionnaire_score,
            cfg.capQuestionnaireMin,
            cfg.capQuestionnaireMax,
          ),
        );

  // VOTES: per-candidate cap ±n×2 where n = count of tier-1/2 votes.
  const n = scorableVotes.length;
  const rawVotes = scorableVotes.reduce((s, v) => s + (v.points ?? 0), 0);
  const votesNorm =
    n === 0 ? null : round1(clampNorm(rawVotes, -(n * 2), n * 2));

  // ACTIONS: sum of points, normalised against designed cap.
  const rawActions = scorableActions.reduce(
    (s, a) => s + (a.points ?? 0),
    0,
  );
  const actionsNorm =
    scorableActions.length === 0
      ? null
      : round1(
          clampNorm(rawActions, cfg.capActionsMin, cfg.capActionsMax),
        );

  // SLOVÁ pillar — MVP weights, drop missing, renormalise.
  const slovaParts: Array<{ value: number; weight: number }> = [];
  if (programNorm !== null)
    slovaParts.push({ value: programNorm, weight: cfg.mvpWeightProgram });
  if (questionnaireNorm !== null)
    slovaParts.push({ value: questionnaireNorm, weight: cfg.mvpWeightQuestionnaire });
  const slova =
    slovaParts.length === 0
      ? null
      : round1(
          slovaParts.reduce((s, p) => s + p.value * p.weight, 0) /
            slovaParts.reduce((s, p) => s + p.weight, 0),
        );

  // SKUTKY pillar — shift full weight if one component is null.
  let skutky: number | null;
  if (votesNorm === null && actionsNorm === null) skutky = null;
  else if (votesNorm === null) skutky = actionsNorm;
  else if (actionsNorm === null) skutky = votesNorm;
  else
    skutky = round1(
      votesNorm * cfg.skutkyWeightVotes +
        actionsNorm * cfg.skutkyWeightActions,
    );

  // TOTAL
  let total: number | null;
  if (slova === null && skutky === null) total = null;
  else if (slova === null) total = skutky;
  else if (skutky === null) total = slova;
  else total = round1(slova * cfg.weightSlova + skutky * cfg.weightSkutky);

  // Overall confidence: mean across votes + programs (documented_actions has no confidence column).
  const confValues: number[] = [
    ...scorableVotes
      .map((v) => v.confidence)
      .filter((c): c is number => c !== null),
    ...programs
      .map((p) => p.confidence)
      .filter((c): c is number => c !== null),
  ];
  const overallConfidence =
    confValues.length > 0
      ? confValues.reduce((s, c) => s + c, 0) / confValues.length
      : null;

  const { badge, badgeSubtype } = deriveBadge({
    total,
    n,
    actionsCount: scorableActions.length,
    overallConfidence: overallConfidence ?? undefined,
    questionnaireResponded: meta.questionnaireResponded,
    isNewCandidate: meta.isNewCandidate,
    cfg,
  });

  return {
    programNorm,
    questionnaireNorm,
    socialNorm: null,
    votesNorm,
    actionsNorm,
    slova,
    skutky,
    total,
    badge,
    badgeSubtype: badgeSubtype ?? null,
    formulaVersion: cfg.formulaVersion,
    overallConfidence,
    debug: {
      n,
      rawVotes,
      rawActions,
      programCount: programs.length,
      questionnaireCount: questionnaires.length,
    },
  };
}

function deriveBadge(input: {
  total: number | null;
  n: number;
  actionsCount: number;
  overallConfidence: number | undefined;
  questionnaireResponded: boolean;
  isNewCandidate: boolean;
  cfg: ScoringConfig;
}): { badge: Badge; badgeSubtype?: GreySubtype } {
  const {
    total,
    n,
    actionsCount,
    overallConfidence,
    questionnaireResponded,
    isNewCandidate,
    cfg,
  } = input;

  if (total === null) return { badge: "grey", badgeSubtype: "GREY_NO_DATA" };
  if (isNewCandidate && n === 0 && actionsCount < 2)
    return { badge: "grey", badgeSubtype: "GREY_NEW_CANDIDATE" };
  if (!questionnaireResponded && n === 0 && actionsCount === 0)
    return { badge: "grey", badgeSubtype: "GREY_REFUSED" };
  if (overallConfidence !== undefined && overallConfidence < cfg.greyLowConfidenceBelow)
    return { badge: "grey", badgeSubtype: "GREY_LOW_CONFIDENCE" };

  if (total >= cfg.badgeGreenMin) return { badge: "green" };
  if (total >= cfg.badgeYellowMin) return { badge: "yellow" };
  if (total >= cfg.badgeOrangeMin) return { badge: "orange" };
  return { badge: "red" };
}
