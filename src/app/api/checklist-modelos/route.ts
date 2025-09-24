// app/api/checklist-modelos/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// helper booleano para querystring
function isTrue(v: string | null) {
  if (!v) return false;
  return ["1", "true", "yes", "on"].includes(v.toLowerCase());
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const onlyActive = isTrue(searchParams.get("ativos"));

    // 1) Modelos
    let q = supabaseAdmin
      .from("checklist_modelo")
      .select("id, nome, descricao, categoria, ativo")
      .order("nome", { ascending: true });

    if (onlyActive) q = q.eq("ativo", true);

    const { data: modelos, error: e1 } = await q;

    if (e1) {
      return NextResponse.json({ ok: false, error: e1.message }, { status: 500 });
    }
    if (!modelos?.length) {
      return NextResponse.json({ ok: true, items: [] }, { status: 200 });
    }

    // 2) Itens por modelo
    const ids = modelos.map((m) => m.id);
    const { data: itens, error: e2 } = await supabaseAdmin
      .from("checklist_modelo_item")
      .select("id, modelo_id, titulo, descricao, obrigatorio, categoria, ordem")
      .in("modelo_id", ids)
      .order("ordem", { ascending: true });

    if (e2) {
      return NextResponse.json({ ok: false, error: e2.message }, { status: 500 });
    }

    // 3) Agrupa
    const porModelo = new Map<number, any[]>();
    for (const it of itens ?? []) {
      const list = porModelo.get(it.modelo_id) ?? [];
      list.push({
        id: String(it.id),
        titulo: it.titulo,
        descricao: it.descricao ?? null,
        obrigatorio: !!it.obrigatorio,
        categoria: it.categoria ?? null,
        ordem: it.ordem ?? null,
      });
      porModelo.set(it.modelo_id, list);
    }

    const items = modelos.map((m) => ({
      id: String(m.id),
      nome: m.nome,
      descricao: m.descricao ?? null,
      categoria: m.categoria ?? null,
      ativo: !!m.ativo,
      itens: porModelo.get(m.id) ?? [],
    }));

    return NextResponse.json({ ok: true, items }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? "Erro inesperado" }, { status: 500 });
  }
}
