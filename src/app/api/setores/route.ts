import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ⚠️ Service Role: use SOMENTE no server (route handler) e NUNCA no browser.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // precisa estar setado no .env
  { auth: { persistSession: false, autoRefreshToken: false } }
);

export const revalidate = 0; // sem cache

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const q = (searchParams.get("q") || "").trim();
    // paginação simples
    const limit = Math.min(Number(searchParams.get("limit") ?? 100) || 100, 500);
    const from = Math.max(Number(searchParams.get("from") ?? 0) || 0, 0);
    const to = from + limit - 1;

    let query = supabase
      .from("setor")
      .select("id,nome", { count: "exact" })
      .order("nome", { ascending: true })
      .range(from, to);

    if (q) query = query.ilike("nome", `%${q}%`);

    const { data, error, count } = await query;

    if (error) {
      console.error("GET /api/setores", error);
      return NextResponse.json({ error: "Falha ao listar setores" }, { status: 500 });
    }

    // dica: se quiser devolver count para o front paginar, inclua no payload
    return NextResponse.json(data ?? [], {
      headers: {
        "Cache-Control": "no-store",
        "x-total-count": String(count ?? 0),
      },
    });
  } catch (err: any) {
    console.error("GET /api/setores (unexpected)", err);
    return NextResponse.json({ error: "Erro inesperado" }, { status: 500 });
  }
}
