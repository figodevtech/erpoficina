import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NFSeService } from "@/lib/services/fiscais/nfse-service";

export async function GET() {
  try {
    const { data: empresa } = await supabaseAdmin.from("empresa").select("*").limit(1).single();
    if (!empresa) return NextResponse.json({ ok: false, message: "Empresa não encontrada" });

    const { data: os } = await supabaseAdmin
      .from("ordemservico")
      .select("*, cliente(*)")
      .eq("id", 25)
      .single();

    if (!os) return NextResponse.json({ ok: false, message: "OS 25 não encontrada" });

    const nfseService = new NFSeService();
    const referencia = `TEST_JP_PAYLOAD_${Date.now()}`;

    const payload: any = {
      referencia,
      natureza_operacao: 1,
      // Usando os dados REAIS da empresa (Regime 3 = Lucro Presumido = false no Simples)
      // Se forçar TRUE com Regime 3, a prefeitura rejeita por conflito cadastral.
      optante_simples_nacional: empresa.regimetributario === "1", 
      regime_especial_tributacao: empresa.regimetributario === "1" ? 6 : undefined,
      
      prestador: {
        cnpj: empresa.cnpj?.replace(/\D/g, ""),
        inscricao_municipal: empresa.inscricaomunicipal?.replace(/\D/g, ""),
        codigo_municipio: "2507507"
      },
      tomador: {
        cpf: os.cliente.cpfcnpj?.replace(/\D/g, ""),
        razao_social: os.cliente.razaosocial || os.cliente.nome || "Consumidor Final",
        endereco: {
          logradouro: os.cliente.endereco || "Rua Teste",
          numero: os.cliente.numero || "S/N",
          bairro: os.cliente.bairro || "Centro",
          codigo_municipio: os.cliente.codigomunicipio || "2507507",
          uf: os.cliente.estado || "PB",
          cep: os.cliente.cep?.replace(/\D/g, "") || "58000000"
        },
        email: os.cliente.email || "test@example.com"
      },
      servico: {
        discriminacao: "Nota emitida em caráter de TESTE de integração com Webservice de João Pessoa/PB",
        valor_servicos: 1.0,
        aliquota: 3,
        item_lista_servico: "14.01",
        codigo_cnae: (empresa.cnae?.replace(/\D/g, "") || "4520001").padEnd(9, "0"),
        iss_retido: false
      }
    };

    const result = await nfseService.emitir(payload);

    return NextResponse.json({
      original_payload_suggested: "Structure followed",
      actual_sent_payload: payload,
      result: result
    });

  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e.message });
  }
}
