export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import * as XLSX from "xlsx";

const FORTALEZA_TZ = "America/Fortaleza";
const FORTALEZA_OFFSET = "-03:00";

function localDayStartToUtcIso(dateStr: string) {
  return new Date(`${dateStr}T00:00:00${FORTALEZA_OFFSET}`).toISOString();
}

function localNextDayStartToUtcIso(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00${FORTALEZA_OFFSET}`);
  return new Date(d.getTime() + 24 * 60 * 60 * 1000).toISOString();
}

function formatFortaleza(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: FORTALEZA_TZ,
    dateStyle: "short",
    timeStyle: "short",
  }).format(d);
}

function toNum(v: any): number | null {
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

const keyOf = (ordemservicoid: number, servicoid: number) => `${ordemservicoid}::${servicoid}`;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = (searchParams.get("userId") ?? "").trim();
    const dateFrom = (searchParams.get("dateFrom") ?? "").trim();
    const dateTo = (searchParams.get("dateTo") ?? "").trim();

    if (!userId) {
      return NextResponse.json({ error: "Selecione um realizador." }, { status: 400 });
    }

    const { data: relRows, error: relErr } = await supabaseAdmin
      .from("osservico_realizador")
      .select(
        "ordemservicoid, servicoid, usuarioid, valor_base, valor_comissao, comissao_percent_aplicada"
      )
      .eq("usuarioid", userId)
      .order("ordemservicoid", { ascending: true })
      .order("servicoid", { ascending: true });

    if (relErr) throw relErr;

    const rel = (relRows ?? []).map((row: any) => ({
      ordemservicoid: Number(row.ordemservicoid),
      servicoid: Number(row.servicoid),
      usuarioid: String(row.usuarioid ?? ""),
      valor_base: toNum(row.valor_base),
      valor_comissao: toNum(row.valor_comissao),
      comissao_percent_aplicada: toNum(row.comissao_percent_aplicada),
    }));

    const osIds = Array.from(new Set(rel.map((row) => row.ordemservicoid))).filter(Boolean);
    const servicoIds = Array.from(new Set(rel.map((row) => row.servicoid))).filter(Boolean);

    const { data: usuarioRow, error: usuarioErr } = await supabaseAdmin
      .from("usuario")
      .select("id, nome, email")
      .eq("id", userId)
      .maybeSingle();

    if (usuarioErr) throw usuarioErr;

    const { data: osRows, error: osErr } = osIds.length
      ? await supabaseAdmin
          .from("ordemservico")
          .select("id, createdat, status, clienteid")
          .in("id", osIds)
      : { data: [], error: null as any };

    if (osErr) throw osErr;

    const clienteIds = Array.from(
      new Set((osRows ?? []).map((row: any) => Number(row.clienteid)).filter(Boolean))
    );

    const { data: clienteRows, error: clienteErr } = clienteIds.length
      ? await supabaseAdmin
          .from("cliente")
          .select("id, nomerazaosocial, cpfcnpj")
          .in("id", clienteIds)
      : { data: [], error: null as any };

    if (clienteErr) throw clienteErr;

    const { data: osServicoRows, error: osServicoErr } = osIds.length
      ? await supabaseAdmin
          .from("osservico")
          .select("ordemservicoid, servicoid, quantidade, precounitario, subtotal")
          .in("ordemservicoid", osIds)
      : { data: [], error: null as any };

    if (osServicoErr) throw osServicoErr;

    const { data: servicoRows, error: servicoErr } = servicoIds.length
      ? await supabaseAdmin
          .from("servico")
          .select("id, codigo, descricao")
          .in("id", servicoIds)
      : { data: [], error: null as any };

    if (servicoErr) throw servicoErr;

    const osMap = new Map<number, any>();
    for (const row of osRows ?? []) {
      osMap.set(Number((row as any).id), row);
    }

    const clienteMap = new Map<number, any>();
    for (const row of clienteRows ?? []) {
      clienteMap.set(Number((row as any).id), row);
    }

    const servicoMap = new Map<number, any>();
    for (const row of servicoRows ?? []) {
      servicoMap.set(Number((row as any).id), row);
    }

    const qtdMap = new Map<
      string,
      { quantidade: number | null; precounitario: number | null; subtotal: number | null }
    >();
    for (const row of osServicoRows ?? []) {
      qtdMap.set(keyOf(Number((row as any).ordemservicoid), Number((row as any).servicoid)), {
        quantidade: toNum((row as any).quantidade),
        precounitario: toNum((row as any).precounitario),
        subtotal: toNum((row as any).subtotal),
      });
    }

    const dateFromUtc = dateFrom ? new Date(localDayStartToUtcIso(dateFrom)) : null;
    const dateToUtc = dateTo ? new Date(localNextDayStartToUtcIso(dateTo)) : null;

    const headers = [
      "OS ID",
      "Data OS",
      "Status OS",
      "Realizador ID",
      "Realizador Nome",
      "Realizador Email",
      "Cliente ID",
      "Cliente Nome/Razão",
      "Cliente CPF/CNPJ",
      "Serviço ID",
      "Serviço Código",
      "Serviço Descrição",
      "Quantidade",
      "Preço Unit. (R$)",
      "Subtotal Serviço (R$)",
      "Base Comissão (R$)",
      "Percentual Aplicado (%)",
      "Comissão (R$)",
    ] as const;

    const rows = rel
      .filter((row) => {
        const os = osMap.get(row.ordemservicoid);
        const createdAt = os?.createdat ? new Date(os.createdat) : null;
        if (!createdAt || Number.isNaN(createdAt.getTime())) return !dateFromUtc && !dateToUtc;
        if (dateFromUtc && createdAt < dateFromUtc) return false;
        if (dateToUtc && createdAt >= dateToUtc) return false;
        return true;
      })
      .map((row) => {
        const os = osMap.get(row.ordemservicoid);
        const cliente = os ? clienteMap.get(Number(os.clienteid)) : null;
        const servico = servicoMap.get(row.servicoid);
        const qtd = qtdMap.get(keyOf(row.ordemservicoid, row.servicoid));

        return [
          row.ordemservicoid,
          formatFortaleza(os?.createdat ?? null),
          os?.status ?? "",
          usuarioRow?.id ?? row.usuarioid,
          usuarioRow?.nome ?? "",
          usuarioRow?.email ?? "",
          os?.clienteid ?? "",
          cliente?.nomerazaosocial ?? "",
          cliente?.cpfcnpj ?? "",
          row.servicoid,
          servico?.codigo ?? "",
          servico?.descricao ?? "",
          qtd?.quantidade ?? null,
          qtd?.precounitario ?? null,
          qtd?.subtotal ?? null,
          row.valor_base ?? null,
          row.comissao_percent_aplicada ?? null,
          row.valor_comissao ?? null,
        ];
      });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers as unknown as string[], ...rows]);
    ws["!cols"] = [
      { wch: 10 },
      { wch: 20 },
      { wch: 16 },
      { wch: 38 },
      { wch: 28 },
      { wch: 30 },
      { wch: 10 },
      { wch: 34 },
      { wch: 18 },
      { wch: 10 },
      { wch: 18 },
      { wch: 36 },
      { wch: 12 },
      { wch: 16 },
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
      { wch: 16 },
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Comissão por serviço");

    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    const filename = `comissao_servico_${new Date().toISOString().replace(/[:.]/g, "-")}.xlsx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Erro ao exportar comissão por serviço" },
      { status: 500 }
    );
  }
}
