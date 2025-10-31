"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { listarQuadro, QuadItem } from "../lib/api";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import OsTile from "./os-tile";
import EmptyColumn from "./emply-column";
import { Loader2 } from "lucide-react";

/* ---------------- utils de status ---------------- */
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

/* --------------- “Campainha” ding-dong --------------- */
/**
 * Campainha mais natural (ding-dong):
 * - Ding: nota mais aguda, curta
 * - Dong: nota mais grave, com cauda maior
 * - Eco sutil para sensação de distância
 */
const useDoorbellChime = () => {
  return useCallback(async () => {
    try {
      const Ctx: typeof AudioContext =
        (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!Ctx) return;

      const ctx = new Ctx();
      try {
        await ctx.resume();
      } catch {}

      // Master
      const master = ctx.createGain();
      master.gain.value = 0.9; // volume geral da campainha
      master.connect(ctx.destination);

      // “Reverb” simples com delay e feedback baixo (eco sutil)
      const delay = ctx.createDelay(1.5);
      delay.delayTime.value = 0.22;

      const fb = ctx.createGain();
      fb.gain.value = 0.23;

      const wet = ctx.createGain();
      wet.gain.value = 0.16; // nível molhado (eco)

      delay.connect(fb);
      fb.connect(delay);
      delay.connect(wet);
      wet.connect(master);

      const dryBus = ctx.createGain();
      dryBus.gain.value = 1.0;
      dryBus.connect(master);

      function bell(
        t0: number,
        freq: number,
        dur: number,
        peak: number,
        downGlide = 0.9,
        partial2 = 0.35,
      ) {
        const g = ctx.createGain();
        g.gain.value = 0.0001;
        g.connect(dryBus);
        g.connect(delay);

        // Osci principal (sine) + parcial (triangle) para “timbre de sino”
        const o1 = ctx.createOscillator();
        o1.type = "sine";
        o1.frequency.setValueAtTime(freq, t0);

        const o2 = ctx.createOscillator();
        o2.type = "triangle";
        o2.frequency.setValueAtTime(freq * 2, t0);

        const p2 = ctx.createGain();
        p2.gain.value = partial2; // nível do harmônico

        o1.connect(g);
        o2.connect(p2);
        p2.connect(g);

        // Envelope
        g.gain.exponentialRampToValueAtTime(peak, t0 + 0.04);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

        // Pequeno “glide” para baixo na frequência (mais natural)
        o1.frequency.exponentialRampToValueAtTime(freq * downGlide, t0 + dur * 0.8);
        o2.frequency.exponentialRampToValueAtTime(freq * 2 * downGlide, t0 + dur * 0.8);

        o1.start(t0);
        o2.start(t0);
        o1.stop(t0 + dur + 0.05);
        o2.stop(t0 + dur + 0.05);
      }

      const now = ctx.currentTime + 0.02;

      // Ding (agudo, curto)
      bell(now, 1560, 0.55, 0.55, 0.92, 0.28);

      // Dong (grave, mais longo)
      bell(now + 0.28, 880, 1.15, 0.6, 0.88, 0.32);

      // Encerrar contexto após a cauda
      const total = 2.0;
      setTimeout(() => {
        try {
          ctx.close();
        } catch {}
      }, Math.ceil(total * 1000));
    } catch {
      // silencioso: navegadores podem bloquear áudio sem gesto do usuário
    }
  }, []);
};

