import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plus, Sparkles, Trash2 } from "lucide-react";
import { seedFromMock, clearAllAdminData } from "@/lib/seed";
import { STATE_LABELS } from "@/lib/stateMachine";
import { getKraj } from "@/lib/krajs";
import { toast } from "@/hooks/use-toast";
import { adminCandidatesRepo } from "@/lib/repository/adminCandidates";
import { useSupabaseQuery } from "@/hooks/useSupabaseQuery";

export default function AdminCandidatesList() {
  const [busy, setBusy] = useState(false);

  const fetcher = useCallback(() => adminCandidatesRepo.list(), []);
  const { data: candidates, refetch } = useSupabaseQuery(fetcher, [], ["candidates"]);

  async function handleSeed() {
    setBusy(true);
    try {
      const { inserted, skipped } = await seedFromMock();
      toast({
        title: "Seed dokončený",
        description: `Pridaných ${inserted}, preskočených ${skipped} (už existujú).`,
      });
      refetch();
    } catch (e) {
      toast({
        title: "Chyba pri seedovaní",
        description: e instanceof Error ? e.message : String(e),
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  }

  async function handleClear() {
    if (!confirm("Vymazať VŠETKÝCH kandidátov a dôkazy z databázy?")) return;
    setBusy(true);
    try {
      await clearAllAdminData();
      toast({ title: "Vymazané", description: "Databáza je prázdna." });
      refetch();
    } catch (e) {
      toast({
        title: "Chyba",
        description: e instanceof Error ? e.message : String(e),
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  }

  const total = candidates?.length ?? 0;
  const approved = candidates?.filter((c) => c.isApproved).length ?? 0;
  const pct = total === 0 ? 0 : Math.round((approved / total) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kandidáti</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kandidáti sú v Supabase. Po schválení a prechode do stavu PUBLISHED sa zobrazia na verejnej stránke.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleSeed} disabled={busy}>
            <Sparkles className="w-4 h-4 mr-1" /> Seed z mock dát
          </Button>
          {total > 0 && (
            <Button variant="ghost" onClick={handleClear} disabled={busy} className="text-destructive">
              <Trash2 className="w-4 h-4 mr-1" /> Vyčistiť
            </Button>
          )}
          <Button asChild>
            <Link to="/admin/candidate/new"><Plus className="w-4 h-4 mr-1" /> Nový kandidát</Link>
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-2 text-sm">
          <span className="font-medium">Postup schvaľovania</span>
          <span className="text-muted-foreground">
            {approved} of {total} candidates approved
          </span>
        </div>
        <Progress value={pct} />
      </Card>

      <Card className="overflow-hidden">
        {total === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            Zatiaľ žiadni kandidáti. Použite tlačidlo „Nový kandidát" alebo „Seed z mock dát" vyššie.
          </div>
        ) : (
          <>
            {/* Mobile: card list */}
            <ul className="md:hidden divide-y">
              {candidates?.map((c) => {
                const kraj = getKraj(c.krajId);
                return (
                  <li key={c.id} className="p-4 hover:bg-accent/30">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          to={`/admin/candidate/${c.id}`}
                          className="text-primary hover:underline font-medium block truncate"
                        >
                          {c.name}
                        </Link>
                        <div className="text-xs text-muted-foreground truncate">{c.party}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {c.position === "zupan" ? "Župan" : "Primátor"} · {kraj?.name ?? c.krajId}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs text-muted-foreground">{STATE_LABELS[c.state]}</div>
                        <div className="text-sm mt-1">{c.isApproved ? "✓" : "—"}</div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* Desktop: table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="text-left px-4 py-2 font-medium">Meno</th>
                    <th className="text-left px-4 py-2 font-medium">Pozícia</th>
                    <th className="text-left px-4 py-2 font-medium">Kraj</th>
                    <th className="text-left px-4 py-2 font-medium">Stav</th>
                    <th className="text-left px-4 py-2 font-medium">Schválené</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates?.map((c) => {
                    const kraj = getKraj(c.krajId);
                    return (
                      <tr key={c.id} className="border-t hover:bg-accent/30">
                        <td className="px-4 py-2">
                          <Link to={`/admin/candidate/${c.id}`} className="text-primary hover:underline">
                            {c.name}
                          </Link>
                          <div className="text-xs text-muted-foreground">{c.party}</div>
                        </td>
                        <td className="px-4 py-2">{c.position === "zupan" ? "Župan" : "Primátor"}</td>
                        <td className="px-4 py-2">{kraj?.name ?? c.krajId}</td>
                        <td className="px-4 py-2"><span className="text-xs">{STATE_LABELS[c.state]}</span></td>
                        <td className="px-4 py-2">{c.isApproved ? "✓" : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
