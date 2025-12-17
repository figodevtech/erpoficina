"use client";

import * as React from "react";
import type { InsightsClientes } from "../lib/types";
import { INSIGHTS_INICIAIS } from "../lib/constants";

export function useInsightsClientes(endpoint: string, autoRefreshMs?: number) {
  const [dados, setDados] = React.useState<InsightsClientes | undefined>(undefined);
  const [carregando, setCarregando] = React.useState(true);
  const [erro, setErro] = React.useState<string | null>(null);
  const [animKey, setAnimKey] = React.useState(0);

  const buscar = React.useCallback(async () => {
    try {
      setCarregando(true);
      setErro(null);

      const res = await fetch(endpoint, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = (await res.json()) as InsightsClientes;

      setDados(json);
      setAnimKey((k) => k + 1); // 👉 força reanimação dos gráficos
    } catch (e: any) {
      setErro(e?.message ?? "Erro ao carregar insights");
      setDados(INSIGHTS_INICIAIS);
      setAnimKey((k) => k + 1); // mesmo em erro/placeholder, reanima
    } finally {
      setCarregando(false);
    }
  }, [endpoint]);

  // primeira carga
  React.useEffect(() => {
    void buscar();
  }, [buscar]);

  // auto refresh
  React.useEffect(() => {
    if (!autoRefreshMs) return;
    const id = setInterval(buscar, autoRefreshMs);
    return () => clearInterval(id);
  }, [autoRefreshMs, buscar]);

  return { dados, carregando, erro, recarregar: buscar, animKey };
}
