ALTER TABLE public.questionnaire_responses
  ADD CONSTRAINT questionnaire_responses_candidate_id_key UNIQUE (candidate_id);