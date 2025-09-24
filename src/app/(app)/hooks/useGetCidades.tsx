import { useEffect, useState } from "react";

type Cidade = {
  id: number;
  nome: string;
};

export function useGetCidades(uf?: string) {
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!uf) {
      // Reseta quando não há UF selecionada
      setCidades([]);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchCidades = async () => {
      try {
        setLoading(true);
        setError(null);

        const resp = await fetch(
          `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`
        );

        if (!resp.ok) throw new Error("Erro ao buscar cidades");

        const data: Cidade[] = await resp.json();
        if (!cancelled) setCidades(data);
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchCidades();
    return () => {
      cancelled = true;
    };
  }, [uf]);

  return { cidades, loading, error };
}
