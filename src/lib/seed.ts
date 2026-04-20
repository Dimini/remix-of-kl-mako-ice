import { supabase } from "@/integrations/supabase/client";
import { MOCK_CANDIDATES } from "@/lib/mockCandidates";
import { candidateToRow } from "@/lib/repository/_adapters";

// Seed candidates only (no scores/evidence) into Supabase for testing.
// Inserts at the candidate's mock state — Grey-data candidates land in
// DATA_COLLECTION; everything else stays as in mock. Skips rows that
// already exist (by id).
export async function seedFromMock(): Promise<{ inserted: number; skipped: number }> {
  let inserted = 0;
  let skipped = 0;
  // Pull existing ids in one query.
  const { data: existing, error: exErr } = await supabase.from("candidates").select("id");
  if (exErr) throw exErr;
  const have = new Set((existing ?? []).map((r) => r.id));

  for (const c of MOCK_CANDIDATES) {
    if (have.has(c.id)) {
      skipped++;
      continue;
    }
    const row = candidateToRow({
      ...c,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    const { error } = await supabase.from("candidates").insert({
      id: c.id,
      name: c.name,
      party: c.party,
      position: c.position,
      region: c.krajId,
      ...row,
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
