import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { InvoiceDraftService } from "@/services/invoice/InvoiceDraftService";
import { EntryAdapter } from "@/services/invoice/adapters/EntryAdapter";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> } // Next.js 15
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

    // 1. Buscar Entrada Completa (com Fornecedor e Itens)
    const { data: entrada, error: entError } = await supabaseAdmin
        .from('entrada')
        .select(`
            *,
            fornecedor:fornecedorid (*)
        `)
        .eq('id', entradaId)
        .single();
    
    if (entError || !entrada) {
        return NextResponse.json(
            { ok: false, message: "Entrada não encontrada", detalhe: entError?.message },
            { status: 404 }
        );
    }

    // Buscar itens da entrada
    // Nota: A tabela é `entradaitens` (com 's') ou `entrada_item`? 
    // Schema diz: create table public.entradaitens
    const { data: itens, error: itensError } = await supabaseAdmin
        .from('entradaitens')
        .select('*')
        .eq('entrada_id', entradaId);

    if (itensError) {
         return NextResponse.json(
            { ok: false, message: "Erro ao buscar itens da entrada", detalhe: itensError.message },
            { status: 500 }
        );
    }

    if (!itens || itens.length === 0) {
        return NextResponse.json(
            { ok: false, message: "A entrada não possui itens." },
            { status: 400 }
        );
    }

    // 2. Adapter
    // Precisamos do ID da empresa logada/ativa.
    // Como é rota de admin, podemos pegar do body ou assumir 1 por enquanto (como nas rotas antigas legacy)
    // O ideal seria pegar da sessão ou do header x-empresa-id.
    // Vamos tentar pegar do body se vier, senão fallback 1.
    const body = await req.json().catch(() => ({}));
    
    let empresaId = body.empresaId;

    if (!empresaId) {
        // Tenta buscar uma empresa que TENHA configuração de NFe
        const { data: config, error: cfgError } = await supabaseAdmin
            .from('nfe_config')
            .select('empresaid')
            .limit(1)
            .single();
        
        if (config && config.empresaid) {
            empresaId = config.empresaid;
        } else {
            // Se não tiver config, cai no fallback de pegar qualquer empresa ou 1
             const { data: emp } = await supabaseAdmin
                .from('empresa')
                .select('id')
                .limit(1)
                .single();
             empresaId = emp?.id || 1;
        }
    }

    const adapter = new EntryAdapter(entrada, itens, empresaId);
    let invoiceDTO;
    try {
        invoiceDTO = adapter.toInvoiceDTO();
    } catch (err: any) {
        return NextResponse.json(
            { ok: false, message: "Erro na conversão dos dados (Adapter)", detalhe: err.message },
            { status: 400 }
        );
    }

    // 3. Service Call
    const service = new InvoiceDraftService();
    const result = await service.createDraft(invoiceDTO);

    return NextResponse.json({
        ok: true,
        data: result
    });

  } catch (error: any) {
    console.error("Erro ao gerar rascunho de NFe de Entrada:", error);
    return NextResponse.json(
      { ok: false, message: "Erro interno", detalhe: error.message },
      { status: 500 }
    );
  }
}
