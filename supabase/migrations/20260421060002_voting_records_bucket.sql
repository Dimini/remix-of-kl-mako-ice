-- CAP-03: Storage bucket for manually uploaded voting record PDFs.
-- Reviewers upload Hlasovanie / Uznesenia PDFs that are blocked from direct fetch.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('voting-records', 'voting-records', false, 20971520, ARRAY['application/pdf'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "reviewer_upload_voting_records"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'voting-records'
    AND (public.has_role(auth.uid(), 'reviewer') OR public.has_role(auth.uid(), 'admin'))
  );

CREATE POLICY "reviewer_read_voting_records"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'voting-records'
    AND (public.has_role(auth.uid(), 'reviewer') OR public.has_role(auth.uid(), 'admin'))
  );
