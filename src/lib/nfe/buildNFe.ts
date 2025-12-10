// src/lib/nfe/buildNFe.ts

import type {
  EmpresaRow,
  NFeIde,
  NFeDestinatario,
  NFeItem,
} from "./types";
import { buildIdeXml } from "./xmlIde";
import { buildEmitXml } from "./xmlEmitente";
import { buildDestXml } from "./xmlDest";
import { buildDetXml } from "./xmlItem";
import { gerarCNF, gerarChaveAcesso } from "./chaveAcesso";
import { mapEmpresaToEmitente } from "./mapEmpresaToEmitente";

/**
 * Formata data/hora para o padrão da NF-e 4.00:
 * AAAA-MM-DDThh:mm:ss-03:00
 */
function formatDateTimeNFe(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");

  // Garante hora no fuso -03:00 independentemente do fuso do host (ex: Vercel em UTC)
  const targetOffsetMinutes = -3 * 60; // UTC-3 (America/Fortaleza)
  const utcMs = date.getTime() + date.getTimezoneOffset() * 60000;
  const targetMs = utcMs + targetOffsetMinutes * 60000;
  const targetDate = new Date(targetMs);

  const ano = targetDate.getUTCFullYear();
  const mes = pad(targetDate.getUTCMonth() + 1);
  const dia = pad(targetDate.getUTCDate());
  const hora = pad(targetDate.getUTCHours());
  const minuto = pad(targetDate.getUTCMinutes());
  const segundo = pad(targetDate.getUTCSeconds());

  const offsetHours = Math.floor(Math.abs(targetOffsetMinutes) / 60);
  const offsetMinutes = Math.abs(targetOffsetMinutes) % 60;
  const sign = targetOffsetMinutes <= 0 ? "-" : "+";
  const tz = `${sign}${pad(offsetHours)}:${pad(offsetMinutes)}`;

  return `${ano}-${mes}-${dia}T${hora}:${minuto}:${segundo}${tz}`;
}
/**
 * Cria o bloco <ide> da NF-e, calculando cNF, chave de acesso e cDV.
 */
export function criarIdeParaEmpresa(
  empresa: EmpresaRow,
  numeroNota: number,
  serie: number
): { ide: NFeIde; cNF: string; chave: string; id: string } {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = agora.getMonth() + 1;

  const tpAmb: 1 | 2 = empresa.ambiente === "PRODUCAO" ? 1 : 2;
  const cNF = gerarCNF(numeroNota);

  const cUF = "25"; // PB
  const mod = "55"; // NF-e
  const tpEmis = 1; // emissão normal

  // 1) Gera chave de acesso (44 dígitos) e cDV
  const { chave, id, dv } = gerarChaveAcesso({
    cUF,
    ano,
    mes,
    cnpj: empresa.cnpj,
    mod,
    serie,
    nNF: numeroNota,
    tpEmis,
    cNF,
  });

  // 2) Monta objeto ide completo
  const ide: NFeIde = {
    cUF,
    cNF,
    natOp: "VENDA DE MERCADORIA",
    mod,
    serie,
    nNF: numeroNota,
    dhEmi: formatDateTimeNFe(agora),
    tpNF: 1,
    idDest: 1,
    cMunFG: empresa.codigomunicipio,
    tpImp: 1,
    tpEmis,
    cDV: dv,
    tpAmb,
    finNFe: 1,
    indFinal: 1,
    indPres: 1,
    procEmi: 0,
    verProc: "ERPOficina 1.0.0",
  };

  return { ide, cNF, chave, id };
}

/**
 * Monta o XML completo da NFe (sem assinatura).
 *
 * Se "itensOverride" for informado, ele será usado para gerar os <det>.
 * Caso contrário, é usado um item de teste fixo (comportamento antigo).
 */
