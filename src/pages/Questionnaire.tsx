import { useParams } from "react-router-dom";

// Placeholder questionnaire form. Phase 8 will build the full form.
export default function Questionnaire() {
  const { uuid = "" } = useParams();
  return (
    <main className="container py-10 max-w-3xl">
      <h1 className="text-3xl font-black tracking-tight mb-4">
        Dotazník pre kandidáta
      </h1>
      <p className="text-muted-foreground mb-6">
        Tento formulár bude doplnený v ďalšej fáze. Vaše ID pozvánky:{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{uuid}</code>
      </p>
      <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
        Formulár v príprave. Po jeho zverejnení vám príde notifikácia na vašu
        registrovanú e-mailovú adresu.
      </div>
    </main>
  );
}
