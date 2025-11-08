// src/app/api/transaction/export/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import * as XLSX from "xlsx";

/** ====== Constantes e helpers ====== */

const FORTALEZA_TZ = "America/Fortaleza";
const FORTALEZA_OFFSET = "-03:00";

/** Campos retornados no select (iguais ao seu GET) */
const TRANSACAO_FIELDS =
  "id, descricao, valor, valorLiquido, data, ordemservicoid, metodopagamento, categoria, tipo, cliente_id, banco_id, created_at, updated_at";

const BANCO_FIELDS =
  "id, titulo, tipo, agencia, contanumero, proprietario, valorinicial, empresa_id, created_at, updated_at";

// Date helpers (mesma lógica do seu GET)
function localDayStartToUtcIso(dateStr: string) {
  return new Date(`${dateStr}T00:00:00${FORTALEZA_OFFSET}`).toISOString();
}
function localNextDayStartToUtcIso(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00${FORTALEZA_OFFSET}`);
  return new Date(d.getTime() + 24 * 60 * 60 * 1000).toISOString();
}

// Conversão de timestamp -> string local Fortaleza
function formatFortaleza(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: FORTALEZA_TZ,
    dateStyle: "short",
    timeStyle: "short",
  }).format(d);
}

function toNumberOrNull(v: any) {
  if (v == null || (typeof v === "string" && v.trim() === "")) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/** ====== GET: export Excel ====== */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // Mesmos filtros aceitos pela sua listagem:
    const q = (searchParams.get("search") ?? searchParams.get("q") ?? "")
      .trim()
      .slice(0, 200);

    const tipo = (searchParams.get("tipo") ?? "").trim();
    const categoria = (searchParams.get("categoria") ?? "").trim();
    const ordemservicoid = searchParams.get("ordemservicoid");
    const metodo = (
      searchParams.get("metodo") ?? searchParams.get("metodopagamento") ?? ""
    )
      .trim()
      .slice(0, 100);
    const bancoId = toNumberOrNull(searchParams.get("bancoId"));
    const clienteId = toNumberOrNull(searchParams.get("clienteId"));
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    // Tamanho do bloco para varrer no Supabase
    const CHUNK = Math.min(
      Math.max(Number(searchParams.get("chunk") ?? 1000), 200),
      5000
    );

    // Cabeçalhos do Excel
    const headers = [
      "ID",
      "Descrição",
      "Tipo",
      "Categoria",
      "Método Pagamento",
      "Valor (R$)",
      "Valor Líquido (R$)",
      "Data (Fortaleza)",
      "Ordem Serviço",
      "Cliente ID",
      "Banco ID",
      "Banco Título",
      "Criado em",
      "Atualizado em",
    ] as const;

    // Inicia workbook/planilha
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers as unknown as string[]]);
    XLSX.utils.book_append_sheet(wb, ws, "Transacoes");

    ws["!cols"] = [
      { wch: 8 },   // ID
      { wch: 40 },  // Descrição
      { wch: 12 },  // Tipo
      { wch: 18 },  // Categoria
      { wch: 18 },  // Método
      { wch: 14 },  // Valor
      { wch: 16 },  // Valor Líquido
      { wch: 22 },  // Data (Fortaleza)
      { wch: 14 },  // OS
      { wch: 12 },  // Cliente ID
      { wch: 10 },  // Banco ID
      { wch: 28 },  // Banco Título
      { wch: 20 },  // Criado em
      { wch: 20 },  // Atualizado em
    ];

    // Query base com filtros (mesma lógica do seu GET)
    const buildQuery = () => {
      let query = supabaseAdmin
        .from("transacao")
        .select(
          `
          ${TRANSACAO_FIELDS},
          banco:bancoconta!transacao_banco_id_fkey ( ${BANCO_FIELDS} )
        `,
          { count: "exact" }
        )
        // Para varrer em blocos, ordene de forma determinística:
        .order("data", { ascending: true })
        .order("id", { ascending: true });

      if (q) query = query.ilike("descricao", `%${q}%`);
      if (ordemservicoid) query = query.eq("ordemservicoid", ordemservicoid);
      if (tipo) query = query.eq("tipo", tipo);
      if (categoria) query = query.eq("categoria", categoria);
      if (metodo) query = query.eq("metodopagamento", metodo);
      if (bancoId != null) query = query.eq("banco_id", bancoId);
      if (clienteId != null) query = query.eq("cliente_id", clienteId);

      if (dateFrom) query = query.gte("data", localDayStartToUtcIso(dateFrom));
      if (dateTo)
        query = query.lt("data", localNextDayStartToUtcIso(dateTo));

      return query;
    };

    // Primeira chamada só para obter o total
    const first = await buildQuery().range(0, 0);
    if (first.error) throw first.error;
    const total = first.count ?? 0;

    // Varrendo em blocos
    for (let from = 0; ; from += CHUNK) {
      const to = from + CHUNK - 1;
      const { data, error } = await buildQuery().range(from, to);
      if (error) throw error;

      const rows = (data ?? []).map((t: any) => [
        t.id ?? "",
        t.descricao ?? "",
        t.tipo ?? "",
        t.categoria ?? "",
        t.metodopagamento ?? "",
        t.valor ?? null,        // número
        t.valorLiquido ?? null, // número
        formatFortaleza(t.data ?? null),
        t.ordemservicoid ?? "",
        t.cliente_id ?? "",
        t.banco_id ?? "",
        t?.banco?.titulo ?? "",
        formatFortaleza(t.created_at ?? null),
        formatFortaleza(t.updated_at ?? null),
      ]);

      if (rows.length) {
        XLSX.utils.sheet_add_aoa(ws, rows as unknown as any[][], { origin: -1 });
      }

      if (!data?.length || data.length < CHUNK) break;
    }

    // Gera buffer do XLSX
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    const filename = `transacoes_${new Date()
      .toISOString()
      .replace(/[:.]/g, "-")}.xlsx`;

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
      { error: e?.message || "Erro ao exportar transações" },
      { status: 500 }
    );
  }
}
