import { createClient } from "npm:@supabase/supabase-js@2";
import { createServiceClient } from "./db.ts";

export async function verifyReviewerOrAdmin(req: Request): Promise<string> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Response(
      JSON.stringify({ error: "Missing Authorization header" }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    );
  }
  const jwt = authHeader.slice(7);

  // Verify JWT via Supabase Auth (anon key client). Use getClaims() so that
  // asymmetric algorithms (ES256, RS256) from Supabase signing keys are
  // verified locally instead of being rejected by the legacy getUser() path.
  const anonClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { auth: { persistSession: false } },
  );
  const { data: claimsData, error: authErr } = await anonClient.auth.getClaims(jwt);
  const userId = claimsData?.claims?.sub;
  if (authErr || !userId) {
    throw new Response(
      JSON.stringify({ error: "Invalid or expired token" }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    );
  }

  // Role check via service client (reads user_roles bypassing RLS)
  const svc = createServiceClient();
  const [reviewerRes, adminRes] = await Promise.all([
    svc.rpc("has_role", { _user_id: userId, _role: "reviewer" }),
    svc.rpc("has_role", { _user_id: userId, _role: "admin" }),
  ]);

  if (reviewerRes.error && adminRes.error) {
    throw new Response(
      JSON.stringify({ error: "Role check failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
  if (!reviewerRes.data && !adminRes.data) {
    throw new Response(
      JSON.stringify({ error: "Forbidden: reviewer or admin role required" }),
      { status: 403, headers: { "Content-Type": "application/json" } },
    );
  }
  return user.id;
}
