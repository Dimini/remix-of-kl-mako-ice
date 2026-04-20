
-- Public bucket for candidate portrait photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('candidate-photos', 'candidate-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Public read
CREATE POLICY "Candidate photos are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'candidate-photos');

-- Reviewer/admin upload
CREATE POLICY "Reviewers upload candidate photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'candidate-photos'
  AND (public.has_role(auth.uid(), 'reviewer') OR public.has_role(auth.uid(), 'admin'))
);

CREATE POLICY "Reviewers update candidate photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'candidate-photos'
  AND (public.has_role(auth.uid(), 'reviewer') OR public.has_role(auth.uid(), 'admin'))
);

CREATE POLICY "Reviewers delete candidate photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'candidate-photos'
  AND (public.has_role(auth.uid(), 'reviewer') OR public.has_role(auth.uid(), 'admin'))
);
