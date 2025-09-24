// app/api/checklist-modelos/[id]/aplicar/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { auth } from "@/lib/auth";

const OPEN = process.env.OPEN_PERMISSIONS === "true";

const PayloadSchema = z.object({
  ordemservicoid: z.number().int().positive(),
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    if (!OPEN) {
      const session = await auth();
      if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const modeloId = Number(params.id);
    const { ordemservicoid } = PayloadSchema.parse(await req.json());

    // Carrega itens do modelo
    const { data: itens, error: e1 } = await supabaseAdmin
      .from("checklist_modelo_item")
      .select("titulo, descricao, obrigatorio, ordem")
      .eq("modelo_id", modeloId)
      .order("ordem", { ascending: true });

    if (e1) throw e1;
    if (!itens || itens.length === 0) {
      return NextResponse.json({ ok: false, error: "Modelo sem itens" }, { status: 400 });
    }

    // Insere na tabela existente `public.checklist`
    // status inicial: 'PENDENTE' (enum_status_checklist)
    const rows = itens.map((i) => ({
      ordemservicoid,
      item: i.titulo,
      status: "PENDENTE" as const,
      observacao: i.descricao ?? null,
    }));

    const { error: e2 } = await supabaseAdmin.from("checklist").insert(rows);
    if (e2) throw e2;

    return NextResponse.json({ ok: true, inserted: rows.length });
  } catch (e: any) {
    if (e?.name === "ZodError") {
      return NextResponse.json({ ok: false, error: e.flatten?.() ?? String(e) }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: e?.message ?? "Erro ao aplicar modelo" }, { status: 500 });
  }
}