/* ---------------- componente ---------------- */
export default function PainelAcompanhamento({
  finalizadas = "recentes",
  horasRecentes = 12,
}: {
  finalizadas?: "hoje" | "recentes";
  horasRecentes?: number;
}) {
  const [err, setErr] = useState<string | null>(null);

  // loading refinado
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [rawAguardando, setRawAguardando] = useState<QuadItem[]>([]);
  const [execucao, setExecucao] = useState<QuadItem[]>([]);
  const [faturamento, setFaturamento] = useState<QuadItem[]>([]);
  const [finalizadasList, setFinalizadasList] = useState<QuadItem[]>([]);

  // evita hydration mismatch
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  // snapshot pra detecção de mudanças
  const prevSigRef = useRef<string>("__init__");
  const firstLoadRef = useRef(true);

  const doorbell = useDoorbellChime();

  const makeSignature = (data: {
    aguardando: QuadItem[];
    emAndamento: QuadItem[];
    aguardandoPagamento: QuadItem[];
    concluidasRecentes: QuadItem[];
  }) => {
    const tiny = (arr: QuadItem[]) =>
      JSON.stringify({
        n: arr.length,
        ids: arr.map((x) => x.id).slice(0, 30),
      });
    return [
      tiny(data.aguardando),
      tiny(data.emAndamento),
      tiny(data.aguardandoPagamento),
      tiny(data.concluidasRecentes),
    ].join("|");
  };

  async function load() {
    setRefreshing(true);
    setErr(null);
    try {
      const data = await listarQuadro({ finalizadas, horasRecentes });

      const sig = makeSignature(data);
      const prev = prevSigRef.current;
      prevSigRef.current = sig;

      setRawAguardando(data.aguardando);
      setExecucao(data.emAndamento);
      setFaturamento(data.aguardandoPagamento);
      setFinalizadasList(data.concluidasRecentes);

      setLastUpdated(Date.now());

      if (!firstLoadRef.current && prev !== sig) {
        void doorbell();
      }
      firstLoadRef.current = false;
    } catch (e: any) {
      setErr(e?.message || "Falha ao carregar painel");
    } finally {
      setRefreshing(false);
      setInitialLoading(false);
    }
  }

  // primeiro load e quando filtros mudarem
  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finalizadas, horasRecentes]);

  // realtime (ordemservico)
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    if (!url || !anon) return;

    const sb = createClient(url, anon, { realtime: { params: { eventsPerSecond: 5 } } });
    const ch = sb
      .channel("acompanhamento-public")
      .on("postgres_changes", { event: "*", schema: "public", table: "ordemservico" }, () => {
        void load();
      })
      .subscribe();

    return () => {
      try {
        void sb.removeChannel(ch);
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const orcAprov = useMemo(() => rawAguardando.filter((x) => IS_ORCAMENTO(x.status)), [rawAguardando]);

  const Column = ({
    title,
    items,
    emptyLabel,
  }: {
    title: string;
    items: QuadItem[];
    emptyLabel: string;
  }) => (
    <section className="flex flex-col min-h-0">
      <header className="mb-2 flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-extrabold tracking-tight uppercase">{title}</h2>
        <Badge variant="outline" className="text-sm md:text-base">
          {items.length}
        </Badge>
      </header>
      <div className="grid gap-4 content-start grid-cols-1">
        {initialLoading ? (
          Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28 md:h-32 w-full rounded-xl" />)
        ) : items.length ? (
          items.map((os) => <OsTile key={os.id} os={os} />)
        ) : (
          <EmptyColumn label={emptyLabel} />
        )}
      </div>
    </section>
  );

  return (
    <div className="min-h-screen px-3 md:px-6 py-4 flex flex-col gap-4">
      <div className="flex items-end justify-between gap-3 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Acompanhamento</h1>
        </div>
        <div className="text-right text-sm md:text-base text-muted-foreground flex items-center gap-2">
          {refreshing && <Loader2 className="h-4 w-4 animate-spin opacity-80" aria-hidden />}
          <span>
            Atualizado:{" "}
            <span suppressHydrationWarning>
              {lastUpdated ? new Date(lastUpdated).toLocaleString() : "—"}
            </span>
          </span>
        </div>
      </div>

      {err && (
        <Card className="p-4 border-red-700/30 bg-red-900/10 text-red-300">
          <div className="font-semibold mb-1">Falha ao carregar painel</div>
          <div className="text-sm opacity-90">{err}</div>
        </Card>
      )}

      {/* Grid “placar” mantendo o visual atual */}
      <div className="grid gap-5 grow grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        <Column title="Orçamento / Aprovação" items={orcAprov} emptyLabel="Sem OS em orçamento/aprovação" />
        <Column title="Execução" items={execucao} emptyLabel="Sem OS em execução" />
        <Column title="Pagamento" items={faturamento} emptyLabel="Sem OS aguardando pagamento" />
        <Column
          title={finalizadas === "hoje" ? "Finalizadas (hoje)" : "Finalizadas (recentes)"}
          items={finalizadasList}
          emptyLabel={finalizadas === "hoje" ? "Nenhuma OS finalizada hoje" : "Sem OS finalizadas recentes"}
        />
      </div>
    </div>
  );
}
