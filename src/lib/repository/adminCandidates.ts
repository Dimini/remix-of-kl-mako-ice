import { db, type CandidateRecord, type EvidenceRecord } from "@/lib/db/dexie";
import type { Candidate, KrajId, Position } from "@/types/domain";

// ---------------------------------------------------------------------------
// Admin-side repository: writes go to Dexie (IndexedDB).
// Public UI continues to read from `candidatesRepo` (mock) until Phase B
// switches it to read from Dexie too.
//
// Backend swap point: replace these methods with Supabase calls. Method
// signatures match the future server-side API.
// ---------------------------------------------------------------------------

export interface AdminCandidatesRepository {
  list(): Promise<CandidateRecord[]>;
  getById(id: string): Promise<CandidateRecord | null>;
  upsert(candidate: CandidateRecord): Promise<void>;
  remove(id: string): Promise<void>;
  countAll(): Promise<number>;
  countApproved(): Promise<number>;
}

export interface AdminEvidenceRepository {
  listByCandidate(candidateId: string): Promise<EvidenceRecord[]>;
  upsert(evidence: EvidenceRecord): Promise<void>;
  remove(id: string): Promise<void>;
}

class DexieCandidatesRepo implements AdminCandidatesRepository {
  list() {
    return db.candidates.toArray();
  }
  async getById(id: string) {
    return (await db.candidates.get(id)) ?? null;
  }
  async upsert(candidate: CandidateRecord) {
    await db.candidates.put(candidate);
  }
  async remove(id: string) {
    await db.candidates.delete(id);
    await db.evidence.where("candidateId").equals(id).delete();
  }
  countAll() {
    return db.candidates.count();
  }
  countApproved() {
    return db.candidates.filter((c) => c.isApproved).count();
  }
}

class DexieEvidenceRepo implements AdminEvidenceRepository {
  listByCandidate(candidateId: string) {
    return db.evidence.where("candidateId").equals(candidateId).toArray();
  }
  async upsert(evidence: EvidenceRecord) {
    await db.evidence.put(evidence);
  }
  async remove(id: string) {
    await db.evidence.delete(id);
  }
}

export const adminCandidatesRepo: AdminCandidatesRepository = new DexieCandidatesRepo();
export const adminEvidenceRepo: AdminEvidenceRepository = new DexieEvidenceRepo();

// Convenience: quick conversion from the legacy Candidate type to the stored record.
export function toCandidateRecord(c: Candidate): CandidateRecord {
  const now = new Date().toISOString();
  const { citations: _drop, ...rest } = c;
  return { ...rest, createdAt: now, updatedAt: now };
}

export type { Candidate, KrajId, Position };
