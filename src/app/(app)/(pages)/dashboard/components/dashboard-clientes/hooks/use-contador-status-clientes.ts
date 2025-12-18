"use client";

import * as React from "react";
import type { RespostaContadorStatusClientes } from "../lib/types";
import { CONTADOR_STATUS_INICIAL } from "../lib/constants";

export function useContadorStatusClientes(endpoint: string, autoRefreshMs?: number) {
  const [dados, setDados] = React.useState<RespostaContadorStatusClientes>(CONTADOR_STATUS_INICIAL);
  const [carregando, setCarregando] = React.useState(true);
  const [erro, setErro] = React.useState<null | string>(null);

  const buscar = React.useCallback(async () => {
    try {
      setCarregando(true);
      setErro(null);

      const res = await fetch(endpoint, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = (await res.json()) as RespostaContadorStatusClientes;
      setDados(json);
    } catch (e: any) {
      setErro(e?.message ?? "Erro ao carregar");
      setDados(CONTADOR_STATUS_INICIAL);
    } finally {
      setCarregando(false);
    }
  }, [endpoint]);

  React.useEffect(() => void buscar(), [buscar]);

  React.useEffect(() => {
    if (!autoRefreshMs) return;
    const id = setInterval(buscar, autoRefreshMs);
    return () => clearInterval(id);
  }, [autoRefreshMs, buscar]);

  return { dados, carregando, erro, recarregar: buscar };
}
