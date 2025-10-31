"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { listarQuadro, QuadItem } from "../lib/api";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import OsTile from "./os-tile";
import EmptyColumn from "./emply-column";

function normStatus(s?: string | null) {
  if (!s) return "";
  return s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, "_")
    .toUpperCase();
}

const IS_ORCAMENTO = (s?: string | null) => {
  const ns = normStatus(s);
  return (
    ns === "ORCAMENTO" ||
    ns === "ORCAMENTO_RECUSADO" ||
    ns === "APROVACAO_ORCAMENTO" ||
    ns === "ORCAMENTO_APROVADO"
  );
};

export default function PainelAcompanhamento({
  finalizadas = "recentes",
  horasRecentes = 12,
}: {
  finalizadas?: "hoje" | "recentes";
  horasRecentes?: number;
}) {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [rawAguardando, setRawAguardando] = useState<QuadItem[]>([]);
  const [execucao, setExecucao] = useState<QuadItem[]>([]);
  const [faturamento, setFaturamento] = useState<QuadItem[]>([]);
  const [finalizadasList, setFinalizadasList] = useState<QuadItem[]>([]);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const data = await listarQuadro({ finalizadas, horasRecentes });
      setRawAguardando(data.aguardando);
      setExecucao(data.emAndamento);
      setFaturamento(data.aguardandoPagamento);
      setFinalizadasList(data.concluidasRecentes);
    } catch (e: any) {
      setErr(e?.message || "Falha ao carregar painel");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [finalizadas, horasRecentes]);

  // realtime (tabela ordemservico)
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    if (!url || !anon) return;

    const sb = createClient(url, anon, { realtime: { params: { eventsPerSecond: 5 } } });
    const ch = sb
      .channel("acompanhamento-public")
      .on("postgres_changes", { event: "*", schema: "public", table: "ordemservico" }, () => load())
      .subscribe();

    return () => {
      try {
        void sb.removeChannel(ch);
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Divisão mais simples: Orçamento/Aprovação (juntos), Execução, Pagamento, Finalizadas
  const orcAprov = useMemo(() => rawAguardando.filter((x) => IS_ORCAMENTO(x.status)), [rawAguardando]);

  const Column = ({ title, items, emptyLabel }: { title: string; items: QuadItem[]; emptyLabel: string }) => (
    <section className="flex flex-col min-h-0">
      <header className="mb-2 flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-extrabold tracking-tight uppercase">{title}</h2>
        <Badge variant="outline" className="text-sm md:text-base">{items.length}</Badge>
      </header>
      <div className="grid gap-4 content-start grid-cols-1">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28 md:h-32 w-full rounded-xl" />)
          : items.length
            ? items.map((os) => <OsTile key={os.id} os={os} />)
            : <EmptyColumn label={emptyLabel} />}
      </div>
    </section>
  );

  return (
    <div className="min-h-screen px-3 md:px-6 py-4 flex flex-col gap-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Acompanhamento</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Visão resumida — leitura fácil à distância
          </p>
        </div>
        <div className="text-right text-sm md:text-base text-muted-foreground">
          Atualizado: {new Date().toLocaleString()}
        </div>
      </div>

      {err && (
        <Card className="p-4 border-red-700/30 bg-red-900/10 text-red-300">
          <div className="font-semibold mb-1">Falha ao carregar painel</div>
          <div className="text-sm opacity-90">{err}</div>
        </Card>
      )}

      {/* Grid mais “placar”: menos colunas em telas pequenas, 4/5 em telas grandes */}
    {/* era: grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 [@media(min-width:1800px)]:grid-cols-5 */}
<div className="grid gap-5 grow grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">

        <Column title="Orçamento / Aprovação" items={orcAprov}     emptyLabel="Sem OS em orçamento/aprovação" />
        <Column title="Execução"              items={execucao}     emptyLabel="Sem OS em execução" />
        <Column title="Pagamento"             items={faturamento}  emptyLabel="Sem OS aguardando pagamento" />
        <Column title={finalizadas === "hoje" ? "Finalizadas (hoje)" : "Finalizadas (recentes)"}
                items={finalizadasList}
                emptyLabel={finalizadas === "hoje" ? "Nenhuma OS finalizada hoje" : "Sem OS finalizadas recentes"} />
      </div>
    </div>
  );
}
