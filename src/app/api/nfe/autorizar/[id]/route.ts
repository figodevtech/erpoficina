// src/app/api/nfe/autorizar/[id]/route.ts

import { NextResponse } from "next/server";
import https from "https";
import fs from "fs";
import path from "path";
import { XMLParser } from "fast-xml-parser";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { buildNFePreviewXml } from "@/lib/nfe/buildNFe";
import { carregarCertificadoA1 } from "@/lib/nfe/certificado";
import { assinarNFeXml } from "@/lib/nfe/assinatura";
import { buildEnviNFeXml } from "@/lib/nfe/enviNFe";
import type { ClienteRow, EmpresaRow, NFeItem } from "@/lib/nfe/types";
import { mapClienteToDestinatario } from "@/lib/nfe/mapClienteToDestinatario";

export const runtime = "nodejs";

/**
 * Envia SOAP via https.request usando client-cert (PFX).
 */
function postSoapComCert(
  url: string,
  soapEnvelope: string,
  agent: https.Agent
): Promise<{ httpStatus: number; body: string }> {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);

    const req = https.request(
      {
        hostname: urlObj.hostname,
        port: urlObj.port || 443,
        path: urlObj.pathname,
        method: "POST",
        agent,
        headers: {
          "Content-Type":
            'application/soap+xml; charset=utf-8; action="http://www.portalfiscal.inf.br/nfe/wsdl/NFeAutorizacao4/nfeAutorizacaoLote"',
          "Content-Length": Buffer.byteLength(soapEnvelope).toString(),
        },
      },
      (res) => {
        let data = "";

        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          resolve({
            httpStatus: res.statusCode ?? 0,
            body: data,
          });
        });
      }
    );

    req.on("error", (err) => {
      reject(err);
    });

    req.write(soapEnvelope);
    req.end();
  });
}

/**
 * Monta o XML <nfeProc> a partir do XML da NFe assinada + XML do protNFe.
 */
function buildNfeProcXml(
  xmlAssinado: string,
  protNFeXml: string | null
): string | null {
  if (!protNFeXml) return null;

  // Remove declaração XML do início da NFe, se existir
  const nfeSemDecl = xmlAssinado.replace(/<\?xml[^>]*\?>\s*/i, "");

  return (
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">' +
    nfeSemDecl +
    protNFeXml +
    "</nfeProc>"
  );
}

/**
 * Extrai o XML bruto do <protNFe> de dentro da resposta SOAP.
 * (Usamos regex aqui só pra montar o nfeProc bonitinho.)
 */
function extrairProtNFeXml(respostaSoap: string): string | null {
  const match = respostaSoap.match(/<protNFe[^>]*>[\s\S]*?<\/protNFe>/);
  return match ? match[0] : null;
}

/**
 * Extrai o Id do <infNFe> e a chave de acesso (44 dígitos) do XML.
 */
function extrairChaveEIdDoXml(
  xml: string
): { chave: string | null; id: string | null } {
  const match = xml.match(/<infNFe[^>]*\sId=['"]([^'"]+)['"][^>]*>/i);
  if (!match) return { chave: null, id: null };

  const id = match[1];
  const chavePossivel = id.replace(/^NFe/i, "");
  const chaveValida = /^\d{44}$/.test(chavePossivel) ? chavePossivel : null;

  return { chave: chaveValida, id };
}

