import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const FORTALEZA_OFFSET = "-03:00";

function localDayStartToUtcIso(dateStr: string) {
  return new Date(`${dateStr}T00:00:00${FORTALEZA_OFFSET}`).toISOString();
}

function localNextDayStartToUtcIso(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00${FORTALEZA_OFFSET}`);
  return new Date(d.getTime() + 24 * 60 * 60 * 1000).toISOString();
}

function toNum(v: any): number {
  if (v == null) return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const inicio = searchParams.get("inicio")?.trim() || "";
    const fim = searchParams.get("fim")?.trim() || "";
    const setorQuery = searchParams.get("setor")?.trim() || "";

    let queryDb = supabaseAdmin
      .from("venda")
      .select(`
        id, 
        status, 
        datavenda, 
        valortotal,
        comissao_venda_percent_aplicada,
        cliente:cliente ( id, nomerazaosocial ),
        vendedor:vendedor ( id, nome, email, setorid )
      `)
      .in("status", ["PAGO", "FINALIZADA"]);

    const inicioUtc = inicio ? new Date(localDayStartToUtcIso(inicio)) : null;
    const fimUtc = fim ? new Date(localNextDayStartToUtcIso(fim)) : null;

    const { data: vendasRows, error: vendasErr } = await queryDb;

    if (vendasErr) {
      console.error("[vendas-setor excel] Erro ao buscar vendas", vendasErr);
      return NextResponse.json({ error: "Erro ao buscar vendas" }, { status: 500 });
    }

    const filteredVendas = (vendasRows || []).filter((venda: any) => {
      const refDateIso = venda.datavenda;
      if (!refDateIso) return !inicioUtc && !fimUtc;

      const d = new Date(refDateIso);
      if (Number.isNaN(d.getTime())) return !inicioUtc && !fimUtc;

      if (inicioUtc && d < inicioUtc) return false;
      if (fimUtc && d >= fimUtc) return false;

      return true;
    });

    if (filteredVendas.length === 0) {
      return NextResponse.json(
        { error: "Nenhuma venda concluída encontrada neste período." },
        { status: 404 }
      );
    }

    const { data: setoresRows } = await supabaseAdmin.from("setor").select("id, nome");
    const mapSetorNome = new Map<string, string>();
    for (const s of setoresRows || []) mapSetorNome.set(String(s.id), s.nome);

    const dataExcel: any[] = [];
    const idSemSetor = "SEM_SETOR";

    for (const venda of filteredVendas) {
      const vinfo = venda.vendedor as any;
      const uId = vinfo ? String(vinfo.id) : "SEM_VENDEDOR";
      const sId = vinfo?.setorid ? String(vinfo.setorid) : idSemSetor;

      if (setorQuery && setorQuery !== "all" && sId !== setorQuery) {
        continue;
      }

      const nomeSetor = sId === idSemSetor ? "Sem Setor" : (mapSetorNome.get(sId) || "Setor Oculto");
      const nomeVendedor = uId === "SEM_VENDEDOR" ? "Sem Vendedor Vinculado" : (vinfo?.nome || vinfo?.email || "Usuário Desconhecido");

      const vTotal = toNum(venda.valortotal);
      const cInfo = Array.isArray(venda.cliente) ? venda.cliente[0] : venda.cliente;
      const cNome = cInfo?.nomerazaosocial ? cInfo.nomerazaosocial : "Cliente Desconhecido";
      const dataVendaStr = venda.datavenda ? format(new Date(venda.datavenda), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "—";
      const percent = toNum(venda.comissao_venda_percent_aplicada);
      const vComissao = (vTotal * percent) / 100;

      dataExcel.push({
        "Setor": nomeSetor,
        "Vendedor": nomeVendedor,
        "Nº Venda": Number(venda.id),
        "Cliente": cNome,
        "Data Venda": dataVendaStr,
        "Status": venda.status,
        "Valor Total": vTotal,
        "Comissão (%)": percent,
        "Comissão (R$)": vComissao,
      });
    }

    if (dataExcel.length === 0) {
      return NextResponse.json(
        { error: "Após aplicar os filtros, não há dados para exportar." },
        { status: 404 }
      );
    }

    // Ordenação: Setor ASC, Vendedor ASC, Data ASC
    dataExcel.sort((a, b) => {
      const cmpSetor = a["Setor"].localeCompare(b["Setor"]);
      if (cmpSetor !== 0) return cmpSetor;
      const cmpVend = a["Vendedor"].localeCompare(b["Vendedor"]);
      if (cmpVend !== 0) return cmpVend;
      return a["Data Venda"].localeCompare(b["Data Venda"]);
    });

    const worksheet = XLSX.utils.json_to_sheet(dataExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Vendas por Setor");
    
    const buf = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Disposition": 'attachment; filename="vendas_por_setor.xlsx"',
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });

  } catch (error) {
    console.error("Erro na exportação Excel (vendas-setor):", error);
    return NextResponse.json({ error: "Erro interno ao gerar Excel" }, { status: 500 });
  }
}
