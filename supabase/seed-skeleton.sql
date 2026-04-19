-- ===========================================================================
-- Klima Kompas — Phase G seed.sql SKELETON
--
-- Purpose: Hand off the local-first Dexie data model to Claude Code so the
-- real Supabase schema + import script can be written. This file is a
-- REFERENCE SKELETON, not an executable migration. It mirrors the JSON
-- export shape defined in `src/lib/export/exportSchema.ts` and the table
-- contract in CLAUDE.md (DATABASE — SUPABASE SCHEMA section).
--
-- Workflow:
--   1. Admin runs /admin/export → downloads klima-kompas-export-*.json
--   2. Claude Code writes the real migration in /supabase/migrations/
--   3. A one-shot import script (Node or psql \copy) reads the JSON and
--      executes the INSERT statements sketched below.
--
-- Conventions:
--   * snake_case column names (Postgres idiomatic).
--   * All tables get id / created_at / updated_at from the migration.
--   * RLS policies are NOT in this skeleton — Claude Code adds them per
--     CLAUDE.md "KEY CONSTRAINTS" (public read for APPROVED rows only,
--     authenticated write for reviewers).
--   * Tier 3 evidence is imported BUT excluded from score computation by
--     CAP-07 (see src/lib/scoring/computeScore.ts).
-- ===========================================================================


