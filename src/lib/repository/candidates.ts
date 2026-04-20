import { supabase } from "@/integrations/supabase/client";
import type { Candidate, KrajId, Position, ScoreBreakdown, SourceCitation } from "@/types/domain";
import {
  candidateFromRow,
  EMPTY_SCORE,
  evidenceFromAction,
  evidenceFromCitation,
  evidenceFromProgram,
  evidenceFromVote,
  scoreFromRow,
} from "./_adapters";
import type { EvidenceRecord } from "./types";
import { computeScore, meanConfidence } from "@/lib/scoring/computeScore";

// ---------------------------------------------------------------------------
// Public reads — Supabase implementation.
// RLS restricts anon to PUBLISHED + is_approved candidates and their evidence.
// ---------------------------------------------------------------------------

export interface CandidatesRepository {
  list(): Promise<Candidate[]>;
  getByKraj(krajId: KrajId): Promise<Candidate[]>;
  getByKrajAndPosition(krajId: KrajId, position: Position): Promise<Candidate[]>;
  getById(id: string): Promise<Candidate | null>;
}

async function fetchLatestScores(candidateIds: string[]): Promise<Map<string, ScoreBreakdown>> {
  if (candidateIds.length === 0) return new Map();
  const { data, error } = await supabase
    .from("scores")
    .select("*")
    .in("candidate_id", candidateIds)
    .eq("is_approved", true)
    .order("version_number", { ascending: false });
  if (error) throw error;
  const out = new Map<string, ScoreBreakdown>();
  // Rows ordered desc by version; first row per candidate is the latest approved.
  for (const row of data ?? []) {
    if (!out.has(row.candidate_id)) {
      out.set(row.candidate_id, scoreFromRow(row));
    }
  }
  return out;
}

async function hydrate(rows: Array<Awaited<ReturnType<typeof fetchCandidates>>[number]>): Promise<Candidate[]> {
  const ids = rows.map((r) => r.id);
  const scores = await fetchLatestScores(ids);
  return rows.map((row) => {
    const rec = candidateFromRow(row);
    return {
      ...rec,
      score: scores.get(row.id) ?? EMPTY_SCORE,
      citations: [],
    } as Candidate;
  });
}

async function fetchCandidates() {
  const { data, error } = await supabase
    .from("candidates")
    .select("*")
    .eq("state", "PUBLISHED")
    .eq("is_approved", true);
  if (error) throw error;
  return data ?? [];
}

class SupabaseCandidatesRepository implements CandidatesRepository {
  async list(): Promise<Candidate[]> {
    return hydrate(await fetchCandidates());
  }
  async getByKraj(krajId: KrajId): Promise<Candidate[]> {
    const { data, error } = await supabase
      .from("candidates")
      .select("*")
      .eq("region", krajId)
      .eq("state", "PUBLISHED")
      .eq("is_approved", true);
    if (error) throw error;
    return hydrate(data ?? []);
  }
  async getByKrajAndPosition(krajId: KrajId, position: Position): Promise<Candidate[]> {
    const { data, error } = await supabase
      .from("candidates")
      .select("*")
      .eq("region", krajId)
      .eq("position", position)
      .eq("state", "PUBLISHED")
      .eq("is_approved", true);
    if (error) throw error;
    return hydrate(data ?? []);
  }
  async getById(id: string): Promise<Candidate | null> {
    const { data, error } = await supabase
      .from("candidates")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const [hydrated] = await hydrate([data]);
    // Fetch evidence + program row in parallel for sub-score computation.
    const [evidence, programRes] = await Promise.all([
      fetchEvidence(id),
      supabase
        .from("programs")
        .select("normalized_score")
        .eq("candidate_id", id)
        .maybeSingle(),
    ]);
    // Compute sub-scores (programNorm/questionnaireNorm/votesNorm/actionsNorm)
    // from evidence so the public detail page can show the breakdown grid.
    // Pillar totals (slova/skutky/total/badge) keep the approved values from
    // the `scores` row — we never recompute those on the public side.
    const computed = computeScore({
      evidence,
      isNewCandidate: !hydrated.incumbent,
      overallConfidence: meanConfidence(evidence),
      questionnaireResponded: hydrated.questionnaireResponded,
    });
    const aiProgramNorm =
      programRes.data?.normalized_score !== null && programRes.data?.normalized_score !== undefined
        ? Math.round(Number(programRes.data.normalized_score) * 10) / 10
        : null;
    const enrichedScore: ScoreBreakdown = {
      ...hydrated.score,
      programNorm: aiProgramNorm ?? computed.programNorm,
      questionnaireNorm: computed.questionnaireNorm,
      socialNorm: computed.socialNorm,
      votesNorm: computed.votesNorm,
      actionsNorm: computed.actionsNorm,
    };
    const citations = evidenceToCitations(evidence);
    return { ...hydrated, score: enrichedScore, citations };
  }
}

async function fetchEvidence(candidateId: string): Promise<EvidenceRecord[]> {
  const [citationsRes, actionsRes, votesRes, programsRes] = await Promise.all([
    supabase.from("source_citations").select("*").eq("candidate_id", candidateId),
    supabase.from("documented_actions").select("*").eq("candidate_id", candidateId),
    supabase.from("votes").select("*").eq("candidate_id", candidateId),
    supabase.from("programs").select("*").eq("candidate_id", candidateId),
  ]);
  return [
    ...(citationsRes.data ?? []).map(evidenceFromCitation),
    ...(actionsRes.data ?? []).map(evidenceFromAction),
    ...(votesRes.data ?? []).map(evidenceFromVote),
    ...(programsRes.data ?? []).flatMap(evidenceFromProgram),
  ];
}

function evidenceToCitations(items: EvidenceRecord[]): SourceCitation[] {
  return items.map(({ candidateId: _c, pointValue: _p, evidenceType: _e, createdAt: _ca, updatedAt: _u, ...rest }) => rest);
}

export const candidatesRepo: CandidatesRepository = new SupabaseCandidatesRepository();
