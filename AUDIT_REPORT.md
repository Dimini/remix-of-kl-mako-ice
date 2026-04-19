# Klima Kompas — v5 Requirements Audit

**Date:** 2026-04-19 | **Branch:** `claude/audit-v5-requirements-e8ovz`

---

## 1. CURRENT STATE

The repo is a **frontend-only React 18 + TypeScript + Vite + Tailwind + shadcn/ui SPA** — zero Supabase, zero backend, zero admin functionality. It is essentially a civic-awareness prototype, not the scoring platform described in requirements.

**Routes (6 total):**

| Path | Component | Purpose |
|------|-----------|---------|
| `/` | `Elections.tsx` | Candidate list w/ hardcoded data |
| `/klimaticke-data` | `Index.tsx` | CO₂/temperature/electricity charts |
| `/klimaticka-zmena` | `ClimateChange.tsx` | Climate education page |
| `/preco-volit` | `WhyVoteMatters.tsx` | Voter advocacy |
| `/metodologia` | `Metodologia.tsx` | Methodology stub |
| `*` | `NotFound.tsx` | 404 |

**Data structures (all in-memory, zero DB):**
```typescript
// Elections.tsx — 100% hardcoded
interface Candidate { id, name, party, position, climatePros[], climateCons[],
  description, climateScore, scoreBreakdown: { program, dotaznik, hlasovanie, online } }
interface KrajData { id, name, abbreviation, capitalName,
  zupanCandidates[], primatorCandidates[] }
// 28 candidate objects across 8 regions — all illustrative, explicitly labelled as fake
```

**Missing entirely:** Supabase schema, auth, Edge Functions, admin dashboard, candidate detail page, SVG region map, questionnaire system, scoring engine, AI agents, source citations, review queue, `/region/:krajId`, `/kandidat/:region/:position/:slug`, `/dotaznik/:uuid`.

---

## 2. SCORING MODEL CONFLICT

Every single dimension of the formula is wrong.

| Dimension | Existing codebase | Required (CLAUDE.md + CAP-07) | Discrepancy |
|-----------|-----------------|-------------------------------|-------------|
| **Top-level structure** | 4 flat pillars summed | `SLOVÁ × 0.40 + SKUTKY × 0.60` | ❌ Architecture is completely different |
| **Program weight** | 25% of total | 20% of total (0.50 × SLOVÁ × 0.40) | ❌ Off by 5 pp |
| **Dotazník weight** | 30% of total | 20% of total (0.50 × SLOVÁ × 0.40) | ❌ Off by 10 pp |
| **Hlasovanie weight** | 40% of total | 25% of total (0.417 × SKUTKY × 0.60) | ❌ Off by 15 pp |
| **Online weight** | 5% of total | **NULL in MVP** (Phase 2 only) | ❌ Must not exist in MVP |
| **Documented actions** | Not modelled at all | 35% of total (0.583 × SKUTKY × 0.60) | ❌ Pillar entirely absent |
| **Normalisation** | None — raw integers 0–100 | Carter min/max clamp, NRSR rubric, designed caps | ❌ No normalisation implemented |
| **Scoring source** | Hardcoded TypeScript objects | Supabase `scoring_config` table, computed in Edge Function | ❌ All hardcoded |
| **Badge thresholds** | Green ≥ 70, Orange 40–70, Red < 40 (3 colours) | Green ≥ 80, Yellow ≥ 55, Orange ≥ 30, Red < 30, Grey = insufficient data (5 colours) | ❌ Wrong thresholds, missing 2 badge types |
| **Grey badge** | Not modelled | `GREY_NO_DATA`, `GREY_REFUSED`, `GREY_NEW_CANDIDATE`, `GREY_LOW_CONFIDENCE` | ❌ Completely absent |
| **Votes-null fallback** | Not modelled | When `votes_norm` is null → `SKUTKY = actions_norm` | ❌ Absent |
| **Tier 3 exclusion** | Not modelled | Tier 3 items excluded from all score computation in CAP-07 | ❌ Absent |
| **formula_version** | Not tracked | Must be stored in `scoring_config` and stamped on every `scores` row | ❌ Absent |