-- ---------------------------------------------------------------------------
-- candidates
-- Source: ExportedCandidate (minus the embedded `score` object).
-- ---------------------------------------------------------------------------
INSERT INTO public.candidates (
    id,
    name,
    photo_url,
    position,            -- 'zupan' | 'primator'
    region,              -- KrajId: 'BA' | 'TT' | 'TN' | 'NR' | 'ZA' | 'BB' | 'PO' | 'KE'
    city,
    party,
    is_independent,
    incumbent,
    year,                -- 2026
    state,               -- CandidateState enum
    questionnaire_responded,
    is_approved,
    questionnaire_uuid,
    created_at,
    updated_at
) VALUES (
    :id, :name, :photo_url, :position, :region, :city, :party,
    :is_independent, :incumbent, :year, :state,
    :questionnaire_responded, :is_approved, :questionnaire_uuid,
    :created_at, :updated_at
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    state = EXCLUDED.state,
    is_approved = EXCLUDED.is_approved,
    updated_at = EXCLUDED.updated_at;


-- ---------------------------------------------------------------------------
-- scores
-- Source: ExportedCandidate.score (ScoreBreakdown). One row per candidate
-- per version_number. First import = version 1.
-- ---------------------------------------------------------------------------
INSERT INTO public.scores (
    candidate_id,
    program_norm,
    questionnaire_norm,
    social_norm,        -- nullable in MVP
    votes_norm,         -- nullable for new candidates
    actions_norm,
    pillar1_score,      -- = slova
    pillar2_score,      -- = skutky
    total_score,        -- = total
    badge,              -- 'green' | 'yellow' | 'orange' | 'red' | 'grey'
    badge_subtype,      -- GreySubtype | NULL
    formula_version,    -- 'v1.0'
    is_approved,
    approved_at,        -- NULL until reviewer sign-off
    approved_by,        -- reviewer name from audit log
    version_number      -- 1 on first import
) VALUES (
    :candidate_id, :program_norm, :questionnaire_norm, :social_norm,
    :votes_norm, :actions_norm, :slova, :skutky, :total,
    :badge, :badge_subtype, :formula_version,
    :is_approved, :approved_at, :approved_by, 1
);


-- ---------------------------------------------------------------------------
-- source_citations
-- Source: ExportedEvidence. Covers ALL pillars (CAP-08 scope).
--   * pillar = 'slova' | 'skutky'
--   * source_type = 'program' | 'questionnaire' | 'social' | 'vote' | 'action'
--   * climate_relevance_tier ∈ {1,2,3}
--   * Tier 2 rows MUST have reviewer_note (enforced by CHECK).
-- ---------------------------------------------------------------------------
INSERT INTO public.source_citations (
    id,
    candidate_id,
    pillar,
    source_type,
    url,
    citation_text,
    climate_relevance_tier,
    reviewer_note,
    confidence,
    point_value,        -- only for SKUTKY rows
    evidence_type,      -- 'council_vote' | 'resolution' | 'initiative' | ...
    date_accessed,
    created_at,
    updated_at
) VALUES (
    :id, :candidate_id, :pillar, :source_type, :url, :citation_text,
    :climate_relevance_tier, :reviewer_note, :confidence,
    :point_value, :evidence_type, :date_accessed,
    :created_at, :updated_at
);

-- Suggested constraint (Claude Code: add to migration):
-- ALTER TABLE public.source_citations
--   ADD CONSTRAINT tier2_requires_reviewer_note
--   CHECK (climate_relevance_tier <> 2 OR (reviewer_note IS NOT NULL AND length(trim(reviewer_note)) > 0));


-- ---------------------------------------------------------------------------
-- review_audit_log
-- Source: ExportedAuditEntry. Full reviewer history (who approved what,
-- when, with what adjustments).
-- ---------------------------------------------------------------------------
INSERT INTO public.review_audit_log (
    id,
    candidate_id,
    at,
    reviewer,
    action,             -- STATE_CHANGE | APPROVED | NEEDS_REVISION | SCORE_SAVED | ADJUSTMENT | QUESTIONNAIRE_SUBMITTED
    from_state,
    to_state,
    note,
    adjustments         -- JSONB: snapshot of pillar deltas vs AI suggestion
) VALUES (
    :id, :candidate_id, :at, :reviewer, :action,
    :from_state, :to_state, :note, :adjustments::jsonb
);


-- ---------------------------------------------------------------------------
-- questionnaire_responses
-- Source: ExportedQuestionnaireResponse. One row per candidate.
-- response_json bundles all candidate-supplied fields verbatim.
-- ---------------------------------------------------------------------------
INSERT INTO public.questionnaire_responses (
    candidate_id,
    link_uuid,
    sent_at,            -- NULL until invitation flow exists
    responded_at,       -- = submittedAt
    status,             -- 'draft' | 'submitted'
    candidate_name,
    email,
    response_json,      -- { scaleAnswers, priorityActions, additionalNotes, consentPublish, consentTruthful }
    questionnaire_score -- = rawScore
) VALUES (
    :candidate_id, :uuid, NULL, :submitted_at, :status,
    :candidate_name, :email,
    jsonb_build_object(
        'scaleAnswers',     :scale_answers::jsonb,
        'priorityActions',  :priority_actions,
        'additionalNotes',  :additional_notes,
        'consentPublish',   :consent_publish,
        'consentTruthful',  :consent_truthful
    ),
    :raw_score
)
ON CONFLICT (candidate_id) DO UPDATE SET
    status = EXCLUDED.status,
    response_json = EXCLUDED.response_json,
    questionnaire_score = EXCLUDED.questionnaire_score,
    responded_at = EXCLUDED.responded_at;


-- ---------------------------------------------------------------------------
-- scoring_config (seed values — formula constants from CLAUDE.md)
-- These do NOT come from the JSON export; Claude Code seeds them directly.
-- ---------------------------------------------------------------------------
INSERT INTO public.scoring_config (key, value, description) VALUES
    ('formula_version',     '"v1.0"',  'Locked scoring formula version'),
    ('weight_slova',        '0.40',    'SLOVÁ pillar weight in total score'),
    ('weight_skutky',       '0.60',    'SKUTKY pillar weight in total score'),
    ('weight_program',      '0.50',    'Program weight inside SLOVÁ (MVP)'),
    ('weight_questionnaire','0.50',    'Questionnaire weight inside SLOVÁ (MVP)'),
    ('weight_votes',        '0.417',   'Votes weight inside SKUTKY'),
    ('weight_actions',      '0.583',   'Actions weight inside SKUTKY'),
    ('cap_program_min',     '-35.30',  'Program normalisation min (Carter et al.)'),
    ('cap_program_max',     '17.31',   'Program normalisation max (Carter et al.)'),
    ('cap_questionnaire_min','0',      'Questionnaire normalisation min'),
    ('cap_questionnaire_max','54',     'Questionnaire normalisation max (NRSR 2023)'),
    ('cap_actions_min',     '-10',     'Documented actions min'),
    ('cap_actions_max',     '15',      'Documented actions max'),
    ('badge_green',         '80',      'Green badge threshold (>=)'),
    ('badge_yellow',        '55',      'Yellow badge threshold (>=)'),
    ('badge_orange',        '30',      'Orange badge threshold (>=)')
ON CONFLICT (key) DO NOTHING;
