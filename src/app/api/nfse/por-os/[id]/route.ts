import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const osId = Number(id);

    if (!Number.isFinite(osId) || osId <= 0) {
      return NextResponse.json(
        { ok: false, message: "ID da OS inválido." },
        { status: 400 }
      );
    }

    const { data: nfses, error } = await supabaseAdmin
      .from("nfse")
      .select("*")
      .eq("ordemservicoid", osId)
      .order("createdat", { ascending: false });

    if (error) {
      console.error("[GET /api/nfse/por-os]", error);
      return NextResponse.json(
        { ok: false, message: "Erro ao buscar NFS-e." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, osId, nfses: nfses || [] }, { status: 200 });
  } catch (e: any) {
    console.error("[GET /api/nfse/por-os] exception", e);
    return NextResponse.json(
      { ok: false, message: "Erro inesperado ao buscar NFS-e." },
      { status: 500 }
    );
  }
}
