import { useCallback } from "react";
import { RefreshCw, Save } from "lucide-react";

import { computeScore, meanConfidence } from "@/lib/scoring/computeScore";
import { adminCandidatesRepo, adminEvidenceRepo } from "@/lib/repository/adminCandidates";
import { logAudit } from "@/lib/audit";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useSupabaseQuery } from "@/hooks/useSupabaseQuery";
import { supabase } from "@/integrations/supabase/client";
import { QUESTIONNAIRE_MAX_SCORE, QUESTIONNAIRE_MIN_SCORE } from "@/lib/scoring/questionnaireCaps";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge as UiBadge } from "@/components/ui/badge";
import { PillarBar } from "@/components/klima/PillarBar";
import { CandidateBadge } from "@/components/klima/CandidateBadge";
import { toast } from "@/hooks/use-toast";

interface ScorePreviewProps {
  candidateId: string;
}

interface ProgramMeta {
  totalSentences?: number;
  proCount?: number;
  antiCount?: number;
  neutralCount?: number;
  tier1Count?: number;
  tier2Count?: number;
  tier3Count?: number;
  proPercent?: number;
  antiPercent?: number;
  rawCarter?: number;
  effectivePro?: number;
  effectiveAnti?: number;
}

interface ProgramRow {
  normalized_score: number | null;
  raw_score: number | null;
  confidence: number | null;
  citations_json: unknown;
  agent_version: string | null;
  processed_at: string | null;
  source_url: string;
}

interface QuestionnaireMeasure {
  measure_text: string;
  points: 1 | -1;
  local_relevance: 1.0 | 0.5;
  tier: 1 | 2;
  citation: string;
  reviewer_note: string | null;
}

interface QuestionnaireMeta {
  totalMeasures?: number;
  tier1Count?: number;
  tier2Count?: number;
  rawTotal?: number;
}

interface QuestionnaireRow {
  questionnaire_score: number | null;
  analysis_json: unknown;
  agent_version: string | null;
  processed_at: string | null;
  status: string;
}

interface QuestionnaireDebug {
  meta: QuestionnaireMeta;
  proCount: number;
  antiCount: number;
  proLocal: number;
  antiLocal: number;
  effectivePro: number;
  effectiveAnti: number;
}

function readProgramMeta(row: ProgramRow | null): ProgramMeta | null {
  if (!row?.citations_json) return null;
  const cj = row.citations_json as { meta?: ProgramMeta } | unknown[];
  if (Array.isArray(cj)) return null; // legacy: plain array, no meta
  return cj?.meta ?? null;
}

function readQuestionnaireDebug(row: QuestionnaireRow | null): QuestionnaireDebug | null {
  if (!row?.analysis_json) return null;
  const aj = row.analysis_json as { meta?: QuestionnaireMeta; measures?: QuestionnaireMeasure[] };
  const measures = Array.isArray(aj?.measures) ? aj.measures : [];
  const pro = measures.filter((m) => m.points === 1);
  const anti = measures.filter((m) => m.points === -1);
  const effectivePro = pro.reduce((s, m) => s + m.points * (m.local_relevance ?? 0.5), 0);
  const effectiveAnti = anti.reduce((s, m) => s + m.points * (m.local_relevance ?? 0.5), 0);
  return {
    meta: aj?.meta ?? {},
    proCount: pro.length,
    antiCount: anti.length,
    proLocal: pro.filter((m) => m.local_relevance === 1.0).length,
    antiLocal: anti.filter((m) => m.local_relevance === 1.0).length,
    effectivePro: Math.round(effectivePro * 100) / 100,
    effectiveAnti: Math.round(effectiveAnti * 100) / 100,
  };
}

