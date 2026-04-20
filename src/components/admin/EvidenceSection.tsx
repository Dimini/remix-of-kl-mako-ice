import { useState, useCallback } from "react";
import { Pencil, Plus, Trash2, ExternalLink } from "lucide-react";

import type { EvidenceRecord } from "@/lib/repository/types";
import { adminEvidenceRepo } from "@/lib/repository/adminCandidates";
import { getEvidenceType, PILLAR_FOR_SOURCE } from "@/lib/evidenceTypes";
import { EvidenceForm } from "@/components/admin/EvidenceForm";
import { useSupabaseQuery } from "@/hooks/useSupabaseQuery";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge as UiBadge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";

interface EvidenceSectionProps {
  candidateId: string;
}

export function EvidenceSection({ candidateId }: EvidenceSectionProps) {
  const [editing, setEditing] = useState<EvidenceRecord | null>(null);
  const [creating, setCreating] = useState(false);

  const fetcher = useCallback(
    () => adminEvidenceRepo.listByCandidate(candidateId),
    [candidateId],
  );
  const { data, refetch } = useSupabaseQuery(fetcher, [candidateId], [
    "source_citations",
    "documented_actions",
    "votes",
    "programs",
  ]);
  const items = data ?? [];

  const slova = items.filter((i) => i.pillar === "slova");
  const skutky = items.filter((i) => i.pillar === "skutky");

  async function remove(id: string) {
    if (!confirm("Zmazať tento dôkaz?")) return;
    await adminEvidenceRepo.remove(id);
    toast({ title: "Zmazané", description: "Dôkaz bol odstránený." });
    refetch();
  }

  const showForm = creating || editing !== null;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <div>
          <h2 className="font-semibold">Dôkazy</h2>
          <p className="text-sm text-muted-foreground">
            SLOVÁ · {slova.length} &nbsp;|&nbsp; SKUTKY · {skutky.length}
          </p>
        </div>
        {!showForm && (
          <Button onClick={() => setCreating(true)} size="sm">
            <Plus className="w-4 h-4 mr-1" /> Pridať dôkaz
          </Button>
        )}
      </div>

      {showForm && (
        <div className="mb-6">
          <EvidenceForm
            candidateId={candidateId}
            initial={editing ?? undefined}
            onSaved={() => {
              setCreating(false);
              setEditing(null);
              refetch();
            }}
            onCancel={() => {
              setCreating(false);
              setEditing(null);
            }}
          />
        </div>
      )}

      <Tabs defaultValue="slova">
        <TabsList>
          <TabsTrigger value="slova">SLOVÁ ({slova.length})</TabsTrigger>
          <TabsTrigger value="skutky">SKUTKY ({skutky.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="slova">
          <EvidenceList items={slova} onEdit={setEditing} onDelete={remove} />
        </TabsContent>
        <TabsContent value="skutky">
          <EvidenceList items={skutky} onEdit={setEditing} onDelete={remove} />
        </TabsContent>
      </Tabs>
    </Card>
  );
}

interface EvidenceListProps {
  items: EvidenceRecord[];
  onEdit: (e: EvidenceRecord) => void;
  onDelete: (id: string) => void;
}

function EvidenceList({ items, onEdit, onDelete }: EvidenceListProps) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-6 text-center">
        Žiadne dôkazy. Pridajte prvý cez tlačidlo vyššie.
      </p>
    );
  }
  return (
    <ul className="divide-y">
      {items.map((ev) => {
        const def = ev.evidenceType ? getEvidenceType(ev.evidenceType) : undefined;
        const tierVariant =
          ev.climateRelevanceTier === 1
            ? "default"
            : ev.climateRelevanceTier === 2
              ? "secondary"
              : "destructive";
        return (
          <li key={ev.id} className="py-3 flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap text-sm">
                <UiBadge variant="outline">{PILLAR_FOR_SOURCE[ev.sourceType].toUpperCase()}</UiBadge>
                <span className="font-medium">{def?.label ?? ev.evidenceType ?? ev.sourceType}</span>
                <UiBadge variant={tierVariant}>Tier {ev.climateRelevanceTier}</UiBadge>
                {ev.pillar === "skutky" && ev.pointValue != null && (
                  <span className="font-mono text-xs">
                    {ev.pointValue > 0 ? "+" : ""}{ev.pointValue} b.
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{ev.citationText}</p>
              {ev.reviewerNote && (
                <p className="text-xs italic text-muted-foreground mt-1">
                  Pozn.: {ev.reviewerNote}
                </p>
              )}
              <a
                href={ev.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center text-xs text-primary hover:underline mt-1"
              >
                Zdroj <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </div>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" onClick={() => onEdit(ev)} aria-label="Upraviť">
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onDelete(ev.id)}
                className="text-destructive"
                aria-label="Zmazať"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
