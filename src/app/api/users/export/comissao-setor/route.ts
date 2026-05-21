export const runtime = "nodejs";

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

function toNum(v: any): number | null {
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const inicio = (searchParams.get("inicio") ?? "").trim();
    const fim = (searchParams.get("fim") ?? "").trim();
    const setorQuery = (searchParams.get("setor") ?? "").trim();

    // 1. Buscar a OS baseada na data + filtro de concluída
    let osQueryDb = supabaseAdmin
      .from("ordemservico")
      .select("id, status, datasaida, createdat, execucao_inicio_em, execucao_fim_em")
      .eq("status", "CONCLUIDO");

    const inicioUtc = inicio ? new Date(localDayStartToUtcIso(inicio)) : null;
    const fimUtc = fim ? new Date(localNextDayStartToUtcIso(fim)) : null;

    const { data: osRows, error: osErr } = await osQueryDb;

    if (osErr) {
      console.error("[export-comissao-setor] erro buscar ordens", osErr);
      return NextResponse.json({ error: "Erro ao buscar OS." }, { status: 500 });
    }

    const filteredOsList = (osRows || []).filter((os: any) => {
      const refDateIso = os.datasaida || os.createdat;
      if (!refDateIso) return !inicioUtc && !fimUtc;

      const d = new Date(refDateIso);
      if (Number.isNaN(d.getTime())) return !inicioUtc && !fimUtc;

      if (inicioUtc && d < inicioUtc) return false;
      if (fimUtc && d >= fimUtc) return false;

      return true;
    });

    const filteredOsIds = filteredOsList.map((os) => Number(os.id));

    if (filteredOsIds.length === 0) {
      return NextResponse.json({ error: "Nenhuma ordem encontrada." }, { status: 404 });
    }

    // Datas Auxiliares (Inicio e Fim da execução e DataSaida de Conclusão)
    const mapOsMetadata = new Map<number, { execInicio: string; execFim: string; dataConclusion: string }>();
    for (const os of filteredOsList) {
      const conclIso = os.datasaida || os.createdat;
      mapOsMetadata.set(Number(os.id), {
        execInicio: os.execucao_inicio_em ? format(new Date(os.execucao_inicio_em), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "",
        execFim: os.execucao_fim_em ? format(new Date(os.execucao_fim_em), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "",
        dataConclusion: conclIso ? format(new Date(conclIso), "dd/MM/yyyy", { locale: ptBR }) : "",
      });
    }

    // 2. Serviço (descrição)
    const { data: osServicosRel, error: osServicosErr } = await supabaseAdmin
      .from("osservico")
      .select("ordemservicoid, servicoid, servico(descricao)")
      .in("ordemservicoid", filteredOsIds);

    if (osServicosErr) throw osServicosErr;

    const mapServicoDesc = new Map<string, string>();
    for (const r of osServicosRel as any[]) {
      mapServicoDesc.set(`${r.ordemservicoid}::${r.servicoid}`, r.servico?.descricao || "S/ Descrição");
    }

    // 3. Comissões / Realizadores
    const { data: comissoes, error: comissoesErr } = await supabaseAdmin
      .from("osservico_realizador")
      .select("ordemservicoid, servicoid, usuarioid, valor_comissao, valor_base, comissao_percent_aplicada")
      .in("ordemservicoid", filteredOsIds);

    if (comissoesErr) throw comissoesErr;

    const relRealizadores = comissoes || [];
    if (relRealizadores.length === 0) {
      return NextResponse.json({ error: "Sem realizadores nesse período." }, { status: 404 });
    }

    const userIds = Array.from(new Set(relRealizadores.map((i: any) => i.usuarioid).filter(Boolean)));

    // 4. Usuários e Setores
    const { data: userRows } = userIds.length
      ? await supabaseAdmin.from("usuario").select("id, nome, email, setorid").in("id", userIds)
      : { data: [] };

    const { data: setoresRows } = await supabaseAdmin.from("setor").select("id, nome");

    const mapUsuarios = new Map<string, any>();
    for (const u of userRows || []) mapUsuarios.set(String(u.id), u);

    const mapSetorNome = new Map<string, string>();
    for (const s of setoresRows || []) mapSetorNome.set(String(s.id), s.nome);

    // 5. Montar Planilha ("Plana")
    const flatRows: any[] = [];
    const idSemSetor = "SEM_SETOR";

    for (const row of relRealizadores as any[]) {
      const uId = String(row.usuarioid);
      const usuarioInfo = mapUsuarios.get(uId);
      const sId = usuarioInfo?.setorid ? String(usuarioInfo.setorid) : idSemSetor;
      
      if (setorQuery && setorQuery !== "all" && sId !== setorQuery) {
        continue; // Ignora os outros setores se filtrado
      }

      const nomeSetor = sId === idSemSetor ? "Sem Setor" : (mapSetorNome.get(sId) || "Oculto");
      const nomeUser = usuarioInfo?.nome || usuarioInfo?.email || "Usuário Desconhecido";
      const osId = Number(row.ordemservicoid);
      const metadata = mapOsMetadata.get(osId);
      
      const vBase = toNum(row.valor_base) || 0;
      const vPerc = toNum(row.comissao_percent_aplicada) || 0;
      const vComissao = toNum(row.valor_comissao) || 0;

      flatRows.push({
        OS: osId,
        "Data de Conclusão": metadata?.dataConclusion || "",
        "Início da Execução": metadata?.execInicio || "",
        "Fim da Execução": metadata?.execFim || "",
        Setor: nomeSetor,
        Funcionário: nomeUser,
        Serviço: mapServicoDesc.get(`${osId}::${row.servicoid}`) || "N/A",
        "Valor Base": vBase,
        "Percentual (%)": vPerc,
        Comissão: vComissao,
      });
    }

    if (flatRows.length === 0) {
      return NextResponse.json({ error: "Nenhum resultado final após aplicar as filtragens." }, { status: 404 });
    }

    // Ordenação visual: Setor -> Funcionario -> OS
    flatRows.sort((a, b) => {
      const s = a.Setor.localeCompare(b.Setor);
      if (s !== 0) return s;
      const f = a.Funcionário.localeCompare(b.Funcionário);
      if (f !== 0) return f;
      return a.OS - b.OS;
    });

    // 6. Gerar Buffer XLSX
    const ws = XLSX.utils.json_to_sheet(flatRows);

    ws["!cols"] = [
      { wch: 10 },  // OS
      { wch: 18 },  // Dt Conclusao
      { wch: 18 },  // Dt Inicio
      { wch: 18 },  // Dt Fim
      { wch: 25 },  // Setor
      { wch: 30 },  // Funcionario
      { wch: 35 },  // Servico
      { wch: 15 },  // V base
      { wch: 15 },  // Perc %
      { wch: 15 },  // Comissao
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Comissões por Setor");

    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    return new Response(buf, {
      status: 200,
      headers: {
        "Content-Disposition": 'attachment; filename="comissao_por_setor.xlsx"',
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (err: any) {
    console.error("[export-comissao-setor] /api/users/export/comissao-setor:", err);
    return NextResponse.json(
      { error: "Falha na exportação." },
      { status: 500 }
    );
  }
}
