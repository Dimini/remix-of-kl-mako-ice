

## What Claude asked vs what's actually needed in Lovable

Claude's instructions assume a local Supabase CLI workflow (`supabase db push`, `supabase functions deploy`). **That doesn't apply here** — Lovable's pipeline auto-applies migrations and auto-deploys edge functions on every commit. So:

| Claude's step | Lovable equivalent | Status |
|---|---|---|
| `supabase db push` for 3 migrations | Auto-applied on commit | Already done when the branch was merged |
| `supabase functions deploy analyze-questionnaire` | Auto-deployed on commit | Blocked by the `pdf-parse` typecheck error |
| Set `app.supabase_functions_url` + `app.service_role_key` in Postgres | Needed for the pg_net trigger in `20260420180002_questionnaire_submit_trigger.sql` | **Manual SQL — needs your approval** |

## Plan

### Step 1 — Unblock the build (the only reason `analyze-questionnaire` isn't live yet)

Create `supabase/functions/deno.json`:
```json
{ "nodeModulesDir": "auto" }
```
This resolves `npm:pdf-parse@1.1.1` so the typecheck passes for **all** functions (the typechecker walks them in one pass and bails at the first unresolved npm import — that's why the error message lists `analyze-questionnaire` even though the import isn't there).

Once this lands, `analyze-questionnaire` deploys automatically.

### Step 2 — Configure the pg_net trigger settings (Claude's third step)

The migration `20260420180002_questionnaire_submit_trigger.sql` fires `analyze-questionnaire` automatically when a response is submitted. It reads two Postgres GUCs that don't exist yet:
- `app.supabase_functions_url` → `https://goitfsbsmrfhzhhqttzx.supabase.co/functions/v1`
- `app.service_role_key` → value of `SUPABASE_SERVICE_ROLE_KEY` secret

A migration will set these at the database level via `ALTER DATABASE postgres SET ...`.

**Wait — `ALTER DATABASE postgres` is explicitly forbidden by Lovable's migration rules.** So I'll use the per-role/per-session alternative: store them in the `scoring_config` table (already exists, already RLS-protected) and have the trigger read from there. That requires a small edit to the trigger function in a follow-up migration.

Concretely, one new migration that:
1. Inserts two rows into `scoring_config`: `pgnet_functions_url` and `pgnet_service_role_key`.
2. Replaces the trigger function from `20260420180002` to read these values via `SELECT value FROM scoring_config WHERE key = ...` instead of `current_setting('app.xxx')`.
3. Tightens RLS on `scoring_config` so `pgnet_service_role_key` is admin-only readable (currently the table is public-readable — service role key must NOT leak). Easiest: split into a row-level filter or move the key to a separate admin-only table. I'll use a new tiny `secure_config` table (admin-only RLS, no public SELECT) for the service role key, keep the URL in `scoring_config`.

### Step 3 — Verify end-to-end

After deploy:
1. Open `/dotaznik/61ed763c-27d8-4bec-8316-234416c2c83d` incognito → form loads (RLS policy from `20260420180000`), draft auto-saves, final submit succeeds.
2. Confirm in Postgres logs that the pg_net trigger fires and `analyze-questionnaire` is invoked with a 200.
3. In admin, the candidate's `analysis_json` populates and citations appear in SLOVÁ with Prospešné/Škodlivé badges.
4. The manual "Analyzovať dotazník" button in `AIToolsPanel` works as a fallback.

If the pg_net trigger turns out to be flaky (it often is — pg_net is async, no retry, easy to silently lose), I'll recommend disabling the trigger and relying on the manual admin button only. We'll know after step 3.

## Files touched

- `supabase/functions/deno.json` (new — Step 1, 3 lines)
- `supabase/migrations/<timestamp>_pgnet_trigger_config.sql` (new — Step 2: secure_config table + scoring_config rows + replaced trigger function)

No edge function code changes. No frontend changes. Claude's branch already has those.

## Open question I'll need answered before Step 2

Do you want the **automatic pg_net trigger** at all? It's the riskier path. The simpler alternative is: skip Step 2 entirely, drop the trigger in a small migration, and let admins click "Analyzovať dotazník" manually after each submission (consistent with how `analyze-program` works). I'd lean toward this — same pattern, debuggable, no hidden failures, no service-role-key-in-database concerns. Tell me which you prefer and I'll proceed.

