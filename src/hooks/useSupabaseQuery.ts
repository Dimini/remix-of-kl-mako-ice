import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

// Tiny query+realtime wrapper. Re-fetches whenever any change lands on the
// subscribed table. `fetcher` should be stable (wrap in useCallback).
export function useSupabaseQuery<T>(
  fetcher: () => Promise<T>,
  deps: ReadonlyArray<unknown>,
  realtimeTables: string[] = [],
): { data: T | undefined; loading: boolean; refetch: () => void; error: Error | null } {
  const [data, setData] = useState<T | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const run = useCallback(async () => {
    try {
      setLoading(true);
      const r = await fetcherRef.current();
      setData(r);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    if (realtimeTables.length === 0) return;
    const channel = supabase.channel(`rt-${realtimeTables.join("-")}-${Math.random().toString(36).slice(2, 7)}`);
    for (const t of realtimeTables) {
      (channel.on as unknown as (e: string, f: object, cb: () => void) => void)(
        "postgres_changes",
        { event: "*", schema: "public", table: t },
        () => void run(),
      );
    }
    channel.subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [realtimeTables.join("|")]);

  return { data, loading, refetch: run, error };
}
