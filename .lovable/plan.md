

## Diagnóza — čo logy skutočne hovoria

Najnovší log (timestamp 1776700065733) ukazuje presnú chybu:

```
[analyze-program] Error: ANTHROPIC_API_KEY contains invalid header characters
    at getAnthropicApiKey (index.ts:385:13)
    at analyzeWithClaude (index.ts:220:18)
```

**Claude API nebol nikdy zavolaný** — funkcia padne PREDTÝM, ako sa vôbec dostane k `fetch()`. Preto v Anthropic console nevidíš žiadny request.

Sanitizácia headeru (`toHeaderValue`) funguje — ale `ANTHROPIC_API_KEY` v Supabase secrets obsahuje nejaký neviditeľný znak (pravdepodobne newline na konci, BOM, alebo smart-quote) a po sanitizácii buď zostane prázdny, alebo sa throw-uje chyba. Gemini hypotézy (chýbajúci beta header, NaN v DB) sú validné pre neskôr, ale teraz sú irelevantné — funkcia sa tam vôbec nedostane.

## Ako si sám overíš deploy

**1. Supabase Dashboard → Edge Functions → analyze-program → Logs**
   - [Edge Function logs](https://supabase.com/dashboard/project/goitfsbsmrfhzhhqttzx/functions/analyze-program/logs)
   - Hľadaj riadok `[analyze-program] boot v2 — SDK removed` — ak tam je, nová verzia beží
   - Pod logmi je aj "Deployments" záložka s časmi nasadenia a verziou

**2. Git** — kód v repo je zdroj pravdy pre to, ČO by malo byť nasadené. Lovable po každej zmene automaticky deployuje. Ak chceš overiť, že deploy prešiel, skontroluj v Supabase Dashboard čas posledného deploymentu vs. čas tvojho commitu.

**3. Anthropic Console** — ak tam nevidíš request, Claude API nebol volaný. To znamená, že funkcia padá PRED volaním (presne náš prípad).

## Plán opravy

### Krok 1 — Opraviť `ANTHROPIC_API_KEY` secret (manuálne, ty)

Toto je najpravdepodobnejšia príčina. Secret obsahuje neviditeľný znak.

- Choď na [Edge Function secrets](https://supabase.com/dashboard/project/goitfsbsmrfhzhhqttzx/settings/functions)
- Zmaž `ANTHROPIC_API_KEY`
- Skopíruj kľúč znova z [Anthropic Console](https://console.anthropic.com/settings/keys) — **dôležité: skopíruj ho do čistého text editora (napr. Notepad bez formátovania, alebo `pbpaste | cat -A` na Macu), vymaž case-sensitive whitespace, a vlož bez záverečného newline**
- Ulož znova

### Krok 2 — Pridať agresívne diagnostické logy (urobím ja)

Pridám logy, ktoré pomôžu pinpointnúť ďalšie problémy bez toho, aby si musel hádať:

1. **V `getAnthropicApiKey`**: log raw length, sanitized length, počet stripnutých znakov, prvé/posledné 4 znaky sanitized kľúča (bezpečné — nepublikuje tajomstvo)
2. **V `Deno.serve` handleri**: log body payload, candidate_id, zdroj (URL vs storage)
3. **V `extractPdfText`**: log byte size, výsledná dĺžka textu, letterCount
4. **Pred/po Claude API call**: log chunk count, chunk sizes, HTTP status, response length
5. **Okolo Supabase upsert**: log payload shape (bez `raw_text`), error detail

### Krok 3 — Stabilizovať error handling (Gemini hypotézy)

Preventívne, aj keď teraz nie sú príčinou:

- Pridať `anthropic-beta` header v `analyzeChunk` pre `max_tokens: 8192`
- Defensive fallbacks `s.specificity ?? 0`, `s.local_relevance ?? 0.5`
- Wrapnúť `cErr`/`uErr` do `Response` objektov namiesto raw throw
- Zosilniť `isValidShape` — validovať aj typy vnútri `sentences[]`

### Krok 4 — Ako testovať po častiach

Po deploy-i máš 3 rýchle spôsoby:

**A) Edge Function logs v reálnom čase** — [odkaz vyššie]. Otvor a nahraj PDF — logy sa objavia do 2–3 sekúnd.

**B) Curl priamo** — pošlem testovací request cez `supabase--curl_edge_functions` s malým JSON payloadom (len `candidate_id` + short `program_url`), nie cez UI. Tým obídeme celý admin frontend a vidíme presnú odpoveď.

**C) Izolované sekcie** — logy v Kroku 2 sú postavené tak, že každá sekcia (auth → body parse → candidate fetch → PDF download → extract → Claude → upsert) má vlastný log prefix. Ak niekde padne, hneď vieš kde.

### Krok 5 — Overenie

Po deployi:
1. Ty nahráš SMER PDF v admin UI
2. Ja pozriem logy a reportnem presne, kde (ak) padlo
3. Ak všetko prejde → uvidíš v Anthropic console request

## Čo od teba potrebujem teraz

Prosím potvrď Krok 1 (obnovenie `ANTHROPIC_API_KEY`) — to je pravdepodobne jediné, čo treba urobiť manuálne. Krok 2–3 spravím ja po tvojom approve plánu.