**Summary:** The formula needs a full replacement — not a patch. It's not an off-by-one; it's a different paradigm (flat vs. pillar-weighted, unnormalised vs. Carter normalisation, 3-badge vs 5-badge).

---

## 3. SCHEMA CONFLICT

**There is no Supabase schema.** The `/supabase/` directory does not exist. No migrations, no seed files, no Edge Functions, no RLS policies.

Required tables vs. what exists:

| Required table | Exists? | Notes |
|----------------|---------|-------|
| `candidates` | ❌ | Hardcoded TS objects only |
| `scores` | ❌ | — |
| `programs` | ❌ | — |
| `questionnaire_responses` | ❌ | — |
| `votes` | ❌ | — |
| `documented_actions` | ❌ | — |
| `source_citations` | ❌ | — |
| `review_queue` | ❌ | — |
| `scoring_config` | ❌ | — |
| `jurisdictions` (CAP-03) | ❌ | — |

Nothing to drop or migrate — the schema must be built from scratch in `/supabase/migrations/`.

**RLS** is entirely absent. All required policies (`public_read_approved`, `public_read_candidates`, `researcher_write`) must be created.

---

## 4. COMPONENTS TO KEEP

Files worth keeping **verbatim or with minor changes only:**

| Path | Keep status | Notes |
|------|------------|-------|
| `src/components/ui/**` (47 shadcn files) | ✅ Keep verbatim | Full shadcn/ui library — standard primitives needed by all new features |
| `src/lib/utils.ts` | ✅ Keep verbatim | `cn()` helper, standard Tailwind merge |
| `src/hooks/use-toast.ts` | ✅ Keep verbatim | |
| `src/hooks/use-mobile.tsx` | ✅ Keep verbatim | |
| `src/components/Footer.tsx` | ✅ Minor update | Update nav hrefs when new routes are added |
| `src/components/InfoCard.tsx` | ✅ Keep verbatim | Generic reusable card |
| `src/components/LoadingSkeleton.tsx` | ✅ Keep verbatim | Skeleton states needed throughout |
| `src/components/FAQ.tsx` | ✅ Keep verbatim | Supplementary content |
| `src/components/DisclaimerBar.tsx` | ✅ Minor update | Wording must match spec exactly: "Toto hodnotenie nie je odporúčaním na hlasovanie." |
| `src/components/charts/*.tsx` (4 chart files) | ✅ Keep verbatim | Used by `/klimaticke-data` supplementary page |
| `src/components/elections/ImpactTable.tsx` | ✅ Keep verbatim | Used by WhyVoteMatters — good bilingual table component |
| `src/components/elections/ResponsibilitiesSection.tsx` | ✅ Keep verbatim | Supplementary |
| `src/components/elections/ActionChecklist.tsx` | ✅ Keep verbatim | Supplementary |
| `src/components/elections/BrochurePreview.tsx` | ✅ Keep verbatim | Supplementary |
| `src/components/KPITile.tsx` | ✅ Keep verbatim | Used by Index.tsx climate dashboard |
| `src/pages/ClimateChange.tsx` | ✅ Keep verbatim | Out-of-scope but harmless supplementary content |
| `src/pages/WhyVoteMatters.tsx` | ✅ Keep verbatim | Good advocacy page |
| `src/pages/NotFound.tsx` | ✅ Keep verbatim | Fine as-is |
| `src/pages/Index.tsx` | ✅ Keep as `/klimaticke-data` | Good climate data dashboard; stays as supplementary page |
| `src/services/api.ts` | ✅ Keep as-is | Used only by Index.tsx; no Supabase needed here |
| `src/contexts/LanguageContext.tsx` | ✅ Keep, expand | Add translation keys for new UI (badge labels, disclaimer text, CAP-08 form labels) |
| `tailwind.config.ts` | ✅ Minor update | Add badge colour tokens (green/yellow/orange/red/grey) as semantic colours |
| `package.json` | ✅ Keep, add deps | Add `@supabase/supabase-js`; remove `express`, `cors`, `csv-parser` (server-side artefacts) |
| `components.json` | ✅ Keep verbatim | shadcn/ui config |

