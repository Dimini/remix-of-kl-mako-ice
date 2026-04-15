# Codebase Audit: remix-of-kl-mako-ice
**Date:** 2026-04-15  
**Stack found:** React 18 + TypeScript + Vite + Tailwind + shadcn/ui  
**Product:** Klíma ťa potrebuje — Slovak komunálne voľby 2026 climate benchmarking platform

---

## WHAT EXISTS — SUMMARY

The POC is a public-facing, frontend-only React SPA ("Klíma ťa potrebuje") with no backend database, no Supabase integration, and no admin functionality. It ships six static pages: a candidates list (`/` → Elections.tsx), a climate data dashboard (`/klimaticke-data`), an education page (`/klimaticka-zmena`), a "why vote" advocacy page (`/preco-volit`), a methodology page (`/metodologia`), and a 404. All candidate data — 28 candidates across 8 regions — is hardcoded as TypeScript objects inside `Elections.tsx`. Climate metrics (CO₂, electricity mix, temperature, precipitation) are fetched from public APIs (World Bank, Our World In Data, Open-Meteo) via a CORS proxy with an Express.js caching layer. There is no SVG region map, no candidate detail page, no comparison view, no admin dashboard, no Supabase schema, no authentication, and no AI agent pipeline.

---

## ALIGNMENT SCORE

| Area | Score | Notes |
|------|-------|-------|
| Page structure & routing | 2/5 | 6 routes exist but missing: candidate detail, comparison, admin |
| Slovakia region map | 1/5 | Dropdown/tab selection only — no interactive SVG map |
| Candidate card component | 2/5 | Cards exist in Elections.tsx but no standalone detail page; no citations, no verbatim questionnaire |
| Badge/scoring display | 2/5 | 3-colour system (green/orange/red) vs required 5 (Green/Yellow/Orange/Red/Grey); formula weights differ |
| Admin review dashboard | 1/5 | Does not exist |
| Supabase schema | 1/5 | Does not exist; no Supabase dependency at all |
| Data model alignment | 1/5 | Hardcoded TS objects; missing 6 of 8 required tables |
| Slovak language & tone | 4/5 | Primary UI is Slovak with full i18n context; English toggle present |
| Mobile responsiveness | 4/5 | Tailwind mobile-first, responsive breakpoints throughout |
| Legal disclaimer | 3/5 | DisclaimerBar exists with correct spirit; wording differs from spec; not on every scorecard |

---

## COMPONENT-BY-COMPONENT VERDICT

### Pages

| Path | What it does | Verdict | Reason |
|------|-------------|---------|--------|
| `src/pages/Elections.tsx` | Hardcoded candidate list, region tabs, score bars, climate pros/cons | REFACTOR | Structure and UI patterns are solid but data must come from Supabase; scoring formula, badge colours, and missing detail/comparison routes must all change |
| `src/pages/Index.tsx` | Climate data dashboard (CO₂, temp, precip charts) | KEEP | Useful supplementary page; not required by spec but adds context; no changes needed for v1 |
| `src/pages/Metodologia.tsx` | Methodology documentation | REFACTOR | Content is directionally correct but scoring weights listed (25/30/40/5) contradict the required spec (40/35/25); rewrite copy |
| `src/pages/ClimateChange.tsx` | Educational climate background | KEEP | Out-of-scope for core product but harmless; keep as-is |
| `src/pages/WhyVoteMatters.tsx` | Voter advocacy / call-to-action | KEEP | Good supporting content; no changes needed |
| `src/pages/NotFound.tsx` | 404 page | KEEP | Fine as-is |

### Components

