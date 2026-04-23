import { createClient } from "@supabase/supabase-js";
import { QUESTIONNAIRE_MAX_SCORE, QUESTIONNAIRE_MIN_SCORE } from "../lib/scoring/questionnaireCaps";

// Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to be set in environment.
declare const process: { env: Record<string, string | undefined>; exit: (code: number) => never };

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function sync() {
  console.log(`Syncing caps to Supabase...`);
  console.log(`QUESTIONNAIRE_MIN_SCORE: ${QUESTIONNAIRE_MIN_SCORE}`);
  console.log(`QUESTIONNAIRE_MAX_SCORE: ${QUESTIONNAIRE_MAX_SCORE}`);

  const { error: errMin } = await supabase.from("scoring_config").upsert({
    key: "cap_questionnaire_min",
    value: QUESTIONNAIRE_MIN_SCORE.toString(),
    description: "Derived minimum score from questionnaire definitions",
  }, { onConflict: "key" });

  if (errMin) {
    console.error("Failed to sync min cap", errMin);
    return;
  }

  const { error: errMax } = await supabase.from("scoring_config").upsert({
    key: "cap_questionnaire_max",
    value: QUESTIONNAIRE_MAX_SCORE.toString(),
    description: "Derived maximum score from questionnaire definitions",
  }, { onConflict: "key" });

  if (errMax) {
    console.error("Failed to sync max cap", errMax);
    return;
  }

  console.log("Successfully synced questionnaire caps to scoring_config.");
}

sync().catch(console.error);
