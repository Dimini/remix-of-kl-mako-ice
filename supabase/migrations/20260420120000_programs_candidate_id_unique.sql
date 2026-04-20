-- CAP-02 requires upsert-by-candidate (one analysis row per candidate, replaced on re-run).
-- The programs table currently has candidate_id as FK only; add UNIQUE to enable upsert conflict target.
ALTER TABLE public.programs
  ADD CONSTRAINT programs_candidate_id_unique UNIQUE (candidate_id);
