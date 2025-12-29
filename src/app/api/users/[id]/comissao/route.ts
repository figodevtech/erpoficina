export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { ensureAccess } from "../../_authz";

function isOpen() {
  const v = (process.env.OPEN_PERMISSIONS ?? "").toString().trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes";
}

function yyyymm(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function toDateOrNull(v?: string | null) {
  const s = (v ?? "").trim();
  if (!s) return null;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function num(v: any) {
  if (v == null) return 0;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

// GET /api/users/:id/comissao?dateFrom=2025-01-01&dateTo=2025-12-31
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = isOpen() ? null : await auth();
    await ensureAccess(session);

    const { id: userId } = await context.params;

    const { searchParams } = new URL(req.url);
    const dateFrom = toDateOrNull(searchParams.get("dateFrom"));
    const dateTo = toDateOrNull(searchParams.get("dateTo"));

    // 1) pega % comissão do usuário
    const { data: userRow, error: uErr } = await supabaseAdmin
      .from("usuario")
      .select("id, nome, email, comissao_percent")
      .eq("id", userId)
      .maybeSingle();

    if (uErr) throw uErr;
    if (!userRow) return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });

    const comissaoPercent = num(userRow.comissao_percent);

    // 2) busca serviços executados pelo usuário
    // IMPORTANTE: ajuste o campo de data da OS aqui:
    const OS_DATE_FIELD = "createdat";

    const { data: rows, error: sErr } = await supabaseAdmin
      .from("osservico")
      .select(
        [
          "ordemservicoid",
          "servicoid",
          "quantidade",
          "precounitario",
          "subtotal",
          "idusuariorealizador",
          `ordem:ordemservicoid(id, ${OS_DATE_FIELD})`,
          "servico:servicoid(id, descricao)",
        ].join(",")
      )
      .eq("idusuariorealizador", userId);

    if (sErr) throw sErr;

    // 3) filtra por período e agrupa por mês (no Node)
    const byMonth = new Map<
      string,
      { month: string; servicos: number; faturamento: number; comissao: number }
    >();

    let totalServicos = 0;
    let totalFaturamento = 0;

    for (const r of rows ?? []) {
      const osDateRaw = (r as any)?.ordem?.[OS_DATE_FIELD] ?? null;
      if (!osDateRaw) continue;

      const d = new Date(osDateRaw);
      if (Number.isNaN(d.getTime())) continue;

      if (dateFrom && d < dateFrom) continue;
      if (dateTo) {
        // inclui o dia inteiro do dateTo
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        if (d > end) continue;
      }

      const month = yyyymm(d);
      const subtotal = num((r as any).subtotal);
      const qtd = num((r as any).quantidade) || 1;

      const cur = byMonth.get(month) ?? { month, servicos: 0, faturamento: 0, comissao: 0 };
      cur.servicos += qtd;
      cur.faturamento += subtotal;
      byMonth.set(month, cur);

      totalServicos += qtd;
      totalFaturamento += subtotal;
    }

    const items = [...byMonth.values()]
      .map((m) => ({
        ...m,
        comissao: (m.faturamento * comissaoPercent) / 100,
      }))
      .sort((a, b) => (a.month < b.month ? 1 : -1)); // desc

    const totalComissao = (totalFaturamento * comissaoPercent) / 100;

    return NextResponse.json({
      usuario: {
        id: userRow.id,
        nome: userRow.nome,
        email: userRow.email,
      },
      comissao_percent: comissaoPercent,
      totalServicos,
      totalFaturamento,
      totalComissao,
      meses: items,
    });
  } catch (e: any) {
    console.error("[/api/users/:id/comissao GET] error:", e);
    const status = /não autenticado|unauth|auth/i.test(String(e?.message)) ? 401 : 500;
    return NextResponse.json(
      { error: e?.message ?? "Erro ao calcular comissão do usuário" },
      { status }
    );
  }
}
