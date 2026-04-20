# CLAUDE.md — Klima Kompas Platform
> Read this file at the start of every session. It is the single source of truth for project context, conventions, and constraints.

---

## PROJECT SUMMARY

**Klima Kompas** is a civic tech platform for the Slovak komunálne voľby 2026. It evaluates and publicly displays climate/environment scorecards for candidates running for Predseda kraju (župan) and Primátor krajského mesta across all 8 Slovak regions.

Built by #klimatapotrebuje NGO. Not a commercial product.

**Core principle:** AI agents collect and score evidence. NGO humans approve before anything is published. Nothing goes live without human sign-off.

**MVP goal:** Working website with real scores for all registered candidates across 16 Phase 1 positions (estimated 60–96 total scorecards — exact count known after registration closes May/June 2026). Manual evidence entry (CAP-08) covers all pillars — SLOVÁ and SKUTKY — wherever AI agents are unavailable. AI automation is additive.

---

## TECH STACK

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + Tailwind + shadcn/ui (Lovable-generated) |
| Backend / DB | Supabase (PostgreSQL + Auth + Storage + Edge Functions) |
| AI agents | Anthropic Claude API (claude-sonnet-4-20250514) via Supabase Edge Functions |
| Hosting | Lovable hosting (dev); production TBD by NGO |
| AI coding tools | Lovable (UI), Antigravity (backend/agents), Claude Code (complex integrations) |

---

## FOLDER OWNERSHIP — DO NOT VIOLATE

```
Lovable owns:
  /src/components/
  /src/pages/
  /src/app/
  /src/hooks/
  /src/contexts/

Antigravity / Claude Code owns:
  /src/lib/
  /src/agents/
  /src/services/
  /supabase/
  /api/

Shared (coordinate before editing):
  /src/types/
  tailwind.config.ts
```

If you need to edit a file owned by another tool, state why in your commit message.

**Exception — Lovable migration write:** Lovable may write and apply the initial Supabase migration (`/supabase/migrations/001_initial_schema.sql`) and auto-generate `src/integrations/supabase/types.ts`. It must use REQUIREMENTS.md as the source of truth for the schema — not infer it from domain.ts or Dexie types. All subsequent Edge Functions and backend logic remain with Claude Code / Antigravity.

---

## BRANCH STRATEGY

- `main` — always reflects what is live on Lovable. Never push directly.
- `dev` — active development branch. All work goes here.
- Feature branches off `dev` for major capabilities (e.g. `feature/cap-07-scoring-engine`).

---

## DATABASE — SUPABASE SCHEMA

See `/supabase/migrations/` for full schema. Key tables:

```sql
candidates        -- id, name, photo_url, position, region, city, party, is_independent, year, state
scores            -- candidate_id, pillar1_score, pillar2_score, total_score, badge, badge_subtype,
                  -- formula_version, is_approved, approved_at, approved_by, version_number
programs          -- candidate_id, source_url, raw_text, raw_score, normalized_score, citations_json,
                  -- agent_version, confidence, processed_at
questionnaire_responses -- candidate_id, link_uuid, sent_at, responded_at, response_json,
                        -- questionnaire_score, status
votes             -- candidate_id, date, meeting_id, topic, vote_direction, points, source_url,
                  -- climate_relevance_tier, confidence
documented_actions -- candidate_id, action_type, date, description, points, source_url,
                   -- citation_text, climate_relevance_tier, entered_by, is_ai_generated
source_citations  -- candidate_id, pillar, source_type, url, citation_text, confidence,
                  -- climate_relevance_tier, date_accessed, reviewer_note
review_queue      -- candidate_id, status, ai_suggestion, adjustments_json, reviewer_id,
                  -- approved_at, approved_by
scoring_config    -- key, value, description (formula constants — not hardcoded)
```

---

## SCORING FORMULA — LOCKED (v1.0)

**Do not modify the formula without updating `formula_version` in scoring_config.**

```
KLIMA_SCORE = (SLOVÁ × 0.40) + (SKUTKY × 0.60)

MVP SLOVÁ  = (program_norm × 0.50) + (questionnaire_norm × 0.50)
Full SLOVÁ = (program_norm × 0.375) + (questionnaire_norm × 0.375) + (social_norm × 0.25)

SKUTKY = (votes_norm × 0.417) + (actions_norm × 0.583)
If votes_norm is null (new candidate with no council history):
  SKUTKY = actions_norm  (full weight shifts to documented actions)
```

**Normalisation — all components use absolute min/max:**
```
normalised = min(100, max(0, (raw − min_cap) / (max_cap − min_cap) × 100))

Caps (stored in scoring_config):
  program:       min = −35.30,  max = +17.31  (Carter et al. global range)
  questionnaire: min = 0,       max = 54      (NRSR 2023, PS achieved 54 pts)
  actions:       min = −10,     max = +15     (designed cap)
  votes:         min = −(n×2),  max = +(n×2)  (n = climate votes in council term)
```

**Badge thresholds:**
```
Green  ≥ 80%
Yellow ≥ 55%
Orange ≥ 30%
Red    < 30%
Grey   = insufficient data (see badge_subtype)
```

---

## CLIMATE RELEVANCE TIERS