| Path | What it does | Verdict | Reason |
|------|-------------|---------|--------|
| `src/components/DisclaimerBar.tsx` | Sticky bottom disclaimer, sessionStorage dismiss | REFACTOR | Copy and positioning are right; must also become a per-scorecard inline component to satisfy "every candidate scorecard must include a disclaimer" |
| `src/components/Footer.tsx` | Site footer with navigation links | KEEP | Solid; update hrefs when new routes are added |
| `src/components/InfoCard.tsx` | Reusable icon + title + bullets card | KEEP | Generic, reusable as-is |
| `src/components/KPITile.tsx` | Metric tile with trend indicator | KEEP | Useful for climate data page |
| `src/components/LoadingSkeleton.tsx` | Skeleton loaders (generic + KPI + chart variants) | KEEP | Needed for async Supabase data; extend for candidate cards |
| `src/components/FAQ.tsx` | Accordion FAQ | KEEP | Reuse pattern for methodology page FAQs |
| `src/components/charts/TemperatureChart.tsx` | Line chart, rolling average, ERA5 data | KEEP | Well-built; not central to core product |
| `src/components/charts/CO2Chart.tsx` | CO₂ bar chart (World Bank data) | KEEP | Same |
| `src/components/charts/ElectricityMixChart.tsx` | Electricity mix chart (OWID data) | KEEP | Same |
| `src/components/charts/PrecipitationChart.tsx` | Precipitation chart (ERA5 data) | KEEP | Same |
| `src/components/elections/ImpactTable.tsx` | Policy area × official type matrix | KEEP | Directly relevant supporting content |
| `src/components/elections/ResponsibilitiesSection.tsx` | Župan vs primátor breakdown | KEEP | Keep verbatim |
| `src/components/elections/ActionChecklist.tsx` | Voter action guide with share | KEEP | Good supporting UX |
| `src/components/elections/BrochurePreview.tsx` | Download brochure component | KEEP | Low priority but harmless |
| `src/components/ui/*` (40+ files) | Full shadcn/ui primitive library | KEEP | Use extensively for new pages (Card, Badge, Progress, Tabs, Dialog, Sheet) |
| `src/contexts/LanguageContext.tsx` | SK/EN i18n via context + t() | KEEP | Well-structured; extend translation keys for new copy |
| `src/services/api.ts` | External climate API fetching with fallbacks | KEEP | Needed for climate data page; no changes |
| `src/lib/utils.ts` | `cn()` classname helper | KEEP | Standard shadcn utility |
| `src/hooks/use-mobile.tsx` | Mobile breakpoint detection hook | KEEP | Used throughout |

### Config / Infrastructure

| Path | Verdict | Reason |
|------|---------|--------|
| `tailwind.config.ts` | KEEP | Climate colour tokens already defined; add badge colour tokens |
| `vite.config.ts` | KEEP | Fine as-is |
| `tsconfig.app.json` | REFACTOR | Enable `strict: true` before serious development |
| `server.js` / `start.js` | REPLACE | Express cache layer becomes unnecessary once Supabase handles data |
| `package.json` | REFACTOR | Add `@supabase/supabase-js`; remove `node-fetch`, `csv-parser`, `express` once Supabase is wired |

---

## WHAT'S ACTUALLY USEFUL

These files/patterns can be used verbatim or near-verbatim:

- **`src/components/ui/*`** — full shadcn/ui library; use `Card`, `Badge`, `Progress`, `Tabs`, `Dialog`, `Sheet` for new pages
- **`src/components/DisclaimerBar.tsx`** — extract disclaimer text + styling; reuse inline per scorecard
- **`src/components/Footer.tsx`** — update nav links only
- **`src/components/InfoCard.tsx`**, **`KPITile.tsx`**, **`LoadingSkeleton.tsx`**, **`FAQ.tsx`** — reuse as-is
- **`src/contexts/LanguageContext.tsx`** — extend with new translation keys; do not rewrite
- **`src/lib/utils.ts`** — standard `cn()` helper
- **`src/hooks/use-mobile.tsx`** — mobile detection
- **`tailwind.config.ts`** — climate colour palette; add `badge-green`, `badge-yellow`, `badge-orange`, `badge-red`, `badge-grey` tokens
- **`src/App.tsx`** routing skeleton — extend with new routes
- **`src/components/elections/ImpactTable.tsx`**, **`ResponsibilitiesSection.tsx`** — content pages
- **`src/pages/ClimateChange.tsx`**, **`WhyVoteMatters.tsx`**, **`Index.tsx`** — keep as supplementary pages
- **React Query** (`@tanstack/react-query`) — already installed; wire up for all Supabase queries
- **`src/services/api.ts`** — keep only for climate data charts

---

## WHAT NEEDS TO BE REBUILT

Priority order (highest impact first):

