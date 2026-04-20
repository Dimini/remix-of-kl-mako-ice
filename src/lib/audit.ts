import { supabase } from "@/integrations/supabase/client";
import type { AuditLogRecord } from "@/lib/repository/types";

// Single entry point for audit log writes (review_audit_log table).
// Reviewer + reviewer_user_id come from the active session; callers may
// override `reviewer` (e.g. candidate questionnaire submissions where
// there is no logged-in reviewer).
export async function logAudit(
  entry: Omit<AuditLogRecord, "id" | "at"> & { at?: string },
): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  const reviewer = entry.reviewer || session?.user?.email || "system";
  const reviewerUserId = session?.user?.id ?? null;
  const { error } = await supabase.from("review_audit_log").insert({
    candidate_id: entry.candidateId,
    reviewer,
    reviewer_user_id: reviewerUserId,
    action: entry.action,
    from_state: entry.fromState ?? null,
    to_state: entry.toState ?? null,
    note: entry.note ?? null,
    adjustments: entry.adjustments ?? null,
    at: entry.at ?? new Date().toISOString(),
  });
  if (error) throw error;
}

export async function listAuditFor(candidateId: string): Promise<AuditLogRecord[]> {
  const { data, error } = await supabase
    .from("review_audit_log")
    .select("*")
    .eq("candidate_id", candidateId)
    .order("at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    candidateId: r.candidate_id,
    at: r.at,
    reviewer: r.reviewer,
    action: r.action,
    fromState: r.from_state ?? undefined,
    toState: r.to_state ?? undefined,
    note: r.note ?? undefined,
    adjustments: (r.adjustments as Record<string, number | null> | null) ?? undefined,
  }));
}