Every evidence item MUST have `climate_relevance_tier`. **The tier is determined by how the candidate or council framed the action — not by the topic of the action.** The same vote on public transport or EV infrastructure can be Tier 1, Tier 2, or Tier 3 depending on whether the environmental connection appears in the source document or is inferred by the reviewer.

- **Tier 1 — Explicit:** The environmental connection is stated in the source document, vote proposal, or candidate's own statement. Environmental keywords (emisie, klíma, životné prostredie, CO2, obnoviteľné, or a measurable environmental target) appear in the source itself. Reviewer pastes verbatim citation from source. No additional justification required.

- **Tier 2 — Implicit:** The environmental connection is real and demonstrable, but the source document does not frame it in environmental terms. The reviewer makes the connection and MUST document it in `reviewer_note` — e.g. "Environmental connection: bus network expansion reduces private car modal share." This note is published publicly alongside the citation. `reviewer_note` is REQUIRED for all Tier 2 items; form cannot submit without it.

- **Tier 3 — Excluded:** No credible environmental connection — either not present or too indirect to document honestly. NOT scored. Stored in DB for transparency but excluded from all score computations. Requires secondary reviewer approval to reclassify to Tier 2.

**Example:** A cycling infrastructure vote with an explicit air quality citation in the proposal → Tier 1. The same vote with no environmental framing in the proposal → Tier 2 (reviewer documents the link). A general road resurfacing vote with no environmental dimension → Tier 3.

Tier 3 items are stored in DB but never included in score computations. This exclusion is enforced in CAP-07.

---

## CAP-08 SCOPE — ALL PILLARS

CAP-08 (Manual Evidence & Override System) covers **all pillars**, not just SKUTKY. Use it whenever any AI agent is unavailable, fails, or produces output needing correction:

- **SLOVÁ — Program:** manually enter program score/citations when CAP-02 fails to fetch or parse
- **SLOVÁ — Questionnaire:** ingest responses that arrive outside the submission form (email, post)
- **SLOVÁ — Social media:** manually add social media posts as evidence items (Phase 2)
- **SKUTKY — Council votes:** primary data entry path in MVP while CAP-03 is in pilot phase
- **SKUTKY — Documented actions:** enter all documented actions for all candidates

The evidence schema and DB structure are identical regardless of pillar. CAP-07 routes each evidence item to the correct pillar based on `source_type`.

---

## CANDIDATE STATE MACHINE

```
REGISTERED → DATA_COLLECTION → ANALYZED → IN_REVIEW → NEEDS_REVISION → APPROVED → PUBLISHED
```

State transitions are logged. Never skip states. Never go backward except NEEDS_REVISION → ANALYZED.

---

## GREY BADGE SUB-TYPES

One grey visual on public site. Sub-type stored in DB, shown as explanatory text in detail view only:
- `GREY_NO_DATA` — data still being collected
- `GREY_REFUSED` — questionnaire sent, no response, no voting history
- `GREY_NEW_CANDIDATE` — votes null AND actions < 2 items
- `GREY_LOW_CONFIDENCE` — overall_confidence < 0.40

---

## KEY CONSTRAINTS — NEVER VIOLATE

1. **No score published without human approval in CAP-06.** `is_approved` must be true.
2. **Every score point has a URL.** `source_citations.url` is required. No URL exception requires admin approval + uploaded scan.
3. **Tier 3 evidence items are never included in score computation.** Enforced in CAP-07.
4. **Tier 2 evidence items require `reviewer_note`.** Must explain the environmental connection. Published publicly. Form cannot submit without it.
5. **Legal disclaimer on every public scorecard:** "Toto hodnotenie nie je odporúčaním na hlasovanie."
6. **Social media note on every MVP scorecard:** "Hodnotenie sociálnych sietí bude doplnené v ďalšej fáze."
7. **All registered candidates in all 16 Phase 1 positions are always visible**, even if Grey. No selective coverage. Number of candidates per position is variable and unknown until registration closes.
8. **Questionnaire responses are published verbatim, unedited.**
9. **Claude API key is in Supabase Vault only.** Never in source code, never in client-side code.

---

## LANGUAGE

- Public-facing UI: **Slovak throughout**
- No English acronyms in voter-facing copy (no "net zero", "NDC", "IPCC", "carbon footprint")
- Admin dashboard: Slovak preferred, English acceptable for technical labels
- Code: English

---

## MVP SCOPE — WHAT IS IN AND OUT

**IN:**
- Public website with badge, pillar bars, citations, methodology page
- Scoring engine (CAP-07)
- Manual evidence entry for all pillars — SLOVÁ and SKUTKY (CAP-08)
- Review/approval dashboard (CAP-06)
- AI program + questionnaire analysis (CAP-02)
- Questionnaire submission acceptance (CAP-05 lite)

**OUT (Phase 2):**
- Candidate comparison view
- In-platform appeals system
- Evidence density indicator
- OG image generation
- Bulk CSV/JSON import
- Questionnaire reminders + state machine (CAP-05 full)
- Social media agent (CAP-04)
- CAP-03 full automation

---

## FULL REQUIREMENTS

See `REQUIREMENTS.md` for complete capability specifications.
See `/docs/` for Initiative v5 and Capabilities v5 documents.
