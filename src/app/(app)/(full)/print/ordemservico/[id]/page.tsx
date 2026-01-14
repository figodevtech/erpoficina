import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { notFound } from "next/navigation";
import { PrintButton } from "../../../components/PrintButton";
import { Metadata } from "next";

export const runtime = "nodejs";

type PageProps = {
  params: Promise<{ id: string }>;
};

const EMPTY = "-";

/* ========= HELPERS DE FORMATAÇÃO ========= */

function fmtMoney(v: number | string | null | undefined) {
  if (v == null) return "R$ 0,00";
  const n = Number(v);
  if (isNaN(n)) return "R$ 0,00";
  return n.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function fmtDate(s?: string | Date | null) {
  if (!s) return EMPTY;
  const d = s instanceof Date ? s : new Date(s);
  if (isNaN(d.getTime())) return EMPTY;
  return d.toLocaleDateString("pt-BR");
}

function fmtDateTime(s?: string | Date | null) {
  if (!s) return EMPTY;
  const d = s instanceof Date ? s : new Date(s);
  if (isNaN(d.getTime())) return EMPTY;
  return d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

function fmtText(value?: string | number | null) {
  if (value == null) return EMPTY;
  const s = String(value).trim();
  return s ? s : EMPTY;
}

function joinParts(parts: Array<string | null | undefined>, separator = ", ") {
  return parts
    .map((part) => (part ?? "").toString().trim())
    .filter((part) => part.length > 0)
    .join(separator);
}

function fmtDoc(cpfCnpj: unknown) {
  if (cpfCnpj == null) return EMPTY;
  const s = String(cpfCnpj).replace(/\D/g, "");
  if (!s) return EMPTY;
  if (s.length === 11) {
    return s.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }
  if (s.length === 14) {
    return s.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  }
  return s;
}

function fmtPhone(value?: string | null) {
  if (!value) return EMPTY;
  const s = String(value).replace(/\D/g, "");
  if (s.length === 11) return s.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  if (s.length === 10) return s.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  return value;
}

function fmtEnum(value?: string | null) {
  if (!value) return EMPTY;
  return String(value)
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

async function fetchEmpresa(empresaId = 1) {
  const { data, error } = await supabaseAdmin
    .from("empresa")
    .select("*")
    .eq("id", empresaId)
    .maybeSingle();

  if (error) {
    console.error("Erro ao buscar empresa no Supabase:", error);
    return null;
  }

  return data ?? null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: `Ordem de Serviço #${id}` };
}

export default async function OSFullPage({ params }: PageProps) {
  const { id: idStr } = await params;
  const osId = Number(idStr);

  if (isNaN(osId)) notFound();

  const { data: os, error: osError } = await supabaseAdmin
    .from("ordemservico")
    .select(
      `
      *,
      cliente:clienteid (*),
      veiculo:veiculoid (*),
      peca:pecaid (*),
      servicos:osservico (*, servico:servicoid (*)),
      produtos:osproduto (*, produto:produtoid (*))
    `
    )
    .eq("id", osId)
    .maybeSingle();

  if (osError || !os) {
    console.error("Erro ao carregar OS:", osError);
    notFound();
  }

  const empresa = await fetchEmpresa(1);

  const totalProdutos =
    os.produtos?.reduce((acc: number, p: any) => acc + Number(p.subtotal), 0) || 0;
  const totalServicos =
    os.servicos?.reduce((acc: number, s: any) => acc + Number(s.subtotal), 0) || 0;
  const totalGeral = totalProdutos + totalServicos;

  const empresaNome = empresa?.nomefantasia || empresa?.razaosocial || "Oficina Mecânica";
  const empresaRazao =
    empresa?.nomefantasia && empresa?.razaosocial && empresa?.nomefantasia !== empresa?.razaosocial
      ? empresa?.razaosocial
      : "";

  const empresaEndereco = joinParts(
    [empresa?.endereco, empresa?.numero ? `Nº ${empresa.numero}` : null, empresa?.complemento],
    ", "
  );
  const empresaLocal = joinParts(
    [empresa?.bairro, empresa?.uf, empresa?.cep ? `CEP ${empresa.cep}` : null],
    " • "
  );

  const clienteEndereco = joinParts(
    [
      os.cliente?.endereco,
      os.cliente?.endereconumero ? `Nº ${os.cliente.endereconumero}` : null,
      os.cliente?.enderecocomplemento,
    ],
    ", "
  );
  const clienteLocal = joinParts(
    [os.cliente?.bairro, os.cliente?.cidade, os.cliente?.estado, os.cliente?.cep ? `CEP ${os.cliente.cep}` : null],
    " • "
  );

  const veiculoNome = joinParts([os.veiculo?.marca, os.veiculo?.modelo], " ");
  const veiculoPlaca = os.veiculo?.placa_formatada || os.veiculo?.placa;
  const alvoTipo = os.alvo_tipo === "PECA" ? "Peça" : "Veículo";

  const companyInfo = [
    { label: "CNPJ", value: fmtDoc(empresa?.cnpj) },
    { label: "Inscrição Estadual", value: fmtText(empresa?.inscricaoestadual) },
    { label: "Telefone", value: fmtPhone(empresa?.telefone) },
  ];

  const osInfo = [
    { label: "Status", value: fmtEnum(os.status) },
    { label: "Aprovação", value: fmtEnum(os.statusaprovacao) },
    { label: "Prioridade", value: fmtEnum(os.prioridade) },
    { label: "Entrada", value: fmtDate(os.dataentrada) },
    { label: "Saída", value: fmtDate(os.datasaida) },
    { label: "Alvo", value: alvoTipo },
  ];

  return (
    <div className="os-page">
      <style>{`
        :root {
          --ink: #0f172a;
          --muted: #475569;

          --accent: hsl(var(--primary, 173 80% 26%));
          --accent-soft: hsl(var(--primary, 173 80% 26%) / 0.12);
          --border: #e2e8f0;
        }

        * {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        /* ====== PRINT BASE ====== */
        @page {
          size: A4;
          margin: 0;
        }

        @media print {
          :root { color-scheme: light !important; }
          html, body {
            background: #fff !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .print-hidden, .no-print { display: none !important; }

          .os-page {
            background: #fff !important;
            padding: 0 !important;
            min-height: auto !important;
          }

          .os-wrapper {
            width: auto !important;
            min-height: auto !important;
            margin: 0 !important;
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            background: #fff !important;
          }

          /* margem real do documento */
          .os-content {
            padding: 10mm !important;
          }

          /* >>> PAGINAÇÃO: força nova página antes do bloco <<< */
          .print-break-before {
            break-before: page !important;
            page-break-before: always !important;
          }

          /* evita cortes ruins dentro de cards/linhas */
          .print-avoid,
          tr {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          thead { display: table-header-group; }
          tfoot { display: table-footer-group; }
        }

        /* ====== SCREEN ====== */
        .os-page {
          min-height: 100vh;
          padding: 16px 0;
          color: var(--ink);
          background: linear-gradient(135deg, #f8fafc, #ffffff, #fffbeb);
          font-family: "IBM Plex Sans", "Source Sans 3", "Segoe UI", sans-serif;
        }

        .os-wrapper {
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto;
          background: #fff;
          border: 1px solid var(--border);
          border-radius: 16px;
          box-shadow: 0 24px 50px rgba(2, 6, 23, 0.14);
          box-sizing: border-box;
        }

        .os-content {
          padding: 8mm;
          box-sizing: border-box;
        }

        .print-heading {
          font-family: "Source Serif 4", "Iowan Old Style", "Palatino Linotype", "Book Antiqua", serif;
        }

        .print-tag {
          border: 1px solid var(--accent);
          color: var(--accent);
          background: var(--accent-soft);
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .section-title::before {
          content: "";
          width: 10px;
          height: 10px;
          border-radius: 9999px;
          background: var(--accent);
          box-shadow: 0 0 0 3px var(--accent-soft);
        }

        .table-head {
          background: var(--accent-soft);
          color: var(--ink);
        }

        table { border-collapse: collapse; }
      `}</style>

      {/* Toolbar (somente tela) */}
      <div className="max-w-[210mm] mx-auto mb-4 flex justify-between items-center px-4 print-hidden no-print">
        <div>
          <p className="text-[11px] uppercase tracking-[0.32em] text-slate-500">Ordem de Serviço</p>
          <h1 className="text-2xl font-semibold text-slate-900">Visualização de Impressão</h1>
        </div>
        <PrintButton />
      </div>

      <div className="os-wrapper">
        <div className="os-content">
          {/* Header */}
          <div className="flex flex-col gap-6 border-b border-slate-200 pb-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold print-heading shadow-sm">
                  OS
                </div>
                <div>
                  <h2 className="print-heading text-2xl font-semibold uppercase text-slate-900">
                    {empresaNome}
                  </h2>
                  {empresaRazao ? <p className="text-xs text-slate-500 mt-1">{empresaRazao}</p> : null}
                  <div className="mt-2 text-xs text-slate-600 leading-relaxed">
                    {empresaEndereco ? <div>{empresaEndereco}</div> : null}
                    {empresaLocal ? <div>{empresaLocal}</div> : null}
                    {empresa?.telefone ? <div>Tel: {fmtPhone(empresa.telefone)}</div> : null}
                  </div>
                </div>
              </div>

              <div className="w-full sm:w-[240px] rounded-xl border border-primary/20 bg-primary/5 p-4 print-avoid">
                <div className="text-[11px] uppercase tracking-[0.25em] text-slate-500">Ordem de Serviço</div>
                <div className="flex items-baseline justify-between mt-2">
                  <div className="text-3xl font-semibold text-slate-900">
                    <span className="text-primary">#</span>
                    {os.id}
                  </div>
                  <span className="print-tag text-[10px] uppercase font-bold tracking-wide px-2 py-1 rounded-full">
                    {fmtEnum(os.status)}
                  </span>
                </div>
                <div className="mt-3 space-y-1 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Entrada</span>
                    <span className="font-medium text-slate-900">{fmtDate(os.dataentrada)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saída</span>
                    <span className="font-medium text-slate-900">{fmtDate(os.datasaida)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Prioridade</span>
                    <span className="font-medium text-slate-900">{fmtEnum(os.prioridade)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-4 print-avoid">
                <h3 className="text-[11px] uppercase tracking-[0.2em] text-slate-500 font-semibold">
                  Identificação da Empresa
                </h3>
                <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3 text-xs">
                  {companyInfo.map((info) => (
                    <div key={info.label}>
                      <p className="text-[10px] uppercase tracking-wider text-slate-500">{info.label}</p>
                      <p className="text-sm font-semibold text-slate-900">{info.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 print-avoid">
                <h3 className="text-[11px] uppercase tracking-[0.2em] text-slate-500 font-semibold">
                  Dados da Ordem
                </h3>
                <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3 text-xs">
                  {osInfo.map((info) => (
                    <div key={info.label}>
                      <p className="text-[10px] uppercase tracking-wider text-slate-500">{info.label}</p>
                      <p className="text-sm font-semibold text-slate-900">{info.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Cliente e Alvo */}
          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-primary/15 bg-primary/5 p-4 print-avoid">
              <h3 className="text-[11px] uppercase tracking-[0.2em] text-slate-500 font-semibold">Cliente</h3>
              <div className="mt-3">
                <p className="text-base font-semibold text-slate-900">{fmtText(os.cliente?.nomerazaosocial)}</p>
                <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-slate-600">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400">Documento</p>
                    <p className="font-medium text-slate-900">{fmtDoc(os.cliente?.cpfcnpj)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400">Telefone</p>
                    <p className="font-medium text-slate-900">{fmtPhone(os.cliente?.telefone)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400">E-mail</p>
                    <p className="font-medium text-slate-900">{fmtText(os.cliente?.email)}</p>
                  </div>
                </div>

                {clienteEndereco || clienteLocal ? (
                  <div className="mt-3 text-xs text-slate-600 leading-relaxed">
                    {clienteEndereco ? <div>{clienteEndereco}</div> : null}
                    {clienteLocal ? <div>{clienteLocal}</div> : null}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="rounded-xl border border-primary/15 bg-primary/5 p-4 print-avoid">
              <h3 className="text-[11px] uppercase tracking-[0.2em] text-slate-500 font-semibold">
                {alvoTipo === "Peça" ? "Peça / Componente" : "Veículo"}
              </h3>

              <div className="mt-3 text-xs text-slate-600">
                {alvoTipo === "Peça" ? (
                  <>
                    <p className="text-base font-semibold text-slate-900">
                      {fmtText(os.peca?.titulo || os.peca?.descricao)}
                    </p>
                    {os.peca?.descricao ? (
                      <p className="mt-3 text-xs text-slate-600 leading-relaxed">{os.peca?.descricao}</p>
                    ) : null}
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <p className="text-base font-semibold text-slate-900">{fmtText(veiculoNome)}</p>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-widest bg-primary text-primary-foreground">
                        {fmtText(veiculoPlaca)}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-slate-400">Ano</p>
                        <p className="font-medium text-slate-900">{fmtText(os.veiculo?.ano)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-slate-400">Cor</p>
                        <p className="font-medium text-slate-900">{fmtText(os.veiculo?.cor)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-slate-400">KM</p>
                        <p className="font-medium text-slate-900">
                          {os.veiculo?.kmatual?.toLocaleString("pt-BR") ?? EMPTY}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-slate-400">Tipo</p>
                        <p className="font-medium text-slate-900">{fmtEnum(os.veiculo?.tipo)}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Descrição */}
          {os.descricao ? (
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 print-avoid">
              <h3 className="text-[11px] uppercase tracking-[0.2em] text-slate-500 font-semibold">
                Relato do Cliente / Problema
              </h3>
              <p className="mt-2 text-sm text-slate-700 leading-relaxed">{os.descricao}</p>
            </div>
          ) : null}

          {/* >>> SERVIÇOS (COMEÇA SEMPRE NA 2ª PÁGINA) <<< */}
          <div className="mt-6 print-break-before">
            <h3 className="section-title text-[11px] uppercase tracking-[0.2em] text-slate-600 font-semibold mb-2">
              Mão de Obra e Serviços
            </h3>

            <table className="w-full text-[11px] text-left border border-slate-200">
              <thead>
                <tr className="table-head uppercase font-semibold">
                  <th className="py-2 px-3 w-16">Item</th>
                  <th className="py-2 px-3">Descrição do Serviço</th>
                  <th className="py-2 px-3 w-16 text-center">Qtd</th>
                  <th className="py-2 px-3 w-24 text-right">Unitário</th>
                  <th className="py-2 px-3 w-28 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {os.servicos?.map((s: any, idx: number) => (
                  <tr key={s.id || idx} className="odd:bg-white even:bg-primary/5">
                    <td className="py-2 px-3 text-slate-400">{(idx + 1).toString().padStart(2, "0")}</td>
                    <td className="py-2 px-3 font-medium text-slate-900">{s.servico?.descricao || "Serviço"}</td>
                    <td className="py-2 px-3 text-center">{s.quantidade}</td>
                    <td className="py-2 px-3 text-right">{fmtMoney(s.precounitario)}</td>
                    <td className="py-2 px-3 text-right font-semibold">{fmtMoney(s.subtotal)}</td>
                  </tr>
                ))}
                {(!os.servicos || os.servicos.length === 0) && (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-slate-400 italic">
                      Nenhum serviço registrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Produtos */}
          <div className="mt-6">
            <h3 className="section-title text-[11px] uppercase tracking-[0.2em] text-slate-600 font-semibold mb-2">
              Peças e Materiais
            </h3>

            <table className="w-full text-[11px] text-left border border-slate-200">
              <thead>
                <tr className="table-head uppercase font-semibold">
                  <th className="py-2 px-3 w-16">Item</th>
                  <th className="py-2 px-3">Peça / Produto</th>
                  <th className="py-2 px-3 w-16 text-center">Qtd</th>
                  <th className="py-2 px-3 w-24 text-right">Unitário</th>
                  <th className="py-2 px-3 w-28 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {os.produtos?.map((p: any, idx: number) => (
                  <tr key={p.id || idx} className="odd:bg-white even:bg-primary/5">
                    <td className="py-2 px-3 text-slate-400">{(idx + 1).toString().padStart(2, "0")}</td>
                    <td className="py-2 px-3 font-medium text-slate-900">
                      {p.produto?.titulo || p.produto?.descricao || "Peça"}
                    </td>
                    <td className="py-2 px-3 text-center">{p.quantidade}</td>
                    <td className="py-2 px-3 text-right">{fmtMoney(p.precounitario)}</td>
                    <td className="py-2 px-3 text-right font-semibold">{fmtMoney(p.subtotal)}</td>
                  </tr>
                ))}
                {(!os.produtos || os.produtos.length === 0) && (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-slate-400 italic">
                      Nenhuma peça registrada
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totais */}
          <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between print-avoid">
            <div className="text-xs text-slate-500">
              <p className="font-semibold text-slate-700">Resumo Financeiro</p>
              <p>Totais calculados a partir dos itens lançados na ordem.</p>
            </div>

            <div className="w-full sm:w-[260px] rounded-xl border border-primary/20 bg-primary/5 p-4">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Total em Serviços</span>
                <span className="font-medium text-slate-900">{fmtMoney(totalServicos)}</span>
              </div>
              <div className="mt-2 flex justify-between text-xs text-slate-600">
                <span>Total em Peças</span>
                <span className="font-medium text-slate-900">{fmtMoney(totalProdutos)}</span>
              </div>
              <div className="mt-3 border-t border-primary/30 pt-3 flex justify-between text-base font-semibold uppercase">
                <span>Total Geral</span>
                <span className="text-primary">{fmtMoney(totalGeral)}</span>
              </div>
            </div>
          </div>

          {/* Assinaturas */}
          <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2 print-avoid">
            <div className="border-t border-primary/40 text-center pt-3">
              <p className="text-xs font-semibold text-slate-600 uppercase">Assinatura do Cliente</p>
            </div>
            <div className="border-t border-primary/40 text-center pt-3">
              <p className="text-xs font-semibold text-slate-600 uppercase">Responsável da Oficina</p>
            </div>
          </div>

          {/* Observações */}
          {os.observacoes ? (
            <div className="mt-8 border-t border-slate-200 pt-4 print-avoid">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                Observações adicionais
              </p>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed italic">{os.observacoes}</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
