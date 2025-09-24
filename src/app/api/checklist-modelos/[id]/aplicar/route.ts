// app/api/checklist-modelos/[id]/aplicar/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { auth } from "@/lib/auth";

const OPEN = process.env.OPEN_PERMISSIONS === "true";

const PayloadSchema = z.object({
  ordemservicoid: z.number().int().positive(),
});

type Params = { id: string };

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    if (!OPEN) {
      const session = await auth();
      if (!session) {
        return NextResponse.json(
          { ok: false, error: "Unauthorized" },
          { status: 401 }
        );
      }
    }

    const { id } = await params;            // 👈 mudou
    const modeloId = Number(id);

    const parsed = PayloadSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.flatten?.() ?? String(parsed.error) },
        { status: 400 }
      );
    }
    const { ordemservicoid } = parsed.data;

    // Carrega itens do modelo
    const { data: itens, error: e1 } = await supabaseAdmin
      .from("checklist_modelo_item")
      .select("titulo, descricao, obrigatorio, ordem")
      .eq("modelo_id", modeloId)
      .order("ordem", { ascending: true });

    if (e1) throw e1;
    if (!itens || itens.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Modelo sem itens" },
        { status: 400 }
      );
    }

    // Monta linhas para `public.checklist`
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
    return NextResponse.json(
      {
        ok: false,
        error:
          e?.name === "ZodError"
            ? e.flatten?.() ?? String(e)
            : e?.message ?? "Erro ao aplicar modelo",
      },
      { status: e?.name === "ZodError" ? 400 : 500 }
    );
  }
}
