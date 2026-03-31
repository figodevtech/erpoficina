import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const referencia = body.ref;
    const status = body.status;

    if (!referencia) {
      return NextResponse.json({ ok: false, message: "Webhook: ref ausente." }, { status: 400 });
    }

    const { data: nfse, error: findError } = await supabaseAdmin
      .from("nfse")
      .select("id, status")
      .eq("referencia", referencia)
      .single();

    if (findError || !nfse) {
      console.warn(`[Webhook Focus NFe] NFSe não encontrada para referência: ${referencia}`);
      // return 200 so they stop retrying
      return NextResponse.json({ ok: true, message: "Ignorado - não encontrado." }, { status: 200 });
    }

    const updateData: any = {
      status: status ? status.toUpperCase() : "PROCESSANDO",
      erros: body.erros || null,
      numero: body.numero || undefined,
      codigo_verificacao: body.codigo_verificacao || undefined,
      qr_code_url: body.url || undefined,
      url_xml: body.caminho_xml_nota_fiscal || undefined,
      url_pdf: body.url ? `${body.url}` : undefined,
      protocolo: body.protocolo || undefined,
      updatedat: new Date().toISOString(),
    };

    // Clean undefined fields
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const { error: updateError } = await supabaseAdmin
      .from("nfse")
      .update(updateData)
      .eq("id", nfse.id);

    if (updateError) {
      console.error("[Webhook Focus NFe] Erro ao atualizar NFSe no webhook", updateError);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[Webhook Focus NFe] Exception", e);
    // Returning 200 to avoid indefinite retries if it's a structural error, unless we want retries.
    return NextResponse.json({ ok: true, message: "Erro interno, mas recebido" }, { status: 200 });
  }
}
