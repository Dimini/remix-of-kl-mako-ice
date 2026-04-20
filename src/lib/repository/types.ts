// Shared record types used across repositories. Replaces the Dexie type module.
import type {
  Candidate,
  CandidateState,
  KrajId,
  Position,
  SourceCitation,
} from "@/types/domain";

export interface EvidenceRecord extends SourceCitation {
  candidateId: string;
  // SKUTKY items carry a fixed point value from the evidence_type catalog.
  // SLOVÁ items leave this null.
  pointValue?: number | null;
  // Canonical evidence_type key from src/lib/evidenceTypes.ts (e.g.
  // "council_vote_for", "implemented_project", "program"…). Maps to a row
  // in one of the four evidence tables.
  evidenceType?: string;
  // For program-derived sub-citations: pro/anti climate sentiment (color-coded in UI).
  sentiment?: "pro_climate" | "anti_climate" | "neutral";
  createdAt: string;
  updatedAt: string;
}

export interface CandidateRecord extends Omit<Candidate, "citations"> {
  questionnaireUuid?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogRecord {
  id: string;
  candidateId: string;
  at: string;
  reviewer: string;
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
  adjustments?: Record<string, number | null>;
}

export interface QuestionnaireResponseRecord {
  id: string;
  candidateId: string;
  uuid: string;
  status: "draft" | "submitted";
  candidateName: string;
  email: string;
  scaleAnswers: Record<string, "1" | "2" | "3" | "4" | "5">;
  priorityActions: string;
  additionalNotes?: string;
  consentPublish: boolean;
  consentTruthful: boolean;
  rawScore: number | null;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type { Candidate, CandidateState, KrajId, Position };
