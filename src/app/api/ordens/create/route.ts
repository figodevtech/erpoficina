export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { auth } from "@/lib/auth";
import { requireOSAccess } from "../../_authz/perms";

type NovoChecklistItem = { item: string; status?: string; observacao?: string };

export async function POST(req: Request) {
  try {
    await requireOSAccess();

    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const uid = (session.user as any).id as string;

    const body = await req.json();
    const {
      clienteid,
      veiculoid,
      setorid,
      tipoos,
      descricao,
      datasaidaprevista,
      checklistItems = [] as NovoChecklistItem[],
    } = body || {};

    if (!clienteid || !setorid || !tipoos)
      return NextResponse.json({ error: "Cliente, Setor e Tipo de OS são obrigatórios" }, { status: 400 });

    const { data: os, error: osErr } = await supabaseAdmin
      .from("ordemservico")
      .insert({
        clienteid,
        veiculoid: veiculoid ?? null,
        setorid,
        tipoos,
        descricao: descricao ?? null,
        status: "ABERTA",
        statusaprovacao: "PENDENTE",
        usuariocriadorid: uid,
        datasaidaprevista: datasaidaprevista ?? null,
      })
      .select("id")
      .single();

    if (osErr) throw osErr;

    if (Array.isArray(checklistItems) && checklistItems.length) {
      const rows = checklistItems
        .filter((c) => c?.item?.trim())
        .map((c) => ({
          ordemservicoid: os.id,
          item: c.item.trim(),
          status: (c.status ?? "PENDENTE") as any, // enum_status_checklist
          observacao: c.observacao ?? null,
        }));
      if (rows.length) {
        const { error: ckErr } = await supabaseAdmin.from("checklist").insert(rows);
        if (ckErr) throw ckErr;
      }
    }

    return NextResponse.json({ ok: true, id: os.id });
  } catch (e: any) {
    const status = e?.statusCode ?? (/não autenticado|unauth/i.test(e?.message) ? 401 : 500);
    return NextResponse.json({ error: e?.message ?? "Erro ao criar OS" }, { status });
  }
}