---

## 5. COMPONENTS TO REPLACE

Files that must be rebuilt because structural assumptions are irreconcilable:

| Path | Verdict | Why |
|------|---------|-----|
| `src/pages/Elections.tsx` | 🔴 Replace | Hardcoded candidate data; wrong formula display; wrong badge colours; missing `/region/:krajId` and `/kandidat/...` routing; no Supabase integration; no citations; no detail page |
| `src/pages/Metodologia.tsx` | 🔴 Replace | Content lists wrong formula weights (25/30/40/5); missing full KLIMA_SCORE formula, badge table, Climate Relevance Framework, normalisation worked example, Carter et al. cap sources |
| `src/App.tsx` | 🔴 Replace | Routes must change: add `/region/:krajId`, `/kandidat/:region/:position/:slug`, `/dotaznik/:uuid`; remove routes that become supplementary |
| `src/types/chart.d.ts` | 🔴 Replace | Add domain types: `Candidate`, `Score`, `SourceCitation`, `EvidenceItem`, `Badge`, `ReviewQueueItem`, `ClimateRelevanceTier` |
| **NEW: `supabase/migrations/001_init.sql`** | 🔴 Build | All 10 required tables, RLS, `scoring_config` seed |
| **NEW: `supabase/functions/scoring-engine/`** | 🔴 Build | CAP-07 Edge Function with correct formula |
| **NEW: `src/pages/RegionPage.tsx`** | 🔴 Build | `/region/:krajId` — 2 candidate rows per region |
| **NEW: `src/pages/CandidateDetail.tsx`** | 🔴 Build | `/kandidat/:region/:position/:slug` — full scorecard |
| **NEW: `src/pages/QuestionnaireForm.tsx`** | 🔴 Build | `/dotaznik/:uuid` — CAP-05 submission form |
| **NEW: `src/components/CandidateBadge.tsx`** | 🔴 Build | 5-colour badge with grey sub-types |
| **NEW: `src/components/PillarBar.tsx`** | 🔴 Build | SLOVÁ/SKUTKY progress bars |
| **NEW: `src/components/CitationList.tsx`** | 🔴 Build | Source citations with Tier 2 reviewer_note display |
| **NEW: `src/lib/supabase.ts`** | 🔴 Build | Supabase client init |
| **NEW: `src/lib/scoring.ts`** | 🔴 Build | Client-side formula utility (mirrors CAP-07 for display) |
| **NEW: `src/pages/admin/`** | 🔴 Build | CAP-06 review dashboard, CAP-08 evidence entry form |
| **NEW: `supabase/functions/cap-02-program-agent/`** | 🔴 Build | AI program analysis |
| **NEW: `supabase/functions/cap-05-questionnaire/`** | 🔴 Build | UUID generation + submission handler |

---

## 6. FIRST 5 ACTIONS

These are the minimum prerequisite actions before any new feature is added. Do them in order.

**Action 1 — Create Supabase schema (foundation for everything)**
- **What:** Write `/supabase/migrations/001_init.sql` with all 10 tables, correct column types, RLS policies, and `scoring_config` seed values from REQUIREMENTS.md
- **Tool:** Claude Code (backend/agents ownership per CLAUDE.md)
- **Estimated time:** 2–3 hours
- **Dependency:** None — can start immediately
- **Critical fields:** `climate_relevance_tier SMALLINT NOT NULL CHECK (tier IN (1,2,3))`, `reviewer_note TEXT` (enforced non-null when tier=2 at app layer), `is_approved BOOLEAN DEFAULT false`, `formula_version` in scoring_config

