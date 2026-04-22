import { supabase } from "@/integrations/supabase/client";
import { KE_PRIMATOR_SAMPLE_CANDIDATES } from "@/lib/mockCandidates";

// Seed the 13 KE primátor sample candidates into Supabase.
// Inserts candidates, programs, questionnaire_responses, documented_actions, and scores.
// Deduplicates by (name, position, region). Safe to re-run.
export async function seedKosiceCandidates(): Promise<{
  inserted: number;
  skipped: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let inserted = 0;
  let skipped = 0;

  // Load existing KE primátor candidates to deduplicate.
  const { data: existing, error: exErr } = await supabase
    .from("candidates")
    .select("name, id")
    .eq("position", "primator")
    .eq("region", "KE");
  if (exErr) throw exErr;

  const existingByName = new Map<string, string>(
    (existing ?? []).map((r) => [r.name, r.id]),
  );

  for (const c of KE_PRIMATOR_SAMPLE_CANDIDATES) {
    if (existingByName.has(c.name)) {
      skipped++;
      continue;
    }

    try {
      // 1. Insert candidate row.
      const { data: inserted_row, error: candErr } = await supabase
        .from("candidates")
        .insert({
          name: c.name,
          party: c.party,
          position: c.position,
          region: c.krajId,
          city: c.city ?? null,
          year: c.year,
          state: c.state,
          is_independent: c.isIndependent,
          incumbent: c.incumbent ?? false,
          questionnaire_responded: c.questionnaireResponded,
          is_approved: c.isApproved,
        })
        .select("id")
        .single();
      if (candErr) throw candErr;

      const cid = inserted_row.id as string;

      // 2. Upsert program row.
      const { error: progErr } = await supabase
        .from("programs")
        .upsert(
          {
            candidate_id: cid,
            source_url: "https://placeholder.klimakompas.sk/program",
            raw_score: c.score.programNorm,
            normalized_score: c.score.programNorm,
            confidence: 0.8,
            agent_version: "manual-seed-v1",
            processed_at: new Date().toISOString(),
          },
          { onConflict: "candidate_id" },
        );
      if (progErr) throw progErr;

      // 3. Upsert questionnaire_response (only for candidates who responded).
      if (c.score.questionnaireNorm !== null) {
        const { error: qErr } = await supabase
          .from("questionnaire_responses")
          .upsert(
            {
              candidate_id: cid,
              candidate_name: c.name,
              questionnaire_score: c.score.questionnaireNorm,
              status: "submitted",
              responded_at: "2026-04-01T00:00:00Z",
            },
            { onConflict: "candidate_id" },
          );
        if (qErr) throw qErr;
      }

      // 4. Insert one documented_action stub (points = actionsNorm placeholder).
      const { error: actErr } = await supabase
        .from("documented_actions")
        .insert({
          candidate_id: cid,
          action_type: "public_statement",
          date: "2026-04-01",
          description: "Placeholder — seed data",
          citation_text: "Placeholder — seed data",
          source_url: "https://placeholder.klimakompas.sk/actions",
          points: c.score.actionsNorm,
          climate_relevance_tier: 1,
          entered_by: "seed",
        });
      if (actErr) throw actErr;

      // 5. Upsert score row.
      const { error: scoreErr } = await supabase
        .from("scores")
        .upsert(
          {
            candidate_id: cid,
            pillar1_score: c.score.slova,
            pillar2_score: c.score.skutky,
            total_score: c.score.total,
            badge: c.score.badge,
            formula_version: c.score.formulaVersion,
            is_approved: false,
            version_number: 1,
          },
          { onConflict: "candidate_id" },
        );
      if (scoreErr) throw scoreErr;

      inserted++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`${c.name}: ${msg}`);
    }
  }

  return { inserted, skipped, errors };
}
