import { supabase } from "@/integrations/supabase/client";
import { getEvidenceType } from "@/lib/evidenceTypes";
import {
  candidateFromRow,
  candidateToRow,
  evidenceFromAction,
  evidenceFromCitation,
  evidenceFromProgram,
  evidenceFromVote,
} from "./_adapters";
import type { Candidate, CandidateRecord, EvidenceRecord } from "./types";
import type { Database } from "@/integrations/supabase/types";

// ---------------------------------------------------------------------------
// Admin-side repository: writes go to Supabase. Reviewer/admin RLS required.
// Evidence is split across 4 canonical tables (source_citations,
// documented_actions, votes, programs); we present a unified EvidenceRecord
// API to the UI and route on (sourceType, evidenceType key) on write.
// ---------------------------------------------------------------------------

export interface AdminCandidatesRepository {
  list(): Promise<CandidateRecord[]>;
  getById(id: string): Promise<CandidateRecord | null>;
  getByQuestionnaireUuid(uuid: string): Promise<CandidateRecord | null>;
  upsert(candidate: CandidateRecord): Promise<void>;
  update(id: string, patch: Partial<CandidateRecord>): Promise<void>;
  remove(id: string): Promise<void>;
  countAll(): Promise<number>;
  countApproved(): Promise<number>;
}

export interface AdminEvidenceRepository {
  listByCandidate(candidateId: string): Promise<EvidenceRecord[]>;
  upsert(evidence: EvidenceRecord): Promise<void>;
  remove(id: string): Promise<void>;
}

class SupabaseCandidatesRepo implements AdminCandidatesRepository {
  async list() {
    const { data, error } = await supabase.from("candidates").select("*").order("name");
    if (error) throw error;
    return (data ?? []).map((r) => candidateFromRow(r));
  }
  async getById(id: string) {
    const { data, error } = await supabase.from("candidates").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? candidateFromRow(data) : null;
  }
  async getByQuestionnaireUuid(uuid: string) {
    const { data, error } = await supabase
      .from("candidates")
      .select("*")
      .eq("questionnaire_uuid", uuid)
      .maybeSingle();
    if (error) throw error;
    return data ? candidateFromRow(data) : null;
  }
  async upsert(candidate: CandidateRecord) {
    const row = candidateToRow(candidate);
    const { error } = await supabase.from("candidates").upsert({
      ...row,
      id: candidate.id,
      name: candidate.name,
      party: candidate.party,
      position: candidate.position,
      region: candidate.krajId,
    } as Database["public"]["Tables"]["candidates"]["Insert"]);
    if (error) throw error;
  }
  async update(id: string, patch: Partial<CandidateRecord>) {
    const row = candidateToRow(patch);
    const { error } = await supabase.from("candidates").update(row).eq("id", id);
    if (error) throw error;
  }
  async remove(id: string) {
    // Evidence rows are removed by ON DELETE CASCADE on the FK.
    const { error } = await supabase.from("candidates").delete().eq("id", id);
    if (error) throw error;
  }
  async countAll() {
    const { count, error } = await supabase.from("candidates").select("*", { count: "exact", head: true });
    if (error) throw error;
    return count ?? 0;
  }
  async countApproved() {
    const { count, error } = await supabase
      .from("candidates")
      .select("*", { count: "exact", head: true })
      .eq("is_approved", true);
    if (error) throw error;
    return count ?? 0;
  }
}

// Routing helpers ------------------------------------------------------------

type EvidenceTable = "source_citations" | "documented_actions" | "votes" | "programs";

function tableFor(ev: EvidenceRecord): EvidenceTable {
  if (ev.sourceType === "council_vote") return "votes";
  if (ev.sourceType === "program") return "programs";
  // SKUTKY non-vote (resolution/initiative/manual_entry) → documented_actions
  if (ev.pillar === "skutky") return "documented_actions";
  // SLOVÁ non-program (questionnaire/social_post) → source_citations
  return "source_citations";
}

function actionTypeFor(ev: EvidenceRecord): Database["public"]["Enums"]["evidence_type"] {
  // Map the catalog evidenceType key onto the DB evidence_type enum.
  switch (ev.evidenceType) {
    case "implemented_project":
      return "project_implementation";
    case "resolution":
      return "public_statement";
    case "public_commitment":
      return "public_statement";
    case "obstruction":
      return "other";
    case "harmful_project":
      return "other";
    default:
      return "other";
  }
}

