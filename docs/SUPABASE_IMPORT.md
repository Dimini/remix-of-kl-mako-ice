# Supabase Migration Handoff (Phase G)

> Audience: **Claude Code** — picks this up when the local-first admin UI has
> enough real data to migrate to Supabase. Owners per CLAUDE.md: this folder
> + `/supabase/` + `/src/lib/` are Antigravity / Claude Code territory.

This document describes how to take the JSON export produced by the Lovable
admin UI and import it into the real Supabase backend.

---

## 1. Inputs

| File | Purpose | Owner |
|---|---|---|
| `klima-kompas-export-YYYY-MM-DD.json` | Full local data dump | Lovable admin UI (`/admin/export`) |
| `src/lib/export/exportSchema.ts` | TypeScript contract for the JSON shape | Lovable |
| `supabase/seed-skeleton.sql` | Reference INSERT statements | Lovable |
| `CLAUDE.md` → "DATABASE — SUPABASE SCHEMA" | Authoritative table list | Shared |

The JSON export is versioned via `schemaVersion` (currently **3**). Bump
required if any field shape changes — the import script must reject
unexpected versions rather than silently truncate.

---

## 2. Migration order

Build the Supabase schema in this order so foreign keys resolve:

1. **`scoring_config`** — formula constants (seeded from
   `seed-skeleton.sql`, not from the JSON).
2. **`candidates`** — base rows. `state`, `position`, `region` are enums.
3. **`scores`** — one row per candidate (`version_number = 1` on first
   import). Flatten `ExportedCandidate.score` into columns.
4. **`source_citations`** — all evidence rows across all pillars. Add the
   `tier2_requires_reviewer_note` CHECK constraint shown in the skeleton.
5. **`questionnaire_responses`** — bundle candidate-supplied fields into
   the `response_json` JSONB column.
6. **`review_audit_log`** — full reviewer history. Preserve `at` ordering;
   it is the source of truth for "who approved what, when".

---

## 3. RLS policies (CLAUDE.md "KEY CONSTRAINTS")

These are **not** in the skeleton — add them in the migration:

| Table | Policy |
|---|---|
| `candidates` | Public `SELECT` only when `state = 'PUBLISHED'` and `is_approved = true`. Authenticated reviewers: full access. |
| `scores` | Public `SELECT` only for the candidate's latest approved version (`is_approved = true`). |
| `source_citations` | Public `SELECT` joined to a published candidate. Tier 3 rows are stored but excluded by the scoring engine, NOT by RLS. |
| `questionnaire_responses` | Public `SELECT` only when the parent candidate is published AND `consent_publish = true`. |
| `review_audit_log` | Authenticated reviewers only. Never public. |
| `scoring_config` | Public `SELECT`. |

Use the user-roles pattern from the system prompt (`has_role()` security
definer function — never check roles in RLS via a recursive subquery on
the same table).

---

## 4. Import script outline

```ts
// scripts/import-from-lovable.ts
import { isExportPayload, EXPORT_SCHEMA_VERSION } from "@/lib/export/exportSchema";
import payload from "./klima-kompas-export-2026-01-15.json";

if (!isExportPayload(payload)) throw new Error("Invalid export payload");
if (payload.schemaVersion !== EXPORT_SCHEMA_VERSION) {
  throw new Error(`Schema mismatch: file=${payload.schemaVersion} expected=${EXPORT_SCHEMA_VERSION}`);
}

// Wrap everything in a single transaction. On any error, roll back.
await supabase.rpc("begin_import_tx");
try {
  await upsertCandidates(payload.candidates);
  await upsertScores(payload.candidates);            // flatten .score
  await upsertCitations(payload.evidence);
  await upsertQuestionnaire(payload.questionnaireResponses);
  await upsertAuditLog(payload.auditLog);
  await supabase.rpc("commit_import_tx");
} catch (err) {
  await supabase.rpc("rollback_import_tx");
  throw err;
}
```

Use service-role key (server-side only) to bypass RLS during import.

---

## 5. Field mapping cheat sheet

| Export field (camelCase) | DB column (snake_case) | Notes |
|---|---|---|
| `krajId` | `region` | Enum: BA/TT/TN/NR/ZA/BB/PO/KE |
| `score.slova` | `pillar1_score` | Renamed for legacy reasons |
| `score.skutky` | `pillar2_score` | |
| `score.total` | `total_score` | |
| `score.badge` | `badge` | |
| `score.badgeSubtype` | `badge_subtype` | NULL unless badge='grey' |
| `evidence.pointValue` | `point_value` | NULL for SLOVÁ rows |
| `audit.adjustments` | `adjustments` | Cast to `jsonb` |
| `questionnaire.uuid` | `link_uuid` | Index for `/dotaznik/:uuid` lookup |
| `questionnaire.submittedAt` | `responded_at` | |
| `questionnaire.rawScore` | `questionnaire_score` | Drives SLOVÁ score |

---

## 6. Post-import verification

Run these checks before flipping the public site over:

```sql
-- 1. Every approved candidate has a score row.
SELECT c.id, c.name FROM candidates c
LEFT JOIN scores s ON s.candidate_id = c.id AND s.is_approved
WHERE c.is_approved AND s.id IS NULL;
-- Expect: 0 rows.

-- 2. No Tier 2 citation is missing reviewer_note.
SELECT id FROM source_citations
WHERE climate_relevance_tier = 2
  AND (reviewer_note IS NULL OR length(trim(reviewer_note)) = 0);
-- Expect: 0 rows.

-- 3. Audit log is non-empty for every APPROVED candidate.
SELECT c.id FROM candidates c
WHERE c.state = 'APPROVED'
  AND NOT EXISTS (SELECT 1 FROM review_audit_log a
                  WHERE a.candidate_id = c.id AND a.action = 'APPROVED');
-- Expect: 0 rows.
```

---

## 7. After Supabase is live

The Lovable repository layer (`src/lib/repository/*`) is the swap point.
Replace the Dexie implementations with Supabase calls — method signatures
already match. The admin UI requires no further changes.

The Dexie store can stay in place as an offline cache for the admin UI
during the transition; remove `src/lib/db/dexie.ts` and `src/lib/seed.ts`
once the live backend is verified.
