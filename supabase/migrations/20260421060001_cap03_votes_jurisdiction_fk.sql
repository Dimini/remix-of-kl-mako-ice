-- CAP-03: add jurisdiction_id to votes for traceability back to the council.
-- Nullable — existing votes and manual entries do not require a jurisdiction.

ALTER TABLE public.votes
  ADD COLUMN IF NOT EXISTS jurisdiction_id UUID
    REFERENCES public.jurisdictions(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.votes.jurisdiction_id IS
  'Links AI-imported votes to the source council jurisdiction (CAP-03). NULL for manually entered votes.';
