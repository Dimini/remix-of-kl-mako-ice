import { supabase } from "@/integrations/supabase/client";
import { logAudit } from "@/lib/audit";
import { adminCandidatesRepo } from "./adminCandidates";
import { candidateFromRow, questionnaireFromRow } from "./_adapters";
import type { CandidateRecord, QuestionnaireResponseRecord } from "./types";

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

export async function findCandidateByUuid(uuid: string): Promise<CandidateRecord | null> {
  if (!uuid) return null;
  // Uses a SECURITY DEFINER RPC that bypasses the admin-only RLS on candidates,
  // allowing anonymous candidates to load the form via their secret UUID link.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.rpc as any)(
    "get_candidate_for_questionnaire",
    { p_uuid: uuid },
  ).maybeSingle();
  if (error) throw error;
  return data ? candidateFromRow(data) : null;
}

export async function getResponseForCandidate(
  candidateId: string,
): Promise<QuestionnaireResponseRecord | null> {
  const { data, error } = await supabase
    .from("questionnaire_responses")
    .select("*")
    .eq("candidate_id", candidateId)
    .maybeSingle();
  if (error) throw error;
  return data ? questionnaireFromRow(data) : null;
}

export function computeQuestionnaireRaw(
  scaleAnswers: Record<string, ScaleValue>,
): number {
  const values = Object.values(scaleAnswers);
  if (values.length === 0) return 0;
  let raw = 0;
  for (const v of values) raw += Number(v) - 3;
  return raw + values.length * 2;
}

// Backfill helper kept for API compatibility — questionnaire_uuid is now
// always present (DB default gen_random_uuid()).
export async function ensureUuid(candidateId: string): Promise<string> {
  const c = await adminCandidatesRepo.getById(candidateId);
  if (!c) throw new Error(`Candidate ${candidateId} not found`);
  if (c.questionnaireUuid) return c.questionnaireUuid;
  // Fallback: let the DB generate one via update with null → trigger default? Not
  // possible. Instead, generate client-side and persist.
  const uuid = crypto.randomUUID();
  await adminCandidatesRepo.update(candidateId, { questionnaireUuid: uuid });
  return uuid;
}

function buildResponseJson(payload: SubmitPayload, status: "draft" | "submitted") {
  return {
    status,
    scaleAnswers: payload.scaleAnswers,
    priorityActions: payload.priorityActions,
    additionalNotes: payload.additionalNotes,
    consentPublish: payload.consentPublish,
    consentTruthful: payload.consentTruthful,
  };
}

export async function saveDraft(uuid: string, payload: Partial<SubmitPayload>): Promise<void> {
  const candidate = await findCandidateByUuid(uuid);
  if (!candidate) throw new Error("Neplatný odkaz na dotazník.");
  const existing = await getResponseForCandidate(candidate.id);
  if (existing?.status === "submitted") return;

  const merged: SubmitPayload = {
    candidateName: payload.candidateName ?? existing?.candidateName ?? candidate.name,
    email: payload.email ?? existing?.email ?? "",
    scaleAnswers: payload.scaleAnswers ?? existing?.scaleAnswers ?? {},
    priorityActions: payload.priorityActions ?? existing?.priorityActions ?? "",
    additionalNotes: payload.additionalNotes ?? existing?.additionalNotes,
    consentPublish: payload.consentPublish ?? existing?.consentPublish ?? false,
    consentTruthful: payload.consentTruthful ?? existing?.consentTruthful ?? false,
  };

  const { error } = await supabase
    .from("questionnaire_responses")
    .upsert(
      {
        candidate_id: candidate.id,
        link_uuid: uuid,
        status: "draft",
        candidate_name: merged.candidateName,
        email: merged.email,
        response_json: buildResponseJson(merged, "draft"),
      },
      { onConflict: "candidate_id" },
    );
  if (error) throw error;
}

export interface SubmitResult {
  candidateId: string;
  rawScore: number;
  stateChangedTo?: string;
}

export async function submitFinal(uuid: string, payload: SubmitPayload): Promise<SubmitResult> {
  const candidate = await findCandidateByUuid(uuid);
  if (!candidate) throw new Error("Neplatný odkaz na dotazník.");
  const existing = await getResponseForCandidate(candidate.id);
  if (existing?.status === "submitted") {
    throw new Error("Dotazník už bol odoslaný a nie je možné ho meniť.");
  }
  const now = new Date().toISOString();
  const rawScore = computeQuestionnaireRaw(payload.scaleAnswers);

  const { error: respErr } = await supabase
    .from("questionnaire_responses")
    .upsert(
      {
        candidate_id: candidate.id,
        link_uuid: uuid,
        status: "submitted",
        candidate_name: payload.candidateName,
        email: payload.email,
        response_json: buildResponseJson(payload, "submitted"),
        questionnaire_score: rawScore,
        responded_at: now,
      },
      { onConflict: "candidate_id" },
    );
  if (respErr) throw respErr;

  const fromState = candidate.state;
  let nextState = fromState;
  if (fromState === "REGISTERED" || fromState === "DATA_COLLECTION") nextState = "ANALYZED";
  else if (fromState === "NEEDS_REVISION") nextState = "ANALYZED";

  await adminCandidatesRepo.update(candidate.id, {
    questionnaireResponded: true,
    state: nextState !== fromState ? nextState : undefined,
  });

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
