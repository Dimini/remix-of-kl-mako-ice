-- Questionnaire public access: allow anonymous candidates to read their own
-- candidate row and write their questionnaire response via the secret UUID link.

-- -------------------------------------------------------------------------
-- Helper: look up candidate id by questionnaire UUID, bypassing RLS.
-- Used inside RLS policy expressions on questionnaire_responses so the
-- policies themselves don't need a wide SELECT on candidates.
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.candidate_id_for_questionnaire_uuid(p_uuid UUID)
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM public.candidates WHERE questionnaire_uuid = p_uuid LIMIT 1;
$$;

-- -------------------------------------------------------------------------
-- Helper: return the full candidate row for a given questionnaire UUID.
-- Called via supabase.rpc('get_candidate_for_questionnaire', { p_uuid })
-- from the frontend questionnaire page (replaces the admin-only direct
-- candidates SELECT that was previously blocked for anonymous users).
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_candidate_for_questionnaire(p_uuid UUID)
RETURNS SETOF public.candidates LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT * FROM public.candidates WHERE questionnaire_uuid = p_uuid LIMIT 1;
$$;

-- -------------------------------------------------------------------------
-- questionnaire_responses policies for anonymous + authenticated users
-- (reviewer/admin policy already covers all operations for logged-in staff)
-- -------------------------------------------------------------------------

-- Allow anon to read the draft they previously saved (hydrate form on return).
CREATE POLICY "Questionnaire: anon reads own response"
  ON public.questionnaire_responses
  FOR SELECT TO anon, authenticated
  USING (
    candidate_id = public.candidate_id_for_questionnaire_uuid(link_uuid)
  );

-- Allow anon to create a draft/submitted response when no submitted row exists.
CREATE POLICY "Questionnaire: anon inserts response"
  ON public.questionnaire_responses
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    candidate_id = public.candidate_id_for_questionnaire_uuid(link_uuid)
    AND NOT EXISTS (
      SELECT 1 FROM public.questionnaire_responses r2
      WHERE r2.candidate_id = questionnaire_responses.candidate_id
        AND r2.status = 'submitted'
    )
  );

-- Allow anon to update a draft response (blocks editing already-submitted rows).
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
