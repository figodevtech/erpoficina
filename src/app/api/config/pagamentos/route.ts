// src/app/api/config/pagamentos/route.ts
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
      .select("*")
      .eq("empresa_id", EMPRESA_ID)
      .maybeSingle();
    if (r.error) throw r.error;

    const pc = r.data || {};
    const cartaoHabilitado = !!(pc.cartao_merchant_id && pc.cartao_api_key);
    const pixHabilitado = !!pc.pix_chave;

    return NextResponse.json({
      cartao: {
        habilitado: cartaoHabilitado,
        provider: (pc.provider_cartao || "stone") as "stone",
        merchantId: pc.cartao_merchant_id ?? "",
        apiKey: pc.cartao_api_key ?? "",
        webhookUrl: pc.cartao_webhook_url ?? "",
        parcelasMax: pc.cartao_parcelas_max ?? 1,
        capturaAutomatica: pc.cartao_captura_auto ?? true,
        terminalIds: Array.isArray(pc.cartao_terminal_ids) ? pc.cartao_terminal_ids : [],
      },
      pix: {
        habilitado: pixHabilitado,
        provider: (pc.pix_provider || "stone") as "stone" | "banco",
        chave: pc.pix_chave ?? "",
        clientId: pc.pix_client_id ?? "",
        clientSecret: pc.pix_client_secret ?? "",
        webhookUrl: pc.pix_webhook_url ?? "",
        expiracaoSegundos: pc.pix_expiracao_s ?? 1800,
      },
      dinheiro: {
        habilitado: !!pc.dinheiro_habilitado,
      },
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (e: any) {
    console.error("GET /api/config/pagamentos", e);
    return NextResponse.json({ error: "Falha ao carregar Pagamentos" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const p = body?.pagamentos || {};

    const up = await supabase
      .from("pagamento_config")
      .upsert({
        empresa_id: EMPRESA_ID,
        provider_cartao: p.cartao?.provider ?? "stone",
        cartao_merchant_id: p.cartao?.habilitado ? (p.cartao?.merchantId ?? null) : null,
        cartao_api_key: p.cartao?.habilitado ? (p.cartao?.apiKey ?? null) : null,
        cartao_webhook_url: p.cartao?.webhookUrl ?? null,
        cartao_parcelas_max: Number(p.cartao?.parcelasMax ?? 1),
        cartao_captura_auto: !!p.cartao?.capturaAutomatica,
        cartao_terminal_ids: Array.isArray(p.cartao?.terminalIds) ? p.cartao.terminalIds : [],
        pix_provider: p.pix?.provider ?? "stone",
        pix_chave: p.pix?.habilitado ? (p.pix?.chave ?? null) : null,
        pix_client_id: p.pix?.clientId ?? null,
        pix_client_secret: p.pix?.clientSecret ?? null,
        pix_webhook_url: p.pix?.webhookUrl ?? null,
        pix_expiracao_s: Number(p.pix?.expiracaoSegundos ?? 1800),
        dinheiro_habilitado: !!p.dinheiro?.habilitado,
        updated_at: new Date().toISOString(),
      }, { onConflict: "empresa_id" })
      .select("*")
      .maybeSingle();
    if (up.error) throw up.error;

    const pc = up.data!;
    const cartaoHabilitado = !!(pc.cartao_merchant_id && pc.cartao_api_key);
    const pixHabilitado = !!pc.pix_chave;

    return NextResponse.json({
      ok: true,
      pagamentos: {
        cartao: {
          habilitado: cartaoHabilitado,
          provider: (pc.provider_cartao || "stone") as "stone",
          merchantId: pc.cartao_merchant_id ?? "",
          apiKey: pc.cartao_api_key ?? "",
          webhookUrl: pc.cartao_webhook_url ?? "",
          parcelasMax: pc.cartao_parcelas_max ?? 1,
          capturaAutomatica: pc.cartao_captura_auto ?? true,
          terminalIds: Array.isArray(pc.cartao_terminal_ids) ? pc.cartao_terminal_ids : [],
        },
        pix: {
          habilitado: pixHabilitado,
          provider: (pc.pix_provider || "stone") as "stone" | "banco",
          chave: pc.pix_chave ?? "",
          clientId: pc.pix_client_id ?? "",
          clientSecret: pc.pix_client_secret ?? "",
          webhookUrl: pc.pix_webhook_url ?? "",
          expiracaoSegundos: pc.pix_expiracao_s ?? 1800,
        },
        dinheiro: {
          habilitado: !!pc.dinheiro_habilitado,
        },
      },
    });
  } catch (e: any) {
    console.error("PUT /api/config/pagamentos", e);
    return NextResponse.json({ error: "Falha ao salvar Pagamentos" }, { status: 500 });
  }
}
