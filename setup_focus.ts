import { createClient } from "@supabase/supabase-js";
import { NFSeService } from "./src/lib/services/fiscais/nfse-service";
import * as fs from "fs";

// Pega variaveis de ambiente ou .env se rodar em ambiente nextjs
import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ozluphhwktyvqfrypjin.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96bHVwaGh3a3R5dnFmcnlwamluIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzcxODQzMSwiZXhwIjoyMDgzMjk0NDMxfQ.37X-tZ9BFhse046j3WF2qOirCfRXJTiwPCo-btKCkiw";

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Iniciando setup da Focus NFe para João Pessoa...");

  // 1. Busca dados da empresa
  const { data: empresa, error } = await supabase.from("empresa").select("*").single();

  if (error || !empresa) {
    console.error("Erro ao buscar dados da empresa:", error);
    return;
  }

  console.log(`Empresa encontrada: ${empresa.nomefantasia || empresa.razaosocial}`);

  // 2. Lê arquivo de certificado em Base64
  const pfxPath = empresa.certificadocaminho || "certs/certificado.pfx";
  let certificadoBase64: string | undefined;

  try {
    const certBuffer = fs.readFileSync(pfxPath);
    certificadoBase64 = certBuffer.toString("base64");
    console.log(`Certificado lido com sucesso de ${pfxPath}. Tamanho: ${certificadoBase64.length} caracteres.`);
  } catch (err: any) {
    console.error(`Aviso: Erro ao ler o arquivo de certificado em ${pfxPath}:`, err.message);
    console.log("Continuando sem envio do certificado...");
  }

  // 3. Pega a senha do banco de dados
  const senhaCertificado = empresa.certificadosenha;

  if (certificadoBase64 && !senhaCertificado) {
    console.error("ERRO: Certificado lido, mas senha não encontrada no banco de dados.");
    return;
  }

  // Verificar Token
  const token = process.env.FOCUS_NFE_API_TOKEN;
  if (!token) {
    console.warn("==========================================================================");
    console.warn("AVISO: FOCUS_NFE_API_TOKEN não encontrado nas variáveis de ambiente!");
    console.warn("Certifique-se de que a variável foi criada.");
    console.warn("==========================================================================");
  } else {
    console.log("Token Focus encontrado nas variáveis de ambiente.");
  }

  // 4. Aciona a FocusNFe via Service
  try {
    const nfseService = new NFSeService();
    const result = await nfseService.configurarEmpresa(empresa, certificadoBase64, senhaCertificado);

    if (result.ok) {
      console.log("✅ Empresa configurada com sucesso na Focus NFe!");
      console.log("Retorno:", JSON.stringify(result.dados, null, 2));
    } else {
      console.error("❌ Falha na configuração da Empresa:");
      console.error(result.message);
      console.error(JSON.stringify(result.erros, null, 2));
    }
  } catch (e: any) {
    console.error("❌ Exception Capturada:", e.message);
  }
}

run();
