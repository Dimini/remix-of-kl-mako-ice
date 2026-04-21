ALTER TABLE public.questionnaire_responses
  ADD COLUMN IF NOT EXISTS analysis_json jsonb,
  ADD COLUMN IF NOT EXISTS processed_at timestamptz;