function voteDirectionFor(ev: EvidenceRecord): Database["public"]["Enums"]["vote_direction"] {
  switch (ev.evidenceType) {
    case "council_vote_for":
      return "for";
    case "council_vote_against":
      return "against";
    case "council_vote_abstain":
      return "abstain";
    default:
      return "abstain";
  }
}

class SupabaseEvidenceRepo implements AdminEvidenceRepository {
  async listByCandidate(candidateId: string): Promise<EvidenceRecord[]> {
    const [c, a, v, p] = await Promise.all([
      supabase.from("source_citations").select("*").eq("candidate_id", candidateId),
      supabase.from("documented_actions").select("*").eq("candidate_id", candidateId),
      supabase.from("votes").select("*").eq("candidate_id", candidateId),
      supabase.from("programs").select("*").eq("candidate_id", candidateId),
    ]);
    if (c.error) throw c.error;
    if (a.error) throw a.error;
    if (v.error) throw v.error;
    if (p.error) throw p.error;
    return [
      ...(c.data ?? []).map(evidenceFromCitation),
      ...(a.data ?? []).map(evidenceFromAction),
      ...(v.data ?? []).map(evidenceFromVote),
      ...(p.data ?? []).flatMap(evidenceFromProgram),
    ];
  }

  async upsert(ev: EvidenceRecord): Promise<void> {
    const table = tableFor(ev);
    const def = ev.evidenceType ? getEvidenceType(ev.evidenceType) : undefined;
    const points = ev.pointValue ?? def?.points ?? null;

    if (table === "votes") {
      const { error } = await supabase.from("votes").upsert({
        id: ev.id,
        candidate_id: ev.candidateId,
        date: ev.dateAccessed,
        topic: ev.citationText.slice(0, 500),
        vote_direction: voteDirectionFor(ev),
        points,
        source_url: ev.url,
        climate_relevance_tier: ev.climateRelevanceTier,
        confidence: ev.confidence ?? null,
        reviewer_note: ev.reviewerNote ?? null,
      });
      if (error) throw error;
      return;
    }
    if (table === "documented_actions") {
      const { error } = await supabase.from("documented_actions").upsert({
        id: ev.id,
        candidate_id: ev.candidateId,
        action_type: actionTypeFor(ev),
        date: ev.dateAccessed,
        description: ev.citationText,
        points,
        source_url: ev.url,
        citation_text: ev.citationText,
        climate_relevance_tier: ev.climateRelevanceTier,
        reviewer_note: ev.reviewerNote ?? null,
      });
      if (error) throw error;
      return;
    }
    if (table === "programs") {
      const { error } = await supabase.from("programs").upsert({
        id: ev.id,
        candidate_id: ev.candidateId,
        source_url: ev.url,
        raw_text: ev.citationText,
        confidence: ev.confidence ?? null,
      });
      if (error) throw error;
      return;
    }
    // source_citations (SLOVÁ: questionnaire/social_post)
    const { error } = await supabase.from("source_citations").upsert({
      id: ev.id,
      candidate_id: ev.candidateId,
      pillar: ev.pillar,
      source_type: ev.sourceType,
      url: ev.url,
      citation_text: ev.citationText,
      date_accessed: ev.dateAccessed,
      confidence: ev.confidence ?? null,
      climate_relevance_tier: ev.climateRelevanceTier,
      reviewer_note: ev.reviewerNote ?? null,
    });
    if (error) throw error;
  }

  async remove(id: string): Promise<void> {
    // Delete from all four; the row only exists in one but this keeps the API simple.
    await Promise.all([
      supabase.from("source_citations").delete().eq("id", id),
      supabase.from("documented_actions").delete().eq("id", id),
      supabase.from("votes").delete().eq("id", id),
      supabase.from("programs").delete().eq("id", id),
    ]);
  }
}

export const adminCandidatesRepo: AdminCandidatesRepository = new SupabaseCandidatesRepo();
export const adminEvidenceRepo: AdminEvidenceRepository = new SupabaseEvidenceRepo();

// Convenience: convert a public Candidate to a CandidateRecord for upsert.
export function toCandidateRecord(c: Candidate): CandidateRecord {
  const now = new Date().toISOString();
  const { citations: _drop, ...rest } = c;
  return { ...rest, createdAt: now, updatedAt: now };
}

export type { Candidate, CandidateRecord };
