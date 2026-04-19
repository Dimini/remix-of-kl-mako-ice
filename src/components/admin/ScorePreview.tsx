import { useLiveQuery } from "dexie-react-hooks";
import { RefreshCw, Save } from "lucide-react";

import { db } from "@/lib/db/dexie";
import { computeScore, meanConfidence } from "@/lib/scoring/computeScore";
import { adminCandidatesRepo } from "@/lib/repository/adminCandidates";
import { logAudit } from "@/lib/audit";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge as UiBadge } from "@/components/ui/badge";
import { PillarBar } from "@/components/klima/PillarBar";
import { CandidateBadge } from "@/components/klima/CandidateBadge";
import { toast } from "@/hooks/use-toast";

interface ScorePreviewProps {
  candidateId: string;
}

// Live, read-only preview of the computed score for the candidate currently
// open in the admin detail view. Recomputes whenever evidence changes.
// "Uložiť skóre" persists the snapshot onto the candidate record so the
// public-facing surfaces (and the Phase G JSON export) see it.
export function ScorePreview({ candidateId }: ScorePreviewProps) {
  const { reviewer } = useAdminAuth();
  const candidate = useLiveQuery(() => db.candidates.get(candidateId), [candidateId]);
  const evidence =
    useLiveQuery(
      () => db.evidence.where("candidateId").equals(candidateId).toArray(),
      [candidateId],
    ) ?? [];

  if (!candidate) return null;

  const result = computeScore({
    evidence,
    isNewCandidate: !candidate.incumbent,
    overallConfidence: meanConfidence(evidence),
    questionnaireResponded: candidate.questionnaireResponded,
  });

  const { debug, ...score } = result;

  async function handleSave() {
    await adminCandidatesRepo.update(candidateId, { score });
    toast({
      title: "Skóre uložené",
      description: `Total: ${score.total ?? "—"} / 100 · ${score.badge.toUpperCase()}`,
    });
  }

  const stale =
    JSON.stringify(candidate.score) !== JSON.stringify(score);

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
          {stale && (
            <UiBadge variant="secondary" className="gap-1">
              <RefreshCw className="w-3 h-3" /> Neuložené
            </UiBadge>
          )}
          <Button size="sm" onClick={handleSave} disabled={!stale}>
            <Save className="w-4 h-4 mr-1" /> Uložiť skóre
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <CandidateBadge badge={score.badge} score={score.total} subtype={score.badgeSubtype} size="lg" />
        <div>
          <div className="text-3xl font-bold tabular-nums">
            {score.total !== null ? `${score.total}` : "—"}
            <span className="text-base text-muted-foreground font-normal"> / 100</span>
          </div>
          <div className="text-xs text-muted-foreground font-mono">
            formula {score.formulaVersion}
          </div>
        </div>
      </div>

      <PillarBar slova={score.slova} skutky={score.skutky} />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
        <SubScore label="Program" value={score.programNorm} />
        <SubScore label="Dotazník" value={score.questionnaireNorm} />
        <SubScore label="Sociálne (Fáza 2)" value={score.socialNorm} muted />
        <SubScore label="Hlasovania" value={score.votesNorm} />
        <SubScore label="Činy" value={score.actionsNorm} />
      </div>

      <details className="text-xs text-muted-foreground">
        <summary className="cursor-pointer font-medium">Debug — vstup do výpočtu</summary>
        <ul className="mt-2 space-y-1 font-mono">
          <li>n (klimatické hlasovania) = {debug.n}</li>
          <li>raw votes = {debug.rawVotes}</li>
          <li>raw actions = {debug.rawActions}</li>
          <li>vylúčené Tier 3 = {debug.excludedTier3}</li>
          <li>program položky = {debug.programCount}</li>
          <li>dotazník položky = {debug.questionnaireCount}</li>
        </ul>
      </details>
    </Card>
  );
}

function SubScore({
  label,
  value,
  muted,
}: {
  label: string;
  value: number | null;
  muted?: boolean;
}) {
  return (
    <div className={muted ? "opacity-60" : ""}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-semibold tabular-nums">
        {value !== null ? `${value} / 100` : "—"}
      </div>
    </div>
  );
}
