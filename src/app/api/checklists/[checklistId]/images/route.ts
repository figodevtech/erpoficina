// src/app/api/checklists/[checklistId]/images/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
// Se você autentica aqui também, descomente a linha abaixo
// import { auth } from "@/lib/auth";

type Params = { checklistId: string };

export async function GET(
  _req: NextRequest,
  context: { params: Promise<Params> } // Next 15: params é Promise
) {
  try {
    // Se usar auth, descomente:
    // const session = await auth();
    // if (!session?.user) {
    //   return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    // }

    const { checklistId } = await context.params;

    const idNum = Number(checklistId);
    if (!Number.isFinite(idNum)) {
      return NextResponse.json({ error: "checklistId inválido" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("imagemvistoria")
      .select("id, url, descricao, createdat")
      .eq("checklistid", idNum)
      .order("createdat", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ images: data ?? [] });
  } catch (err: any) {
    console.error("[GET] /api/checklists/[checklistId]/images", err);
    return NextResponse.json(
      { error: err?.message ?? "Erro inesperado" },
      { status: 500 }
    );
  }
}
