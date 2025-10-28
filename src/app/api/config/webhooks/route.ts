// src/app/api/config/webhooks/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 0;
export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

const EMPRESA_ID = 1;

export async function GET() {
  try {
    const r = await supabase
      .from("pagamento_config")
      .select("cartao_webhook_url, pix_webhook_url")
      .eq("empresa_id", EMPRESA_ID)
      .maybeSingle();
    if (r.error) throw r.error;

    return NextResponse.json({
      cartaoWebhookUrl: r.data?.cartao_webhook_url ?? "",
      pixWebhookUrl: r.data?.pix_webhook_url ?? "",
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (e: any) {
    console.error("GET /api/config/webhooks", e);
    return NextResponse.json({ error: "Falha ao carregar Webhooks" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const cartao_webhook_url = body?.cartao_webhook_url ?? null;
    const pix_webhook_url = body?.pix_webhook_url ?? null;

    const up = await supabase
      .from("pagamento_config")
      .upsert({
        empresa_id: EMPRESA_ID,
        cartao_webhook_url,
        pix_webhook_url,
        updated_at: new Date().toISOString(),
      }, { onConflict: "empresa_id" })
      .select("cartao_webhook_url, pix_webhook_url")
      .maybeSingle();
    if (up.error) throw up.error;

    return NextResponse.json({
      ok: true,
      cartaoWebhookUrl: up.data?.cartao_webhook_url ?? "",
      pixWebhookUrl: up.data?.pix_webhook_url ?? "",
    });
  } catch (e: any) {
    console.error("PUT /api/config/webhooks", e);
    return NextResponse.json({ error: "Falha ao salvar Webhooks" }, { status: 500 });
  }
}
