DROP TRIGGER IF EXISTS trg_questionnaire_submitted ON public.questionnaire_responses;
DROP FUNCTION IF EXISTS public.notify_questionnaire_submitted();