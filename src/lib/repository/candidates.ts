import type { Candidate, KrajId, Position } from "@/types/domain";
import { MOCK_CANDIDATES } from "@/lib/mockCandidates";

// ---------------------------------------------------------------------------
// Repository abstraction for candidates.
// UI components MUST go through this layer — never import mock data directly.
// Backend (Supabase) implementation will swap in here later without UI changes.
// ---------------------------------------------------------------------------

export interface CandidatesRepository {
  list(): Promise<Candidate[]>;
  getByKraj(krajId: KrajId): Promise<Candidate[]>;
  getByKrajAndPosition(krajId: KrajId, position: Position): Promise<Candidate[]>;
  getById(id: string): Promise<Candidate | null>;
}

class MockCandidatesRepository implements CandidatesRepository {
  async list(): Promise<Candidate[]> {
    return MOCK_CANDIDATES.filter((c) => c.isApproved || c.score.badge === "grey");
  }
  async getByKraj(krajId: KrajId): Promise<Candidate[]> {
    return (await this.list()).filter((c) => c.krajId === krajId);
  }
  async getByKrajAndPosition(krajId: KrajId, position: Position): Promise<Candidate[]> {
    return (await this.list()).filter(
      (c) => c.krajId === krajId && c.position === position,
    );
  }
  async getById(id: string): Promise<Candidate | null> {
    return MOCK_CANDIDATES.find((c) => c.id === id) ?? null;
  }
}

// Single export — swap implementation here when Supabase repo is ready.
export const candidatesRepo: CandidatesRepository = new MockCandidatesRepository();
