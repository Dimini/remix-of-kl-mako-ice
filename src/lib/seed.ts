import { db, generateUuid } from "@/lib/db/dexie";
import { MOCK_CANDIDATES } from "@/lib/mockCandidates";
import { toCandidateRecord } from "@/lib/repository/adminCandidates";

// Copies the public-site mock fixture into the local Dexie store so the
// admin UI has realistic data to edit. Does NOT mutate MOCK_CANDIDATES.
// The public site keeps reading from the in-memory fixture until the
// repository swap in a later phase.
export async function seedFromMock(): Promise<{ inserted: number; skipped: number }> {
  let inserted = 0;
  let skipped = 0;
  for (const c of MOCK_CANDIDATES) {
    const existing = await db.candidates.get(c.id);
    if (existing) {
      skipped++;
      continue;
    }
    const record = toCandidateRecord(c);
    record.questionnaireUuid = generateUuid();
    await db.candidates.put(record);
    inserted++;
  }
  return { inserted, skipped };
}

export async function clearAllAdminData(): Promise<void> {
  await db.candidates.clear();
  await db.evidence.clear();
  await db.auditLog.clear();
  await db.questionnaireResponses.clear();
}
