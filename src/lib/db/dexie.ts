import Dexie, { type Table } from "dexie";
import type { Candidate, SourceCitation } from "@/types/domain";

// ---------------------------------------------------------------------------
// Local-first IndexedDB store for the NGO admin UI.
// This is the dev-time persistence layer — JSON export (Phase G) hands the
// data shape to Claude Code for the real Supabase migration.
// ---------------------------------------------------------------------------

// Evidence row — separate from Candidate so we can support all four pillars
// (program, questionnaire, social, vote, action) with per-item tier + reviewer notes.
export interface EvidenceRecord extends SourceCitation {
  candidateId: string;
  // SKUTKY items carry a fixed point value from the evidence_type table.
  // SLOVÁ items (program/questionnaire/social) leave this null — they feed
  // into a sub-score that is computed from the full set of evidence.
  pointValue?: number | null;
  evidenceType?: string;        // e.g. "council_vote" | "resolution" | "initiative" | "program" | ...
  createdAt: string;            // ISO
  updatedAt: string;            // ISO
}

export interface CandidateRecord extends Omit<Candidate, "citations"> {
  createdAt: string;
  updatedAt: string;
}

// Audit trail — every approval / revision / state change.
// Survives in IndexedDB for the lifetime of the local-first phase and is
// included in the Phase G JSON export so backend migration keeps history.
export interface AuditLogRecord {
  id: string;                 // ulid-ish: `${candidateId}-${ts}`
  candidateId: string;
  at: string;                 // ISO
  reviewer: string;           // free-text reviewer name from admin auth
  action:
    | "STATE_CHANGE"
    | "APPROVED"
    | "NEEDS_REVISION"
    | "SCORE_SAVED"
    | "ADJUSTMENT";
  fromState?: string;
  toState?: string;
  note?: string;
  // For ADJUSTMENT entries: snapshot of pillar deltas vs AI suggestion.
  adjustments?: Record<string, number | null>;
}

export class KlimaKompasDB extends Dexie {
  candidates!: Table<CandidateRecord, string>;
  evidence!: Table<EvidenceRecord, string>;
  auditLog!: Table<AuditLogRecord, string>;

  constructor() {
    super("klima_kompas_admin");
    this.version(1).stores({
      candidates: "id, krajId, position, state, year, isApproved",
      evidence: "id, candidateId, pillar, sourceType, climateRelevanceTier",
    });
    // v2: add audit log table.
    this.version(2).stores({
      candidates: "id, krajId, position, state, year, isApproved",
      evidence: "id, candidateId, pillar, sourceType, climateRelevanceTier",
      auditLog: "id, candidateId, at, action",
    });
  }
}

export const db = new KlimaKompasDB();
