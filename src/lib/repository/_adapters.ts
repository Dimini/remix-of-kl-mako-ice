// DB row ↔ app record adapters. Keep snake_case isolated to this file.
import type { Database } from "@/integrations/supabase/types";
import type { CandidateRecord, EvidenceRecord, QuestionnaireResponseRecord } from "./types";
import type { ScoreBreakdown } from "@/types/domain";

type CandidateRow = Database["public"]["Tables"]["candidates"]["Row"];
type CitationRow = Database["public"]["Tables"]["source_citations"]["Row"];
type ActionRow = Database["public"]["Tables"]["documented_actions"]["Row"];
type VoteRow = Database["public"]["Tables"]["votes"]["Row"];
type ProgramRow = Database["public"]["Tables"]["programs"]["Row"];
type ScoreRow = Database["public"]["Tables"]["scores"]["Row"];
type QResponseRow = Database["public"]["Tables"]["questionnaire_responses"]["Row"];

export const EMPTY_SCORE: ScoreBreakdown = {
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

export function candidateFromRow(row: CandidateRow, score?: ScoreRow | null): CandidateRecord {
  return {
    id: row.id,
    name: row.name,
    photoUrl: row.photo_url ?? undefined,
    position: row.position,
    krajId: row.region,
    city: row.city ?? undefined,
    party: row.party,
    isIndependent: row.is_independent,
    incumbent: row.incumbent ?? false,
    year: row.year,
    state: row.state,
    questionnaireResponded: row.questionnaire_responded,
    isApproved: row.is_approved,
    questionnaireUuid: row.questionnaire_uuid ?? undefined,
    score: score ? scoreFromRow(score) : EMPTY_SCORE,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function candidateToRow(c: Partial<CandidateRecord>): Partial<CandidateRow> {
  const out: Partial<CandidateRow> = {};
  if (c.id !== undefined) out.id = c.id;
  if (c.name !== undefined) out.name = c.name;
  if (c.photoUrl !== undefined) out.photo_url = c.photoUrl ?? null;
  if (c.position !== undefined) out.position = c.position;
  if (c.krajId !== undefined) out.region = c.krajId;
  if (c.city !== undefined) out.city = c.city ?? null;
  if (c.party !== undefined) out.party = c.party;
  if (c.isIndependent !== undefined) out.is_independent = c.isIndependent;
  if (c.incumbent !== undefined) out.incumbent = c.incumbent;
  if (c.year !== undefined) out.year = c.year;
  if (c.state !== undefined) out.state = c.state;
  if (c.questionnaireResponded !== undefined)
    out.questionnaire_responded = c.questionnaireResponded;
  if (c.isApproved !== undefined) out.is_approved = c.isApproved;
  if (c.questionnaireUuid !== undefined) out.questionnaire_uuid = c.questionnaireUuid ?? null;
  return out;
}

export function scoreFromRow(row: ScoreRow): ScoreBreakdown {
  return {
    ...EMPTY_SCORE,
    slova: row.pillar1_score !== null ? Number(row.pillar1_score) : null,
    skutky: row.pillar2_score !== null ? Number(row.pillar2_score) : null,
    total: row.total_score !== null ? Number(row.total_score) : null,
    badge: row.badge,
    badgeSubtype: row.badge_subtype ?? undefined,
    formulaVersion: row.formula_version,
  };
}

// --- Evidence: 4 tables ↔ unified EvidenceRecord ---------------------------

export function evidenceFromCitation(row: CitationRow): EvidenceRecord {
  return {
    id: row.id,
    candidateId: row.candidate_id,
    pillar: row.pillar,
    sourceType: row.source_type,
    url: row.url,
    citationText: row.citation_text,
    climateRelevanceTier: row.climate_relevance_tier as 1 | 2 | 3,
    reviewerNote: row.reviewer_note ?? undefined,
    dateAccessed: row.date_accessed,
    confidence: row.confidence !== null ? Number(row.confidence) : undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    pointValue: null,
  };
}

export function evidenceFromAction(row: ActionRow): EvidenceRecord {
  return {
    id: row.id,
    candidateId: row.candidate_id,
    pillar: "skutky",
    sourceType: "initiative",
    url: row.source_url,
    citationText: row.citation_text,
    climateRelevanceTier: row.climate_relevance_tier as 1 | 2 | 3,
    reviewerNote: row.reviewer_note ?? undefined,
    dateAccessed: row.date,
    confidence: undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    pointValue: row.points !== null ? Number(row.points) : null,
    evidenceType: row.action_type,
  };
}

export function evidenceFromVote(row: VoteRow): EvidenceRecord {
  return {
    id: row.id,
    candidateId: row.candidate_id,
    pillar: "skutky",
    sourceType: "council_vote",
    url: row.source_url,
    citationText: row.topic,
    climateRelevanceTier: row.climate_relevance_tier as 1 | 2 | 3,
    reviewerNote: row.reviewer_note ?? undefined,
    dateAccessed: row.date,
    confidence: row.confidence !== null ? Number(row.confidence) : undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    pointValue: row.points !== null ? Number(row.points) : null,
    evidenceType: `council_vote_${row.vote_direction === "for" ? "for" : row.vote_direction === "against" ? "against" : "abstain"}`,
  };
}

export function evidenceFromProgram(row: ProgramRow): EvidenceRecord {
  // Summary citation — the full raw_text can be 100k chars; the ScorePreview
  // panel surfaces the Carter-method detail separately. Here we only show a
  // short summary so EvidenceSection doesn't render the entire PDF.
  const cj = row.citations_json as { meta?: { totalSentences?: number; proCount?: number; antiCount?: number; rawCarter?: number } } | unknown[] | null;
  const meta = !Array.isArray(cj) ? cj?.meta : undefined;
  const summary = meta
    ? `Analýza programu (AI): ${meta.proCount ?? 0} pro / ${meta.antiCount ?? 0} anti z ${meta.totalSentences ?? 0} viet · raw Carter = ${meta.rawCarter ?? "—"} · normalizované = ${row.normalized_score ?? "—"}/100`
    : (row.raw_text ?? "").slice(0, 280);
  return {
    id: row.id,
    candidateId: row.candidate_id,
    pillar: "slova",
    sourceType: "program",
    url: row.source_url,
    citationText: summary,
    climateRelevanceTier: 1,
    dateAccessed: (row.processed_at ?? row.created_at).slice(0, 10),
    confidence: row.confidence !== null ? Number(row.confidence) : undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    pointValue: null,
    evidenceType: "program",
  };
}

export function questionnaireFromRow(row: QResponseRow): QuestionnaireResponseRecord {
  const json = (row.response_json ?? {}) as Record<string, unknown>;
  return {
    id: row.candidate_id,
    candidateId: row.candidate_id,
    uuid: row.link_uuid,
    status: row.status,
    candidateName: row.candidate_name ?? "",
    email: row.email ?? "",
    scaleAnswers: (json.scaleAnswers as QuestionnaireResponseRecord["scaleAnswers"]) ?? {},
    priorityActions: (json.priorityActions as string) ?? "",
    additionalNotes: (json.additionalNotes as string) ?? undefined,
    consentPublish: Boolean(json.consentPublish),
    consentTruthful: Boolean(json.consentTruthful),
    rawScore: row.questionnaire_score !== null ? Number(row.questionnaire_score) : null,
    submittedAt: row.responded_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
