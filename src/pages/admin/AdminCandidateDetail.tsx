import { useParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

// Placeholder — Phase B fills in the CRUD form + state machine controls,
// Phase C adds the evidence editor.
export default function AdminCandidateDetail() {
  const { id } = useParams();
  const isNew = id === "new";

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/admin"><ArrowLeft className="w-4 h-4 mr-1" /> Späť na zoznam</Link>
      </Button>
      <Card className="p-6">
        <h1 className="text-xl font-semibold">
          {isNew ? "Nový kandidát" : `Kandidát ${id}`}
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Detail kandidáta — formulár pribudne v Phase B (CRUD) a Phase C (evidencia).
        </p>
      </Card>
    </div>
  );
}
