
-- =====================================================================
-- 001_initial_schema.sql — Klima Kompas backend (per REQUIREMENTS.md)
-- =====================================================================

-- ---------- ENUMS ----------------------------------------------------
CREATE TYPE public.app_role AS ENUM ('admin', 'reviewer', 'user');
CREATE TYPE public.kraj_id AS ENUM ('BA','TT','TN','NR','ZA','BB','PO','KE');
CREATE TYPE public.position_type AS ENUM ('zupan','primator');
CREATE TYPE public.candidate_state AS ENUM (
  'REGISTERED','DATA_COLLECTION','ANALYZED','IN_REVIEW',
  'NEEDS_REVISION','APPROVED','PUBLISHED'
);
CREATE TYPE public.badge_color AS ENUM ('green','yellow','orange','red','grey');
CREATE TYPE public.grey_subtype AS ENUM (
  'GREY_NO_DATA','GREY_REFUSED','GREY_NEW_CANDIDATE','GREY_LOW_CONFIDENCE'
);
CREATE TYPE public.pillar AS ENUM ('slova','skutky');
CREATE TYPE public.source_type AS ENUM (
  'council_vote','resolution','initiative','program',
  'questionnaire','social_post','manual_entry'
);
CREATE TYPE public.evidence_type AS ENUM (
  'project_implementation','public_statement','attended_protest',
  'membership','op_ed','interview','other'
);
CREATE TYPE public.vote_direction AS ENUM ('for','against','abstain','absent');
CREATE TYPE public.audit_action AS ENUM (
  'STATE_CHANGE','APPROVED','NEEDS_REVISION','SCORE_SAVED',
  'ADJUSTMENT','QUESTIONNAIRE_SUBMITTED'
);
CREATE TYPE public.questionnaire_status AS ENUM ('draft','submitted');

-- ---------- updated_at trigger function ------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ---------- user_roles + has_role (security definer, RLS-safe) -------
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Reviewers can view all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ---------- scoring_config -------------------------------------------
CREATE TABLE public.scoring_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.scoring_config ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_scoring_config_updated
  BEFORE UPDATE ON public.scoring_config
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "Public can read scoring_config" ON public.scoring_config
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage scoring_config" ON public.scoring_config
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ---------- candidates -----------------------------------------------
CREATE TABLE public.candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  photo_url TEXT,
  position public.position_type NOT NULL,
  region public.kraj_id NOT NULL,
  city TEXT,
  party TEXT NOT NULL,
  is_independent BOOLEAN NOT NULL DEFAULT false,
  incumbent BOOLEAN DEFAULT false,
  year INTEGER NOT NULL DEFAULT 2026,
  state public.candidate_state NOT NULL DEFAULT 'REGISTERED',
  questionnaire_responded BOOLEAN NOT NULL DEFAULT false,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  questionnaire_uuid UUID UNIQUE DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_candidates_updated BEFORE UPDATE ON public.candidates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_candidates_region ON public.candidates(region);
CREATE INDEX idx_candidates_state ON public.candidates(state);

CREATE POLICY "Public reads published candidates" ON public.candidates
  FOR SELECT TO anon, authenticated
  USING (state = 'PUBLISHED' AND is_approved = true);
CREATE POLICY "Reviewers read all candidates" ON public.candidates
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'reviewer') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Reviewers manage candidates" ON public.candidates
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'reviewer') OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'reviewer') OR public.has_role(auth.uid(), 'admin'));

-- ---------- scores ---------------------------------------------------
CREATE TABLE public.scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  pillar1_score NUMERIC(6,2),     -- SLOVÁ (0–100)
  pillar2_score NUMERIC(6,2),     -- SKUTKY (0–100)
  total_score NUMERIC(6,2),
  badge public.badge_color NOT NULL DEFAULT 'grey',
  badge_subtype public.grey_subtype,
  formula_version TEXT NOT NULL DEFAULT '1.0',
  is_approved BOOLEAN NOT NULL DEFAULT false,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (candidate_id, version_number),
  CHECK (badge_subtype IS NULL OR badge = 'grey')
);
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_scores_updated BEFORE UPDATE ON public.scores
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_scores_candidate ON public.scores(candidate_id);

CREATE POLICY "Public reads approved scores of published candidates" ON public.scores
  FOR SELECT TO anon, authenticated
  USING (
    is_approved = true AND EXISTS (
      SELECT 1 FROM public.candidates c
      WHERE c.id = scores.candidate_id
        AND c.state = 'PUBLISHED' AND c.is_approved = true
    )
  );
CREATE POLICY "Reviewers manage scores" ON public.scores
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'reviewer') OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'reviewer') OR public.has_role(auth.uid(), 'admin'));

