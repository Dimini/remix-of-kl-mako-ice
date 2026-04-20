

## Goal
Swap the Dexie/IndexedDB persistence layer for Supabase across the three repositories (`candidates`, `adminCandidates`, `questionnaire`) plus the audit helper, so that all reads/writes go through the live Postgres backend. After this, Dexie can be deleted and the public site renders real DB-backed candidates.

## Why this is the right next step
- Auth is in place and you have the `admin` role → write paths will satisfy RLS.
- Schema + types are aligned (migration done, `src/integrations/supabase/types.ts` regenerated, `src/types/domain.ts` matches DB enums).
- Until this swap, every admin edit still writes to your browser's IndexedDB only — invisible to the DB and to other reviewers.

## Scope of changes

### 1. New Supabase-backed repositories (replace Dexie implementations)

**`src/lib/repository/candidates.ts`** (public reads)
- `list()` → `select * from candidates where state='PUBLISHED' and is_approved=true` (RLS already enforces this for anon).
- `getByKraj`, `getByKrajAndPosition` → same with `.eq('region', krajId)` / `.eq('position', position)`.
- `getById` → single row fetch + join `scores` (latest approved), `source_citations`, `programs`, `documented_actions`, `votes` to assemble the public `Candidate` shape consumed by `CandidateDetail.tsx` and the map.
- Keep the `CandidatesRepository` interface unchanged so UI code is untouched.

**`src/lib/repository/adminCandidates.ts`** (reviewer CRUD)
- Replace Dexie calls with Supabase client calls against `candidates` and the evidence tables.
- Map snake_case DB columns ↔ camelCase `CandidateRecord` in a single adapter (`fromRow` / `toRow`) so component code keeps using the existing record shape.
- `adminEvidenceRepo`: split the unified Dexie `evidence` table into reads/writes against the four canonical tables (`source_citations`, `programs`, `documented_actions`, `votes`) using `pillar` + `source_type` to route. Returns a unified `EvidenceRecord[]` to keep `EvidenceSection.tsx` / `EvidenceForm.tsx` working without prop changes.

**`src/lib/repository/questionnaire.ts`**
- `findCandidateByUuid` → `select … where questionnaire_uuid = :uuid`.
- `saveDraft` / `submitFinal` → upsert into `questionnaire_responses` with the canonical shape (`link_uuid`, `response_json` JSONB bundling scaleAnswers/priorityActions/consents, `questionnaire_score`, `status`, `responded_at`).
- `submitFinal` also updates `candidates.state` + `questionnaire_responded` and writes a `review_audit_log` row via the new audit helper.

**`src/lib/audit.ts`**
- Rewrite `logAudit()` to insert into `public.review_audit_log` using the current session (`reviewer = user.email`, `reviewer_user_id = user.id`).
- `listAuditFor()` → select by `candidate_id` ordered by `at desc`.

### 2. Convert `useLiveQuery` call sites
`AdminCandidatesList.tsx`, `AdminCandidateDetail.tsx`, `AdminReviewQueue.tsx`, `AdminExport.tsx`, `EvidenceSection.tsx`, `AuditLogPanel.tsx`, `QuestionnaireLinkPanel.tsx` currently use `dexie-react-hooks`. Replace each with a small `useSupabaseQuery` pattern using `useEffect` + `useState` (or TanStack Query if already wired — will check). Subscribe to Supabase Realtime on the relevant table so the list refreshes on inserts/updates without manual refetch.

### 3. Seed flow
- Repurpose `src/lib/seed.ts` `seedFromMock()` to upsert `MOCK_CANDIDATES` into Supabase (`candidates` only — no scores/evidence) so you can populate the DB once for testing. Guard behind admin role.
- `clearAllAdminData()` → delete-all from `candidates` cascading through the evidence tables (admin-only, with confirm dialog already in place).

### 4. Delete (after smoke-test passes)
- `src/lib/db/dexie.ts`
- `dexie` + `dexie-react-hooks` from `package.json`
- All `import { db } from "@/lib/db/dexie"` references

### 5. UI tweak
- `AdminCandidatesList.tsx` empty-state copy referencing "Phase B" / IndexedDB → update to mention Supabase.
- `AdminLayout` header: show signed-in reviewer email next to the sign-out button (cheap win, helps multi-reviewer workflows).

## Out of scope (next iterations)
- Public `Candidate` shape conversion when no row in `scores` exists yet → Grey badge fallback. Will implement basic fallback but full grey-subtype logic stays as-is.
- Storage bucket for candidate photos (currently `photo_url` is a free text URL — fine for now).
- Admin user management UI.
- CAP-07 scoring Edge Function (Antigravity territory).

## Risks & mitigations
- **RLS lockout on writes**: every write goes through `Reviewers manage …` policies which require `has_role`. Your `admin` role covers this. Other reviewers will need roles granted before they can write.
- **Public reads return empty until candidates are PUBLISHED + approved**: expected. The seed flow inserts at `state='REGISTERED'` so the public site stays empty until you walk a candidate through the state machine. I'll add a one-line note in the admin list explaining this.
- **`useLiveQuery` → manual subscription**: I'll wrap the pattern in a tiny `useTable(name, query)` hook in `src/hooks/useSupabaseTable.ts` so call sites stay one-liners.

## Files touched (estimate)
- Rewritten: `candidates.ts`, `adminCandidates.ts`, `questionnaire.ts`, `audit.ts`, `seed.ts` (5 files in `src/lib/`)
- New: `src/hooks/useSupabaseTable.ts`, `src/lib/repository/_adapters.ts`
- Edited (hook swap only): 7 admin pages/components listed above
- Deleted: `src/lib/db/dexie.ts` + dexie deps
- Untouched: all `src/components/klima/*`, `src/pages/CandidateDetail.tsx`, public site routing

## Verification steps after implementation
1. Sign in at `/admin/login` → land on `/admin` without errors.
2. Click "Seed z mock dát" → see candidates appear (verify via `select count(*) from candidates`).
3. Open one candidate, add an evidence item, save → verify row in `source_citations`/`votes`/etc.
4. Walk a candidate to `PUBLISHED` + approved → confirm it appears on the public `/region/:krajId` page in an incognito window (anon read path).
5. Open browser devtools → confirm no `dexie` references remain in the network/console.

