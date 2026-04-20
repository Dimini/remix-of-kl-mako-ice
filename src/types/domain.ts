// Domain types for Klima Kompas — aligned with CLAUDE.md schema.
// These types describe the public-facing shape consumed by UI components.
// Backend (Supabase) integration will adapt DB rows to these types via the repository layer.

export type KrajId =
  | "BA" // Bratislavský
  | "TT" // Trnavský
  | "TN" // Trenčiansky
  | "NR" // Nitriansky
  | "ZA" // Žilinský
  | "BB" // Banskobystrický
  | "PO" // Prešovský
  | "KE"; // Košický

export interface Kraj {
  id: KrajId;
  name: string;          // "Bratislavský kraj"
  capital: string;       // "Bratislava"
}

export type Position = "zupan" | "primator";

export type Badge = "green" | "yellow" | "orange" | "red" | "grey";

export type GreySubtype =
  | "GREY_NO_DATA"
  | "GREY_REFUSED"
  | "GREY_NEW_CANDIDATE"
  | "GREY_LOW_CONFIDENCE";

export type CandidateState =
  | "REGISTERED"
  | "DATA_COLLECTION"
  | "ANALYZED"
  | "IN_REVIEW"
  | "NEEDS_REVISION"
  | "APPROVED"
  | "PUBLISHED";

export type ClimateRelevanceTier = 1 | 2 | 3;

// Aligned to Postgres enum `public.source_type` (migration 001).
export type SourceType =
  | "council_vote"
  | "resolution"
  | "initiative"
  | "program"
  | "questionnaire"
  | "social_post"
  | "manual_entry";

// Aligned to Postgres enum `public.evidence_type` (documented_actions.action_type).
export type EvidenceType =
  | "project_implementation"
  | "public_statement"
  | "attended_protest"
  | "membership"
  | "op_ed"
  | "interview"
  | "other";

// Aligned to Postgres enum `public.audit_action`.
export type AuditAction =
  | "STATE_CHANGE"
  | "APPROVED"
  | "NEEDS_REVISION"
  | "SCORE_SAVED"
  | "ADJUSTMENT"
  | "QUESTIONNAIRE_SUBMITTED";

// Aligned to Postgres enum `public.vote_direction`.
export type VoteDirection = "for" | "against" | "abstain" | "absent";

export type Pillar = "slova" | "skutky";

export interface SourceCitation {
  id: string;
  pillar: "slova" | "skutky";
  sourceType: SourceType;
  url: string;
  citationText: string;          // Verbatim quote (Tier 1) or reviewer-documented link (Tier 2)
  climateRelevanceTier: ClimateRelevanceTier;
  reviewerNote?: string;         // REQUIRED for Tier 2
  dateAccessed: string;          // ISO date
  confidence?: number;           // 0..1
  sentiment?: "pro_climate" | "anti_climate" | "neutral"; // For program-derived sub-citations
}

export interface ScoreBreakdown {
  // Normalised 0..100 sub-scores
  programNorm: number | null;
  questionnaireNorm: number | null;
  socialNorm: number | null;        // null in MVP
  votesNorm: number | null;         // null for new candidates
  actionsNorm: number | null;
  // Pillar aggregates 0..100
  slova: number | null;
  skutky: number | null;
  // Final
  total: number | null;             // 0..100
  badge: Badge;
  badgeSubtype?: GreySubtype;
  formulaVersion: string;           // e.g. "v1.0"
}

export interface Candidate {
  id: string;
  name: string;
  photoUrl?: string;
  position: Position;
  krajId: KrajId;
  city?: string;                    // For primátor (krajské mesto)
  party: string;                    // "Nezávislý" if independent
  isIndependent: boolean;
  incumbent?: boolean;              // Currently holds the position
  year: number;                     // 2026
  state: CandidateState;
  score: ScoreBreakdown;
  citations: SourceCitation[];
  questionnaireResponded: boolean;
  isApproved: boolean;              // Must be true to publish
}
