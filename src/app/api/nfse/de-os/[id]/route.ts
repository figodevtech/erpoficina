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

    const reqBody = await req.json().catch(() => ({}));
    const { osservicoId } = reqBody;
    if (!osservicoId) {
      return NextResponse.json(
        { ok: false, message: "ID do serviço (osservicoId) não fornecido." },
        { status: 400 }
      );
    }

    // 1. Fetch OS data including services, client, and company
    const { data: os, error: osError } = await supabaseAdmin
      .from("ordemservico")
      .select(`
        *,
        cliente (*),
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

    const { data: empresa } = await supabaseAdmin.from("empresa").select("*").limit(1).single();
    if (!empresa) {
      return NextResponse.json(
        { ok: false, message: "A aplicação não possui uma empresa configurada." },
        { status: 400 }
      );
    }

    if (!os.cliente) {
      return NextResponse.json(
        { ok: false, message: "A OS não possui um cliente (tomador) vinculado." },
        { status: 400 }
      );
    }

    // 2. Aggregate single service
    const itemServico = os.osservico.find((item: any) => item.servicoid === osservicoId);
    if (!itemServico) {
      return NextResponse.json(
        { ok: false, message: "O serviço informado não pertence a esta OS ou não existe." },
        { status: 400 }
      );
    }
    
    // We assume the first service's taxation data applies to all, as is common in a single OS
    const firstServico = itemServico.servico;

    const q = itemServico.quantidade || 1;
    const v = itemServico.precounitario || 0;
    const val = q * v;
    let totalServicos = val;
    const descricao = `${q}x ${itemServico.servico?.descricao || "Serviço Padrão"} - R$ ${val.toFixed(2)}`;

    const descricaoCompleta = `Serviços da OS #${os.id}:\n` + descricao;

    // 3. Prepare parameters for Focus NFe
    const referencia = `OS_${os.id}_SRV_${itemServico.servicoid}_${Date.now()}`;
    
    // Defaulting to empty values, but users should maintain their CAD.
    const empresaData = empresa as any;
    const prestadorCnpj = empresaData.cnpj || "";
    
    const clienteData = os.cliente as any;

    const emitirParams: NFSeEmitirParams = {
      referencia,
      natureza_operacao: 1, // Tributação no município (Padrão ABRASF/DSF)
      optante_simples_nacional: true, // true para Simples Nacional
      regime_especial_tributacao: 6, // 6 para Microempresa Municipal (Padrão comum João Pessoa)
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
        iss_retido: "false", // Use string "false"
        item_lista_servico: firstServico?.codigomunicipal || "0107", 
        codigo_cnae: empresaData.cnae?.replace(/\D/g, "") || "829979900", // Mandatory for Joao Pessoa
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
      empresaid: empresa.id,
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
