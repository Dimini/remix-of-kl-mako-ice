CREATE OR REPLACE FUNCTION public.questionnaire_already_submitted(_candidate_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.questionnaire_responses
    WHERE candidate_id = _candidate_id
      AND status = 'submitted'::public.questionnaire_status
  );
$$;

DROP POLICY IF EXISTS "Questionnaire: anon inserts response" ON public.questionnaire_responses;

CREATE POLICY "Questionnaire: anon inserts response"
  ON public.questionnaire_responses
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    candidate_id = public.candidate_id_for_questionnaire_uuid(link_uuid)
    AND NOT public.questionnaire_already_submitted(candidate_id)
  );