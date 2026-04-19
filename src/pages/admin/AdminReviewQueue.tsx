import { useEffect, useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Inbox,
  RotateCcw,
  Send,
} from "lucide-react";

import { db } from "@/lib/db/dexie";
import { computeScore, meanConfidence } from "@/lib/scoring/computeScore";
import { logAudit } from "@/lib/audit";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { canTransition, STATE_LABELS } from "@/lib/stateMachine";
import { getKraj } from "@/lib/krajs";
import type { ScoreBreakdown } from "@/types/domain";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge as UiBadge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CandidateBadge } from "@/components/klima/CandidateBadge";
import { PillarBar } from "@/components/klima/PillarBar";
import { toast } from "@/hooks/use-toast";

// Reviewable states: candidates that need a human pass.
const REVIEWABLE = new Set(["ANALYZED", "IN_REVIEW", "NEEDS_REVISION"]);

interface Adjustments {
  programNorm: number | null;
  questionnaireNorm: number | null;
  votesNorm: number | null;
  actionsNorm: number | null;
}

const SUB_KEYS: Array<keyof Adjustments> = [
  "programNorm",
  "questionnaireNorm",
  "votesNorm",
  "actionsNorm",
];

const SUB_LABELS: Record<keyof Adjustments, string> = {
  programNorm: "Program",
  questionnaireNorm: "Dotazník",
  votesNorm: "Hlasovania",
  actionsNorm: "Činy",
};

function fromScore(s: ScoreBreakdown): Adjustments {
  return {
    programNorm: s.programNorm,
    questionnaireNorm: s.questionnaireNorm,
    votesNorm: s.votesNorm,
    actionsNorm: s.actionsNorm,
  };
}

function recomputePillars(adj: Adjustments) {
  const slovaParts: number[] = [];
  if (adj.programNorm !== null) slovaParts.push(adj.programNorm);
  if (adj.questionnaireNorm !== null) slovaParts.push(adj.questionnaireNorm);
  const slova = slovaParts.length === 0 ? null : slovaParts.reduce((s, n) => s + n, 0) / slovaParts.length;

  let skutky: number | null;
  if (adj.votesNorm === null && adj.actionsNorm === null) skutky = null;
  else if (adj.votesNorm === null) skutky = adj.actionsNorm;
  else if (adj.actionsNorm === null) skutky = adj.votesNorm;
  else skutky = adj.votesNorm * 0.417 + adj.actionsNorm * 0.583;

  let total: number | null;
  if (slova === null && skutky === null) total = null;
  else if (slova === null) total = skutky;
  else if (skutky === null) total = slova;
  else total = slova * 0.4 + skutky * 0.6;

  return {
    slova: slova === null ? null : Math.round(slova * 10) / 10,
    skutky: skutky === null ? null : Math.round(skutky * 10) / 10,
    total: total === null ? null : Math.round(total * 10) / 10,
  };
}

