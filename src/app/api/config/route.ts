// app/api/config/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

// Evita cache no App Router
export const revalidate = 0;
export const dynamic = "force-dynamic";

function respostaJSON(body: any, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function booleanValido(v: any) {
  return typeof v === "boolean" ? v : undefined;
}

// Busca sempre a config mais recente (normalmente só existe 1 linha)
async function buscarConfigAtual() {
  const { data, error } = await supabase
    .from("config_geral")
    .select("id, aviso_pagamento, checklist_obrigatorio, alerta_estoque_pdv, habilitar_emissao_nfe, created_at")
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data ?? null;
}

async function criarConfigPadraoSeNaoExistir() {
  const atual = await buscarConfigAtual();
  if (atual) return atual;

  const { data, error } = await supabase
    .from("config_geral")
    .insert({}) // usa defaults do banco
    .select("id, aviso_pagamento, checklist_obrigatorio, created_at")
    .single();

  if (error) throw error;
  return data;
}

export async function GET() {
  try {
    const config = await criarConfigPadraoSeNaoExistir();
    return respostaJSON({ config });
  } catch (err: any) {
    console.error("GET /api/config-geral", err);
    return respostaJSON({ error: "Falha ao buscar configuração geral." }, 500);
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) return respostaJSON({ error: "JSON inválido no body." }, 400);

    // Aceita os campos direto no body:
    // { aviso_pagamento?: boolean, checklist_obrigatorio?: boolean }
    const patch: any = {};

    const avisoPagamento = booleanValido(body.aviso_pagamento);
    const checklistObrigatorio = booleanValido(body.checklist_obrigatorio);

    if (body.aviso_pagamento !== undefined && avisoPagamento === undefined) {
      return respostaJSON(
        { error: "Campo 'aviso_pagamento' deve ser boolean." },
        400
      );
    }
    if (
      body.checklist_obrigatorio !== undefined &&
      checklistObrigatorio === undefined
    ) {
      return respostaJSON(
        { error: "Campo 'checklist_obrigatorio' deve ser boolean." },
        400
      );
    }

    if (avisoPagamento !== undefined) patch.aviso_pagamento = avisoPagamento;
    if (checklistObrigatorio !== undefined)
      patch.checklist_obrigatorio = checklistObrigatorio;

    if (Object.keys(patch).length === 0) {
      return respostaJSON({ error: "Nenhum campo para atualizar." }, 400);
    }

    const atual = await criarConfigPadraoSeNaoExistir();

    const { data, error } = await supabase
      .from("config_geral")
      .update(patch)
      .eq("id", atual.id)
      .select("id, aviso_pagamento, checklist_obrigatorio, created_at")
      .single();

    if (error) {
      console.error("Supabase update error:", error);
      return respostaJSON({ error: "Falha ao atualizar configuração geral." }, 500);
    }

    return respostaJSON({ config: data });
  } catch (err: any) {
    console.error("PUT /api/config-geral", err);
    return respostaJSON({ error: "Falha ao atualizar configuração geral." }, 500);
  }
}
