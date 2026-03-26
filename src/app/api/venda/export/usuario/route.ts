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

function firstOrSelf<T>(v: T | T[] | null | undefined): T | null {
  if (!v) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

const VENDA_SELECT = `
  id,
  status,
  canal,
  valortotal,
  sub_total,
  desconto_tipo,
  desconto_valor,
  datavenda,
  createdat,
  updatedat,
  created_by,
  cliente:clienteid ( id, nomerazaosocial, cpfcnpj, telefone, email ),
  vendedor:created_by ( id, nome, email )
`;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = (searchParams.get("userId") ?? "").trim();
    const dateFrom = (searchParams.get("dateFrom") ?? "").trim();
    const dateTo = (searchParams.get("dateTo") ?? "").trim();

    if (!userId) {
      return NextResponse.json({ error: "Selecione um usuário." }, { status: 400 });
    }

    let query = supabaseAdmin
      .from("venda")
      .select(VENDA_SELECT)
      .eq("created_by", userId)
      .order("datavenda", { ascending: true, nullsFirst: false })
      .order("id", { ascending: true });

    if (dateFrom) query = query.gte("datavenda", localDayStartToUtcIso(dateFrom));
    if (dateTo) query = query.lt("datavenda", localNextDayStartToUtcIso(dateTo));

    const { data, error } = await query;
    if (error) throw error;

    const headers = [
      "Venda ID",
      "Data Venda",
      "Status",
      "Canal",
      "Vendedor ID",
      "Vendedor Nome",
      "Vendedor Email",
      "Cliente ID",
      "Cliente Nome/Razão",
      "Cliente CPF/CNPJ",
      "Cliente Telefone",
      "Cliente Email",
      "Subtotal (R$)",
      "Desconto Tipo",
      "Desconto Valor (R$)",
      "Total (R$)",
    ] as const;

    const rows = (data ?? []).map((v: any) => {
      const cliente = firstOrSelf<any>(v.cliente);
      const vendedor = firstOrSelf<any>(v.vendedor);

      return [
        v.id ?? "",
        formatFortaleza(v.datavenda ?? null),
        v.status ?? "",
        v.canal ?? "",
        vendedor?.id ?? v.created_by ?? "",
        vendedor?.nome ?? "",
        vendedor?.email ?? "",
        cliente?.id ?? "",
        cliente?.nomerazaosocial ?? "",
        cliente?.cpfcnpj ?? "",
        cliente?.telefone ?? "",
        cliente?.email ?? "",
        toNum(v.sub_total) ?? null,
        v.desconto_tipo ?? "",
        toNum(v.desconto_valor) ?? null,
        toNum(v.valortotal) ?? null,
      ];
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers as unknown as string[], ...rows]);
    ws["!cols"] = [
      { wch: 10 },
      { wch: 22 },
      { wch: 16 },
      { wch: 12 },
      { wch: 38 },
      { wch: 28 },
      { wch: 30 },
      { wch: 10 },
      { wch: 34 },
      { wch: 18 },
      { wch: 18 },
      { wch: 28 },
      { wch: 16 },
      { wch: 16 },
      { wch: 16 },
      { wch: 16 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, "Vendas por usuário");

    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    const filename = `vendas_usuario_${new Date().toISOString().replace(/[:.]/g, "-")}.xlsx`;

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
      { error: e?.message || "Erro ao exportar vendas por usuário" },
      { status: 500 }
    );
  }
}
