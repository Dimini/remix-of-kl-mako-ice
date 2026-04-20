
ALTER PUBLICATION supabase_realtime ADD TABLE public.programs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.scores;
ALTER PUBLICATION supabase_realtime ADD TABLE public.source_citations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.documented_actions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.votes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.candidates;
ALTER PUBLICATION supabase_realtime ADD TABLE public.questionnaire_responses;

ALTER TABLE public.programs REPLICA IDENTITY FULL;
ALTER TABLE public.scores REPLICA IDENTITY FULL;
ALTER TABLE public.source_citations REPLICA IDENTITY FULL;
ALTER TABLE public.documented_actions REPLICA IDENTITY FULL;
ALTER TABLE public.votes REPLICA IDENTITY FULL;
ALTER TABLE public.candidates REPLICA IDENTITY FULL;
ALTER TABLE public.questionnaire_responses REPLICA IDENTITY FULL;
