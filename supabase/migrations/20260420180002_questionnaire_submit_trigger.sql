-- CAP-02: fire-and-forget pg_net trigger that calls the analyze-questionnaire
-- Edge Function whenever a questionnaire response transitions to 'submitted'.
-- Requires Lovable to set these Postgres settings after deploying:
--   ALTER DATABASE postgres SET app.supabase_functions_url = 'https://<ref>.supabase.co/functions/v1';
--   ALTER DATABASE postgres SET app.service_role_key = '<service-role-key>';

CREATE OR REPLACE FUNCTION public.notify_questionnaire_submitted()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status = 'submitted' AND (OLD.status IS DISTINCT FROM 'submitted') THEN
    PERFORM net.http_post(
      url     := current_setting('app.supabase_functions_url') || '/analyze-questionnaire',
      headers := jsonb_build_object(
                   'Content-Type',  'application/json',
                   'Authorization', 'Bearer ' || current_setting('app.service_role_key')
                 ),
      body    := jsonb_build_object('candidate_id', NEW.candidate_id::text)
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_questionnaire_submitted
  AFTER INSERT OR UPDATE OF status ON public.questionnaire_responses
  FOR EACH ROW EXECUTE FUNCTION public.notify_questionnaire_submitted();
