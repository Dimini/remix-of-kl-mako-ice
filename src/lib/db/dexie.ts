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
  // Unique link UUID — embedded in /dotaznik/:uuid sent to the candidate.
  // Optional in v2 records; v3 backfill fills it for everyone.
  questionnaireUuid?: string;
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
    | "ADJUSTMENT"
    | "QUESTIONNAIRE_SUBMITTED";
  fromState?: string;
  toState?: string;
  note?: string;
  // For ADJUSTMENT entries: snapshot of pillar deltas vs AI suggestion.
  adjustments?: Record<string, number | null>;
}

// Phase F — questionnaire response from the candidate-facing /dotaznik/:uuid form.
// One per candidate (unique). The published verbatim text lives in `responseJson`.
export interface QuestionnaireResponseRecord {
  id: string;                       // == candidateId (1:1)
  candidateId: string;
  uuid: string;                     // matches CandidateRecord.questionnaireUuid
  status: "draft" | "submitted";
  candidateName: string;            // self-reported (audit trail)
  email: string;
  scaleAnswers: Record<string, "1" | "2" | "3" | "4" | "5">;
  priorityActions: string;
  additionalNotes?: string;
  consentPublish: boolean;
  consentTruthful: boolean;
  // Computed at submit time — sum of (scale-3) across answered scale qs,
  // mapped to the 0..54 cap defined in CLAUDE.md (questionnaire raw range).
  rawScore: number | null;
  submittedAt?: string;             // ISO
  createdAt: string;
  updatedAt: string;
}

export class KlimaKompasDB extends Dexie {
  candidates!: Table<CandidateRecord, string>;
  evidence!: Table<EvidenceRecord, string>;
  auditLog!: Table<AuditLogRecord, string>;
  questionnaireResponses!: Table<QuestionnaireResponseRecord, string>;

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
    // v3: add questionnaireUuid index + questionnaireResponses table.
    // Backfill: assign a stable UUID to every existing candidate record.
    this.version(3)
      .stores({
        candidates: "id, krajId, position, state, year, isApproved, questionnaireUuid",
        evidence: "id, candidateId, pillar, sourceType, climateRelevanceTier",
        auditLog: "id, candidateId, at, action",
        questionnaireResponses: "id, candidateId, uuid, status",
      })
      .upgrade(async (tx) => {
        await tx.table("candidates").toCollection().modify((c) => {
          if (!c.questionnaireUuid) c.questionnaireUuid = generateUuid();
        });
      });
  }
}

export const db = new KlimaKompasDB();

// Lightweight UUID generator (RFC4122 v4-ish via crypto.getRandomValues).
// Avoids adding the `uuid` package for a single use site.
export function generateUuid(): string {
  const c: Crypto | undefined =
    typeof globalThis !== "undefined" ? (globalThis as { crypto?: Crypto }).crypto : undefined;
  if (c && typeof c.randomUUID === "function") {
    return c.randomUUID();
  }
  if (!c) {
    // Extremely unlikely in modern browsers; falls back to Math.random.
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (ch) => {
      const r = (Math.random() * 16) | 0;
      const v = ch === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
  const bytes = new Uint8Array(16);
  c.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
