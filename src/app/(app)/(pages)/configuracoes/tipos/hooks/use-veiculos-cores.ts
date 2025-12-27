"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export type CorFromApi = {
  id: number;
  nome: string;
  ativo: boolean;
};

export function useVeiculosCores() {
  const [cores, setCores] = useState<CorFromApi[]>([]);
  const [loadingCores, setLoadingCores] = useState(false);
  const [errorCores, setErrorCores] = useState<string | null>(null);

  useEffect(() => {
    const fetchUnidades = async () => {
      try {
        setLoadingCores(true);
        setErrorCores(null);

        const res = await axios.get("/api/tipos/cores-veiculos?somenteAtivas=1");
        const items: CorFromApi[] = res.data?.items ?? [];
        setCores(items.filter((u) => u.ativo));
      } catch (err) {
        console.error("Erro ao carregar grupos:", err);
        setErrorCores("Erro ao carregar grupos");
      } finally {
        setLoadingCores(false);
      }
    };

    fetchUnidades();
  }, []);

  return { cores, loadingCores, errorCores };
}
