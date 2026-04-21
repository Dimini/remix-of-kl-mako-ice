# Klima Kompas — MVP Readiness Audit
**Date:** 2026-04-21 | **Branch:** `dev` | **Auditor:** Claude Code (`claude/assess-mvp-readiness-573ym`)

---

## TL;DR

**~85% demo-ready.** Core scoring, public website, admin dashboard, AI agents, questionnaire, and evidence entry are all functionally implemented and correctly wired. There are no correctness bugs in the formula. Three workflow gaps were found (one critical, now fixed). With the fixes in this commit plus seeded test data, the platform is ready to show to NGO stakeholders.

---

## 1. WHAT IS COMPLETE AND CORRECT

### CAP-07 — Scoring Engine (P0) ✅
- Formula v1.0 locked and correctly implemented in both `supabase/functions/_shared/scoring.ts` and `src/lib/scoring/computeScore.ts` (client mirror)
- Weights exact: SLOVÁ × 0.40 + SKUTKY × 0.60; MVP SLOVÁ = program 50% + questionnaire 50%; SKUTKY = votes 0.417 + actions 0.583
- Tier 3 exclusion enforced before any computation in both locations
- Votes-null fallback correctly shifts full weight to actions
- All 5 badge types including all 4 grey subtypes correctly derived
- Normalisation caps correct: program [−35.30, +17.31], questionnaire [0, 54], actions [−10, +15], votes [±n×2]
- Formula version stamped on every score row

### CAP-01 — Public Website (P0) ✅
- Homepage (`/`) with interactive SVG map of 8 regions, badge distribution bars, real-time DB stats
- Region page (`/region/:krajId`) with candidates grouped by position; handles variable counts
- Candidate detail (`/kandidat/:id`) — photo, identity, badge, pillar bars, score breakdown, per-pillar citations, grey sub-type explanations
- Methodology page (`/metodologia`) — full formula, badge table, tier definitions, normalisation example, non-endorsement statement
- **Both mandatory disclaimers present and correct** on homepage, candidate detail, and questionnaire:
  - "Toto hodnotenie nie je odporúčaním na hlasovanie."
  - "Hodnotenie sociálnych sietí bude doplnené v ďalšej fáze."

### Public Data Filtering ✅
- `candidatesRepo.fetchCandidates()` correctly double-guards: `state = PUBLISHED` AND `is_approved = true`
- RLS policies enforce anon read restriction at DB level as backstop
- Scores table queried with `.eq("is_approved", true)` before serving to public

### CAP-08 — Manual Evidence Entry (P0) ✅
- EvidenceForm covers all pillars (SLOVÁ + SKUTKY)
- Tier 2 enforcement: Zod `superRefine` blocks submission unless `reviewerNote` ≥ 10 chars
- Tier 3 shown as excluded with warning; stored for transparency, excluded from scoring
- Evidence types catalog complete: 3 SLOVÁ types + 8 SKUTKY types with fixed point values
- Point values from catalog, not editable by reviewer (correct)

### CAP-06 — Admin Dashboard (P0) ✅
- Admin auth: Supabase email/password + role check (reviewer/admin) via AdminGate
- Candidate CRUD: create, edit, delete, state transitions in AdminCandidateDetail
- Review queue (AdminReviewQueue): score adjustment panel, approve/needs-revision buttons
- Score preview live-recomputes as evidence changes
- Audit log recorded on every state change, approval, adjustment
- Questionnaire UUID link generation per candidate

### CAP-02 — AI Agents (P1) ✅
- `analyze-program` Edge Function: Carter method, PDF + HTML fetch, chunked processing, per-sentence tier assignment, Tier 2 reviewer_note generation
- `analyze-questionnaire` Edge Function: NRSR +1/−1 rubric, stores analysis_json, updates questionnaire_score
- Both triggered from AIToolsPanel in admin detail page

### CAP-05 — Questionnaire (MVP scope) ✅
- 10-question Likert form at `/dotaznik/:uuid` (note: REQUIREMENTS.md CAP-05 lists 8 questions; 10-question version is more complete — NGO should formally approve)
- Draft auto-save (debounced 1500 ms), resumes on re-visit
- Submit-once guard (blocks re-submission, shows confirmation)
- Consent checkboxes required (consentPublish + consentTruthful)

### Database Schema ✅
- 18 migrations applied; all core tables present
- RLS policies complete; storage buckets configured
- RBAC: user_roles table + `has_role()` security definer function

