import type { CandidateState } from "@/types/domain";

// Linear progression with one allowed regression: NEEDS_REVISION → ANALYZED.
// CLAUDE.md: "Never skip states. Never go backward except NEEDS_REVISION → ANALYZED."
// Exception: PUBLISHED → NEEDS_REVISION is allowed as an explicit unpublish action
// (requires a mandatory reason and demotes the live scores row).
const FORWARD: Record<CandidateState, CandidateState | null> = {
  REGISTERED: "DATA_COLLECTION",
  DATA_COLLECTION: "ANALYZED",
  ANALYZED: "IN_REVIEW",
  IN_REVIEW: "APPROVED",
  NEEDS_REVISION: "ANALYZED",
  APPROVED: "PUBLISHED",
  PUBLISHED: null,
};

export const STATE_ORDER: CandidateState[] = [
  "REGISTERED",
  "DATA_COLLECTION",
  "ANALYZED",
  "IN_REVIEW",
  "NEEDS_REVISION",
  "APPROVED",
  "PUBLISHED",
];

export const STATE_LABELS: Record<CandidateState, string> = {
  REGISTERED: "Registrovaný",
  DATA_COLLECTION: "Zber dát",
  ANALYZED: "Analyzované",
  IN_REVIEW: "V kontrole",
  NEEDS_REVISION: "Vyžaduje úpravy",
  APPROVED: "Schválené",
  PUBLISHED: "Publikované",
};

export interface StateTransition {
  to: CandidateState;
  label: string;
  variant?: "default" | "secondary" | "destructive" | "outline";
}

export function nextStates(current: CandidateState): StateTransition[] {
  const transitions: StateTransition[] = [];
  const fwd = FORWARD[current];
  if (fwd) {
    transitions.push({ to: fwd, label: `→ ${STATE_LABELS[fwd]}` });
  }
  // From IN_REVIEW the reviewer can also send back for revision.
  if (current === "IN_REVIEW") {
    transitions.push({
      to: "NEEDS_REVISION",
      label: "Vrátiť na úpravy",
      variant: "outline",
    });
  }
  // From PUBLISHED: unpublish is the only allowed action. Requires a mandatory
  // reason and demotes the live scores row (handled in AdminCandidateDetail).
  if (current === "PUBLISHED") {
    transitions.push({
      to: "NEEDS_REVISION",
      label: "Zrušiť publikovanie",
      variant: "destructive",
    });
  }
  return transitions;
}

// Approval guard — APPROVED requires the isApproved flag.
export function canTransition(
  from: CandidateState,
  to: CandidateState,
): { ok: boolean; reason?: string } {
  const allowed = nextStates(from).map((t) => t.to);
  if (!allowed.includes(to)) {
    return { ok: false, reason: `Nepovolený prechod ${from} → ${to}` };
  }
  return { ok: true };
}

export interface StateLogEntry {
  at: string;
  from: CandidateState;
  to: CandidateState;
}
