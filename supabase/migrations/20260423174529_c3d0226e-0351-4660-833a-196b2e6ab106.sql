-- Enable RLS on realtime.messages and restrict channel subscriptions for
-- sensitive table topics to reviewers/admins. The Supabase Realtime client
-- uses the table name as the channel topic via postgres_changes.
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Reviewers subscribe to sensitive tables" ON realtime.messages;
CREATE POLICY "Reviewers subscribe to sensitive tables"
  ON realtime.messages
  FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'reviewer')
    OR public.has_role(auth.uid(), 'admin')
  );