**Action 2 — Fix App.tsx routing**
- **What:** Replace current 6-route config with spec-compliant routing: `/` → `RegionMap` (homepage with SVG map), `/region/:krajId`, `/kandidat/:region/:position/:slug`, `/dotaznik/:uuid`, `/metodologia`, `/admin/*`; retain supplementary routes at `/klimaticke-data`, `/klimaticka-zmena`, `/preco-volit`
- **Tool:** Lovable (frontend, owns `/src/pages/`)
- **Estimated time:** 30 minutes
- **Dependency:** Needs Action 1 complete so route guards can check auth

**Action 3 — Fix Metodologia.tsx content**
- **What:** Replace formula section weights (currently 25/30/40/5) with correct KLIMA_SCORE formula; add badge threshold table; add Climate Relevance Framework with Tier definitions and worked example; add Carter et al. normalisation example; add non-endorsement statement
- **Tool:** Lovable (frontend)
- **Estimated time:** 1–2 hours
- **Dependency:** Independent; can run parallel to Action 1

**Action 4 — Build CAP-07 scoring Edge Function**
- **What:** Create `supabase/functions/cap-07-scoring-engine/index.ts` implementing the exact formula from REQUIREMENTS.md: Tier 3 exclusion filter → component normalisation → SLOVÁ/SKUTKY pillar calc → KLIMA_SCORE → badge assignment → write to `scores` table; triggered by DB webhook
- **Tool:** Claude Code (backend/agents ownership)
- **Estimated time:** 3–4 hours
- **Dependency:** Action 1 (needs tables to exist)

**Action 5 — Build the public candidate list page (replaces Elections.tsx)**
- **What:** New `Elections.tsx` (or `RegionPage.tsx`) that reads from Supabase `candidates` + `scores` (WHERE `is_approved = true`), shows correct 5-colour badge, SLOVÁ/SKUTKY pillar bars, legal disclaimer on every card; all 16 Phase 1 candidates always visible regardless of Grey status; link to candidate detail
- **Tool:** Lovable (frontend, owns `/src/pages/`)
- **Estimated time:** 3–4 hours
- **Dependency:** Actions 1 + 4 (needs DB + scoring engine to have data to display)

---

## 7. VERDICT

**Build on top — do not start fresh.**

The existing repo is a good scaffold: the Tailwind + shadcn/ui setup, the i18n context, the mobile-first responsive patterns, the supplementary content pages (climate education, advocacy), the chart infrastructure, and the complete shadcn primitive library are all production-quality and directly reusable. Rebuilding them from zero would cost 1–2 weeks for no product gain.

**Minimum cleanup before adding new features (in addition to the 5 actions above):**

1. Remove `server.js` and `start.js` from the repo root — they are Express.js CORS proxy artefacts that belong to a different architecture; they create confusion and security surface.
2. Add `@supabase/supabase-js` to `package.json`; remove `express`, `cors`, `csv-parser` (unused once Supabase is in place).
3. Add badge semantic colour tokens to `tailwind.config.ts`: `badge-green`, `badge-yellow`, `badge-orange`, `badge-red`, `badge-grey` — use these consistently across all new components rather than arbitrary hex strings.
4. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `.env.example` (never commit actual values).
5. Remove the hardcoded disclaimer in `Elections.tsx` bottom section — it explicitly says "Táto stránka používa ilustračné údaje" which cannot appear in production.

The existing `Elections.tsx` hardcoded data can be used as **seed data only** — to pre-populate the `candidates` table via a one-off migration script while real candidate data is being collected. Its TypeScript interface structure (`Candidate`, `KrajData`) should not be carried forward; replace with the domain types from the schema.
