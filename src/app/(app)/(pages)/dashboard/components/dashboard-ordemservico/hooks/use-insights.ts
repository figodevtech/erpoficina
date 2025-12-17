"use client";

import * as React from "react";
import type { Insights } from "../lib/types";

export function useInsights(endpoint: string, autoRefreshMs?: number) {
  const [data, setData] = React.useState<Insights | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [animKey, setAnimKey] = React.useState(0);

  // Guarda o último endpoint usado para evitar double fetch no StrictMode
  const lastEndpointRef = React.useRef<string | null>(null);

  const fetcher = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(endpoint, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = (await res.json()) as Insights;
      setData(json);

      // incrementa animKey sempre que dados novos chegam com sucesso
      setAnimKey((prev) => prev + 1);
    } catch (e: any) {
      setError(e?.message ?? "Erro ao carregar insights");
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  // Evita double-fetch do StrictMode para o mesmo endpoint
  React.useEffect(() => {
    if (lastEndpointRef.current === endpoint) return;
    lastEndpointRef.current = endpoint;
    fetcher();
  }, [endpoint, fetcher]);

  // Auto refresh, se configurado
  React.useEffect(() => {
    if (!autoRefreshMs) return;
    const id = setInterval(fetcher, autoRefreshMs);
    return () => clearInterval(id);
  }, [autoRefreshMs, fetcher]);

  return { data, loading, error, refetch: fetcher, animKey };
}
