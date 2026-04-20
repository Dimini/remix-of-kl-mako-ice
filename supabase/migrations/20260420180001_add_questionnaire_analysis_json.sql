-- CAP-02: add AI analysis output columns to questionnaire_responses.
-- Mirrors the programs table (citations_json / agent_version / processed_at).
ALTER TABLE public.questionnaire_responses
  ADD COLUMN IF NOT EXISTS analysis_json  JSONB,
  ADD COLUMN IF NOT EXISTS agent_version  TEXT,
  ADD COLUMN IF NOT EXISTS processed_at  TIMESTAMPTZ;
