// CAP-07: score-candidate
// Reads all evidence for a candidate, computes the locked v1.0 climate score,
// and inserts a new unapproved row into `scores`. Does not approve — human
// reviewer must approve via CAP-06 before the score becomes public.

import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { verifyReviewerOrAdmin } from "../_shared/auth.ts";
import { createServiceClient } from "../_shared/db.ts";
import {
  buildScoreBreakdown,
  loadScoringConfig,
} from "../_shared/scoring.ts";

Deno.serve(async (req) => {
  const corsResp = handleCors(req);
  if (corsResp) return corsResp;

  try {
    // 1. Auth: verify reviewer or admin before any DB access.
    const callerId = await verifyReviewerOrAdmin(req);

    // 2. Parse body.
    const body = await req.json().catch(() => null);
    const candidate_id: string | undefined = body?.candidate_id;
    if (!candidate_id || typeof candidate_id !== "string") {
      return json({ error: "candidate_id required" }, 400);
    }

    const svc = createServiceClient();

    // 3. Load scoring config from DB.
    const cfg = await loadScoringConfig(svc);

    // 4. Fetch candidate meta.
    const { data: candidate, error: cErr } = await svc
      .from("candidates")
      .select("id, incumbent, questionnaire_responded")
      .eq("id", candidate_id)
      .maybeSingle();
    if (cErr) throw cErr;
    if (!candidate) return json({ error: "Candidate not found" }, 404);

    // 5. Fetch all evidence in parallel.
    // Votes and actions are pre-filtered to exclude tier 3.
    const [pRes, qRes, vRes, aRes] = await Promise.all([
      svc
        .from("programs")
        .select("normalized_score, confidence")
        .eq("candidate_id", candidate_id),
      svc
        .from("questionnaire_responses")
        .select("questionnaire_score")
        .eq("candidate_id", candidate_id)
        .eq("status", "submitted")
        .order("responded_at", { ascending: false })
        .limit(1),
      svc
        .from("votes")
        .select("points, confidence, climate_relevance_tier")
        .eq("candidate_id", candidate_id)
        .neq("climate_relevance_tier", 3),
      svc
        .from("documented_actions")
        .select("points, climate_relevance_tier")
        .eq("candidate_id", candidate_id)
        .neq("climate_relevance_tier", 3),
    ]);
    if (pRes.error) throw pRes.error;
    if (qRes.error) throw qRes.error;
    if (vRes.error) throw vRes.error;
    if (aRes.error) throw aRes.error;

    // 6. Compute score.
    const breakdown = buildScoreBreakdown(
      pRes.data ?? [],
      qRes.data ?? [],
      vRes.data ?? [],
      aRes.data ?? [],
      {
        isNewCandidate: !candidate.incumbent,
        questionnaireResponded: candidate.questionnaire_responded,
      },
      cfg,
    );

    // 7. Determine next version_number.
    const { data: latestVer, error: verErr } = await svc
      .from("scores")
      .select("version_number")
      .eq("candidate_id", candidate_id)
      .order("version_number", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (verErr) throw verErr;
    const nextVersion = (latestVer?.version_number ?? 0) + 1;

    // 8. Insert new score row (is_approved = false — human must approve in CAP-06).
    const { data: inserted, error: iErr } = await svc
      .from("scores")
      .insert({
        candidate_id,
        version_number: nextVersion,
        pillar1_score: breakdown.slova,
        pillar2_score: breakdown.skutky,
        total_score: breakdown.total,
        badge: breakdown.badge,
        badge_subtype: breakdown.badgeSubtype ?? null,
        formula_version: breakdown.formulaVersion,
        is_approved: false,
      })
      .select("id, version_number")
      .single();
    if (iErr) {
      // Unique constraint violation = version race; caller should retry.
      if (iErr.code === "23505") return json({ error: "Version conflict, retry" }, 409);
      throw iErr;
    }

    // 9. Write audit log.
    await svc.from("review_audit_log").insert({
      candidate_id,
      reviewer: "system:score-candidate",
      reviewer_user_id: callerId,
      action: "SCORE_SAVED",
      note: `v${nextVersion} computed by score-candidate edge function`,
    });

    return json({ ok: true, scoreId: inserted.id, version: nextVersion, breakdown });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[score-candidate]", err);
    return json({ error: "Internal server error" }, 500);
  }
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