-- ---------- programs (CAP-02 program-pillar agent output) ------------
CREATE TABLE public.programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  source_url TEXT NOT NULL,
  raw_text TEXT,
  raw_score NUMERIC(8,4),
  normalized_score NUMERIC(6,2),
  citations_json JSONB DEFAULT '[]'::jsonb,
  agent_version TEXT,
  confidence NUMERIC(4,3) CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1)),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_programs_updated BEFORE UPDATE ON public.programs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_programs_candidate ON public.programs(candidate_id);

CREATE POLICY "Public reads programs of published candidates" ON public.programs
  FOR SELECT TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.candidates c
    WHERE c.id = programs.candidate_id
      AND c.state = 'PUBLISHED' AND c.is_approved = true
  ));
CREATE POLICY "Reviewers manage programs" ON public.programs
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'reviewer') OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'reviewer') OR public.has_role(auth.uid(), 'admin'));

-- ---------- questionnaire_responses ----------------------------------
CREATE TABLE public.questionnaire_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  link_uuid UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  status public.questionnaire_status NOT NULL DEFAULT 'draft',
  candidate_name TEXT,
  email TEXT,
  response_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- expected response_json keys: scaleAnswers, priorityActions, additionalNotes,
  --                              consentPublish (bool), consentTruthful (bool)
  questionnaire_score NUMERIC(6,2),
  sent_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.questionnaire_responses ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_q_responses_updated BEFORE UPDATE ON public.questionnaire_responses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_q_responses_candidate ON public.questionnaire_responses(candidate_id);
CREATE INDEX idx_q_responses_link ON public.questionnaire_responses(link_uuid);

CREATE POLICY "Public reads consented questionnaire responses" ON public.questionnaire_responses
  FOR SELECT TO anon, authenticated
  USING (
    status = 'submitted'
    AND COALESCE((response_json->>'consentPublish')::boolean, false) = true
    AND EXISTS (
      SELECT 1 FROM public.candidates c
      WHERE c.id = questionnaire_responses.candidate_id
        AND c.state = 'PUBLISHED' AND c.is_approved = true
    )
  );
CREATE POLICY "Reviewers manage questionnaire responses" ON public.questionnaire_responses
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'reviewer') OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'reviewer') OR public.has_role(auth.uid(), 'admin'));

-- ---------- votes ----------------------------------------------------
-- NOTE: REQUIREMENTS calls for `computed_points` GENERATED. Postgres requires
-- immutable expressions for STORED generated columns; the formula needs a
-- lookup against scoring_config. Defer to a TRIGGER in CAP-07 migration.
CREATE TABLE public.votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  meeting_id TEXT,
  topic TEXT NOT NULL,
  vote_direction public.vote_direction NOT NULL,
  points NUMERIC(5,2),
  source_url TEXT NOT NULL,
  climate_relevance_tier SMALLINT NOT NULL CHECK (climate_relevance_tier IN (1,2,3)),
  reviewer_note TEXT,
  confidence NUMERIC(4,3) CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1)),
  entered_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_ai_generated BOOLEAN NOT NULL DEFAULT false,
  requires_second_reviewer BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT votes_tier2_requires_reviewer_note CHECK (
    climate_relevance_tier <> 2
    OR (reviewer_note IS NOT NULL AND length(trim(reviewer_note)) > 0)
  )
);
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_votes_updated BEFORE UPDATE ON public.votes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_votes_candidate ON public.votes(candidate_id);

CREATE POLICY "Public reads votes of published candidates" ON public.votes
  FOR SELECT TO anon, authenticated
  USING (
    climate_relevance_tier <> 3
    AND EXISTS (
      SELECT 1 FROM public.candidates c
      WHERE c.id = votes.candidate_id
        AND c.state = 'PUBLISHED' AND c.is_approved = true
    )
  );
CREATE POLICY "Reviewers manage votes" ON public.votes
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'reviewer') OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'reviewer') OR public.has_role(auth.uid(), 'admin'));

-- ---------- documented_actions ---------------------------------------
CREATE TABLE public.documented_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  action_type public.evidence_type NOT NULL,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  points NUMERIC(5,2),
  source_url TEXT NOT NULL,
  citation_text TEXT NOT NULL CHECK (length(citation_text) <= 280),
  climate_relevance_tier SMALLINT NOT NULL CHECK (climate_relevance_tier IN (1,2,3)),
  reviewer_note TEXT,
  entered_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_ai_generated BOOLEAN NOT NULL DEFAULT false,
  requires_second_reviewer BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT actions_tier2_requires_reviewer_note CHECK (
    climate_relevance_tier <> 2
    OR (reviewer_note IS NOT NULL AND length(trim(reviewer_note)) > 0)
  )
);
ALTER TABLE public.documented_actions ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_actions_updated BEFORE UPDATE ON public.documented_actions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_actions_candidate ON public.documented_actions(candidate_id);

