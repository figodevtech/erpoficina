// src/app/(app)/(pages)/nfe/[id]/danfe/page.tsx
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { notFound } from "next/navigation";
import { PrintButton } from "./components/PrintButton";
import type { Metadata } from "next";

export const runtime = "nodejs";

type PageProps = {
  params: { id: string };
};

function fmtDate(s?: string | null) {
  if (!s) return "—";
  const d = new Date(s);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("pt-BR");
}

function fmtMoney(v: number | string | null | undefined) {
  if (v == null) return "—";
  const n = Number(v);
  if (isNaN(n)) return "—";
  return n.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function fmtPercent(v: number | string | null | undefined) {
  if (v == null) return "—";
  const n = Number(v);
  if (isNaN(n)) return "—";
  return `${n.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`;
}

function fmtDoc(cpfCnpj?: string | null) {
  if (!cpfCnpj) return "—";
  const s = cpfCnpj.replace(/\D/g, "");
  if (s.length === 11) {
    return s.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }
  if (s.length === 14) {
    return s.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      "$1.$2.$3/$4-$5"
    );
  }
  return cpfCnpj;
}

// chave em 11 blocos de 4 dígitos (3.1.1 do manual)
function fmtChaveAcesso(chave?: string | null) {
  if (!chave) return "—";
  const s = chave.replace(/\D/g, "");
  return s.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

type EmpresaRow = {
  id: number;
  razaosocial: string;
  nomefantasia: string | null;
  cnpj: string;
  endereco: string;
  numero: string | null;
  bairro: string | null;
  complemento: string | null;
  cep: string | null;
  uf: string | null;
  codigomunicipio: string | null;
  telefone: string | null;
  inscricaoestadual: string | null;
};

type ClienteRow = {
  id: number;
  nomerazaosocial: string;
  cpfcnpj: string;
  endereco: string | null;
  endereconumero: string | null;
  enderecocomplemento: string | null;
  bairro: string | null;
  cidade: string;
  estado: string;
  cep: string | null;
};

type NfeRow = {
  id: number;
  modelo: string;
  serie: number;
  numero: number;
  chave_acesso: string;
  ambiente: string;
  status: string;
  ordemservicoid: number | null;
  vendaid: number | null;
  clienteid: number;
  empresaid: number;
  dataemissao: string;
  dataautorizacao: string | null;
  protocolo: string | null;
  total_produtos: number;
  total_servicos: number;
  total_nfe: number;
  empresa?: EmpresaRow;
  cliente?: ClienteRow;
};

type NfeItemRow = {
  id: number;
  n_item: number;
  produtoid: number | null;
  descricao: string;
  ncm: string | null;
  cfop: string;
  csosn: string | null;
  unidade: string;
  quantidade: number | string;
  valor_unitario: number | string;
  valor_total: number | string;
  valor_desconto: number | string | null;
  aliquotaicms: number | string | null;
  valor_bc_icms: number | string | null;
  valor_icms: number | string | null;
  cst_pis: string | null;
  aliquota_pis: number | string | null;
  valor_pis: number | string | null;
  cst_cofins: string | null;
  aliquota_cofins: number | string | null;
  valor_cofins: number | string | null;
};

// Título da aba
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return { title: "DANFE" };
  }

  const { data: nfe } = await supabaseAdmin
    .from("nfe")
    .select("numero")
    .eq("id", id)
    .maybeSingle();

  return {
    title: nfe?.numero ? `DANFE NF-e #${nfe.numero}` : "DANFE",
  };
}

