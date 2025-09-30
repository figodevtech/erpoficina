import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

/** início do dia em America/Fortaleza (como ISO UTC) */
function inicioHojeFortalezaISO() {
  const now = new Date();
  const ymd = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Fortaleza",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now); // ex.: "2025-09-29"
  const [y, m, d] = ymd.split("-").map(Number);
  const utcMidnight = new Date(Date.UTC(y!, (m! - 1), d!, 0, 0, 0));
  return utcMidnight.toISOString();
}

/** considera "pago" de forma ampla (ajuste aos seus statuses reais) */
function isPago(status?: string | null) {
  if (!status) return false;
  const s = status.toUpperCase();
  return ["PAGO", "APROVADO", "CONFIRMADO", "EFETIVADO"].includes(s);
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(500, Math.max(1, Number(searchParams.get("limit") || "300")));
    const horasRecentes = Math.min(72, Math.max(1, Number(searchParams.get("horasRecentes") || "12")));
    const finalizadasScope = (searchParams.get("finalizadas") || "recentes") as "hoje" | "recentes";

    const cutoff = new Date(Date.now() - horasRecentes * 3600 * 1000).toISOString();
    const inicioHoje = inicioHojeFortalezaISO();

    const baseSelect = `
      id,
      descricao,
      status,
      dataentrada,
      datasaidareal,
      updatedat,
      cliente:clienteid ( id, nomerazaosocial ),
      veiculo:veiculoid ( id, placa, modelo, marca ),
      setor:setorid ( id, nome ),
      pagamentos:pagamento ( id, status )
    `;

    // Aguardando (fila geral): ABERTA + AGUARDANDO_PECA
    const qAguardando = supabaseAdmin
      .from("ordemservico")
      .select(baseSelect)
      .or("status.eq.ABERTA,status.eq.AGUARDANDO_PECA")
      .order("dataentrada", { ascending: true })
      .limit(limit);

    // Em atendimento
    const qAndamento = supabaseAdmin
      .from("ordemservico")
      .select(baseSelect)
      .eq("status", "EM_ANDAMENTO")
      .order("updatedat", { ascending: false })
      .limit(limit);

    // Concluídas (escopo configurável)
    let qConcluidas = supabaseAdmin
      .from("ordemservico")
      .select(baseSelect)
      .eq("status", "CONCLUIDA");

    if (finalizadasScope === "hoje") {
      qConcluidas = qConcluidas.gte("datasaidareal", inicioHoje);
    } else {
      qConcluidas = qConcluidas.or(`updatedat.gte.${cutoff},datasaidareal.gte.${cutoff}`);
    }
    qConcluidas = qConcluidas.order("datasaidareal", { ascending: false }).limit(limit);

    const [rAguard, rAnd, rConc] = await Promise.all([qAguardando, qAndamento, qConcluidas]);

    if (rAguard.error || rAnd.error || rConc.error) {
      throw rAguard.error || rAnd.error || rConc.error;
    }

    const aguardando = (rAguard.data ?? []).map((x: any) => x);
    const emAndamento = (rAnd.data ?? []).map((x: any) => x);

    // separa concluídas entre aguardando pagamento e finalizadas recentes (pagas)
    const concluidas = (rConc.data ?? []) as any[];
    const aguardandoPagamento: any[] = [];
    const concluidasRecentes: any[] = [];

    for (const os of concluidas) {
      const pagos = (Array.isArray(os.pagamentos) ? os.pagamentos : []).some((p: any) => isPago(p?.status));
      if (pagos) concluidasRecentes.push(os);
      else aguardandoPagamento.push(os);
    }

    return NextResponse.json(
      {
        aguardando,
        emAndamento,
        aguardandoPagamento,
        concluidasRecentes,
        meta: {
          limit,
          horasRecentes,
          finalizadas: finalizadasScope,
          now: new Date().toISOString(),
        },
      },
      { status: 200 },
    );
  } catch (err: any) {
    console.error("[GET] /api/acompanhamento/ordens", err);
    return NextResponse.json({ error: "Falha ao carregar painel" }, { status: 500 });
  }
}
