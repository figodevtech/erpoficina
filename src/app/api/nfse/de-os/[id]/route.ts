import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NFSeService, NFSeEmitirParams } from "@/lib/services/fiscais/nfse-service";

export const runtime = "nodejs";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const osId = Number(id);

    if (!Number.isFinite(osId) || osId <= 0) {
      return NextResponse.json(
        { ok: false, message: "ID da OS inválido." },
        { status: 400 }
      );
    }

    // 1. Fetch OS data including services, client, and company
    const { data: os, error: osError } = await supabaseAdmin
      .from("ordemservico")
      .select(`
        *,
        cliente (*),
        empresa (*),
        osservico (
          *,
          servico (*)
        )
      `)
      .eq("id", osId)
      .single();

    if (osError || !os) {
      console.error("[POST /api/nfse/de-os] Erro ao buscar OS", osError);
      return NextResponse.json(
        { ok: false, message: "OS não encontrada ou erro no banco." },
        { status: 404 }
      );
    }

    if (!os.osservico || os.osservico.length === 0) {
      return NextResponse.json(
        { ok: false, message: "Esta OS não possui serviços para emitir NFS-e." },
        { status: 400 }
      );
    }

    if (!os.empresa) {
      return NextResponse.json(
        { ok: false, message: "A OS não possui uma empresa (prestador) vinculada." },
        { status: 400 }
      );
    }

    if (!os.cliente) {
      return NextResponse.json(
        { ok: false, message: "A OS não possui um cliente (tomador) vinculado." },
        { status: 400 }
      );
    }

    // 2. Aggregate services
    let totalServicos = 0;
    const descricoes: string[] = [];
    
    // We assume the first service's taxation data applies to all, as is common in a single OS
    const firstServico = os.osservico[0].servico;

    for (const item of os.osservico) {
      const q = item.quantidade || 1;
      const v = item.valorunitario || 0;
      const val = q * v;
      totalServicos += val;
      descricoes.push(`${q}x ${item.servico?.nome || "Serviço"} - R$ ${val.toFixed(2)}`);
    }

    const descricaoCompleta = `Serviços referentes à OS #${os.id}:\n` + descricoes.join("\n");

    // 3. Prepare parameters for Focus NFe
    const referencia = `OS_${os.id}_${Date.now()}`;
    
    // Defaulting to empty values, but users should maintain their CAD.
    const prestadorCnpj = os.empresa.cnpj || "";
    // Note: If inscricao_municipal and codigo_municipio aren't in empresa, we should use empty or default.
    // In many schemas they might be missing. We assume the table has them or we pass "0".
    
    const empresaData = os.empresa as any;
    const clienteData = os.cliente as any;

    const emitirParams: NFSeEmitirParams = {
      referencia,
      prestador: {
        cnpj: prestadorCnpj.replace(/\D/g, ""),
        inscricao_municipal: empresaData.inscricaomunicipal?.replace(/\D/g, "") || "",
        codigo_municipio: empresaData.codigomunicipio || "", // IBGE
      },
      tomador: {
        cpf: clienteData.cpfcnpj?.length <= 14 ? clienteData.cpfcnpj.replace(/\D/g, "") : undefined,
        cnpj: clienteData.cpfcnpj?.length > 14 ? clienteData.cpfcnpj.replace(/\D/g, "") : undefined,
        razao_social: clienteData.nome || "Cliente Não Identificado",
        email: clienteData.email || undefined,
        endereco: {
          logradouro: clienteData.endereco || "",
          numero: clienteData.numero || "S/N",
          bairro: clienteData.bairro || "",
          codigo_municipio: clienteData.codigomunicipio || "", 
          uf: clienteData.estado || "",
          cep: clienteData.cep?.replace(/\D/g, "") || "",
        }
      },
      servico: {
        aliquota: 3, // Fallback if no specific config
        discriminacao: descricaoCompleta,
        iss_retido: false,
        item_lista_servico: firstServico?.codigomunicipal || "0107", 
        valor_servicos: totalServicos,
      }
    };

    // 4. Send to Focus API
    const nfseService = new NFSeService();
    const result = await nfseService.emitir(emitirParams);

    // 5. Store in our Database
    const insercao = {
      ordemservicoid: os.id,
      clienteid: os.cliente.id,
      empresaid: os.empresa.id,
      referencia,
      status: result.ok ? result.status : "REJEITADA",
      erros: result.ok ? null : result.erros,
      valor_total: totalServicos,
    };

    const { error: insertError } = await supabaseAdmin
      .from("nfse")
      .insert([insercao]);

    if (insertError) {
      console.error("[POST /api/nfse/de-os] Erro ao gravar NFS-e no banco", insertError);
    }

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, message: result.message, erros: result.erros },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { ok: true, message: "NFS-e enviada para processamento.", referencia: result.referencia },
      { status: 200 }
    );

  } catch (e: any) {
    console.error("[POST /api/nfse/de-os] Exception", e);
    return NextResponse.json(
      { ok: false, message: "Erro inesperado ao emitir NFS-e." },
      { status: 500 }
    );
  }
}