export default function AdminReviewQueue() {
  const { reviewer } = useAdminAuth();
  const all = useLiveQuery(() => db.candidates.toArray(), []) ?? [];
  const queue = useMemo(
    () => all.filter((c) => REVIEWABLE.has(c.state)).sort((a, b) => a.name.localeCompare(b.name)),
    [all],
  );

  const [cursor, setCursor] = useState(0);
  useEffect(() => {
    if (cursor >= queue.length) setCursor(0);
  }, [queue.length, cursor]);

  const candidate = queue[cursor];
  const evidence =
    useLiveQuery(
      () =>
        candidate
          ? db.evidence.where("candidateId").equals(candidate.id).toArray()
          : Promise.resolve([]),
      [candidate?.id],
    ) ?? [];

  // AI suggestion = pure recompute from evidence.
  const aiResult = candidate
    ? computeScore({
        evidence,
        isNewCandidate: !candidate.incumbent,
        overallConfidence: meanConfidence(evidence),
        questionnaireResponded: candidate.questionnaireResponded,
      })
    : null;

  const [adj, setAdj] = useState<Adjustments | null>(null);
  const [note, setNote] = useState("");

  // Reset adjustments when candidate changes.
  useEffect(() => {
    if (aiResult) {
      setAdj(fromScore(aiResult));
      setNote("");
    } else {
      setAdj(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidate?.id]);

  if (queue.length === 0) {
    return (
      <Card className="p-10 text-center space-y-2">
        <Inbox className="w-8 h-8 mx-auto text-muted-foreground" />
        <h1 className="text-lg font-semibold">Front je prázdny</h1>
        <p className="text-sm text-muted-foreground">
          Žiadni kandidáti vo fáze ANALYZED, IN_REVIEW ani NEEDS_REVISION.
        </p>
      </Card>
    );
  }

  if (!candidate || !aiResult || !adj) return null;

  const reviewerPillars = recomputePillars(adj);
  const kraj = getKraj(candidate.krajId);

  function changeAdj(key: keyof Adjustments, raw: string) {
    const v = raw.trim() === "" ? null : Number(raw);
    setAdj((prev) => (prev ? { ...prev, [key]: v === null || Number.isNaN(v) ? null : Math.max(0, Math.min(100, v)) } : prev));
  }

  function reset() {
    if (aiResult) setAdj(fromScore(aiResult));
  }

  function deltas(): Record<string, number | null> {
    const out: Record<string, number | null> = {};
    for (const k of SUB_KEYS) {
      const ai = aiResult![k];
      const rev = adj![k];
      if (ai === null && rev === null) continue;
      const d = (rev ?? 0) - (ai ?? 0);
      if (Math.abs(d) > 0.01) out[k] = Math.round(d * 10) / 10;
    }
    return out;
  }

  async function persistReviewerScore() {
    const finalScore: ScoreBreakdown = {
      ...aiResult!,
      programNorm: adj!.programNorm,
      questionnaireNorm: adj!.questionnaireNorm,
      votesNorm: adj!.votesNorm,
      actionsNorm: adj!.actionsNorm,
      slova: reviewerPillars.slova,
      skutky: reviewerPillars.skutky,
      total: reviewerPillars.total,
    };
    // Recompute badge from total via the same thresholds (without re-running grey logic — reviewer overrides).
    const t = reviewerPillars.total;
    if (t !== null) {
      finalScore.badge =
        t >= 80 ? "green" : t >= 55 ? "yellow" : t >= 30 ? "orange" : "red";
      finalScore.badgeSubtype = undefined;
    }
    await db.candidates.update(candidate.id, {
      score: finalScore,
      updatedAt: new Date().toISOString(),
    });
    const d = deltas();
    if (Object.keys(d).length > 0) {
      await logAudit({
        candidateId: candidate.id,
        reviewer: reviewer || "neznámy",
        action: "ADJUSTMENT",
        adjustments: d,
        note: note.trim() || undefined,
      });
    }
  }

  async function handleSendToReview() {
    const guard = canTransition(candidate.state, "IN_REVIEW");
    if (!guard.ok) {
      toast({ title: "Chyba", description: guard.reason, variant: "destructive" });
      return;
    }
    await persistReviewerScore();
    await db.candidates.update(candidate.id, { state: "IN_REVIEW" });
    await logAudit({
      candidateId: candidate.id,
      reviewer: reviewer || "neznámy",
      action: "STATE_CHANGE",
      fromState: candidate.state,
      toState: "IN_REVIEW",
    });
    toast({ title: "Odoslané do revízie", description: candidate.name });
  }

  async function handleApprove() {
    const guard = canTransition(candidate.state, "APPROVED");
    if (!guard.ok) {
      toast({ title: "Chyba", description: guard.reason, variant: "destructive" });
      return;
    }
    await persistReviewerScore();
    await db.candidates.update(candidate.id, { state: "APPROVED", isApproved: true });
    await logAudit({
      candidateId: candidate.id,
      reviewer: reviewer || "neznámy",
      action: "APPROVED",
      fromState: candidate.state,
      toState: "APPROVED",
      note: note.trim() || undefined,
    });
    toast({ title: "Schválené ✓", description: candidate.name });
  }

  async function handleNeedsRevision() {
    const guard = canTransition(candidate.state, "NEEDS_REVISION");
    if (!guard.ok) {
      toast({
        title: "Chyba",
        description: guard.reason ?? "Tento prechod je dostupný iba z IN_REVIEW.",
        variant: "destructive",
      });
      return;
    }
    if (!note.trim()) {
      toast({
        title: "Chýba poznámka",
        description: "Pri vrátení na úpravy uveďte dôvod v poznámke.",
        variant: "destructive",
      });
      return;
    }
    await db.candidates.update(candidate.id, {
      state: "NEEDS_REVISION",
      isApproved: false,
    });
    await logAudit({
      candidateId: candidate.id,
      reviewer: reviewer || "neznámy",
      action: "NEEDS_REVISION",
      fromState: candidate.state,
      toState: "NEEDS_REVISION",
      note: note.trim(),
    });
    toast({ title: "Vrátené na úpravy", description: candidate.name });
  }

  return (
    <div className="space-y-4">
      {/* Header / queue nav */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Front kontroly</h1>
          <p className="text-sm text-muted-foreground">
            {cursor + 1} z {queue.length} · {candidate.name} ·{" "}
            <Link to={`/admin/candidate/${candidate.id}`} className="text-primary hover:underline">
              otvoriť detail
            </Link>
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCursor((c) => (c - 1 + queue.length) % queue.length)}
            disabled={queue.length < 2}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCursor((c) => (c + 1) % queue.length)}
            disabled={queue.length < 2}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Candidate meta */}
      <Card className="p-4 flex items-center gap-3 flex-wrap">
        <UiBadge variant="secondary" className="font-mono">{candidate.state}</UiBadge>
        <span className="text-sm">{STATE_LABELS[candidate.state]}</span>
        <span className="text-sm text-muted-foreground">·</span>
        <span className="text-sm">{candidate.position === "zupan" ? "Župan" : "Primátor"}</span>
        <span className="text-sm text-muted-foreground">·</span>
        <span className="text-sm">{kraj?.name ?? candidate.krajId}</span>
        <span className="text-sm text-muted-foreground">·</span>
        <span className="text-sm">{candidate.party}</span>
      </Card>

      {/* Split panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* AI suggestion */}
        <Card className="p-5 space-y-4">
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
              AI návrh
            </div>
            <div className="text-sm text-muted-foreground">
              Vypočítané z dôkazov · formula {aiResult.formulaVersion}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CandidateBadge
              badge={aiResult.badge}
              score={aiResult.total}
              subtype={aiResult.badgeSubtype}
              size="lg"
            />
          </div>
          <PillarBar slova={aiResult.slova} skutky={aiResult.skutky} />
          <div className="grid grid-cols-2 gap-3 text-sm">
            {SUB_KEYS.map((k) => (
              <div key={k}>
                <div className="text-xs text-muted-foreground">{SUB_LABELS[k]}</div>
                <div className="font-semibold tabular-nums">
                  {aiResult[k] !== null ? `${aiResult[k]} / 100` : "—"}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Reviewer adjustments */}
        <Card className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                Úprava recenzentom
              </div>
              <div className="text-sm text-muted-foreground">
                Recenzent: <span className="text-foreground font-medium">{reviewer || "—"}</span>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={reset}>
              <RotateCcw className="w-4 h-4 mr-1" /> Reset
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <CandidateBadge
              badge={
                reviewerPillars.total === null
                  ? "grey"
                  : reviewerPillars.total >= 80
                    ? "green"
                    : reviewerPillars.total >= 55
                      ? "yellow"
                      : reviewerPillars.total >= 30
                        ? "orange"
                        : "red"
              }
              score={reviewerPillars.total}
              size="lg"
            />
          </div>
          <PillarBar slova={reviewerPillars.slova} skutky={reviewerPillars.skutky} />

          <div className="grid grid-cols-2 gap-3">
            {SUB_KEYS.map((k) => {
              const aiVal = aiResult[k];
              const revVal = adj[k];
              const delta =
                aiVal === null || revVal === null ? null : Math.round((revVal - aiVal) * 10) / 10;
              return (
                <div key={k}>
                  <Label className="text-xs">{SUB_LABELS[k]}</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={revVal ?? ""}
                    placeholder="—"
                    onChange={(e) => changeAdj(k, e.target.value)}
                  />
                  {delta !== null && delta !== 0 && (
                    <div
                      className={`text-xs mt-0.5 tabular-nums ${
                        delta > 0 ? "text-badge-green" : "text-badge-red"
                      }`}
                    >
                      {delta > 0 ? "+" : ""}{delta} vs AI
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div>
            <Label htmlFor="note" className="text-xs">
              Poznámka recenzenta {`(povinná pri vrátení na úpravy)`}
            </Label>
            <Textarea
              id="note"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Dôvod úpravy alebo požiadavky pre ďalšiu fázu zberu dát…"
            />
          </div>
        </Card>
      </div>

      {/* Action bar */}
      <Card className="p-4 flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm text-muted-foreground">
          {Object.keys(deltas()).length > 0
            ? `${Object.keys(deltas()).length} úprav vs AI`
            : "Bez úprav"}
        </div>
        <div className="flex flex-wrap gap-2">
          {candidate.state === "ANALYZED" && (
            <Button variant="outline" onClick={handleSendToReview}>
              <Send className="w-4 h-4 mr-1" /> Odoslať do revízie
            </Button>
          )}
          {candidate.state === "IN_REVIEW" && (
            <Button variant="outline" onClick={handleNeedsRevision} className="text-destructive">
              <RotateCcw className="w-4 h-4 mr-1" /> Vrátiť na úpravy
            </Button>
          )}
          {candidate.state === "IN_REVIEW" && (
            <Button onClick={handleApprove}>
              <Check className="w-4 h-4 mr-1" /> Schváliť a publikovať
            </Button>
          )}
          {candidate.state === "NEEDS_REVISION" && (
            <Button variant="outline" onClick={handleSendToReview}>
              <Send className="w-4 h-4 mr-1" /> Po úpravách späť do kontroly
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
