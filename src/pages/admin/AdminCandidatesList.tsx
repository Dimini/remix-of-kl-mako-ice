import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db } from "@/lib/db/dexie";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plus } from "lucide-react";

export default function AdminCandidatesList() {
  const candidates = useLiveQuery(() => db.candidates.toArray(), [], []);
  const total = candidates?.length ?? 0;
  const approved = candidates?.filter((c) => c.isApproved).length ?? 0;
  const pct = total === 0 ? 0 : Math.round((approved / total) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kandidáti</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Lokálna evidencia kandidátov. Po uzávierke registrácie a schválení sa publikujú na verejnú stránku.
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/candidate/new"><Plus className="w-4 h-4 mr-1" /> Nový kandidát</Link>
        </Button>
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
            Zatiaľ žiadni kandidáti. Použite tlačidlo „Nový kandidát" vyššie.
            <p className="mt-2 text-xs">(Phase B pridáva CRUD formuláre.)</p>
          </div>
        ) : (
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
              {candidates?.map((c) => (
                <tr key={c.id} className="border-t hover:bg-accent/30">
                  <td className="px-4 py-2">
                    <Link to={`/admin/candidate/${c.id}`} className="text-primary hover:underline">
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2">{c.position}</td>
                  <td className="px-4 py-2">{c.krajId}</td>
                  <td className="px-4 py-2"><span className="text-xs font-mono">{c.state}</span></td>
                  <td className="px-4 py-2">{c.isApproved ? "✓" : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
