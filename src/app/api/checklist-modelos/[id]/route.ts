// app/api/checklist-modelos/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { auth } from "@/lib/auth";

const OPEN = process.env.OPEN_PERMISSIONS === "true";

const ItemSchema = z.object({
  titulo: z.string().min(1),
  descricao: z.string().optional(),
  categoria: z.string().optional().default(""),
  obrigatorio: z.boolean().optional().default(false),
  ordem: z.number().int().optional().default(0),
});

const ModeloUpdateSchema = z.object({
  nome: z.string().min(1),
  descricao: z.string().optional().default(""),
  categoria: z.string().optional().default(""),
  ativo: z.boolean().optional().default(true),
  itens: z.array(ItemSchema).min(1),
});

type Params = { id: string };

export async function GET(_req: NextRequest, { params }: { params: Promise<Params> }) {
  try {
    if (!OPEN) {
      const session = await auth();
      if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const modeloId = Number(id);

    const { data, error } = await supabaseAdmin
      .from("checklist_modelo")
      .select("id, nome, descricao, categoria, ativo, criado_em, atualizado_em, checklist_modelo_item(*)")
      .eq("id", modeloId)
      .single();

    if (error) throw error;
    if (!data) return NextResponse.json({ ok: false, error: "Não encontrado" }, { status: 404 });

    const ret = { ...data, itens: data.checklist_modelo_item ?? [], checklist_modelo_item: undefined as undefined };
    return NextResponse.json({ ok: true, data: ret });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Erro ao carregar" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<Params> }) {
  try {
    if (!OPEN) {
      const session = await auth();
      if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const modeloId = Number(id);

    const body = await req.json();
    const parsed = ModeloUpdateSchema.parse(body);

    // Atualiza cabeçalho
    const { error: e1 } = await supabaseAdmin
      .from("checklist_modelo")
      .update({
        nome: parsed.nome,
        descricao: parsed.descricao,
        categoria: parsed.categoria,
        ativo: parsed.ativo,
        atualizado_em: new Date().toISOString(),
      })
      .eq("id", modeloId);
    if (e1) throw e1;

    // Estratégia simples: substitui todos os itens
    const { error: e2 } = await supabaseAdmin.from("checklist_modelo_item").delete().eq("modelo_id", modeloId);
    if (e2) throw e2;

    const itens = parsed.itens.map((it, idx) => ({
      modelo_id: modeloId,
      titulo: it.titulo,
      descricao: it.descricao ?? null,
      categoria: it.categoria ?? "",
      obrigatorio: !!it.obrigatorio,
      ordem: it.ordem ?? idx,
    }));

    const { error: e3 } = await supabaseAdmin.from("checklist_modelo_item").insert(itens);
    if (e3) throw e3;

    // Retorna atualizado
    const { data, error: e4 } = await supabaseAdmin
      .from("checklist_modelo")
      .select("id, nome, descricao, categoria, ativo, criado_em, atualizado_em, checklist_modelo_item(*)")
      .eq("id", modeloId)
      .single();
    if (e4) throw e4;

    const ret = { ...data, itens: data.checklist_modelo_item ?? [], checklist_modelo_item: undefined as undefined };
    return NextResponse.json({ ok: true, data: ret });
  } catch (e: any) {
    if (e?.name === "ZodError") {
      return NextResponse.json({ ok: false, error: e.flatten?.() ?? String(e) }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: e?.message ?? "Erro ao atualizar" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<Params> }) {
  try {
    if (!OPEN) {
      const session = await auth();
      if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const modeloId = Number(id);

    // ON DELETE CASCADE no FK cuida dos itens
    const { error } = await supabaseAdmin.from("checklist_modelo").delete().eq("id", modeloId);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Erro ao excluir" }, { status: 500 });
  }
}
