// app/api/ordens/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined; // ABERTA | EM_ANDAMENTO | ...
    const search = searchParams.get("q")?.trim() || undefined;
    const limit = Math.min(Number(searchParams.get("limit") ?? 10), 200);
    const page = Math.max(Number(searchParams.get("page") ?? 1), 1);
    const offset = (page - 1) * limit;

    let q = supabaseAdmin
      .from("ordemservico")
      .select(
        `
        id,
        descricao,
        status,
        dataentrada,
        datasaidaprevista,
        datasaidareal,
        cliente:clienteid ( id, nomerazaosocial ),
        veiculo:veiculoid ( id, placa, modelo, marca ),
        setor:setorid ( id, nome )
      `,
        { count: "exact" }
      )
      .order("dataentrada", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && status !== "TODAS") q = q.eq("status", status);
    if (search) q = q.ilike("descricao", `%${search}%`);

    const { data, error, count } = await q;
    if (error) throw error;

    const items = (data ?? []).map((r: any) => ({
      id: r.id,
      descricao: r.descricao ?? "",
      status: r.status,
      dataEntrada: r.dataentrada,
      dataSaidaPrevista: r.datasaidaprevista,
      dataSaidaReal: r.datasaidareal,
      cliente: r.cliente ? { id: r.cliente.id, nome: r.cliente.nomerazaosocial } : null,
      veiculo: r.veiculo ? { id: r.veiculo.id, placa: r.veiculo.placa, modelo: r.veiculo.modelo, marca: r.veiculo.marca } : null,
      setor: r.setor ? { id: r.setor.id, nome: r.setor.nome } : null,
    }));

    return NextResponse.json({
      items,
      page,
      limit,
      total: count ?? 0,
      totalPages: Math.max(1, Math.ceil((count ?? 0) / limit)),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Erro ao listar OS" }, { status: 500 });
  }
}
