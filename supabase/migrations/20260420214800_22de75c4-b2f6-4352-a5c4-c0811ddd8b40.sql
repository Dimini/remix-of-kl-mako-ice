CREATE OR REPLACE FUNCTION public.candidate_id_for_questionnaire_uuid(p_uuid UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id
  FROM public.candidates
  WHERE questionnaire_uuid = p_uuid
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_candidate_for_questionnaire(p_uuid UUID)
RETURNS SETOF public.candidates
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT *
  FROM public.candidates
  WHERE questionnaire_uuid = p_uuid
  LIMIT 1;
$$;

DROP POLICY IF EXISTS "Questionnaire: anon reads own response" ON public.questionnaire_responses;
DROP POLICY IF EXISTS "Questionnaire: anon inserts response" ON public.questionnaire_responses;
DROP POLICY IF EXISTS "Questionnaire: anon updates draft" ON public.questionnaire_responses;

CREATE POLICY "Questionnaire: anon reads own response"
  ON public.questionnaire_responses
  FOR SELECT TO anon, authenticated
  USING (
    candidate_id = public.candidate_id_for_questionnaire_uuid(link_uuid)
  );

CREATE POLICY "Questionnaire: anon inserts response"
  ON public.questionnaire_responses
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    candidate_id = public.candidate_id_for_questionnaire_uuid(link_uuid)
    AND NOT EXISTS (
      SELECT 1
      FROM public.questionnaire_responses r2
      WHERE r2.candidate_id = questionnaire_responses.candidate_id
        AND r2.status = 'submitted'
    )
  );

CREATE POLICY "Questionnaire: anon updates draft"
  ON public.questionnaire_responses
  FOR UPDATE TO anon, authenticated
  USING (
    candidate_id = public.candidate_id_for_questionnaire_uuid(link_uuid)
    AND status = 'draft'
  )
  WITH CHECK (
    candidate_id = public.candidate_id_for_questionnaire_uuid(link_uuid)
  );

UPDATE public.candidates c
SET questionnaire_responded = EXISTS (
  SELECT 1
  FROM public.questionnaire_responses qr
  WHERE qr.candidate_id = c.id
    AND qr.status = 'submitted'
);