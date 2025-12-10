import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

function parseId(idParam: string | string[] | undefined): number | null {
  const raw = Array.isArray(idParam) ? idParam[0] : idParam;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

// GET: retorna xml_assinado (rascunho) para edição
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const nfeId = parseId(params.id);
  if (nfeId === null) {
    return NextResponse.json(
      { ok: false, message: "ID inválido" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("nfe")
    .select("id, status, xml_assinado")
    .eq("id", nfeId)
    .maybeSingle();

  if (error) {
    console.error("[GET /api/nfe/:id/xml] erro ao buscar NF-e", error);
    return NextResponse.json(
      { ok: false, message: "Erro ao buscar NF-e", detalhe: error.message },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json(
      { ok: false, message: "NF-e não encontrada" },
      { status: 404 }
    );
  }

  if (data.status !== "RASCUNHO") {
    return NextResponse.json(
      {
        ok: false,
        message: "Somente NF-e em status RASCUNHO podem ter o XML editado",
      },
      { status: 409 }
    );
  }

  return NextResponse.json({
    ok: true,
    id: data.id,
    status: data.status,
    xml: data.xml_assinado ?? "",
  });
}

// PUT: salva XML de rascunho na coluna xml_assinado (sem assinatura)
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const nfeId = parseId(params.id);
  if (nfeId === null) {
    return NextResponse.json(
      { ok: false, message: "ID inválido" },
      { status: 400 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const xml = typeof body.xml === "string" ? body.xml : "";

  if (!xml.trim()) {
    return NextResponse.json(
      { ok: false, message: "XML não pode ser vazio." },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("nfe")
    .select("status")
    .eq("id", nfeId)
    .maybeSingle();

  if (error) {
    console.error("[PUT /api/nfe/:id/xml] erro ao validar NF-e", error);
    return NextResponse.json(
      { ok: false, message: "Erro ao validar NF-e", detalhe: error.message },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json(
      { ok: false, message: "NF-e não encontrada" },
      { status: 404 }
    );
  }

  if (data.status !== "RASCUNHO") {
    return NextResponse.json(
      {
        ok: false,
        message: "Somente NF-e em status RASCUNHO podem ter o XML editado",
      },
      { status: 409 }
    );
  }

  const { error: updateError } = await supabaseAdmin
    .from("nfe")
    .update({
      xml_assinado: xml,
      updatedat: new Date().toISOString(),
    })
    .eq("id", nfeId);

  if (updateError) {
    console.error("[PUT /api/nfe/:id/xml] erro ao salvar XML", updateError);
    return NextResponse.json(
      { ok: false, message: "Erro ao salvar XML", detalhe: updateError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
