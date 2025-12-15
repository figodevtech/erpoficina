// src/app/api/acompanhamento/ordens/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

/** início do dia em America/Fortaleza (ISO UTC truncado em segundos) */
function inicioHojeFortalezaISO() {
  const now = new Date();
  const ymd = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Fortaleza",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now); // "YYYY-MM-DD"
  const [y, m, d] = ymd.split("-").map(Number);
  const utcMidnight = new Date(Date.UTC(y!, (m! - 1), d!, 0, 0, 0));
  return utcMidnight.toISOString().slice(0, 19);
}
const isoRecentes = (horas: number) =>
  new Date(Date.now() - Math.max(1, horas) * 3600 * 1000).toISOString().slice(0, 19);

type StatusOS =
  | "ORCAMENTO"
  | "EM_ANDAMENTO"
  | "PAGAMENTO"
  | "CONCLUIDO"
  | "CANCELADO"
  | "APROVACAO_ORCAMENTO"
  | "ORCAMENTO_APROVADO"
  | "ORCAMENTO_RECUSADO";

const SET_AGUARDANDO: StatusOS[] = [
  "ORCAMENTO",
  "ORCAMENTO_RECUSADO",
  "APROVACAO_ORCAMENTO",
  "ORCAMENTO_APROVADO",
];
const SET_EXECUCAO: StatusOS[] = ["EM_ANDAMENTO"];
const SET_FATURAMENTO: StatusOS[] = ["PAGAMENTO"];
const SET_FINALIZADAS: StatusOS[] = ["CONCLUIDO", "CANCELADO"];

/**
 * campos/joins usados pelo painel
 * - inclui itens de orçamento (osproduto e osservico)
 */
const BASE_SELECT = `
  id,
  descricao,
  status,
  prioridade,
  alvo_tipo,
  dataentrada,
  datasaida,
  updatedat,
  cliente:clienteid ( id, nomerazaosocial ),
  veiculo:veiculoid ( id, placa, modelo, marca, cor ),
  peca:pecaid ( id, titulo, descricao ),
  setor:setorid ( id, nome ),
  produtos:osproduto (
    quantidade,
    precounitario,
    subtotal,
    produto:produtoid ( id, titulo )
  ),
  servicos:osservico (
    quantidade,
    precounitario,
    subtotal,
    servico:servicoid ( id, descricao )
  )
`;

function httpError(err: any, fallback = "Falha ao carregar painel", code = 500) {
  const msg = err?.message || fallback;
  return NextResponse.json({ error: msg }, { status: err?.statusCode || code });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const limit = Math.min(500, Math.max(1, Number(searchParams.get("limit") || "300")));
    const horasRecentes = Math.min(72, Math.max(1, Number(searchParams.get("horasRecentes") || "12")));
    const finalizadasScope = (searchParams.get("finalizadas") || "recentes") as "hoje" | "recentes";

    const setorIdRaw = searchParams.get("setorId");
    const setorId = setorIdRaw ? Number(setorIdRaw) : null;
    const hasSetor = Number.isFinite(setorId as number) && (setorId as number) > 0;

    const cutoffRecentes = isoRecentes(horasRecentes);
    const inicioHoje = inicioHojeFortalezaISO();

    let qAguard = supabaseAdmin
      .from("ordemservico")
      .select(BASE_SELECT)
      .in("status", SET_AGUARDANDO);
    if (hasSetor) qAguard = qAguard.eq("setorid", setorId as number);
    qAguard = qAguard.order("dataentrada", { ascending: true }).limit(limit);

    let qExec = supabaseAdmin
      .from("ordemservico")
      .select(BASE_SELECT)
      .in("status", SET_EXECUCAO);
    if (hasSetor) qExec = qExec.eq("setorid", setorId as number);
    qExec = qExec.order("updatedat", { ascending: false }).limit(limit);

    let qFat = supabaseAdmin
      .from("ordemservico")
      .select(BASE_SELECT)
      .in("status", SET_FATURAMENTO);
    if (hasSetor) qFat = qFat.eq("setorid", setorId as number);
    qFat = qFat.order("updatedat", { ascending: false }).limit(limit);

    let qFin = supabaseAdmin
      .from("ordemservico")
      .select(BASE_SELECT)
      .in("status", SET_FINALIZADAS);
    if (hasSetor) qFin = qFin.eq("setorid", setorId as number);

    if (finalizadasScope === "hoje") {
      qFin = qFin.gte("datasaida", inicioHoje);
    } else {
      qFin = qFin.or(`updatedat.gte.${cutoffRecentes},datasaida.gte.${cutoffRecentes}`);
    }
    qFin = qFin.order("datasaida", { ascending: false }).limit(limit);

    const [rAguard, rExec, rFat, rFin] = await Promise.all([qAguard, qExec, qFat, qFin]);

    for (const r of [rAguard, rExec, rFat, rFin]) {
      if (r.error) throw r.error;
    }

    return NextResponse.json(
      {
        aguardando: rAguard.data ?? [],
        emAndamento: rExec.data ?? [],
        aguardandoPagamento: rFat.data ?? [],
        concluidasRecentes: rFin.data ?? [],
        meta: {
          limit,
          horasRecentes,
          finalizadas: finalizadasScope,
          setorId: hasSetor ? (setorId as number) : null,
          now: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("[GET] /api/acompanhamento/ordens", err);
    return httpError(err);
  }
}
