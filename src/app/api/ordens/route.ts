// app/api/ordens/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { StatusOS } from "@/app/(app)/(pages)/ordens/types";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = (searchParams.get("status") as StatusOS) || "TODAS";
    const q = searchParams.get("q")?.trim() || "";
    const limit = Math.min(Math.max(Number(searchParams.get("limit") ?? 10), 1), 200);
    const page = Math.max(Number(searchParams.get("page") ?? 1), 1);
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabaseAdmin
      .from("ordemservico")
      .select(
        `
        id,
        descricao,
        prioridade,
        orcamentototal,
        status,
        dataentrada,
        datasaida,
        cliente:clienteid ( id, nomerazaosocial ),
        veiculo:veiculoid ( id, placa, modelo, marca ),
        setor:setorid ( id, nome ),
        transacoes:transacao!transacao_ordemservicoid_fkey (
          id,
          descricao,
          valor,
          data,
          metodopagamento,
          categoria,
          tipo,
          banco_id,
          nomepagador,
          cpfcnpjpagador,
          created_at,
          updated_at
        )
      `,
        { count: "exact" }
      )
      .order("dataentrada", { ascending: false }) // ordenação do pai
      .range(from, to)
      // ordenação do array filho (usa o alias "transacoes")
      .order("data", { foreignTable: "transacoes", ascending: false })
      // opcional: limitar quantidade de transações por OS
      .limit(50, { foreignTable: "transacoes" });

    if (status && status !== "TODAS") query = query.eq("status", status);
    if (q) query = query.ilike("descricao", `%${q}%`);

    const { data, error, count } = await query;
    if (error) throw error;

    const items = (data ?? []).map((r: any) => ({
      id: r.id as number,
      descricao: (r.descricao as string) ?? "",
      prioridade: (r.prioridade as "ALTA" | "NORMAL" | "BAIXA" | null) ?? null,
      status: r.status as Exclude<StatusOS, "TODAS">,
      dataEntrada: r.dataentrada as string | null,
      orcamentototal: r.orcamentototal as number | null, // atenção: numeric pode vir como string
      dataSaida: r.datasaida as string | null,
      cliente: r.cliente ? { id: r.cliente.id as number, nome: r.cliente.nomerazaosocial as string } : null,
      veiculo: r.veiculo
        ? { id: r.veiculo.id as number, placa: r.veiculo.placa as string, modelo: r.veiculo.modelo as string, marca: r.veiculo.marca as string }
        : null,
      setor: r.setor ? { id: r.setor.id as number, nome: r.setor.nome as string } : null,
      transacoes: (r.transacoes ?? []).map((t: any) => ({
        id: Number(t.id),
        descricao: t.descricao as string,
        valor: Number(t.valor), // pode vir como string dependendo da config do client
        data: t.data as string,
        metodoPagamento: t.metodopagamento as string,
        categoria: t.categoria as string,
        tipo: t.tipo as string, // p.ex. 'ENTRADA' | 'SAIDA'
        bancoId: Number(t.banco_id),
        pagador: { nome: t.nomepagador as string, cpfcnpj: t.cpfcnpjpagador as string },
        createdAt: t.created_at as string,
        updatedAt: t.updated_at as string,
      })),
    }));

    const total = count ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const pageCount = items.length;

    return NextResponse.json({ items, page, limit, total, totalPages, pageCount });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Erro ao listar OS" }, { status: 500 });
  }
}
