

## Goal
Write the **initial Supabase migration** as the first real backend artifact for Klima Kompas, using **REQUIREMENTS.md + CLAUDE.md as the schema source of truth**. Apply it, regenerate `src/integrations/supabase/types.ts`, run the linter, and report the next step.

## Inconsistencies Found (must resolve before/while migrating)

I cross-checked REQUIREMENTS.md, CLAUDE.md, `src/types/domain.ts`, `src/lib/db/dexie.ts`, and `supabase/seed-skeleton.sql`. Findings:

| # | Topic | REQUIREMENTS.md / CLAUDE.md | Dexie / domain.ts | Recommendation |
|---|---|---|---|---|
| 1 | **Pillar source tables** | Separate: `programs`, `votes`, `documented_actions`, `questionnaire_responses` + a *parallel* `source_citations` table for citations | Single unified `evidence` table covering all pillars | **Follow REQUIREMENTS.** Create separate domain tables (programs/votes/documented_actions) AND a `source_citations` table. The Dexie unified model was a local-first shortcut — repository layer will adapt. |
| 2 | **`source_type` enum values** | `council_vote \| resolution \| initiative \| program \| questionnaire \| social_post \| manual_entry` | `program \| questionnaire \| social \| vote \| action` | **Follow REQUIREMENTS** in DB. Update `domain.ts` later (Lovable-owned) so the public types match the canonical enum. |
| 3 | **Position enum** | "Predseda kraju (župan)" + "Primátor" — no string literal locked | `"zupan" \| "primator"` | **Adopt `zupan \| primator`** in DB enum (consistent with existing UI/routes like `/region/:krajId`). Document in CLAUDE.md. |
| 4 | **Region enum** | 8 krajov, codes BA/TT/TN/NR/ZA/BB/PO/KE | Same | ✅ Aligned. |
| 5 | **`scoring_config.value` type** | Stored as text-ish keys (`'-35.30'`, `'1.0'`) | Skeleton uses JSONB-quoted | **Use `value JSONB`** (skeleton already does) — supports numbers + strings cleanly. |
| 6 | **`questionnaire_responses` shape** | `link_uuid`, `response_json`, `questionnaire_score`, `status`, `sent_at`, `responded_at` | `scaleAnswers`, `priorityActions`, `consentPublish`, `consentTruthful`, `rawScore` (flat) | **Follow REQUIREMENTS:** flat columns for routing fields, bundle the candidate-supplied content into `response_json JSONB`. |
| 7 | **`computed_points` GENERATED column** | REQUIREMENTS calls for it on documented_actions/votes | Not present | Defer — Postgres `GENERATED ALWAYS AS … STORED` requires a deterministic expression but the formula needs a lookup table. Use a **trigger** instead. Note in migration. |
| 8 | **Audit log table name** | CLAUDE.md doesn't name one; skeleton uses `review_audit_log` | Dexie `auditLog` | **Use `review_audit_log`** (matches skeleton + `docs/SUPABASE_IMPORT.md`). |
| 9 | **Tier 2 enforcement** | "Form cannot submit without `reviewer_note`" + DB CHECK suggested | Frontend-only in Dexie | **Add CHECK constraint** in DB on every evidence-bearing table. |

