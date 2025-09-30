"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { listarQuadro, QuadItem } from "../lib/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import OsTile from "./os-tile";
import EmptyColumn from "./emply-column";

function fmtNow(d = new Date()) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "full", timeStyle: "medium" }).format(d);
}

export default function PainelAcompanhamento({
  finalizadas = "recentes",
  horasRecentes = 12,
}: {
  /** "hoje" para apenas as concluídas do dia, "recentes" para janela de horas */
  finalizadas?: "hoje" | "recentes";
  horasRecentes?: number;
}) {
  const [loading, setLoading] = useState(true);
  const [aguardando, setAguardando] = useState<QuadItem[]>([]);
  const [andamento, setAndamento] = useState<QuadItem[]>([]);
  const [aguardandoPg, setAguardandoPg] = useState<QuadItem[]>([]);
  const [concluidas, setConcluidas] = useState<QuadItem[]>([]);

  async function load() {
    setLoading(true);
    try {
      const data = await listarQuadro({ finalizadas, horasRecentes });
      setAguardando(data.aguardando);
      setAndamento(data.emAndamento);
      setAguardandoPg(data.aguardandoPagamento);
      setConcluidas(data.concluidasRecentes);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [finalizadas, horasRecentes]);

  // realtime: recarrega quando qualquer linha de ordemservico muda
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    if (!url || !anon) return;

    const sb = createClient(url, anon, { realtime: { params: { eventsPerSecond: 5 } } });
    const ch = sb
      .channel("acompanhamento-public")
      .on("postgres_changes", { event: "*", schema: "public", table: "ordemservico" }, () => load())
      .subscribe();

    return () => { try { void sb.removeChannel(ch); } catch {} };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const Column = ({ title, items, highlight, emptyLabel }: {
    title: string;
    items: QuadItem[];
    highlight?: boolean;
    emptyLabel: string;
  }) => (
    <section className="flex flex-col min-h-0">
      <header className="mb-2 flex items-center justify-between">
        <h2 className="text-lg md:text-xl font-bold">{title}</h2>
        <Badge variant="outline">{items.length}</Badge>
      </header>
      <div className="grid gap-3 content-start grid-cols-1">
        {loading
          ? Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)
          : (items.length
              ? items.map((os) => <OsTile key={os.id} os={os} destaque={highlight} />)
              : <EmptyColumn label={emptyLabel} />
            )
        }
      </div>
    </section>
  );

  return (
    <div className="min-h-screen px-4 md:px-6 py-4 flex flex-col gap-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Acompanhamento</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Visão geral das ordens por status — {finalizadas === "hoje" ? "finalizadas hoje" : `finalizadas nas últimas ${horasRecentes}h`}
          </p>
        </div>
        <div className="text-right">
          <div className="text-base md:text-xl font-semibold">{fmtNow(now)}</div>
        </div>
      </div>

      {/* Grelha responsiva: 4 colunas quando houver espaço; carrega muitos cards para TV */}
      <div className="grid gap-4 grow grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4">
        <Column title="Aguardando" items={aguardando} emptyLabel="Nenhuma OS aguardando" />
        <Column title="Em atendimento" items={andamento} highlight emptyLabel="Nenhuma OS em atendimento" />
        <Column title="Aguardando pagamento" items={aguardandoPg} emptyLabel="Sem OS aguardando pagamento" />
        <Column
          title={finalizadas === "hoje" ? "Finalizadas (hoje)" : "Finalizadas (recentes)"}
          items={concluidas}
          emptyLabel={finalizadas === "hoje" ? "Nenhuma OS finalizada hoje" : "Sem OS finalizadas recentes"}
        />
      </div>
    </div>
  );
}
