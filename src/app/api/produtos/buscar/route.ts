import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 0;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim();
    const codigo = (searchParams.get("codigo") || "").trim();

    const limit = Math.min(Number(searchParams.get("limit") ?? 50) || 50, 200);
    const from = Math.max(Number(searchParams.get("from") ?? 0) || 0, 0);
    const to = from + limit - 1;

    let query = supabase
      .from("produto")
      .select("id,codigo,descricao,precounitario,estoque,ean,referencia,titulo", { count: "exact" })
      .range(from, to)
      .order("descricao", { ascending: true });

    if (codigo) {
      query = query.ilike("codigo", `%${codigo}%`);
    }
    if (q) {
      const filters = [
        `descricao.ilike.%${q}%`,
        `titulo.ilike.%${q}%`,
        `referencia.ilike.%${q}%`,
        `ean.ilike.%${q}%`,
      ].join(",");
      // cast pontual para contornar o typing genérico do .or(...)
      query = (query as any).or(filters);
    }

    const { data, error } = await query;
    if (error) throw error;

    const produtos = (data ?? []).map((p: any) => ({
      id: p.id,
      codigo: p.codigo,
      descricao: p.descricao || p.titulo || "",
      precounitario: Number(p.precounitario || 0),
      estoque: Number(p.estoque || 0),
    }));

    return NextResponse.json({ produtos }, { headers: { "Cache-Control": "no-store" } });
  } catch (err: any) {
    console.error("GET /api/produtos/buscar", err);
    return NextResponse.json({ error: "Falha ao buscar produtos" }, { status: 500 });
  }
}
