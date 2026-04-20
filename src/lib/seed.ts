import { supabase } from "@/integrations/supabase/client";
import { MOCK_CANDIDATES } from "@/lib/mockCandidates";
import { candidateToRow } from "@/lib/repository/_adapters";

// Seed candidates only (no scores/evidence) into Supabase for testing.
// DB candidate ids are UUIDs, so we let Postgres generate them and
// match existing rows by (name, position, region) instead of mock id.
export async function seedFromMock(): Promise<{ inserted: number; skipped: number }> {
  let inserted = 0;
  let skipped = 0;
  const { data: existing, error: exErr } = await supabase
    .from("candidates")
    .select("name, position, region");
  if (exErr) throw exErr;
  const key = (n: string, p: string, r: string) => `${n}|${p}|${r}`;
  const have = new Set((existing ?? []).map((r) => key(r.name, r.position, r.region)));

  for (const c of MOCK_CANDIDATES) {
    if (have.has(key(c.name, c.position, c.krajId))) {
      skipped++;
      continue;
    }
    const { id: _drop, ...rest } = c;
    const row = candidateToRow({
      ...rest,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Parameters<typeof candidateToRow>[0]);
    // Omit id so the DB default (gen_random_uuid) takes over.
    const { id: _omit, ...insertRow } = row;
    const { error } = await supabase.from("candidates").insert({
      name: c.name,
      party: c.party,
      position: c.position,
      region: c.krajId,
      ...insertRow,
    });
    if (error) throw error;
    inserted++;
  }
  return { inserted, skipped };
}

// Admin-only nuke. The candidates FK cascades, so evidence rows go with them.
export async function clearAllAdminData(): Promise<void> {
  const { error } = await supabase.from("candidates").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (error) throw error;
}
