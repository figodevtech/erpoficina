import { supabaseAdmin } from "./src/lib/supabaseAdmin";
import { NFSeService } from "./src/lib/services/fiscais/nfse-service";
import * as fs from "fs";

async function runTest() {
  console.log("🚀 Iniciando teste manual de NFS-e para João Pessoa/PB...");

  // 1. Buscar Empresa
  const { data: empresa } = await supabaseAdmin.from("empresa").select("*").limit(1).single();
  if (!empresa) {
    console.error("❌ Empresa não encontrada no banco.");
    return;
  }

  // 2. Buscar OS #25 para pegar o Tomador
  const { data: os } = await supabaseAdmin
    .from("ordemservico")
    .select("*, cliente(*)")
    .eq("id", 25)
    .single();

  if (!os || !os.cliente) {
    console.error("❌ OS #25 ou Cliente não encontrados.");
    return;
  }

  const nfseService = new NFSeService();
  const referencia = `TEST_JP_${Date.now()}`;

  // 3. Montar o payload baseado na sugestão do usuário + dados REAIS da empresa
  const payload: any = {
    referencia,
    natureza_operacao: 1,
    optante_simples_nacional: empresa.regimetributario === "1", // Seguindo a lógica real do banco (3 = false)
    // Se o usuário quiser forçar Simples + Regime 6 para teste, podemos, mas aqui usamos o real:
    regime_especial_tributacao: empresa.regimetributario === "1" ? 6 : undefined, 
    
    prestador: {
      cnpj: empresa.cnpj?.replace(/\D/g, ""),
      inscricao_municipal: empresa.inscricaomunicipal?.replace(/\D/g, ""),
      codigo_municipio: "2507507"
    },
    tomador: {
      cpf: os.cliente.cpfcnpj?.replace(/\D/g, ""),
      razao_social: os.cliente.razaosocial || os.cliente.nome || "Tomador Teste",
      endereco: {
        logradouro: os.cliente.endereco || "Rua Ficticia",
        numero: os.cliente.numero || "2",
        bairro: os.cliente.bairro || "Centro",
        codigo_municipio: os.cliente.codigomunicipio || "2507507",
        uf: os.cliente.estado || "PB",
        cep: os.cliente.cep?.replace(/\D/g, "") || "58000000"
      },
      email: os.cliente.email || "test@example.com"
    },
    servico: {
      discriminacao: "Nota emitida em caráter de TESTE de integração com Webservice João Pessoa/PB",
      valor_servicos: 1.0,
      aliquota: 3, // Alíquota padrão oficina
      item_lista_servico: "14.01", // Padrão oficina mechanical
      codigo_cnae: (empresa.cnae?.replace(/\D/g, "") || "4520001").padEnd(9, "0"),
      iss_retido: false
    }
  };

  console.log("📦 Payload Gerado:", JSON.stringify(payload, null, 2));

  try {
    const result = await nfseService.emitir(payload);
    console.log("🏁 Resultado da Focus NFe:", JSON.stringify(result, null, 2));
    
    fs.writeFileSync("test_nfse_result.json", JSON.stringify({ payload, result }, null, 2));
    console.log("💾 Resultado salvo em test_nfse_result.json");
  } catch (e) {
    console.error("💥 Exceção durante o teste:", e);
  }
}

runTest();