export function ScorePreview({ candidateId }: ScorePreviewProps) {
  const { reviewer, user } = useAdminAuth();

  const candFetcher = useCallback(() => adminCandidatesRepo.getById(candidateId), [candidateId]);
  const evFetcher = useCallback(() => adminEvidenceRepo.listByCandidate(candidateId), [candidateId]);
  const programFetcher = useCallback(async (): Promise<ProgramRow | null> => {
    const { data, error } = await supabase
      .from("programs")
      .select("normalized_score, raw_score, confidence, citations_json, agent_version, processed_at, source_url")
      .eq("candidate_id", candidateId)
      .maybeSingle();
    if (error) throw error;
    return data;
  }, [candidateId]);
  const questionnaireFetcher = useCallback(async (): Promise<QuestionnaireRow | null> => {
    const { data, error } = await supabase
      .from("questionnaire_responses")
      .select("questionnaire_score, analysis_json, agent_version, processed_at, status")
      .eq("candidate_id", candidateId)
      .maybeSingle();
    if (error) throw error;
    return data;
  }, [candidateId]);

  const { data: candidate } = useSupabaseQuery(candFetcher, [candidateId], ["candidates"]);
  const { data: evidenceData } = useSupabaseQuery(evFetcher, [candidateId], [
    "source_citations", "documented_actions", "votes", "programs",
  ]);
  const { data: programRow } = useSupabaseQuery(programFetcher, [candidateId], ["programs"]);
  const { data: questionnaireRow } = useSupabaseQuery(questionnaireFetcher, [candidateId], ["questionnaire_responses"]);
  const evidence = evidenceData ?? [];

  if (!candidate) return null;

  const result = computeScore({
    evidence,
    isNewCandidate: !candidate.incumbent,
    overallConfidence: meanConfidence(evidence),
    questionnaireResponded: candidate.questionnaireResponded,
    questionnaireRawScore: questionnaireRow?.questionnaire_score ?? undefined,
  });

  const { debug, ...score } = result;

  // Prefer the AI agent's own normalized program score (Carter Method) when
  // present. computeScore's `programNorm` is a confidence-weighted heuristic
  // for manually entered evidence and would overestimate program scores.
  const aiProgramNorm =
    programRow?.normalized_score !== null && programRow?.normalized_score !== undefined
      ? Math.round(Number(programRow.normalized_score) * 10) / 10
      : null;
  const programNormFinal = aiProgramNorm ?? score.programNorm;
  const programMeta = readProgramMeta(programRow ?? null);
  const questionnaireDebug = readQuestionnaireDebug(questionnaireRow ?? null);

  // Recompute slova with the AI program score so total reflects Carter.
  const slovaFinal = (() => {
    const parts: number[] = [];
    if (programNormFinal !== null && programNormFinal !== undefined) parts.push(programNormFinal);
    if (score.questionnaireNorm !== null && score.questionnaireNorm !== undefined) parts.push(score.questionnaireNorm);
    if (parts.length === 0) return null;
    return Math.round((parts.reduce((s, v) => s + v, 0) / parts.length) * 10) / 10;
  })();

  const totalFinal = (() => {
    if (slovaFinal === null && score.skutky === null) return null;
    if (slovaFinal === null) return score.skutky;
    if (score.skutky === null) return slovaFinal;
    return Math.round((slovaFinal * 0.4 + score.skutky * 0.6) * 10) / 10;
  })();

  async function handleSave() {
    // Determine next version_number (avoid 23505 unique violation).
    const { data: latest, error: verErr } = await supabase
      .from("scores")
      .select("version_number")
      .eq("candidate_id", candidateId)
      .order("version_number", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (verErr) {
      toast({ title: "Chyba pri načítaní verzie", description: verErr.message, variant: "destructive" });
      return;
    }
    const nextVersion = (latest?.version_number ?? 0) + 1;

    // Demote all previous approved scores so only the newest is public.
    const { error: demoteErr } = await supabase
      .from("scores")
      .update({ is_approved: false })
      .eq("candidate_id", candidateId)
      .eq("is_approved", true);
    if (demoteErr) {
      toast({ title: "Chyba pri deaprobovaní", description: demoteErr.message, variant: "destructive" });
      return;
    }

    const nowIso = new Date().toISOString();
    const { error } = await supabase.from("scores").insert({
      candidate_id: candidateId,
      version_number: nextVersion,
      pillar1_score: slovaFinal,
      pillar2_score: score.skutky,
      total_score: totalFinal,
      badge: score.badge,
      badge_subtype: score.badgeSubtype ?? null,
      formula_version: score.formulaVersion,
      is_approved: true,
      approved_at: nowIso,
      approved_by: user?.id ?? null,
    });
    if (error) {
      toast({ title: "Chyba pri ukladaní skóre", description: error.message, variant: "destructive" });
      return;
    }
    await logAudit({
      candidateId,
      reviewer: reviewer || "neznámy",
      action: "SCORE_SAVED",
      note: `total=${totalFinal ?? "—"} badge=${score.badge}`,
    });
    toast({
      title: "Skóre uložené",
      description: `Total: ${totalFinal ?? "—"} / 100 · ${score.badge.toUpperCase()}`,
    });
  }

  return (
    <Card className="p-6 space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-semibold">Náhľad skóre</h2>
          <p className="text-sm text-muted-foreground">
            Prepočítava sa živo z dôkazov. Tier 3 položky sú vylúčené.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <UiBadge variant="secondary" className="gap-1">
            <RefreshCw className="w-3 h-3" /> Live
          </UiBadge>
          <Button size="sm" onClick={handleSave}>
            <Save className="w-4 h-4 mr-1" /> Uložiť skóre
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <CandidateBadge badge={score.badge} score={totalFinal} subtype={score.badgeSubtype} size="lg" />
        <div>
          <div className="text-3xl font-bold tabular-nums">
            {totalFinal !== null ? `${totalFinal}` : "—"}
            <span className="text-base text-muted-foreground font-normal"> / 100</span>
          </div>
          <div className="text-xs text-muted-foreground font-mono">
            formula {score.formulaVersion}
          </div>
        </div>
      </div>

      <PillarBar slova={slovaFinal} skutky={score.skutky} />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
        <SubScore label="Program (AI)" value={programNormFinal} />
        <SubScore label="Dotazník" value={score.questionnaireNorm} />
        <SubScore label="Sociálne (Fáza 2)" value={score.socialNorm} muted />
        <SubScore label="Hlasovania" value={score.votesNorm} />
        <SubScore label="Činy" value={score.actionsNorm} />
      </div>

      <details className="text-xs text-muted-foreground" open>
        <summary className="cursor-pointer font-medium">Debug — vstup do výpočtu</summary>
        <div className="mt-2 space-y-3">
          <div>
            <div className="font-semibold text-foreground mb-1">Evidence</div>
            <ul className="space-y-1 font-mono">
              <li>n (klimatické hlasovania) = {debug.n}</li>
              <li>raw votes = {debug.rawVotes}</li>
              <li>raw actions = {debug.rawActions}</li>
              <li>vylúčené Tier 3 = {debug.excludedTier3}</li>
              <li>program položky = {debug.programCount}</li>
              <li>dotazník položky = {debug.questionnaireCount}</li>
            </ul>
          </div>
          {programMeta && (
            <div>
              <div className="font-semibold text-foreground mb-1">Program — Carter Method</div>
              <ul className="space-y-1 font-mono">
                <li>celkom viet v dokumente = {programMeta.totalSentences ?? "—"}</li>
                <li>
                  pro-climate = {programMeta.proCount ?? "—"}
                  {programMeta.proPercent !== undefined && (
                    <span className="text-muted-foreground"> ({programMeta.proPercent}%)</span>
                  )}
                </li>
                <li>
                  anti-climate = {programMeta.antiCount ?? "—"}
                  {programMeta.antiPercent !== undefined && (
                    <span className="text-muted-foreground"> ({programMeta.antiPercent}%)</span>
                  )}
                </li>
                <li>neutral (vynechané) = {programMeta.neutralCount ?? "—"}</li>
                <li>Tier 1 / 2 / 3 = {programMeta.tier1Count ?? 0} / {programMeta.tier2Count ?? 0} / {programMeta.tier3Count ?? 0}</li>
                <li>effective pro (vážené) = {programMeta.effectivePro ?? "—"}</li>
                <li>effective anti (vážené) = {programMeta.effectiveAnti ?? "—"}</li>
                <li className="text-foreground">
                  raw Carter skóre (pro% − anti%) = {programMeta.rawCarter ?? "—"}
                </li>
                <li className="text-foreground">
                  normalizované (0–100) = {aiProgramNorm ?? "—"}
                </li>
                {programRow?.confidence !== null && programRow?.confidence !== undefined && (
                  <li>spoľahlivosť = {Number(programRow.confidence).toFixed(2)}</li>
                )}
                {programRow?.agent_version && (
                  <li className="text-[10px] opacity-70">agent: {programRow.agent_version}</li>
                )}
              </ul>
            </div>
          )}
          {questionnaireDebug && (
            <div>
              <div className="font-semibold text-foreground mb-1">Dotazník — NRSR rubrika</div>
              <ul className="space-y-1 font-mono">
                <li>celkom opatrení = {questionnaireDebug.meta.totalMeasures ?? "—"}</li>
                <li>
                  pro-climate (+1) = {questionnaireDebug.proCount}
                  <span className="text-muted-foreground"> ({questionnaireDebug.proLocal} lokálnych)</span>
                </li>
                <li>
                  anti-climate (−1) = {questionnaireDebug.antiCount}
                  <span className="text-muted-foreground"> ({questionnaireDebug.antiLocal} lokálnych)</span>
                </li>
                <li>Tier 1 / 2 = {questionnaireDebug.meta.tier1Count ?? 0} / {questionnaireDebug.meta.tier2Count ?? 0}</li>
                <li>effective pro (vážené local_relevance) = {questionnaireDebug.effectivePro}</li>
                <li>effective anti (vážené local_relevance) = {questionnaireDebug.effectiveAnti}</li>
                <li className="text-foreground">
                  raw NRSR skóre (Σ points × local_relevance) = {questionnaireDebug.meta.rawTotal ?? "—"}
                </li>
                <li className="text-foreground">
                  questionnaire_score (min: {QUESTIONNAIRE_MIN_SCORE}, max: {QUESTIONNAIRE_MAX_SCORE}) = {questionnaireRow?.questionnaire_score ?? "—"}
                </li>
                <li className="text-muted-foreground">
                  status = {questionnaireRow?.status ?? "—"}
                </li>
                {questionnaireRow?.agent_version && (
                  <li className="text-[10px] opacity-70">agent: {questionnaireRow.agent_version}</li>
                )}
              </ul>
            </div>
          )}
        </div>
      </details>
    </Card>
  );
}

function SubScore({ label, value, muted }: { label: string; value: number | null; muted?: boolean }) {
  return (
    <div className={muted ? "opacity-60" : ""}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-semibold tabular-nums">
        {value !== null ? `${value} / 100` : "—"}
      </div>
    </div>
  );
}
