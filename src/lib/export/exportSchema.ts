// ---------------------------------------------------------------------------
// Phase G — Supabase migration handoff: typed schema for the JSON export.
//
// This file is the contract between the local-first Dexie store (admin UI)
// and the future Supabase database. Claude Code reads this file (plus
// `supabase/seed-skeleton.sql` and `docs/SUPABASE_IMPORT.md`) to write the
// real migration + import script.
//
// IMPORTANT — DO NOT MUTATE EXISTING FIELDS WITHOUT BUMPING `schemaVersion`.
// The export consumer (Claude Code) keys its import logic off the version.
// ---------------------------------------------------------------------------

import type {
  Badge,
  CandidateState,
  ClimateRelevanceTier,
  GreySubtype,
  KrajId,
  Position,
  ScoreBreakdown,
  SourceType,
} from "@/types/domain";

/** Bump on every breaking change. Current = matches Dexie v3. */
export const EXPORT_SCHEMA_VERSION = 3 as const;
export type ExportSchemaVersion = typeof EXPORT_SCHEMA_VERSION;

// ---------------------------------------------------------------------------
// Row shapes — flat JSON, snake_case-ready field names retained as camelCase
// (Claude Code maps to snake_case in seed.sql).
// ---------------------------------------------------------------------------

export interface ExportedCandidate {
  id: string;
  name: string;
  photoUrl?: string;
  position: Position;
  krajId: KrajId;
  city?: string;
  party: string;
  isIndependent: boolean;
  incumbent?: boolean;
  year: number;
  state: CandidateState;
  /** Persisted score snapshot at export time. */
  score: ScoreBreakdown;
  questionnaireResponded: boolean;
  isApproved: boolean;
  /** Unique link UUID embedded in /dotaznik/:uuid. */
  questionnaireUuid?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExportedEvidence {
  id: string;
  candidateId: string;
  pillar: "slova" | "skutky";
  sourceType: SourceType;
  url: string;
  citationText: string;
  climateRelevanceTier: ClimateRelevanceTier;
  /** REQUIRED for Tier 2 — explains the environmental connection. */
  reviewerNote?: string;
  dateAccessed: string;
  confidence?: number;
  pointValue?: number | null;
  evidenceType?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExportedAuditEntry {
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

export interface ExportedQuestionnaireResponse {
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

// ---------------------------------------------------------------------------
// Top-level export payload — what `AdminExport.tsx` writes to the JSON file.
// ---------------------------------------------------------------------------

export interface ExportPayload {
  /** ISO timestamp of when the export was generated. */
  exportedAt: string;
  /** Schema contract version — see EXPORT_SCHEMA_VERSION. */
  schemaVersion: ExportSchemaVersion;
  candidates: ExportedCandidate[];
  evidence: ExportedEvidence[];
  auditLog: ExportedAuditEntry[];
  questionnaireResponses: ExportedQuestionnaireResponse[];
}

// ---------------------------------------------------------------------------
// Mapping notes for Claude Code (kept here so the contract is co-located).
//
// candidates table:        ExportedCandidate.score is flattened into the
//                          column set on `scores` table; keep candidate row
//                          minimal (id, name, photo_url, position, region,
//                          city, party, is_independent, year, state).
// scores table:            one row per candidate with a `version_number`
//                          column — first import = 1.
// source_citations table:  ExportedEvidence maps 1:1.
// review_queue / audit:    ExportedAuditEntry maps to a reviewer audit
//                          table; `adjustments` JSONB column stores the
//                          deltas snapshot.
// questionnaire_responses: ExportedQuestionnaireResponse maps 1:1; the
//                          `response_json` column stores
//                          { scaleAnswers, priorityActions, additionalNotes,
//                            consentPublish, consentTruthful }.
// ---------------------------------------------------------------------------

/** Type guard — useful for the import script on the Supabase side. */
export function isExportPayload(x: unknown): x is ExportPayload {
  if (!x || typeof x !== "object") return false;
  const p = x as Partial<ExportPayload>;
  return (
    typeof p.exportedAt === "string" &&
    typeof p.schemaVersion === "number" &&
    Array.isArray(p.candidates) &&
    Array.isArray(p.evidence) &&
    Array.isArray(p.auditLog) &&
    Array.isArray(p.questionnaireResponses)
  );
}