### State Machine ✅
- 7 states correct; `canTransition()` guard enforced on every state change

---

## 2. GAPS FOUND

### GAP 1 — "Schváliť a publikovať" did not publish (**FIXED in this commit**)
**File:** `src/pages/admin/AdminReviewQueue.tsx:183`

`handleApprove()` was setting `state: "APPROVED"` only. The public `candidatesRepo` requires `state = "PUBLISHED"`. An approved candidate would remain invisible on the public site until a reviewer separately navigated to the candidate detail page and clicked "→ Publikované".

**Fix applied:** Changed to `state: "PUBLISHED"` so the review-queue approve action publishes in one click.

### GAP 2 — Citation text max was 2000 chars (**FIXED in this commit**)
**File:** `src/components/admin/EvidenceForm.tsx:58`

Form schema had `max(2000)` but the DB column and spec both cap at 280 chars. A reviewer entering a long citation would receive a confusing DB constraint error.

**Fix applied:** Changed to `max(280)` and added a live character counter (n/280) below the textarea.

### GAP 3 — Review queue has no per-evidence-item Accept/Adjust/Flag (open)
CAP-06 P0 specifies a split panel with evidence list + source URL iframe, and per-item A/E/F/N actions. The current queue shows only aggregate score adjustment. Individual evidence items are accessible in the candidate detail page.

**Status:** Not fixed in this sprint. Acceptable for the NGO demo if framed as a known simplification. Recommend addressing before reviewer onboarding.

### GAP 4 — Questionnaire submit trigger was dropped (open)
Migration `20260420213442` dropped the DB trigger that auto-called `analyze-questionnaire` on submission. AI analysis of questionnaire responses is now a manual step.

**Status:** Not fixed. Reviewer SOP must document: after questionnaire submission → admin detail → click "Analyze Questionnaire".

---

## 3. MINOR SPEC DEVIATIONS (acceptable)

| # | Issue | Action |
|---|-------|--------|
| 5 | Confidence input is raw 0–1 number; spec says 3-star selector | Low priority |
| 6 | No "No URL exception flow" | Acceptable — URL is mandatory in MVP |
| 7 | 10 questionnaire questions vs 8 in spec | NGO sign-off needed |
| 8 | Keyboard shortcuts A/E/F/N not implemented | Low priority |
| 9 | `AdminExport` is a placeholder | Out of scope for demo |
| 10 | `AdminUsers` has no grant/revoke UI | Admin setup via Supabase dashboard |

---

## 4. WHAT IS CORRECTLY OUT OF SCOPE

- Social media scoring (`socialNorm = null` correctly throughout MVP)
- CAP-03 voting record parser (pilot only)
- Comparison view, OG images, evidence density indicator
- Bulk import, questionnaire reminders, appeals system

---

## 5. BEFORE THE NGO DEMO — REMAINING STEPS

1. **Seed 2–3 demo candidates** — at minimum: 1 published with Green/Yellow badge, 1 grey (GREY_NO_DATA), 1 with a Tier 2 citation so the reviewer_note is visible on the public scorecard
2. **Create admin user** — per `docs/ADMIN_BOOTSTRAP.md`; grant reviewer/admin role via `admin_grant_role()`
3. **Verify `.env`** — correct Supabase URL + anon key
4. **Write reviewer SOP** — 1 paragraph explaining the manual questionnaire analysis step

---

## 6. DEMO SCENARIOS READY

| Scenario | Status |
|----------|--------|
| Voter journey: map → region → candidate scorecard | ✅ Ready |
| Admin: manual evidence entry (Tier 1 + Tier 2) | ✅ Ready |
| Admin: trigger AI program analysis | ✅ Ready |
| Admin: review queue → approve → public site updates | ✅ Ready (after this fix) |
| Candidate: fill questionnaire via UUID link | ✅ Ready |
| Methodology page walkthrough | ✅ Ready |

---

## 7. CAPABILITY STATUS SUMMARY

| Capability | Status |
|------------|--------|
| CAP-01 Public website | ✅ Complete |
| CAP-07 Scoring engine | ✅ Complete |
| CAP-08 Manual evidence | ✅ Complete |
| CAP-06 Admin dashboard | ✅ Functional (per-item review queue open) |
| CAP-02 AI agents | ✅ Complete (manual trigger only) |
| CAP-05 Questionnaire | ✅ Complete |
| Database schema | ✅ Complete |
| Auth / RBAC | ✅ Complete |
| Test data | ❌ Must seed before demo |
