-- Ensure one program row per candidate so analyze-program can upsert on candidate_id
ALTER TABLE public.programs
  ADD CONSTRAINT programs_candidate_id_key UNIQUE (candidate_id);