export default async function DanfePage({ params }: PageProps) {
  const id = Number(params.id);
  if (Number.isNaN(id)) {
    notFound();
  }

  // NF-e + empresa + cliente
  const { data: nfeRaw, error } = await supabaseAdmin
    .from("nfe")
    .select(
      `
      id,
      modelo,
      serie,
      numero,
      chave_acesso,
      ambiente,
      status,
      ordemservicoid,
      vendaid,
      clienteid,
      empresaid,
      dataemissao,
      dataautorizacao,
      protocolo,
      total_produtos,
      total_servicos,
      total_nfe,
      empresa:empresa (
        id,
        razaosocial,
        nomefantasia,
        cnpj,
        endereco,
        numero,
        bairro,
        complemento,
        cep,
        uf,
        codigomunicipio,
        telefone,
        inscricaoestadual
      ),
      cliente:cliente (
        id,
        nomerazaosocial,
        cpfcnpj,
        endereco,
        endereconumero,
        enderecocomplemento,
        bairro,
        cidade,
        estado,
        cep
      )
    `
    )
    .eq("id", id)
    .maybeSingle<NfeRow>();

  if (error || !nfeRaw) {
    console.error("[danfe] erro ao carregar nfe:", error);
    notFound();
  }

  const nfe = nfeRaw as NfeRow;

  // Itens da NF-e com detalhes fiscais
  const { data: itensRaw, error: itensError } = await supabaseAdmin
    .from("nfe_item")
    .select(
      `
      id,
      n_item,
      produtoid,
      descricao,
      ncm,
      cfop,
      csosn,
      unidade,
      quantidade,
      valor_unitario,
      valor_total,
      valor_desconto,
      aliquotaicms,
      valor_bc_icms,
      valor_icms,
      cst_pis,
      aliquota_pis,
      valor_pis,
      cst_cofins,
      aliquota_cofins,
      valor_cofins
    `
    )
    .eq("nfe_id", id)
    .order("n_item", { ascending: true });

  if (itensError) {
    console.error("[select nfe_item] erro:", itensError);
  }

  const itens = (itensRaw ?? []) as NfeItemRow[];

  const status = (nfe.status || "").toUpperCase();
  const emitente = nfe.empresa;
  const destinatario = nfe.cliente;

  const enderecoEmitente = emitente
    ? [
        emitente.endereco,
        emitente.numero && `, ${emitente.numero}`,
        emitente.bairro && ` - ${emitente.bairro}`,
        emitente.cep && ` - CEP ${emitente.cep}`,
        emitente.uf && ` - ${emitente.uf}`,
      ]
        .filter(Boolean)
        .join("")
    : "—";

  const enderecoDestinatario = destinatario
    ? [
        destinatario.endereco,
        destinatario.endereconumero && `, ${destinatario.endereconumero}`,
        destinatario.bairro && ` - ${destinatario.bairro}`,
        destinatario.cep && ` - CEP ${destinatario.cep}`,
        ` - ${destinatario.cidade}/${destinatario.estado}`,
      ]
        .filter(Boolean)
        .join("")
    : "—";

  // Totais por tributo (para quadro "Cálculo do Imposto")
  const totalBcIcms = itens.reduce(
    (acc, i) => acc + Number(i.valor_bc_icms ?? 0),
    0
  );
  const totalIcms = itens.reduce(
    (acc, i) => acc + Number(i.valor_icms ?? 0),
    0
  );
  const totalPis = itens.reduce(
    (acc, i) => acc + Number(i.valor_pis ?? 0),
    0
  );
  const totalCofins = itens.reduce(
    (acc, i) => acc + Number(i.valor_cofins ?? 0),
    0
  );

  // Aqui você pode ligar ao tpNF da NF-e real (0=ENTRADA,1=SAÍDA)
const tipoOperacao: string = "SAÍDA";

  const chaveFormatada = fmtChaveAcesso(nfe.chave_acesso);

  const isAutorizada = status === "AUTORIZADA";

  return (
    <>
      <style>{`
        @page {
          size: A4;
          margin: 7mm 5mm;
        }

        .danfe-page {
          font-family: "Times New Roman", "Courier New", system-ui, -apple-system,
            BlinkMacSystemFont, "Segoe UI", sans-serif;
          font-size: 9px;
          color: #000;
          background: #f3f4f6;
          min-height: 100vh;
          padding: 16px 0;
        }

        .danfe-wrapper {
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto;
          background: #ffffff;
          border: 1px solid #000;
          padding: 4mm;
          box-sizing: border-box;
        }

        .actions {
          display: flex;
          justify-content: flex-end;
          width: 210mm;
          margin: 0 auto 8px auto;
          padding: 0 2px;
        }

        .block-title {
          font-size: 7px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .field-label {
          font-size: 7px;
          text-transform: uppercase;
        }

        .field-value {
          font-size: 9px;
          font-weight: 500;
        }

        .border-box {
          border: 1px solid #000;
          box-sizing: border-box;
        }

        .flex-row {
          display: flex;
          flex-direction: row;
        }

        .flex-col {
          display: flex;
          flex-direction: column;
        }

        .center {
          text-align: center;
        }

        .right {
          text-align: right;
        }

        .small-text {
          font-size: 7px;
        }

        .danfe-main-title {
          font-size: 16px;
          font-weight: 700;
        }

        .danfe-subtitle {
          font-size: 9px;
          font-weight: 700;
        }

        .status-pill {
          display: inline-flex;
          align-items: center;
          border-radius: 9999px;
          padding: 1px 8px;
          font-size: 7px;
          font-weight: 700;
          border: 1px solid #000;
        }

        .chave {
          font-family: "Courier New", ui-monospace, SFMono-Regular, Menlo, Monaco,
            Consolas, "Liberation Mono", "Courier New", monospace;
          font-size: 9px;
          letter-spacing: 1px;
          word-break: break-all;
        }

        .barcode-placeholder {
          border: 1px solid #000;
          height: 14mm;
          margin-top: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 7px;
        }

        .items-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 7px;
        }

        .items-table thead {
          background: #f9fafb;
        }

        .items-table th,
        .items-table td {
          border: 1px solid #000;
          padding: 2px 3px;
        }

        .items-table th {
          font-weight: 700;
          text-transform: uppercase;
        }

        .items-table td.desc {
          word-break: break-word;
        }

        @media print {
          .danfe-page {
            background: #ffffff;
            padding: 0;
            min-height: auto;
          }
          .actions {
            display: none;
          }
          .danfe-wrapper {
            margin: 0;
            border: none;
            width: auto;
            min-height: auto;
            padding: 0;
          }
        }
      `}</style>

      <div className="danfe-page">
        <div className="actions">
          <PrintButton />
        </div>

        <div className="danfe-wrapper">
          {/* CANHOTO DE RECEBIMENTO */}
          <div
            className="border-box"
            style={{
              display: "grid",
              gridTemplateColumns: "2.5fr 2fr",
              marginBottom: "2mm",
            }}
          >
            <div style={{ borderRight: "1px solid #000", padding: "2px 3px" }}>
              <div className="block-title">RECEBEMOS DE</div>
              <div className="small-text">
                {emitente?.razaosocial ?? "Emitente"}
              </div>
              <div className="small-text">
                NF-e Nº {nfe.numero.toString().padStart(9, "0")} SÉRIE{" "}
                {nfe.serie.toString().padStart(3, "0")}
              </div>
              <div className="small-text">
                A descrição dos produtos e/ou serviços constantes na NF-e
                indicada ao lado.
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 2fr" }}>
              <div
                style={{
                  borderRight: "1px solid #000",
                  padding: "2px 3px",
                  fontSize: 8,
                }}
              >
                <div className="block-title">DATA DE RECEBIMENTO</div>
                <div style={{ minHeight: "14mm" }} />
              </div>
              <div style={{ padding: "2px 3px", fontSize: 8 }}>
                <div className="block-title">
                  IDENTIFICAÇÃO E ASSINATURA DO RECEBEDOR
                </div>
                <div style={{ minHeight: "14mm" }} />
              </div>
            </div>
          </div>

          {/* BLOCO IDENTIFICAÇÃO EMITENTE + DANFE + CHAVE */}
          <div
            className="border-box"
            style={{
              display: "grid",
              gridTemplateColumns: "2.8fr 2.2fr 2.5fr",
              marginBottom: "2mm",
            }}
          >
            {/* Emitente */}
            <div style={{ borderRight: "1px solid #000", padding: "2px 3px" }}>
              <div className="block-title">IDENTIFICAÇÃO DO EMITENTE</div>
              <div className="field-value">
                {emitente?.razaosocial ?? "—"}
              </div>
              <div className="small-text">{enderecoEmitente}</div>
              <div className="small-text">
                CNPJ: {fmtDoc(emitente?.cnpj)}{" "}
                {emitente?.inscricaoestadual &&
                  ` | IE: ${emitente.inscricaoestadual}`}
              </div>
              {emitente?.telefone && (
                <div className="small-text">Fone: {emitente.telefone}</div>
              )}
            </div>

            {/* Meio - DANFE / tipo operação / nº, série, folha */}
            <div
              style={{
                borderRight: "1px solid #000",
                padding: "2px 3px",
                textAlign: "center",
              }}
            >
              <div className="danfe-main-title">DANFE</div>
              <div className="danfe-subtitle">
                DOCUMENTO AUXILIAR DA NOTA FISCAL ELETRÔNICA
              </div>
              <div className="small-text" style={{ marginTop: 4 }}>
                {tipoOperacao === "ENTRADA" ? "0-ENTRADA" : "1-SAÍDA"}
              </div>
              <div className="small-text" style={{ marginTop: 2 }}>
                Nº{" "}
                <strong>
                  {nfe.numero.toString().padStart(9, "0")}
                </strong>{" "}
                SÉRIE <strong>{nfe.serie.toString().padStart(3, "0")}</strong>
              </div>
              <div className="small-text">
                FOLHA <strong>1/1</strong>
              </div>
              {nfe.ordemservicoid && (
                <div className="small-text" style={{ marginTop: 2 }}>
                  Ref. OS nº {nfe.ordemservicoid}
                </div>
              )}
              <div style={{ marginTop: 4 }}>
                <span className="field-label">Status: </span>
                <span className="status-pill">{status || "DESCONHECIDO"}</span>
              </div>
            </div>

            {/* Chave + código de barras + campos 1 e 2 */}
            <div style={{ padding: "2px 3px" }}>
              <div className="field-label center">CHAVE DE ACESSO</div>
              <div className="chave center">{chaveFormatada}</div>
              <div className="barcode-placeholder">
                {/* Aqui entra o CODE-128C da chave de acesso */}
                CÓDIGO DE BARRAS (CODE-128C)
              </div>
              <div className="small-text" style={{ marginTop: 2 }}>
                {isAutorizada ? (
                  <>
                    Consulta de autenticidade no Portal Nacional da NF-e
                    (www.nfe.fazenda.gov.br/portal) ou no site da Sefaz
                    Autorizadora.
                  </>
                ) : (
                  <>
                    DANFE emitido em ambiente de homologação ou em contingência.
                    Consulte a NF-e no portal apropriado.
                  </>
                )}
              </div>
              {isAutorizada && nfe.protocolo && (
                <div className="small-text" style={{ marginTop: 2 }}>
                  PROTOCOLO DE AUTORIZAÇÃO DE USO: {nfe.protocolo}{" "}
                  {nfe.dataautorizacao && " – "}
                  {nfe.dataautorizacao && fmtDate(nfe.dataautorizacao)}
                </div>
              )}
            </div>
          </div>

          {/* BLOCO DADOS DA NF-E / DESTINATÁRIO */}
          <div
            className="border-box"
            style={{ padding: "2px 3px", marginBottom: "2mm" }}
          >
            <div className="block-title">DESTINATÁRIO / REMETENTE</div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "3fr 1.4fr 1.2fr",
                columnGap: "2mm",
                rowGap: "1mm",
                marginTop: 2,
              }}
            >
              <div>
                <div className="field-label">Nome / Razão Social</div>
                <div className="field-value">
                  {destinatario?.nomerazaosocial ?? "—"}
                </div>
              </div>
              <div>
                <div className="field-label">CPF/CNPJ</div>
                <div className="field-value">
                  {fmtDoc(destinatario?.cpfcnpj)}
                </div>
              </div>
              <div>
                <div className="field-label">Data de Emissão</div>
                <div className="field-value">{fmtDate(nfe.dataemissao)}</div>
              </div>
              <div>
                <div className="field-label">Endereço</div>
                <div className="field-value">{enderecoDestinatario}</div>
              </div>
              <div>
                <div className="field-label">Município / UF</div>
                <div className="field-value">
                  {destinatario
                    ? `${destinatario.cidade}/${destinatario.estado}`
                    : "—"}
                </div>
              </div>
              <div>
                <div className="field-label">CEP</div>
                <div className="field-value">
                  {destinatario?.cep ?? "—"}
                </div>
              </div>
            </div>
          </div>

          {/* BLOCO CÁLCULO DO IMPOSTO */}
          <div
            className="border-box"
            style={{
              padding: "2px 3px",
              marginBottom: "2mm",
            }}
          >
            <div className="block-title">CÁLCULO DO IMPOSTO</div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(6, minmax(0, 1fr))",
                columnGap: "2mm",
                marginTop: 2,
              }}
            >
              <div>
                <div className="field-label">Base de Cálculo do ICMS</div>
                <div className="field-value">{fmtMoney(totalBcIcms)}</div>
              </div>
              <div>
                <div className="field-label">Valor do ICMS</div>
                <div className="field-value">{fmtMoney(totalIcms)}</div>
              </div>
              <div>
                <div className="field-label">Base de Cálculo do ICMS ST</div>
                <div className="field-value">{fmtMoney(0)}</div>
              </div>
              <div>
                <div className="field-label">Valor do ICMS ST</div>
                <div className="field-value">{fmtMoney(0)}</div>
              </div>
              <div>
                <div className="field-label">Valor Total dos Produtos</div>
                <div className="field-value">
                  {fmtMoney(nfe.total_produtos)}
                </div>
              </div>
              <div>
                <div className="field-label">Valor Total da Nota</div>
                <div className="field-value">
                  {fmtMoney(nfe.total_nfe)}
                </div>
              </div>
            </div>
          </div>

          {/* BLOCO TRANSPORTADOR / VOLUMES (valores genéricos por enquanto) */}
          <div
            className="border-box"
            style={{ padding: "2px 3px", marginBottom: "2mm" }}
          >
            <div className="block-title">
              TRANSPORTADOR / VOLUMES TRANSPORTADOS
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "3fr 1fr 1.5fr 1fr 1.5fr",
                columnGap: "2mm",
                rowGap: "1mm",
                marginTop: 2,
              }}
            >
              <div>
                <div className="field-label">Nome / Razão Social</div>
                <div className="field-value">—</div>
              </div>
              <div>
                <div className="field-label">Frete por conta</div>
                <div className="field-value">9 - Sem Ocorrência</div>
              </div>
              <div>
                <div className="field-label">CNPJ/CPF</div>
                <div className="field-value">—</div>
              </div>
              <div>
                <div className="field-label">Placa do Veículo</div>
                <div className="field-value">—</div>
              </div>
              <div>
                <div className="field-label">UF</div>
                <div className="field-value">—</div>
              </div>
            </div>
          </div>

          {/* BLOCO DADOS DOS PRODUTOS/SERVIÇOS */}
          <div
            className="border-box"
            style={{ padding: "2px 1px", marginBottom: "2mm" }}
          >
            <div className="block-title">DADOS DOS PRODUTOS / SERVIÇOS</div>
            <div style={{ marginTop: 2 }}>
              {itens.length === 0 ? (
                <div className="small-text">
                  Nenhum item cadastrado para esta NF-e.
                </div>
              ) : (
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Cód. Produto</th>
                      <th>Descrição do Produto / Serviço</th>
                      <th>NCM</th>
                      <th>CST/CSOSN</th>
                      <th>CFOP</th>
                      <th>UN</th>
                      <th>Qtde</th>
                      <th>Valor Unitário</th>
                      <th>Valor Total</th>
                      <th>BC ICMS</th>
                      <th>Alíquota ICMS</th>
                      <th>Valor ICMS</th>
                      <th>CST PIS</th>
                      <th>Valor PIS</th>
                      <th>CST COFINS</th>
                      <th>Valor COFINS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itens.map((item) => (
                      <tr key={item.id}>
                        <td className="center">{item.n_item}</td>
                        <td className="center">
                          {item.produtoid ?? "—"}
                        </td>
                        <td className="desc">{item.descricao}</td>
                        <td className="center">{item.ncm ?? "—"}</td>
                        <td className="center">
                          {item.csosn ?? "—"}
                        </td>
                        <td className="center">{item.cfop}</td>
                        <td className="center">{item.unidade}</td>
                        <td className="right">
                          {Number(item.quantidade ?? 0).toLocaleString(
                            "pt-BR",
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 4,
                            }
                          )}
                        </td>
                        <td className="right">
                          {fmtMoney(item.valor_unitario)}
                        </td>
                        <td className="right">
                          {fmtMoney(item.valor_total)}
                        </td>
                        <td className="right">
                          {fmtMoney(item.valor_bc_icms)}
                        </td>
                        <td className="right">
                          {fmtPercent(item.aliquotaicms)}
                        </td>
                        <td className="right">
                          {fmtMoney(item.valor_icms)}
                        </td>
                        <td className="center">{item.cst_pis ?? "—"}</td>
                        <td className="right">
                          {fmtMoney(item.valor_pis)}
                        </td>
                        <td className="center">{item.cst_cofins ?? "—"}</td>
                        <td className="right">
                          {fmtMoney(item.valor_cofins)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* BLOCO CÁLCULO ISSQN + DADOS ADICIONAIS */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 2fr 1.2fr",
              columnGap: "2mm",
            }}
          >
            {/* ISSQN */}
            <div className="border-box" style={{ padding: "2px 3px" }}>
              <div className="block-title">CÁLCULO DO ISSQN</div>
              <div style={{ marginTop: 2 }}>
                <div className="small-text">
                  Inscrição Municipal: —{/* sem coluna na tabela nfe */}
                </div>
                <div className="small-text">
                  Valor Total dos Serviços: {fmtMoney(nfe.total_servicos)}
                </div>
                <div className="small-text">
                  Base de Cálculo do ISSQN: {fmtMoney(0)}
                </div>
                <div className="small-text">
                  Valor do ISSQN: {fmtMoney(0)}
                </div>
              </div>
            </div>

            {/* Informações complementares */}
            <div className="border-box" style={{ padding: "2px 3px" }}>
              <div className="block-title">INFORMAÇÕES COMPLEMENTARES</div>
              <div className="small-text" style={{ marginTop: 2 }}>
                Versão de visualização do DANFE gerada pelo sistema. Para fins
                fiscais, prevalece o XML da NF-e autorizado pela SEFAZ.
              </div>
            </div>

            {/* Reservado ao Fisco */}
            <div className="border-box" style={{ padding: "2px 3px" }}>
              <div className="block-title">RESERVADO AO FISCO</div>
              <div className="small-text" style={{ marginTop: 2 }}>
                {/* Uso exclusivo do Fisco. */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
