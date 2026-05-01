-- CAP-04: Social Media Analysis — schema for pilot (Facebook manual paste)
-- Phase 1: tables, RLS, realtime, scoring_config seeds.
-- Phase 2 (separate): classification via Claude + aggregate score computation.
-- Phase 5 (separate): cap calibration + formula_version bump to activate social pillar.

CREATE TYPE public.social_platform AS ENUM ('facebook', 'twitter', 'instagram', 'tiktok', 'youtube');
CREATE TYPE public.social_post_lang  AS ENUM ('sk', 'cs', 'en', 'other');

CREATE TABLE public.social_media_posts (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id           UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  platform               public.social_platform NOT NULL DEFAULT 'facebook',
  post_url               TEXT NOT NULL,
  post_external_id       TEXT,
  post_date              DATE NOT NULL,
  raw_text               TEXT NOT NULL,
  language               public.social_post_lang NOT NULL DEFAULT 'sk',
  env_score              SMALLINT CHECK (env_score   IS NULL OR env_score   BETWEEN 0 AND 2),
  local_score            SMALLINT CHECK (local_score IS NULL OR local_score BETWEEN 0 AND 2),
  conc_score             SMALLINT CHECK (conc_score  IS NULL OR conc_score  BETWEEN 0 AND 2),
  avg_score NUMERIC(4,3) GENERATED ALWAYS AS (
    CASE WHEN env_score IS NULL OR local_score IS NULL OR conc_score IS NULL THEN NULL
         ELSE (env_score + local_score + conc_score)::NUMERIC / 3.0 END
  ) STORED,
  recency_weight         NUMERIC(3,2) NOT NULL DEFAULT 1.0 CHECK (recency_weight IN (0.5, 1.0)),
  classification         TEXT CHECK (classification IN ('pro_climate', 'anti_climate', 'neutral')),
  climate_relevance_tier SMALLINT NOT NULL DEFAULT 3 CHECK (climate_relevance_tier IN (1, 2, 3)),
  reviewer_note          TEXT,
  citation_text          TEXT CHECK (citation_text IS NULL OR length(citation_text) <= 280),
  confidence             NUMERIC(4,3) CHECK (confidence IS NULL OR (confidence BETWEEN 0 AND 1)),
  is_approved            BOOLEAN NOT NULL DEFAULT false,
  approved_at            TIMESTAMPTZ,
  approved_by            UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  agent_version          TEXT,
  ingest_method          TEXT NOT NULL DEFAULT 'manual_paste'
                           CHECK (ingest_method IN ('manual_paste', 'graph_api', 'admin_url_only')),
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT social_post_unique_per_candidate UNIQUE (candidate_id, post_url),
  CONSTRAINT social_tier2_requires_reviewer_note CHECK (
    climate_relevance_tier <> 2
    OR (reviewer_note IS NOT NULL AND length(trim(reviewer_note)) > 0)
  )
);

ALTER TABLE public.social_media_posts ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_social_posts_updated
  BEFORE UPDATE ON public.social_media_posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_social_posts_candidate
  ON public.social_media_posts(candidate_id);

CREATE INDEX idx_social_posts_candidate_tier_approved
  ON public.social_media_posts(candidate_id, climate_relevance_tier, is_approved);

CREATE POLICY "Reviewers manage social posts"
  ON public.social_media_posts
  FOR ALL TO authenticated
  USING  (public.has_role(auth.uid(), 'reviewer') OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'reviewer') OR public.has_role(auth.uid(), 'admin'));

ALTER PUBLICATION supabase_realtime ADD TABLE public.social_media_posts;
ALTER TABLE public.social_media_posts REPLICA IDENTITY FULL;

-- Aggregate summary row per candidate (one row, updated after each batch).
CREATE TABLE public.social_aggregates (
  candidate_id         UUID PRIMARY KEY REFERENCES public.candidates(id) ON DELETE CASCADE,
  raw_score            NUMERIC(6,3),
  social_norm_preview  NUMERIC(5,2),
  confidence           NUMERIC(4,3),
  post_count_total     INT NOT NULL DEFAULT 0,
  post_count_tier1     INT NOT NULL DEFAULT 0,
  post_count_tier2     INT NOT NULL DEFAULT 0,
  post_count_tier3     INT NOT NULL DEFAULT 0,
  post_count_approved  INT NOT NULL DEFAULT 0,
  agent_version        TEXT,
  computed_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.social_aggregates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviewers read social aggregates"
  ON public.social_aggregates
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'reviewer') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Reviewers write social aggregates"
  ON public.social_aggregates
  FOR ALL TO authenticated
  USING  (public.has_role(auth.uid(), 'reviewer') OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'reviewer') OR public.has_role(auth.uid(), 'admin'));

ALTER PUBLICATION supabase_realtime ADD TABLE public.social_aggregates;

-- scoring_config seeds for CAP-04 (caps calibrated from pilot data in Phase 5).
INSERT INTO public.scoring_config (key, value, description) VALUES
  ('cap_social_min',     '0',            'CAP-04 norm lower bound (calibrate from pilot data)'),
  ('cap_social_max',     '2',            'CAP-04 norm upper bound (calibrate from pilot data)'),
  ('election_date',      '"2026-10-31"', 'CAP-04 recency reference date for 30-day weight window'),
  ('social_norm_active', 'false',        'CAP-04 feature flag: include social_norm in SLOVÁ formula')
ON CONFLICT (key) DO NOTHING;
