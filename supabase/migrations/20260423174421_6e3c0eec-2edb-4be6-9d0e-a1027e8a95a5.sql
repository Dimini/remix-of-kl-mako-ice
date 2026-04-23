-- 1) Hide candidates.questionnaire_uuid from anonymous (public) reads.
--    Authenticated reviewers/admins still need it.
REVOKE SELECT (questionnaire_uuid) ON public.candidates FROM anon;

-- 2) Hide questionnaire_responses sensitive columns from anonymous reads:
--    email (PII), analysis_json (internal AI output), agent_version (internal).
--    Authenticated reviewers still need full access via service-role/RLS.
REVOKE SELECT (email, analysis_json, agent_version)
  ON public.questionnaire_responses FROM anon;

-- 3) Voting-records storage bucket: allow reviewers/admins to update/delete
--    files so records can be corrected or removed (currently immutable).
DROP POLICY IF EXISTS "reviewer_update_voting_records" ON storage.objects;
CREATE POLICY "reviewer_update_voting_records"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'voting-records'
    AND (public.has_role(auth.uid(), 'reviewer') OR public.has_role(auth.uid(), 'admin'))
  )
  WITH CHECK (
    bucket_id = 'voting-records'
    AND (public.has_role(auth.uid(), 'reviewer') OR public.has_role(auth.uid(), 'admin'))
  );

DROP POLICY IF EXISTS "admin_delete_voting_records" ON storage.objects;
CREATE POLICY "admin_delete_voting_records"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'voting-records'
    AND public.has_role(auth.uid(), 'admin')
  );

-- 4) Public candidate-photos bucket: prevent anonymous LISTING of all files
--    while still allowing direct GET of a known photo URL (which goes through
--    the storage CDN, not this policy). Restrict the listing policy to
--    individual object reads only by requiring bucket_id match — listing
--    via storage.objects SELECT is what we want to lock down for anon role.
--    Drop overly broad public SELECT and replace with one that does not
--    enable directory listing for anonymous users.
DROP POLICY IF EXISTS "Candidate photos are publicly readable" ON storage.objects;

-- Authenticated users (admins/reviewers) can see all objects in the bucket.
CREATE POLICY "Reviewers list candidate photos"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'candidate-photos'
    AND (public.has_role(auth.uid(), 'reviewer') OR public.has_role(auth.uid(), 'admin'))
  );

-- Public bucket files remain accessible via the public CDN URL
-- (storage.objects SELECT for anon is intentionally NOT granted to prevent
--  enumeration/listing). Direct file URLs continue to work because the
--  storage public-bucket CDN path bypasses this policy for public buckets.