import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const params = await ctx.params;
    const entradaId = Number(params.id);

    if (isNaN(entradaId)) {
      return NextResponse.json(
        { ok: false, message: "ID de entrada inválido" },
        { status: 400 }
      );
    }

    const { data: nfes, error } = await supabaseAdmin
      .from("nfe")
      .select("*")
      .eq("entradaid", entradaId)
      .order("id", { ascending: false });

    if (error) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      entradaId,
      nfes: nfes || [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, message: error.message },
      { status: 500 }
    );
  }
}
