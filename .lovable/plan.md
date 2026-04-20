

## Dokončenie fixu `analyze-program` + test

### Čo urobím

1. **Force redeploy `analyze-program`** — Edge logs potvrdzujú, že stále beží stará verzia s SDK volaním na riadku 302 (`TypeError: 'headers' is not a valid ByteString`). V `supabase/functions/analyze-program/index.ts` spravím kozmetickú zmenu, ktorá vynúti nové nasadenie:
   - Bump `AGENT_VERSION` z `-cap02-v1` na `-cap02-v2`
   - Pridám `console.log("[analyze-program] boot v2 — SDK removed")` na začiatok `Deno.serve` handlera pre diagnostiku v logoch

2. **Explicitný redeploy** cez `supabase--deploy_edge_functions` — zaistí, že nová verzia skutočne pôjde do runtime (nespoliehať sa na auto-deploy, ktorý zlyhal pri predošlých pokusoch).

3. **Overenie cez logy** — po deploye prečítam `supabase--edge_function_logs` a skontrolujem, či sa objavil `boot v2` riadok. Ak áno, nová verzia beží.

4. **Smoke test cez curl** — zavolám `analyze-program` s testovacím krátkym programom (verejne dostupné SMER URL alebo minimálny text) pomocou `supabase--curl_edge_functions`, aby som potvrdil, že `analyzeChunk` už nepadá na ByteString a Anthropic API odpovedá. Ak Claude vráti 401/429 (nedostatok kreditu), povieme ti presne — to už bude mimo technickej chyby.

5. **Report** — zhrniem výsledok: buď všetko OK a môžeš testovať v admin UI, alebo presnú chybu z Claude (kredit / rate limit / iné).

### Čo nerobím

- Žiadne zmeny DB, secretov, ani iných funkcií
- Žiadne zmeny v UI (`AIToolsPanel.tsx`)
- Neprepisujem logiku analýzy ani extrakcie PDF

### Fallback ak deploy znova zlyhá

Ak sa `boot v2` neobjaví v logoch ani po explicitnom `deploy_edge_functions`, skontrolujem prítomnosť `deno.lock` v `supabase/functions/` (známa príčina tichých deploy zlyhaní) a navrhnem ďalší krok.