1. **Supabase project + all 8 DB tables** — The entire data layer is missing. Must create: `candidates`, `scores`, `programs`, `votes`, `social_posts`, `questionnaire_responses`, `review_queue`, `source_citations`. Hardcoded `krajeData` in `Elections.tsx` must be migrated to seeded DB rows. **Blocking everything else.**

2. **Interactive SVG map of Slovakia's 8 regions** — Homepage must show a tappable map. No map asset or component exists. Requires an SVG (or library like `react-simple-maps`) with region hit areas keyed to `kraj` IDs. High UX impact; replaces current tab/dropdown region selector.

3. **Candidate detail / scorecard page** (`/kandidat/:id`) — No standalone detail page exists. Needs: overall score, three pillar bars (Slová 40%, Skutky 35%, Komunikácia 25%), verbatim questionnaire response, source citations list, inline legal disclaimer. This is the core product deliverable.

4. **Scoring formula realignment** — Current weights (25% program / 30% dotaznik / 40% hlasovanie / 5% online) differ from the spec (40% Slová / 35% Skutky / 25% Komunikácia). Badge thresholds also differ (current 3-colour vs required 5-colour Green/Yellow/Orange/Red/Grey). Must be fixed in DB schema and all display components.

5. **Admin dashboard** (`/admin`) — Supabase Auth-protected route with review queue UI: list of pending AI-generated scores, approve/adjust controls, `approved_by` and `approved_at` write-back. Does not exist at all.

6. **Candidate comparison view** — Side-by-side two candidate scorecards. No comparison page or component exists.

7. **Supabase Auth** — No auth at all. Needed for admin dashboard protection.

8. **Supabase Edge Functions** — AI agent pipeline (Claude Sonnet 4) for ingesting programs, voting records, and social posts and writing to `programs`, `votes`, `social_posts`, `review_queue`. Entirely absent.

9. **Source citations component** — `source_citations` table required by spec; no citation display component exists anywhere.

---

## DATA MODEL GAP ANALYSIS

### Current state
All candidate data is a TypeScript in-memory object:
```typescript
interface Candidate {
  id: string; name: string; party: string; position: string;
  climatePros: string[]; climateCons: string[];
  description: string; climateScore: number;
  scoreBreakdown: { program, dotaznik, hlasovanie, online }
}
```
No Supabase client, no migrations, no schema files anywhere in the repo.

### Required vs existing — table by table

| Required Table | Status | Gap |
|----------------|--------|-----|
| `candidates` | PARTIAL (TS object only) | Missing: `photo_url`, `city`, `is_independent`, `year`; no DB persistence |
| `scores` | MISSING | `pillar1/2/3_score`, `badge`, `is_approved`, `approved_at/by` — none exist |
| `programs` | MISSING | `source_url`, `raw_text`, `citations_json`, `agent_version`, `confidence`, `requires_review` — none |
| `votes` | MISSING | `date`, `topic`, `vote_direction`, `relevance_score`, `source_url` — none |
| `social_posts` | MISSING | `platform`, `date`, `text`, `climate_relevance`, `score` — none |
| `questionnaire_responses` | MISSING | `sent_at`, `responded_at`, `response_json`, `pillar1_contribution` — none |
| `review_queue` | MISSING | `ai_suggestion`, `status`, `reviewer_notes`, `adjustments_json` — none |
| `source_citations` | MISSING | `pillar`, `source_type`, `url`, `quote`, `date_accessed` — none |

### Scoring formula mismatch
| | POC (current) | Spec (required) |
|--|---------------|-----------------|
| Pillar 1 | Program — 25% | Slová (program) — **40%** |
| Pillar 2 | Dotazník — 30% | Skutky (voting record) — **35%** |
| Pillar 3 | Hlasovanie — 40% | Komunikácia (social media) — **25%** |
| Pillar 4 | Online — 5% | *(not a separate pillar)* |

### Badge threshold mismatch
| Colour | POC threshold | Spec threshold |
|--------|---------------|----------------|
| Green | ≥70% | **≥80%** |
| Yellow | *(does not exist)* | **≥55%** |
| Orange | ≥40% | **≥30%** |
| Red | <40% | **<30%** |
| Grey | *(does not exist)* | **null / low confidence** |

