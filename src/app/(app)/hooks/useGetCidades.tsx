import { useEffect, useState } from "react";

type Cidade = {
  id: number;
  nome: string;
};

export function useGetCidades(uf?: string) {
  const [cidades, setCidades] = useState<Cidade[]>([]);
    
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);

  useEffect(() => {
     if (!uf) {
      setCidades([]);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchCidades = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`
        );

        if (!response.ok) {
          throw new Error("Erro ao buscar cidades");
        }

        const data: Cidade[] = await response.json();
        setCidades(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchCidades();
  }, [uf]);

  return { cidades, loading, error };
}
