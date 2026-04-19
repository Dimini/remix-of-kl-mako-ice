import { useState, type ReactNode } from "react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Lock } from "lucide-react";

// Wraps every /admin route. The questionnaire route (/dotaznik/:uuid) is NOT
// wrapped — candidates fill it without auth.
export function AdminGate({ children }: { children: ReactNode }) {
  const { unlocked, unlock, reviewer } = useAdminAuth();
  const [pw, setPw] = useState("");
  const [name, setName] = useState(reviewer);
  const [error, setError] = useState<string | null>(null);

  if (unlocked) return <>{children}</>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-semibold">Admin prístup</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Táto sekcia je určená pre redaktorov #klimatapotrebuje. Vaše meno sa pripája k auditnému záznamu.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) {
              setError("Zadajte meno recenzenta.");
              return;
            }
            const ok = unlock(pw, name);
            if (!ok) setError("Nesprávne heslo.");
          }}
          className="space-y-3"
        >
          <Input
            type="text"
            placeholder="Meno recenzenta"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError(null);
            }}
            autoFocus
          />
          <Input
            type="password"
            placeholder="Heslo"
            value={pw}
            onChange={(e) => {
              setPw(e.target.value);
              setError(null);
            }}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full">Odomknúť</Button>
        </form>
      </Card>
    </div>
  );
}