CREATE POLICY "Public reads actions of published candidates" ON public.documented_actions
  FOR SELECT TO anon, authenticated
  USING (
    climate_relevance_tier <> 3
    AND EXISTS (
      SELECT 1 FROM public.candidates c
      WHERE c.id = documented_actions.candidate_id
        AND c.state = 'PUBLISHED' AND c.is_approved = true
    )
  );
CREATE POLICY "Reviewers manage actions" ON public.documented_actions
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'reviewer') OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'reviewer') OR public.has_role(auth.uid(), 'admin'));

-- ---------- source_citations (canonical evidence audit) --------------
CREATE TABLE public.source_citations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  pillar public.pillar NOT NULL,
  source_type public.source_type NOT NULL,
  url TEXT NOT NULL,
  citation_text TEXT NOT NULL CHECK (length(citation_text) <= 280),
  date_accessed DATE NOT NULL DEFAULT CURRENT_DATE,
  confidence NUMERIC(4,3) CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1)),
  climate_relevance_tier SMALLINT NOT NULL CHECK (climate_relevance_tier IN (1,2,3)),
  reviewer_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT citations_tier2_requires_reviewer_note CHECK (
    climate_relevance_tier <> 2
    OR (reviewer_note IS NOT NULL AND length(trim(reviewer_note)) > 0)
  )
);
ALTER TABLE public.source_citations ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_citations_updated BEFORE UPDATE ON public.source_citations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_citations_candidate ON public.source_citations(candidate_id);

CREATE POLICY "Public reads citations of published candidates" ON public.source_citations
  FOR SELECT TO anon, authenticated
  USING (
    climate_relevance_tier <> 3
    AND EXISTS (
      SELECT 1 FROM public.candidates c
      WHERE c.id = source_citations.candidate_id
        AND c.state = 'PUBLISHED' AND c.is_approved = true
    )
  );
CREATE POLICY "Reviewers manage citations" ON public.source_citations
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'reviewer') OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'reviewer') OR public.has_role(auth.uid(), 'admin'));

-- ---------- review_audit_log -----------------------------------------
CREATE TABLE public.review_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewer TEXT NOT NULL,
  reviewer_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action public.audit_action NOT NULL,
  from_state TEXT,
  to_state TEXT,
  note TEXT,
  adjustments JSONB
);
ALTER TABLE public.review_audit_log ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_audit_candidate_at ON public.review_audit_log(candidate_id, at DESC);

CREATE POLICY "Reviewers read audit log" ON public.review_audit_log
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'reviewer') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Reviewers insert audit log" ON public.review_audit_log
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'reviewer') OR public.has_role(auth.uid(), 'admin'));

-- ---------- SEED scoring_config (v1.0) -------------------------------
INSERT INTO public.scoring_config (key, value, description) VALUES
  ('formula_version', '"1.0"', 'Locked formula version'),
  ('weight_slova', '0.40', 'KLIMA_SCORE weight for SLOVÁ pillar'),
  ('weight_skutky', '0.60', 'KLIMA_SCORE weight for SKUTKY pillar'),
  ('mvp_weight_program', '0.50', 'SLOVÁ MVP: program weight'),
  ('mvp_weight_questionnaire', '0.50', 'SLOVÁ MVP: questionnaire weight'),
  ('full_weight_program', '0.375', 'SLOVÁ Full: program weight'),
  ('full_weight_questionnaire', '0.375', 'SLOVÁ Full: questionnaire weight'),
  ('full_weight_social', '0.25', 'SLOVÁ Full: social weight'),
  ('skutky_weight_votes', '0.417', 'SKUTKY: votes weight'),
  ('skutky_weight_actions', '0.583', 'SKUTKY: actions weight'),
  ('cap_program_min', '-35.30', 'Program normalisation min (Carter et al.)'),
  ('cap_program_max', '17.31', 'Program normalisation max (Carter et al.)'),
  ('cap_questionnaire_min', '0', 'Questionnaire normalisation min'),
  ('cap_questionnaire_max', '54', 'Questionnaire normalisation max (NRSR 2023 PS)'),
  ('cap_actions_min', '-10', 'Documented actions normalisation min'),
  ('cap_actions_max', '15', 'Documented actions normalisation max'),
  ('vote_point_value', '2', 'Per-vote point magnitude (votes cap = ±n×2)'),
  ('badge_green_min', '80', 'Green badge threshold (>=)'),
  ('badge_yellow_min', '55', 'Yellow badge threshold (>=)'),
  ('badge_orange_min', '30', 'Orange badge threshold (>=)'),
  ('grey_low_confidence_below', '0.40', 'Confidence threshold for GREY_LOW_CONFIDENCE');
