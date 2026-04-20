import { useState, type FormEvent } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock, AlertCircle } from "lucide-react";

export default function AdminLogin() {
  const { session, signIn, signUp, loading } = useAdminAuth();
  const location = useLocation() as { state?: { from?: string } };
  const redirectTo = location.state?.from ?? "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!loading && session) return <Navigate to={redirectTo} replace />;

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setInfo(null);
    const { error: err } = await signIn(email.trim(), password);
    setBusy(false);
    if (err) setError(err);
  };

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setInfo(null);
    const { error: err } = await signUp(email.trim(), password);
    setBusy(false);
    if (err) {
      setError(err);
    } else {
      setInfo(
        "Účet vytvorený. Skontrolujte e-mail pre potvrdenie. Po prihlásení je potrebné priradiť rolu reviewer/admin v Supabase (viď bootstrap pokyny v README)."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-semibold">Admin prístup</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Prihláste sa cez e-mail a heslo. Prístup do admin sekcie vyžaduje rolu
          <span className="font-medium"> reviewer </span>alebo
          <span className="font-medium"> admin</span>.
        </p>

        <Tabs defaultValue="signin">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="signin">Prihlásenie</TabsTrigger>
            <TabsTrigger value="signup">Registrácia</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="space-y-3 pt-3">
              <Input
                type="email"
                placeholder="email@klimatapotrebuje.sk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
              <Input
                type="password"
                placeholder="Heslo"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? "Prihlasujem…" : "Prihlásiť sa"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-3 pt-3">
              <Input
                type="email"
                placeholder="email@klimatapotrebuje.sk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="Heslo (min. 6 znakov)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? "Vytváram účet…" : "Vytvoriť účet"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        {error && (
          <div className="flex items-start gap-2 text-sm text-destructive">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {info && <p className="text-sm text-muted-foreground">{info}</p>}
      </Card>
    </div>
  );
}
