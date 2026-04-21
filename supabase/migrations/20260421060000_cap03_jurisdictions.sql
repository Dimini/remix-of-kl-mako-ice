-- CAP-03: jurisdictions table
-- Stores council metadata and base URL for the voting record parser agent.

CREATE TABLE public.jurisdictions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  kraj_id    public.kraj_id,
  city       TEXT,
  type       TEXT NOT NULL CHECK (type IN ('VUC', 'city', 'mestska_cast')),
  base_url   TEXT,
  is_active  BOOLEAN NOT NULL DEFAULT true,
  notes      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.jurisdictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_full_jurisdictions" ON public.jurisdictions
  FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'reviewer')
  );

CREATE POLICY "anon_read_active_jurisdictions" ON public.jurisdictions
  FOR SELECT
  TO anon
  USING (is_active = true);

-- Seed the KVP pilot jurisdiction.
INSERT INTO public.jurisdictions (name, city, kraj_id, type, base_url)
VALUES (
  'Miestne zastupiteľstvo Košice – Košická Nová Ves a Pereš (KVP)',
  'Košice',
  'KE',
  'mestska_cast',
  'https://www.mckvp.sk/mestska-cast/samosprava/mistne-zastupitelstvo-2022---2026'
);