export function buildNFePreviewXml(
  empresa: EmpresaRow,
  numeroNota: number,
  serie: number,
  itensOverride?: NFeItem[],
  destinatario?: NFeDestinatario
): { xml: string; chave: string; id: string } {
  const { ide, chave, id } = criarIdeParaEmpresa(empresa, numeroNota, serie);

  const emitente = mapEmpresaToEmitente(empresa, "JOAO PESSOA");

  const dest: NFeDestinatario =
    destinatario ??
    {
      cpf: "12345678909", // pode deixar assim mesmo em homologacao
      razaoSocial: "NF-E EMITIDA EM AMBIENTE DE HOMOLOGACAO - SEM VALOR FISCAL",
      indIEDest: "9",
      endereco: {
        logradouro: "RUA TESTE",
        numero: "100",
        complemento: "",
        bairro: "BAIRRO TESTE",
        codigoMunicipio: empresa.codigomunicipio,
        nomeMunicipio: "JOAO PESSOA",
        uf: "PB",
        cep: "58000000",
        codigoPais: "1058",
        nomePais: "BRASIL",
        telefone: "",
      },
    };

  // Se itensOverride não for passado, usa o item de teste (compatibilidade)
  const itens: NFeItem[] =
    itensOverride && itensOverride.length > 0
      ? itensOverride
      : [
          {
            numeroItem: 1,
            codigoProduto: "001",
            descricao: "PECA TESTE",
            ncm: "61091000", // NCM exemplo - AJUSTAR DEPOIS
            cfop: "5102", // venda dentro do estado
            unidade: "UN",
            quantidade: 1,
            valorUnitario: 100.0,
            valorTotal: 100.0,
          },
        ];

  const ideXml = buildIdeXml(ide);
  const emitXml = buildEmitXml(emitente);
  const destXml = buildDestXml(dest);
  const detXml = itens.map((item) => buildDetXml(item)).join("");

  // Calcula totais com base nos itens
  const totalProdutosNumber = itens.reduce(
    (acc, item) => acc + Number(item.valorTotal),
    0
  );

  const vNF = totalProdutosNumber.toFixed(2);
  const vProd = vNF;

  const totalXml =
    "<total>" +
    "<ICMSTot>" +
    `<vBC>0.00</vBC>` +
    `<vICMS>0.00</vICMS>` +
    `<vICMSDeson>0.00</vICMSDeson>` +
    `<vFCP>0.00</vFCP>` +
    `<vBCST>0.00</vBCST>` +
    `<vST>0.00</vST>` +
    `<vFCPST>0.00</vFCPST>` +
    `<vFCPSTRet>0.00</vFCPSTRet>` +
    `<vProd>${vProd}</vProd>` +
    `<vFrete>0.00</vFrete>` +
    `<vSeg>0.00</vSeg>` +
    `<vDesc>0.00</vDesc>` +
    `<vII>0.00</vII>` +
    `<vIPI>0.00</vIPI>` +
    `<vIPIDevol>0.00</vIPIDevol>` +
    `<vPIS>0.00</vPIS>` +
    `<vCOFINS>0.00</vCOFINS>` +
    `<vOutro>0.00</vOutro>` +
    `<vNF>${vNF}</vNF>` +
    "</ICMSTot>" +
    "</total>";

  const transpXml =
    "<transp>" +
    "<modFrete>9</modFrete>" + // 9 = sem frete
    "</transp>";

  const pagXml =
    "<pag>" +
    "<detPag>" +
    "<tPag>01</tPag>" + // 01 = dinheiro
    `<vPag>${vNF}</vPag>` +
    "</detPag>" +
    "</pag>";

  const infAdicXml =
    "<infAdic>" +
    "<infCpl>NF-e de teste em homologação.</infCpl>" +
    "</infAdic>";

  const infNFeXml =
    `<infNFe Id="${id}" versao="4.00">` +
    ideXml +
    emitXml +
    destXml +
    detXml +
    totalXml +
    transpXml +
    pagXml +
    infAdicXml +
    "</infNFe>";

  const nfeXml =
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<NFe xmlns="http://www.portalfiscal.inf.br/nfe">' +
    infNFeXml +
    "</NFe>";

  return { xml: nfeXml, chave, id };
}