async function autorizarHandler(req: Request, nfeIdParam: string) {
  try {
    // -------------------------------------------------------------------
    // 1) Validar ID da NF-e (tabela nfe)
    // -------------------------------------------------------------------
    const nfeId = Number(nfeIdParam);
    if (Number.isNaN(nfeId)) {
      return NextResponse.json(
        { ok: false, mensagem: "ID de NF-e inválido" },
        { status: 400 }
      );
    }

    // -------------------------------------------------------------------
    // 2) Buscar registro da NF-e no Supabase
    // -------------------------------------------------------------------
    const { data: nfe, error: nfeError } = await supabaseAdmin
      .from("nfe")
      .select("*")
      .eq("id", nfeId)
      .maybeSingle();

    if (nfeError) {
      console.error("[nfe] erro ao buscar NF-e:", nfeError);
      return NextResponse.json(
        {
          ok: false,
          mensagem: "Erro ao buscar NF-e no banco",
          detalhe: nfeError.message,
        },
        { status: 500 }
      );
    }

    if (!nfe) {
      return NextResponse.json(
        { ok: false, mensagem: "NF-e não encontrada" },
        { status: 404 }
      );
    }

    // Esperado: nfe.empresaid, nfe.numero, nfe.serie
    if (!nfe.empresaid) {
      return NextResponse.json(
        {
          ok: false,
          mensagem: "NF-e não possui empresa associada (empresaid nulo)",
        },
        { status: 500 }
      );
    }

    if (nfe.numero == null || nfe.serie == null) {
      return NextResponse.json(
        {
          ok: false,
          mensagem:
            "NF-e não possui número ou série definidos (campos numero/serie)",
        },
        { status: 500 }
      );
    }

    const numeroNota = Number(nfe.numero);
    const serie = Number(nfe.serie);
    const statusAtual: string | null = nfe.status ?? null;

    // -------------------------------------------------------------------
    // 3) Buscar empresa no Supabase (usando nfe.empresaid)
    // -------------------------------------------------------------------
    const { data: empresa, error: empresaError } = await supabaseAdmin
      .from("empresa")
      .select("*")
      .eq("id", nfe.empresaid)
      .single<EmpresaRow>();

    if (empresaError) {
      console.error("[empresa] erro ao buscar empresa:", empresaError);
      return NextResponse.json(
        {
          ok: false,
          mensagem: "Erro ao buscar empresa no banco",
          detalhe: empresaError.message,
        },
        { status: 500 }
      );
    }

    if (!empresa) {
      return NextResponse.json(
        { ok: false, mensagem: "Empresa não encontrada" },
        { status: 404 }
      );
    }

    const ambiente =
      empresa.ambiente === "PRODUCAO" ? "PRODUCAO" : "HOMOLOGACAO";

    // -------------------------------------------------------------------
    // 4) Buscar cliente destinatario (cliente da OS vinculado a esta NF-e)
    // -------------------------------------------------------------------
    if (!nfe.clienteid) {
      return NextResponse.json(
        {
          ok: false,
          mensagem: "NF-e sem cliente associado (clienteid nulo).",
        },
        { status: 500 }
      );
    }

    const { data: cliente, error: clienteError } = await supabaseAdmin
      .from("cliente")
      .select(
        `
        id,
        cpfcnpj,
        nomerazaosocial,
        telefone,
        email,
        endereco,
        endereconumero,
        enderecocomplemento,
        bairro,
        cidade,
        estado,
        cep,
        inscricaoestadual,
        inscricaomunicipal,
        codigomunicipio
      `
      )
      .eq("id", nfe.clienteid)
      .single<ClienteRow>();

    if (clienteError) {
      console.error("[cliente] erro ao buscar cliente da NF-e:", clienteError);
      return NextResponse.json(
        {
          ok: false,
          mensagem: "Erro ao buscar cliente da NF-e",
          detalhe: clienteError.message,
        },
        { status: 500 }
      );
    }

    if (!cliente) {
      return NextResponse.json(
        { ok: false, mensagem: "Cliente da NF-e nao encontrado" },
        { status: 404 }
      );
    }

    const destinatario = mapClienteToDestinatario(cliente, empresa);

    // -------------------------------------------------------------------
    // 5) Buscar itens da NF-e em nfe_item
    // -------------------------------------------------------------------
    const { data: itensNfe, error: itensNfeError } = await supabaseAdmin
      .from("nfe_item")
      .select(
        `
        n_item,
        produtoid,
        descricao,
        ncm,
        cfop,
        unidade,
        quantidade,
        valor_unitario,
        valor_total
      `
      )
      .eq("nfe_id", nfeId)
      .order("n_item", { ascending: true });

    if (itensNfeError) {
      console.error("[nfe_item] erro ao buscar itens da NF-e:", itensNfeError);
      return NextResponse.json(
        {
          ok: false,
          mensagem: "Erro ao buscar itens da NF-e",
          detalhe: itensNfeError.message,
        },
        { status: 500 }
      );
    }

    if (!itensNfe || itensNfe.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          mensagem: "NF-e não possui itens cadastrados em nfe_item.",
        },
        { status: 500 }
      );
    }

    const itens: NFeItem[] = (itensNfe as any[]).map((row, idx) => ({
      numeroItem: Number(row.n_item ?? idx + 1),
      codigoProduto:
        row.produtoid != null ? String(row.produtoid) : String(row.n_item ?? idx + 1),
      descricao: row.descricao,
      ncm: row.ncm || "00000000",
      cfop: row.cfop,
      unidade: row.unidade,
      quantidade: Number(row.quantidade ?? 0),
      valorUnitario: Number(row.valor_unitario ?? 0),
      valorTotal: Number(row.valor_total ?? 0),
      codigoBarras: null,
    }));

    // -------------------------------------------------------------------
    // 6) Usar o XML salvo no rascunho (xml_assinado) ou gerar um novo
    // -------------------------------------------------------------------
    const xmlRascunhoSalvo =
      typeof nfe.xml_assinado === "string" ? nfe.xml_assinado.trim() : "";

    const chaveDoBanco =
      typeof nfe.chave_acesso === "string" && nfe.chave_acesso.trim()
        ? nfe.chave_acesso.trim()
        : null;

    let chave: string | null = chaveDoBanco;
    let idNFeXml: string | null = null;

    if (xmlRascunhoSalvo) {
      const extraida = extrairChaveEIdDoXml(xmlRascunhoSalvo);
      if (extraida.chave) chave = extraida.chave;
      if (extraida.id) idNFeXml = extraida.id;
    }

    let xmlSemAssinatura = xmlRascunhoSalvo;

    // Se nÇœo houver XML salvo, gera um novo com base nos itens atuais
    if (!xmlSemAssinatura) {
      const { xml: xmlGerado, chave: chaveGerada, id } = buildNFePreviewXml(
        empresa,
        numeroNota,
        serie,
        itens,
        destinatario
      );
      xmlSemAssinatura = xmlGerado;
      if (!chave) chave = chaveGerada;
      if (!idNFeXml) idNFeXml = id;
    }

    // -------------------------------------------------------------------
    // 7) Carregar certificado A1 (chave privada + certificado em PEM)
    // -------------------------------------------------------------------
    const { privateKeyPem, certificatePem } = await carregarCertificadoA1(
      empresa
    );

    // -------------------------------------------------------------------
    // 8) Assinar XML da NFe (tag <infNFe>)
    // -------------------------------------------------------------------
    const xmlAssinado = assinarNFeXml(
      xmlSemAssinatura,
      privateKeyPem,
      certificatePem
    );

    // -------------------------------------------------------------------
    // 9) Montar o XML do <enviNFe> (lote) com o XML assinado
    // -------------------------------------------------------------------
    const enviNFeXml = buildEnviNFeXml(xmlAssinado);

    // -------------------------------------------------------------------
    // 10) Montar SOAP Envelope para o serviço NFeAutorizacao4
    // -------------------------------------------------------------------
    const soapEnvelope =
      '<?xml version="1.0" encoding="utf-8"?>' +
      '<soap12:Envelope ' +
      'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
      'xmlns:xsd="http://www.w3.org/2001/XMLSchema" ' +
      'xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">' +
      "<soap12:Body>" +
      '<nfeDadosMsg xmlns="http://www.portalfiscal.inf.br/nfe/wsdl/NFeAutorizacao4">' +
      enviNFeXml +
      "</nfeDadosMsg>" +
      "</soap12:Body>" +
      "</soap12:Envelope>";

    // -------------------------------------------------------------------
    // 11) URL do webservice (SVRS - PB) para PRODUÇÃO / HOMOLOGAÇÃO
    // -------------------------------------------------------------------
    const url =
      ambiente === "PRODUCAO"
        ? "https://nfe.svrs.rs.gov.br/ws/NfeAutorizacao/NFeAutorizacao4.asmx"
        : "https://nfe-homologacao.svrs.rs.gov.br/ws/NfeAutorizacao/NFeAutorizacao4.asmx";

    // -------------------------------------------------------------------
    // 12) Montar agente HTTPS com o PFX para autenticação mútua TLS
    // -------------------------------------------------------------------
    const pfxPathRaw =
      nfe.certificadocaminho ||
      empresa.certificadocaminho ||
      process.env.NFE_CERT_PFX_PATH ||
      "C:\\certs\\certificado.pfx";

    const pfxPath = path.resolve(pfxPathRaw);
    const pfxPass =
      empresa.certificadosenha ?? process.env.NFE_CERT_PFX_PASSWORD ?? "";

    const httpsAgent = new https.Agent({
      pfx: fs.readFileSync(pfxPath),
      passphrase: pfxPass,
      // Em produção, o ideal é deixar como true e ter a cadeia de certificados correta:
      rejectUnauthorized: false,
    });

    // -------------------------------------------------------------------
    // 13) Enviar requisição SOAP para o webservice usando https.request
    // -------------------------------------------------------------------
    const { httpStatus, body: respostaText } = await postSoapComCert(
      url,
      soapEnvelope,
      httpsAgent
    );

    // -------------------------------------------------------------------
    // 14) Se HTTP não for 200, já retorna erro bruto
    // -------------------------------------------------------------------
    if (httpStatus !== 200) {
      return NextResponse.json(
        {
          ok: false,
          ambiente,
          chave: chave ?? null,
          idNFe: idNFeXml ?? null, // Id lógico da NFe (ex: NFe3525...)
          httpStatus,
          mensagem: "Erro HTTP ao chamar NFeAutorizacao4",
          soap: {
            xmlEnviado: soapEnvelope,
            xmlRespostaSnippet: respostaText.substring(0, 2000),
          },
        },
        { status: 500 }
      );
    }

    // -------------------------------------------------------------------
    // 15) Parse do XML de retorno (retEnviNFe + protNFe)
    // -------------------------------------------------------------------
    const parser = new XMLParser({
      ignoreAttributes: false,
    });

    let retEnviNFe: any = null;
    let lote_cStat: string | null = null;
    let lote_xMotivo: string | null = null;
    let prot_cStat: string | null = null;
    let prot_xMotivo: string | null = null;
    let nRec: string | null = null;
    let nProt: string | null = null;

    try {
      const parsed = parser.parse(respostaText);
      const envelope = parsed["soap:Envelope"] ?? parsed.Envelope;
      const body = envelope?.["soap:Body"] ?? envelope?.Body;
      const resultMsg = body?.nfeResultMsg;
      retEnviNFe = resultMsg?.retEnviNFe;

      // normaliza para string (fast-xml-parser pode trazer número)
      const rawLoteCStat = retEnviNFe?.cStat;
      lote_cStat = rawLoteCStat != null ? String(rawLoteCStat) : null;
      lote_xMotivo = retEnviNFe?.xMotivo ?? null;
      nRec = retEnviNFe?.nRec ?? null;

      const protNFe = retEnviNFe?.protNFe;
      const infProt = protNFe?.infProt;

      const rawProtCStat = infProt?.cStat;
      prot_cStat = rawProtCStat != null ? String(rawProtCStat) : null;
      prot_xMotivo = infProt?.xMotivo ?? null;

      const rawNProt = infProt?.nProt;
      nProt = rawNProt != null ? String(rawNProt) : null;
    } catch (parseErr) {
      console.warn("[nfe] erro ao parsear XML de retorno da SEFAZ:", parseErr);
    }

    // -------------------------------------------------------------------
    // 16) Montar nfeProc (xml_autorizado), se tivermos protNFe no retorno
    // -------------------------------------------------------------------
    const protNFeXml = extrairProtNFeXml(respostaText);
    const xmlAutorizado = buildNfeProcXml(xmlAssinado, protNFeXml);

    // -------------------------------------------------------------------
    // 17) Determinar novo status da NF-e
    // -------------------------------------------------------------------
    let novoStatus: string | null = null;

    if (prot_cStat === "100") {
      // Autorizado o uso da NF-e
      novoStatus = "AUTORIZADA";
    } else if (["110", "301", "302"].includes(prot_cStat || "")) {
      // Denegada
      novoStatus = "DENEGADA";
    } else if (prot_cStat && prot_cStat !== "100") {
      // Qualquer outra rejeição de protocolo
      novoStatus = "REJEITADA";
    } else if (lote_cStat === "103" || (lote_cStat === "104" && !prot_cStat)) {
      // 103: Lote recebido; 104 sem prot -> fluxo assíncrono
      novoStatus = "ENVIADA";
    }

    // -------------------------------------------------------------------
    // 18) Atualizar tabela nfe com status / protocolo / xml
    // -------------------------------------------------------------------
    let statusFinal = statusAtual;
    let protocoloFinal: string | null = nfe.protocolo ?? null;

    try {
      const updatePayload: any = {
        xml_assinado: xmlAssinado,
        updatedat: new Date().toISOString(),
      };

      // garante que o banco sempre fique com a MESMA chave usada no XML
      if (chave) {
        updatePayload.chave_acesso = chave;
      }

      if (xmlAutorizado) {
        updatePayload.xml_autorizado = xmlAutorizado;
      }

      // NÃO rebaixar AUTORIZADA para REJEITADA em caso de duplicidade/testes
      if (novoStatus) {
        if (statusAtual === "AUTORIZADA" && novoStatus === "REJEITADA") {
          console.warn(
            `[nfe] tentativa de mudar NF-e ${nfeId} de AUTORIZADA para REJEITADA. Mantendo AUTORIZADA.`
          );
        } else {
          updatePayload.status = novoStatus;
          statusFinal = novoStatus;
        }
      }

      if (nProt) {
        updatePayload.protocolo = nProt;
        protocoloFinal = nProt;
      }

      if (statusFinal === "AUTORIZADA") {
        // Usamos "agora" como data de autorização (poderia ser dhRecbto do infProt também)
        updatePayload.dataautorizacao = new Date().toISOString();
      }

      await supabaseAdmin.from("nfe").update(updatePayload).eq("id", nfeId);
    } catch (updateErr) {
      console.warn(
        "[nfe] falha ao atualizar status/infos da NF-e:",
        updateErr
      );
    }

    // -------------------------------------------------------------------
    // 19) Responder JSON para o frontend
    // -------------------------------------------------------------------
    return NextResponse.json({
      ok: true,
      ambiente,
      chave: chave ?? null,
      idNFe: idNFeXml ?? null, // Id lógico da NFe no XML, não o id da tabela
      httpStatus,
      sefaz: {
        lote: {
          cStat: lote_cStat,
          xMotivo: lote_xMotivo,
          nRec,
        },
        protocolo: {
          cStat: prot_cStat,
          xMotivo: prot_xMotivo,
          nProt,
        },
      },
      nfeDb: {
        id: nfeId,
        status: statusFinal ?? novoStatus ?? statusAtual ?? null,
        protocolo: protocoloFinal,
      },
      soap: {
        xmlEnviado: soapEnvelope,
        xmlRespostaSnippet: respostaText.substring(0, 2000),
      },
    });
  } catch (e: any) {
    console.error("Erro em /api/nfe/autorizar/[id]:", e);
    return NextResponse.json(
      {
        ok: false,
        mensagem: "Erro interno ao enviar NF-e para autorização",
        detalhe: String(e?.message ?? e),
        stack: e?.stack ?? null,
      },
      { status: 500 }
    );
  }
}

// ATENÇÃO: no Next 15, params é uma Promise.
// Aqui a gente resolve isso no POST e passa só o id (string) para o handler.
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  return autorizarHandler(req, id);
}
