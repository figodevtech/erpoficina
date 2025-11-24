// src/app/api/servicos/buscar/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0; // sem cache

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = Math.max(Number(searchParams.get("page") ?? 1), 1);
    const q = (searchParams.get("search") ?? searchParams.get("q") ?? "").trim();
    const codigo = (searchParams.get("codigo") || "").trim();

    const limit = Math.min(Number(searchParams.get("limit") ?? 50) || 50, 200);
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("servico")
      .select(
        "id,codigo,descricao,precohora,cnae,itemlistaservico",
        { count: "exact" } // <- pega o total pra paginação
      )
      .range(from, to)
      .order("descricao", { ascending: true });

    if (codigo && !q) {
      query = query.ilike("codigo", `%${codigo}%`);
    }

    if (q) {
      (query as any).or(
        `descricao.ilike.%${q}%,cnae.ilike.%${q}%,itemlistaservico.ilike.%${q}%,codigo.ilike.%${q}%`
      );
    }

    const { data, error, count } = await query;

    if (error) throw error;

    const servicos = (data ?? []).map((s: any) => ({
      id: Number(s.id),
      codigo: String(s.codigo ?? ""),
      descricao: String(s.descricao ?? ""),
      precohora: Number(s.precohora ?? 0),
    }));

    const total = count ?? 0;
    const totalPages = total > 0 ? Math.ceil(total / limit) : 0;
    const pageCount = servicos.length;

    return NextResponse.json(
      {
        servicos,
        pagination: {
          total,      // total de registros no banco (dentro do filtro)
          page,       // página atual
          limit,      // limite por página
          totalPages, // total de páginas
          pageCount,  // qtde de itens retornados nesta página
        },
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err: any) {
    console.error("GET /api/servicos/buscar", err);
    return NextResponse.json(
      { error: "Falha ao buscar serviços" },
      { status: 500 }
    );
  }
}
