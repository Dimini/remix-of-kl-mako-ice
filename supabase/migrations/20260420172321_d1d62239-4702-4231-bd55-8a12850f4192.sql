-- Demote all approved scores for Gandalf, then approve the latest (highest version_number).
UPDATE public.scores
   SET is_approved = false
 WHERE candidate_id = '772599c5-5695-481d-9923-97a5fba07c73';

UPDATE public.scores
   SET is_approved = true,
       approved_at = COALESCE(approved_at, now())
 WHERE id = (
   SELECT id FROM public.scores
    WHERE candidate_id = '772599c5-5695-481d-9923-97a5fba07c73'
    ORDER BY version_number DESC
    LIMIT 1
 );