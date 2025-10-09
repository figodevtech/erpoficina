// app/api/ordens/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type StatusOS = "TODAS" | "ABERTA" | "EM_ANDAMENTO" | "AGUARDANDO_PECA" | "CONCLUIDA" | "CANCELADA";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = (searchParams.get("status") as StatusOS) || "TODAS";
    const q = searchParams.get("q")?.trim() || "";
    const limit = Math.min(Math.max(Number(searchParams.get("limit") ?? 10), 1), 200);
    const page = Math.max(Number(searchParams.get("page") ?? 1), 1);
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // base
    let query = supabaseAdmin
      .from("ordemservico")
      .select(
        `
        id,
        descricao,
        prioridade,
        status,
        dataentrada,
        datasaida,
        cliente:clienteid ( id, nomerazaosocial ),
        veiculo:veiculoid ( id, placa, modelo, marca ),
        setor:setorid ( id, nome )
      `,
        { count: "exact" }
      )
      .order("dataentrada", { ascending: false }) 
      .range(from, to);

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
      dataSaida: r.datasaida as string | null,
      cliente: r.cliente ? { id: r.cliente.id as number, nome: r.cliente.nomerazaosocial as string } : null,
      veiculo: r.veiculo
        ? { id: r.veiculo.id as number, placa: r.veiculo.placa as string, modelo: r.veiculo.modelo as string, marca: r.veiculo.marca as string }
        : null,
      setor: r.setor ? { id: r.setor.id as number, nome: r.setor.nome as string } : null,
    }));

    const total = count ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const pageCount = items.length;

    return NextResponse.json({ items, page, limit, total, totalPages, pageCount });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Erro ao listar OS" }, { status: 500 });
  }
}
