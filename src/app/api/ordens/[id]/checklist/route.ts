export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

/** enums do banco */
type DBChecklistStatus = "OK" | "ALERTA" | "FALHA";

type ChecklistItemBody = {
  item: string;
  status?: DBChecklistStatus | string | null;
  observacao?: string | null;
};

type Body = {
  checklistTemplateId: string | null;
  checklist: ChecklistItemBody[];
};

type Params = { id: string };
type MaybePromise<T> = T | Promise<T>;
async function resolveParams(p: MaybePromise<Params>) {
  return await Promise.resolve(p);
}

function toDbChecklistStatusOrNull(v: unknown): DBChecklistStatus | null {
  const t = String(v ?? "").trim().toUpperCase();
  return t === "OK" || t === "ALERTA" || t === "FALHA" ? (t as DBChecklistStatus) : null;
}

export async function PUT(req: NextRequest, ctx: { params: MaybePromise<Params> }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { id } = await resolveParams(ctx.params);
    const osId = Number(id);
    if (!osId || Number.isNaN(osId)) {
      return NextResponse.json({ error: "ID de OS inválido" }, { status: 400 });
    }

    const body = (await req.json()) as Body;

    const checklistModeloId =
      body?.checklistTemplateId && /^\d+$/.test(String(body.checklistTemplateId))
        ? Number(body.checklistTemplateId)
        : null;

    const reqItens = Array.isArray(body.checklist) ? body.checklist : [];
    if (!reqItens.length) {
      return NextResponse.json({ error: "Checklist vazio." }, { status: 400 });
    }

    // garante que a OS existe
    const { data: os, error: eOS } = await supabaseAdmin
      .from("ordemservico")
      .select("id")
      .eq("id", osId)
      .maybeSingle();

    if (eOS) throw eOS;
    if (!os) {
      return NextResponse.json({ error: "OS não encontrada." }, { status: 404 });
    }

    // apaga checklist anterior (se houver)
    await supabaseAdmin.from("checklist").delete().eq("ordemservicoid", osId);

    const itens = reqItens
      .map((x) => {
        const label = (x?.item || "").trim();
        const status = toDbChecklistStatusOrNull(x?.status);
        if (!label || !status) return null;
        return {
          ordemservicoid: osId,
          item: label,
          status, // "OK" | "ALERTA" | "FALHA"
          observacao: (x?.observacao ?? null) as string | null,
        };
      })
      .filter(Boolean) as Array<{
      ordemservicoid: number;
      item: string;
      status: DBChecklistStatus;
      observacao: string | null;
    }>;

    if (!itens.length) {
      return NextResponse.json(
        { error: "Nenhum item de checklist válido para salvar." },
        { status: 400 }
      );
    }

    const { data: inserted, error: eCheck } = await supabaseAdmin
      .from("checklist")
      .insert(itens)
      .select("id, item, status, observacao");

    if (eCheck) throw eCheck;

    const checklistCreated = inserted ?? [];

    // atualiza OS para ORCAMENTO + vincula modelo de checklist (se enviado)
    const patch: any = {
      status: "ORCAMENTO",
    };
    if (checklistModeloId) {
      patch.checklist_modelo_id = checklistModeloId;
    }

    const { error: eUpdate } = await supabaseAdmin
      .from("ordemservico")
      .update(patch)
      .eq("id", osId);

    if (eUpdate) throw eUpdate;

    return NextResponse.json({ id: osId, checklistCreated }, { status: 200 });
  } catch (err: any) {
    console.error("PUT /api/ordens/[id]/checklist", err);
    return NextResponse.json(
      { error: err?.message || "Erro ao salvar checklist" },
      { status: 500 }
    );
  }
}