### AI agent pipeline blockers
Edge Functions need to write to: `programs.citations_json` (JSONB), `programs.agent_version`, `programs.confidence`, `review_queue.ai_suggestion`, `review_queue.adjustments_json`. None of these columns or tables exist.

---

## BIGGEST RISKS

1. **Total data layer absence.** There is no Supabase project, no schema, no auth, no edge functions. Every product requirement that touches live data (scoring, admin approval, AI ingestion, citations) is blocked until the Supabase schema is created and seeded. Building more frontend before the schema is locked risks a second full rewrite of all data-binding code.

2. **Scoring formula and badge system are wrong.** The POC's formula (25/30/40/5) and badge thresholds (3 colours) are baked into `Elections.tsx` display logic, `Metodologia.tsx` copy, and the implicit mental model of the hardcoded data. If the team ships more features before correcting the formula to (40/35/25) and the 5-colour badge system, every score-display component and all seeded test data will need to be redone.

3. **Hardcoded data in Elections.tsx is a maintenance trap.** With 28 candidates embedded in a 574-line TSX file, adding a candidate, adjusting a score, or correcting a badge requires a developer deploy. Any new Supabase-backed component that fetches real data will conflict with the static render until the hardcoded array is fully removed. The longer these coexist, the more confusing the codebase becomes.

---

## RECOMMENDED NEXT STEPS

| # | Action | Tool | Effort | Dependency |
|---|--------|------|--------|------------|
| 1 | Create Supabase project; write and run all 8 migration files; add RLS policies; generate TypeScript types via `supabase gen types` | Manual (Supabase dashboard) + Claude Code | 4–6 h | None — first action |
| 2 | Correct scoring formula (to 40/35/25) and 5-colour badge system (Green/Yellow/Orange/Red/Grey with correct thresholds); update `Metodologia.tsx` copy; add badge colour tokens to `tailwind.config.ts`; replace hardcoded `getScoreBarColor()` with a `getBadge()` utility | Claude Code | 2 h | Step 1 (needs badge enum from DB types) |
| 3 | Migrate hardcoded `krajeData` (28 candidates) into Supabase seed SQL; wire `Elections.tsx` to Supabase query via React Query; delete static TypeScript data array | Claude Code | 3 h | Step 1 |
| 4 | Build interactive Slovakia SVG map component for homepage — tappable 8-region map navigating to `/region/:krajId`; source or create SVG with correct kraj boundaries | Lovable (initial scaffold) + Claude Code (data binding) | 4–6 h | Step 3 |
| 5 | Build candidate detail page (`/kandidat/:id`) with: overall score, three pillar progress bars, verbatim questionnaire response, source citations list, inline legal disclaimer | Lovable (UI scaffold) + Claude Code (Supabase wiring) | 4–6 h | Steps 1–3 |

---

## BUILD-ON-TOP OR START FRESH?

**Recommendation: BUILD ON TOP — with a hard prerequisite cleanup sprint before adding any new features.**

**Rationale:** The UI foundation is genuinely useful. The shadcn/ui library, Tailwind config, i18n context, mobile-first layout, Router v6 skeleton, React Query installation, and several supporting components (DisclaimerBar, Footer, election content components) are all production-quality. Rebuilding from scratch would cost 2–3 days of UI scaffolding for no net gain.

However, the codebase is **not ready for feature development yet**. Three things must be resolved first:

1. **Supabase schema** (Step 1 above) — do not add a single new page until the DB is running and typed.
2. **Scoring formula + badge correction** (Step 2) — lock the formula and badge system in code before any score data is seeded or displayed.
3. **Remove hardcoded `krajeData`** (Step 3) — once real Supabase queries exist, delete the static array entirely. Do not let them coexist.

**If a fresh start were chosen (not recommended), these assets should be copied over first:**
- `src/components/ui/*` (entire shadcn library)
- `src/contexts/LanguageContext.tsx`
- `src/components/DisclaimerBar.tsx`
- `src/components/Footer.tsx`
- `tailwind.config.ts`
- `src/lib/utils.ts`
- `src/services/api.ts`
- Supporting pages: `ClimateChange.tsx`, `WhyVoteMatters.tsx`, `Index.tsx`
