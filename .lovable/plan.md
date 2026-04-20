

## Next steps: wire the AI functions into the admin UI

Both edge functions (`analyze-program`, `score-candidate`) are **deployed and ready**, the `ANTHROPIC_API_KEY` is in Vault, and the DB constraints are in place. But there's currently **no UI to call them**, so you can't test them from the preview yet.

Two ways to test them — pick one (or do both):

### Option A — Test from the preview (recommended)

Add an **"AI nástroje"** card to the admin candidate detail page (`/admin/candidate/:id`) with two buttons:

1. **"Analyzovať program"** — opens a small dialog asking for a `program_url` (with the candidate's existing program URL pre-filled if any), then calls `supabase.functions.invoke('analyze-program', { body: { candidate_id, program_url } })`. Shows a loading spinner (~30–90 s while Claude analyses), then a toast with `normalizedScore`, `confidence`, and citation count. Refreshes the evidence section.

2. **"Prepočítať skóre"** — calls `supabase.functions.invoke('score-candidate', { body: { candidate_id } })`. Shows a toast with the new `version`, pillar scores, badge, and badge subtype. Refreshes the `ScorePreview` panel.

Both buttons:
- Disabled while running
- Show clear error toast on failure (parse the JSON `{ error }` body)
- Use the existing logged-in admin session — `supabase.functions.invoke` automatically attaches the JWT, which the edge functions verify via `verifyReviewerOrAdmin`

After this, you can test end-to-end in the preview:
1. Open a candidate in `/admin`
2. Click **Analyzovať program** with a real Slovak party program URL → wait → see citations appear in the Evidence section
3. Click **Prepočítať skóre** → see a new unapproved score row appear in `ScorePreview`
4. Approve it via the existing review flow → walk to PUBLISHED → verify it on the public region page

### Option B — Test directly without UI (faster smoke test)

I can call the deployed functions directly using `supabase--curl_edge_functions` against a real candidate ID from your seeded data, and report back the raw response + edge function logs. This proves the pipeline works without writing any UI code, but you can't trigger it from the preview yourself.

### Files I will create/modify (Option A)

- **Create** `src/components/admin/AIToolsPanel.tsx` — the card with both buttons + the program URL dialog
- **Modify** `src/pages/admin/AdminCandidateDetail.tsx` — render `<AIToolsPanel candidateId={existing.id} programUrl={…} />` near `ScorePreview`
- No DB changes, no new secrets, no edge function changes

### Recommendation

Do **both**: I'll run Option B first as a quick smoke test (so we know the deployed functions actually work end-to-end with Claude), then build Option A so you can use them from the preview going forward.

