// src/app/api/products/export/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import * as XLSX from "xlsx";

/** Status de estoque (para filtros) */
type Status = "OK" | "CRITICO" | "BAIXO";
const STATUS_SET = new Set<Status>(["OK", "CRITICO", "BAIXO"]);

/** Campos a exportar (podem ser ajustados) */
const EXPORT_FIELDS = `
  id, titulo, descricao, referencia,
  precovenda, unidade,
  estoque, estoqueminimo, status_estoque,
  fornecedor, fabricante, grupo,
  ncm, cfop, csosn, cest, aliquotaicms, codigobarras,
  createdat, updatedat
`;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const q = (searchParams.get("search") ?? searchParams.get("q") ?? "")
      .trim()
      .slice(0, 200);

    const statusParam = (searchParams.get("status") ?? "TODOS").toUpperCase();
    const statusFilter = STATUS_SET.has(statusParam as Status)
      ? (statusParam as Status)
      : null;

    // tamanho do bloco para varrer tudo
    const CHUNK = Math.min(
      Math.max(Number(searchParams.get("chunk") ?? 1000), 200),
      5000
    );

    // Cabeçalhos do Excel
    const headers = [
      "ID",
      "Título",
      "Descrição",
      "Referência",
      "Preço Venda",
      "Unidade",
      "Estoque",
      "Estoque Mín.",
      "Status Estoque",
      "Fornecedor",
      "Fabricante",
      "Grupo",
      "NCM",
      "CFOP",
      "CSOSN",
      "CEST",
      "Alíquota ICMS",
      "Código Barras",
      "Criado em",
      "Atualizado em",
    ] as const;

    // Cria workbook e planilha
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers as unknown as string[]]);
    XLSX.utils.book_append_sheet(wb, ws, "Produtos");

    // Larguras (opcional)
    ws["!cols"] = [
      { wch: 8 },  // ID
      { wch: 32 }, // Título
      { wch: 50 }, // Descrição
      { wch: 18 }, // Referência
      { wch: 14 }, // Preço Venda
      { wch: 10 }, // Unidade
      { wch: 10 }, // Estoque
      { wch: 12 }, // Estoque Mín.
      { wch: 14 }, // Status
      { wch: 24 }, // Fornecedor
      { wch: 24 }, // Fabricante
      { wch: 16 }, // Grupo
      { wch: 12 }, // NCM
      { wch: 10 }, // CFOP
      { wch: 10 }, // CSOSN
      { wch: 10 }, // CEST
      { wch: 14 }, // Alíquota ICMS
      { wch: 18 }, // Código Barras
      { wch: 20 }, // Criado em
      { wch: 20 }, // Atualizado em
    ];

    // Monta query base com filtros
    const buildQuery = () => {
      let query = supabaseAdmin
        .from("produto")
        .select(EXPORT_FIELDS, { count: "exact" })
        // Para varrer com range em blocos, ordene ASC de forma determinística
        .order("id", { ascending: true });

      if (q) {
        query = query.or(
          `referencia.ilike.%${q}%,titulo.ilike.%${q}%,fornecedor.ilike.%${q}%,fabricante.ilike.%${q}%`
        );
      }
      if (statusFilter) {
        query = query.eq("status_estoque", statusFilter);
      }
      return query;
    };

    // 1ª chamada apenas para obter total
    const first = await buildQuery().range(0, 0);
    if (first.error) throw first.error;

    // Varre tudo em blocos
    for (let from = 0; ; from += CHUNK) {
      const to = from + CHUNK - 1;
      const { data, error } = await buildQuery().range(from, to);
      if (error) throw error;

      const rows = (data ?? []).map((p: any) => [
        p.id ?? "",
        p.titulo ?? "",
        p.descricao ?? "",
        p.referencia ?? "",
        p.precovenda ?? null, // número
        p.unidade ?? "",
        p.estoque ?? null, // número (int)
        p.estoqueminimo ?? null, // número (int)
        p.status_estoque ?? "",
        p.fornecedor ?? "",
        p.fabricante ?? "",
        p.grupo ?? "",
        p.ncm ?? "",
        p.cfop ?? "",
        p.csosn ?? "",
        p.cest ?? "",
        p.aliquotaicms ?? null, // número
        p.codigobarras ?? "",
        p.createdat ? new Date(p.createdat) : "",
        p.updatedat ? new Date(p.updatedat) : "",
      ]);

      if (rows.length) {
        XLSX.utils.sheet_add_aoa(ws, rows as unknown as any[][], { origin: -1 });
      }

      if (!data?.length || data.length < CHUNK) break;
    }

    // Buffer do XLSX
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    const filename = `produtos_${(statusFilter ?? "TODOS")}_${new Date()
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
      { error: e?.message || "Erro ao exportar produtos" },
      { status: 500 }
    );
  }
}
