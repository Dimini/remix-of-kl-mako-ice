import {
  db,
  generateUuid,
  type CandidateRecord,
  type QuestionnaireResponseRecord,
} from "@/lib/db/dexie";
import { logAudit } from "@/lib/audit";

// ---------------------------------------------------------------------------
// Phase F — Questionnaire repository.
// Resolves a public /dotaznik/:uuid link to a candidate, persists drafts,
// and finalises submissions into the admin review pipeline.
// ---------------------------------------------------------------------------

export type ScaleValue = "1" | "2" | "3" | "4" | "5";

export interface SubmitPayload {
  candidateName: string;
  email: string;
  scaleAnswers: Record<string, ScaleValue>;
  priorityActions: string;
  additionalNotes?: string;
  consentPublish: boolean;
  consentTruthful: boolean;
}

export async function findCandidateByUuid(
  uuid: string,
): Promise<CandidateRecord | null> {
  if (!uuid) return null;
  const row = await db.candidates.where("questionnaireUuid").equals(uuid).first();
  return row ?? null;
}

export async function getResponseForCandidate(
  candidateId: string,
): Promise<QuestionnaireResponseRecord | null> {
  return (await db.questionnaireResponses.get(candidateId)) ?? null;
}

// CLAUDE.md questionnaire cap: raw 0..54 (NRSR 2023 max achieved). We map
// each Likert answer to (value − 3) on −2..+2, then sum across answered
// scale questions. Unanswered → 0 contribution. Final raw is shifted to
// the positive 0..N*4 range for readability before the scoring engine
// normalises to 0..54.
export function computeQuestionnaireRaw(
  scaleAnswers: Record<string, ScaleValue>,
): number {
  const values = Object.values(scaleAnswers);
  if (values.length === 0) return 0;
  let raw = 0;
  for (const v of values) raw += Number(v) - 3; // −2..+2
  // Shift to 0..(n*4): a fully neutral candidate scores half the cap.
  return raw + values.length * 2;
}

// Ensure the candidate has a uuid (older v1/v2 records). Returns the uuid.
export async function ensureUuid(candidateId: string): Promise<string> {
  const c = await db.candidates.get(candidateId);
  if (!c) throw new Error(`Candidate ${candidateId} not found`);
  if (c.questionnaireUuid) return c.questionnaireUuid;
  const uuid = generateUuid();
  await db.candidates.update(candidateId, {
    questionnaireUuid: uuid,
    updatedAt: new Date().toISOString(),
  });
  return uuid;
}

export async function saveDraft(
  uuid: string,
  payload: Partial<SubmitPayload>,
): Promise<void> {
  const candidate = await findCandidateByUuid(uuid);
  if (!candidate) throw new Error("Neplatný odkaz na dotazník.");
  const existing = await getResponseForCandidate(candidate.id);
  if (existing?.status === "submitted") return; // never overwrite a submission

  const now = new Date().toISOString();
  const record: QuestionnaireResponseRecord = {
    id: candidate.id,
    candidateId: candidate.id,
    uuid,
    status: "draft",
    candidateName: payload.candidateName ?? existing?.candidateName ?? candidate.name,
    email: payload.email ?? existing?.email ?? "",
    scaleAnswers: payload.scaleAnswers ?? existing?.scaleAnswers ?? {},
    priorityActions: payload.priorityActions ?? existing?.priorityActions ?? "",
    additionalNotes: payload.additionalNotes ?? existing?.additionalNotes,
    consentPublish: payload.consentPublish ?? existing?.consentPublish ?? false,
    consentTruthful: payload.consentTruthful ?? existing?.consentTruthful ?? false,
    rawScore: null,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  await db.questionnaireResponses.put(record);
}

export interface SubmitResult {
  candidateId: string;
  rawScore: number;
  stateChangedTo?: string;
}

export async function submitFinal(
  uuid: string,
  payload: SubmitPayload,
): Promise<SubmitResult> {
  const candidate = await findCandidateByUuid(uuid);
  if (!candidate) throw new Error("Neplatný odkaz na dotazník.");

  const existing = await getResponseForCandidate(candidate.id);
  if (existing?.status === "submitted") {
    throw new Error("Dotazník už bol odoslaný a nie je možné ho meniť.");
  }

  const now = new Date().toISOString();
  const rawScore = computeQuestionnaireRaw(payload.scaleAnswers);

  const record: QuestionnaireResponseRecord = {
    id: candidate.id,
    candidateId: candidate.id,
    uuid,
    status: "submitted",
    candidateName: payload.candidateName,
    email: payload.email,
    scaleAnswers: payload.scaleAnswers,
    priorityActions: payload.priorityActions,
    additionalNotes: payload.additionalNotes,
    consentPublish: payload.consentPublish,
    consentTruthful: payload.consentTruthful,
    rawScore,
    submittedAt: now,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  await db.questionnaireResponses.put(record);

  // Advance candidate into the review pipeline. We push linearly through
  // REGISTERED → DATA_COLLECTION → ANALYZED so the candidate appears in
  // the admin review queue immediately. We never regress an in-progress
  // candidate (IN_REVIEW / APPROVED / PUBLISHED stays put).
  const fromState = candidate.state;
  let nextState = fromState;
  if (fromState === "REGISTERED" || fromState === "DATA_COLLECTION") {
    nextState = "ANALYZED";
  } else if (fromState === "NEEDS_REVISION") {
    nextState = "ANALYZED";
  }

  const candidatePatch: Partial<CandidateRecord> = {
    questionnaireResponded: true,
    updatedAt: now,
  };
  if (nextState !== fromState) candidatePatch.state = nextState;
  await db.candidates.update(candidate.id, candidatePatch);

  await logAudit({
    candidateId: candidate.id,
    reviewer: `kandidát: ${payload.candidateName}`,
    action: "QUESTIONNAIRE_SUBMITTED",
    fromState: nextState !== fromState ? fromState : undefined,
    toState: nextState !== fromState ? nextState : undefined,
    note: `Raw skóre dotazníka: ${rawScore}`,
  });

  return {
    candidateId: candidate.id,
    rawScore,
    stateChangedTo: nextState !== fromState ? nextState : undefined,
  };
}
