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

export class KlimaKompasDB extends Dexie {
  candidates!: Table<CandidateRecord, string>;
  evidence!: Table<EvidenceRecord, string>;

  constructor() {
    super("klima_kompas_admin");
    this.version(1).stores({
      // Indexed fields — primary key first.
      candidates: "id, krajId, position, state, year, isApproved",
      evidence: "id, candidateId, pillar, sourceType, climateRelevanceTier",
    });
  }
}

export const db = new KlimaKompasDB();