**My recommendation on the bigger conflict (#1, #2):**
- **Keep REQUIREMENTS.md as source of truth** — it's the contract Claude Code will build to.
- **Update `src/types/domain.ts` and the Dexie types** in a follow-up Lovable task to match the canonical enums (so UI keeps compiling against Supabase types). I'll flag this clearly when reporting "next step" — won't do it in this turn to keep the migration atomic.

## Migration Plan — `001_initial_schema.sql`

**Tables (in dependency order):**
1. **Enums:** `app_role`, `kraj_id`, `position_type`, `candidate_state`, `badge_color`, `grey_subtype`, `pillar`, `source_type`, `evidence_type`, `direction`, `vote_direction`, `audit_action`, `questionnaire_status`.
2. **`user_roles`** + **`has_role(user_id, role)`** SECURITY DEFINER function (per system prompt, prevents RLS recursion). Used by reviewer policies.
3. **`scoring_config`** (key TEXT PK, value JSONB, description). Seeded in step 9.
4. **`candidates`** (id, name, photo_url, position, region, city, party, is_independent, incumbent, year, state, questionnaire_responded, is_approved, questionnaire_uuid UNIQUE, timestamps).
5. **`scores`** (one row per candidate per version_number; pillar1_score/pillar2_score/total_score; badge + badge_subtype; formula_version; is_approved/approved_at/approved_by; UNIQUE on (candidate_id, version_number)).
6. **`programs`** (program-pillar agent output: source_url, raw_text, raw_score, normalized_score, citations_json, agent_version, confidence, processed_at).
7. **`questionnaire_responses`** (candidate_id FK, link_uuid UNIQUE, sent_at, responded_at, status, candidate_name, email, response_json JSONB, questionnaire_score).
8. **`votes`** (candidate_id, date, meeting_id, topic, vote_direction, points, source_url, climate_relevance_tier, reviewer_note, confidence, entered_by, is_ai_generated, requires_second_reviewer).
9. **`documented_actions`** (candidate_id, action_type evidence_type, date, description, points, source_url, citation_text, climate_relevance_tier, reviewer_note, entered_by, is_ai_generated, requires_second_reviewer).
10. **`source_citations`** (the canonical evidence audit table per REQUIREMENTS §EVIDENCE SCHEMA — pillar, source_type, url NOT NULL, citation_text ≤280 CHECK, date_accessed, confidence, climate_relevance_tier, reviewer_note).
11. **`review_audit_log`** (candidate_id, at, reviewer, action, from_state, to_state, note, adjustments JSONB).

**Constraints applied:**
- Tier 2 CHECK on `votes`, `documented_actions`, `source_citations`: `tier <> 2 OR (reviewer_note IS NOT NULL AND length(trim(reviewer_note)) > 0)`.
- `citation_text` length ≤ 280.
- `confidence` BETWEEN 0 and 1.
- Foreign keys all ON DELETE CASCADE from `candidates`.

**Triggers:**
- `set_updated_at()` BEFORE UPDATE on every table that has `updated_at`.

**RLS policies (per `docs/SUPABASE_IMPORT.md` §3):**
- `candidates`: public SELECT when `state = 'PUBLISHED' AND is_approved = true`; reviewers (`has_role('reviewer')`) full access.
- `scores`: public SELECT when `is_approved = true`; reviewers full access.
- `source_citations`, `programs`, `questionnaire_responses`, `votes`, `documented_actions`: public SELECT joined to a published+approved candidate; reviewers full access. Questionnaire additionally requires `consent_publish = true` inside `response_json`.
- `review_audit_log`: reviewers only, never public.
- `scoring_config`: public SELECT.
- `user_roles`: only the user themselves SELECT their own row; reviewers can read all.

**Seed `scoring_config`** with all v1.0 constants from REQUIREMENTS §CAP-07 (program min/max, questionnaire max, actions min/max, badge thresholds, weights, formula_version).

## Steps I will execute (after approval)

1. Write `supabase/migrations/<ts>_initial_schema.sql` containing everything above. Run it via the migration tool.
2. Run **`supabase--linter`** + **`security--run_security_scan`** and fix any findings (typically: enable RLS on every table even if not needed, set `search_path` on functions).
3. Auto-regenerate `src/integrations/supabase/types.ts` (happens automatically after migration apply).
4. Verify by running `SELECT count(*) FROM scoring_config` via `supabase--read_query` — should return 16+ rows.
5. Report next step: **swap `src/lib/repository/{candidates,adminCandidates,questionnaire}.ts` from Dexie to Supabase** (Claude Code's territory per CLAUDE.md), and **align `src/types/domain.ts` enums to the DB** (Lovable's territory). Plus: implement auth so reviewers can actually authenticate and `has_role()` resolves.

## Out of scope for this turn
- No data import from the JSON export (separate one-shot script).
- No repository swap — that's the explicit next step Claude Code will pick up.
- No Edge Functions (CAP-07 scoring webhook) — Antigravity territory.
- No auth UI — flag as a blocker for write operations.

