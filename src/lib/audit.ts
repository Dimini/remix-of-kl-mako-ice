import { db, type AuditLogRecord } from "@/lib/db/dexie";

// ---------------------------------------------------------------------------
// Audit helper — single entry point so every approval / state change
// produces a consistent log entry.
// ---------------------------------------------------------------------------

export async function logAudit(
  entry: Omit<AuditLogRecord, "id" | "at"> & { at?: string },
) {
  const at = entry.at ?? new Date().toISOString();
  const id = `${entry.candidateId}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  await db.auditLog.put({ ...entry, id, at });
}

export async function listAuditFor(candidateId: string) {
  return db.auditLog.where("candidateId").equals(candidateId).reverse().sortBy("at");
}
