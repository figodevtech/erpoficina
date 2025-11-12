"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Loader2,
  Copy,
  ExternalLink,
  Link2,
  Car,
  Wrench,
  User2,
  Building2,
  CheckSquare,
  Package,
  ImageIcon,
  FileText,
  StickyNote,
  ListChecks,
  Calculator,
  X,
} from "lucide-react";

const PUBLIC_APPROVAL_BASE = "/aprovacao";
function approvalUrlFromToken(token: string) {
  if (!token) return "";
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}${PUBLIC_APPROVAL_BASE}/${token}`;
}

const statusClasses: Record<string, string> = {
  ORCAMENTO: "bg-fuchsia-600/15 text-fuchsia-400",
  APROVACAO_ORCAMENTO: "bg-sky-600/15 text-sky-400",
  EM_ANDAMENTO: "bg-amber-600/15 text-amber-400",
  PAGAMENTO: "bg-indigo-600/15 text-indigo-400",
  CONCLUIDO: "bg-green-600/15 text-green-400",
  CANCELADO: "bg-red-600/15 text-red-400",
};
const prioClasses: Record<string, string> = {
  ALTA: "bg-red-600/15 text-red-500",
  NORMAL: "bg-amber-600/15 text-amber-500",
  BAIXA: "bg-emerald-600/15 text-emerald-500",
};

function fmtDate(s?: string | null) {
  if (!s) return "—";
  const d = new Date(s);
  return isNaN(d.getTime()) ? "—" : d.toLocaleString();
}
function fmtMoney(v: number | null | undefined) {
  if (v == null || isNaN(Number(v))) return "—";
  return Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function fileNameFromUrl(url: string) {
  try {
    const u = new URL(url);
    const last = u.pathname.split("/").pop() || "imagem";
    return decodeURIComponent(last);
  } catch {
    const last = url.split("/").pop() || "imagem";
    try {
      return decodeURIComponent(last);
    } catch {
      return last;
    }
  }
}

type OS = {
  id: number;
  descricao?: string | null;
  observacoes?: string | null;
  status?: string | null;
  statusaprovacao?: string | null;
  prioridade?: "ALTA" | "NORMAL" | "BAIXA" | null;
  dataentrada?: string | null;
  datasaidaprevista?: string | null;
  datasaidareal?: string | null;
  setor?: { id: number; nome: string } | null;
  cliente?: { id: number; nomerazaosocial: string } | null;
  veiculo?: { id: number; placa?: string | null; modelo?: string | null; marca?: string | null } | null;
  alvo_tipo?: "VEICULO" | "PECA" | null;
  peca?: { id: number; titulo: string } | null;
};

type ItemProduto = {
  ordemservicoid: number;
  produtoid: number;
  quantidade: number;
  precounitario: number;
  subtotal: number;
  produto?: {
    id: number;
    codigo?: string | null;
    descricao?: string | null;
    precounitario?: number | null;
    unidade?: string | null;
  } | null;
};
type ItemServico = {
  ordemservicoid: number;
  servicoid: number;
  quantidade: number;
  precounitario: number;
  subtotal: number;
  servico?: { id: number; codigo?: string | null; descricao?: string | null; precohora?: number | null } | null;
};

type ChecklistImage = { id: number; url: string; descricao?: string | null; createdat?: string | null };
type ChecklistItem = {
  id: number;
  item: string;
  status: "PENDENTE" | "OK" | "ALERTA" | "FALHA";
  observacao?: string | null;
  createdat?: string | null;
  imagens?: ChecklistImage[];
};
type Aprovacao = {
  id: number;
  token: string;
  expira_em?: string | null;
  usado_em?: string | null;
  created_at?: string | null;
};

type OSDetalhesResponse = {
  os: OS;
  itensProduto: ItemProduto[];
  itensServico: ItemServico[];
  checklist: ChecklistItem[];
  aprovacoes?: Aprovacao[];
};

function badgeClassForChecklistStatus(status?: string) {
  switch ((status || "").toUpperCase()) {
    case "OK":
      // verde
      return "bg-emerald-600/15 text-emerald-500 border-emerald-700/30";
    case "ALERTA":
      // amarelo
      return "bg-amber-500/15 text-amber-500 border-amber-700/30";
    case "FALHA":
      // vermelho
      return "bg-red-600/15 text-red-500 border-red-700/30";
    default:
      // neutro (pendente / desconhecido)
      return "bg-muted/30 text-muted-foreground border-muted";
  }
}

export function OSDetalhesDialog({
  open,
  onOpenChange,
  osId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  osId: number | null;
}) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<OSDetalhesResponse | null>(null);

  const canFetch = open && !!osId;

  async function fetchDetails() {
    if (!osId) return;
    setLoading(true);
    try {
      const r = await fetch(`/api/ordens/${osId}`, { cache: "no-store" });
      const j = (await r.json()) as any;
      if (!r.ok) throw new Error(j?.error || "Falha ao carregar OS");
      setData(j as OSDetalhesResponse);
    } catch (e: any) {
      toast.error(e?.message || "Erro ao carregar detalhes");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (canFetch) fetchDetails();
  }, [canFetch, osId]);

  const titulo = useMemo(() => (data?.os?.id ? `Detalhes da OS #${data.os.id}` : "Detalhes da OS"), [data?.os?.id]);

  const statusBadge = useMemo(() => {
    const st = (data?.os?.status || "ORCAMENTO").toUpperCase();
    return <Badge className={statusClasses[st] ?? ""}>{st.replaceAll("_", " ")}</Badge>;
  }, [data?.os?.status]);

  const prioBadge = useMemo(() => {
    const p = (data?.os?.prioridade || "").toUpperCase();
    return p ? <Badge className={prioClasses[p] ?? ""}>{p}</Badge> : null;
  }, [data?.os?.prioridade]);

  const totalProdutos = useMemo(
    () => (data?.itensProduto || []).reduce((acc, it) => acc + Number(it.subtotal || 0), 0),
    [data?.itensProduto]
  );
  const totalServicos = useMemo(
    () => (data?.itensServico || []).reduce((acc, it) => acc + Number(it.subtotal || 0), 0),
    [data?.itensServico]
  );
  const totalGeral = useMemo(() => totalProdutos + totalServicos, [totalProdutos, totalServicos]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          w-[95vw] sm:max-w-4xl
          max-h-[85vh] sm:max-h-[85vh] supports-[height:100svh]:max-h-[85svh]
          overflow-y-auto overscroll-contain
          p-0
        "
      >
        {/* Header sticky + botão fechar */}
        <div className="top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b relative">
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="absolute right-2 top-2" aria-label="Fechar" title="Fechar">
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>

          <DialogHeader className="px-5 pt-5 pb-3">
            <DialogTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-primary" />
              {titulo}
            </DialogTitle>
            <DialogDescription>Informações completas da OS, itens, checklist e links de aprovação.</DialogDescription>
          </DialogHeader>

          {/* Barra de estado */}
          <div className="px-5 pb-3 flex items-center gap-2">
            {statusBadge}
            {prioBadge}
            <div className="ml-auto text-xs text-muted-foreground">
              Entrada: <b>{fmtDate(data?.os?.dataentrada)}</b>
              {" · "}Saída real: <b>{fmtDate(data?.os?.datasaidareal)}</b>
            </div>
          </div>
        </div>

        {/* Conteúdo rolável */}
        <div className="px-5 pb-5">
          {loading ? (
            <div className="h-48 grid place-items-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : !data ? (
            <div className="h-24 grid place-items-center text-sm text-muted-foreground">
              Não foi possível carregar os detalhes.
            </div>
          ) : (
            <div className="space-y-6">
              {/* Resumo — gap-6 para casar com space-y-6 das seções */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <User2 className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Cliente</span>
                  </div>
                  <div className="text-sm">{data.os.cliente?.nomerazaosocial ?? "—"}</div>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Building2 className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Setor</span>
                  </div>
                  <div className="text-sm">{data.os.setor?.nome ?? "—"}</div>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    {data.os.alvo_tipo === "PECA" ? (
                      <Wrench className="h-4 w-4 text-primary" />
                    ) : (
                      <Car className="h-4 w-4 text-primary" />
                    )}
                    <span className="text-sm font-medium">{data.os.alvo_tipo === "PECA" ? "Peça" : "Veículo"}</span>
                  </div>
                  {data.os.alvo_tipo === "PECA" ? (
                    <div className="text-sm">{data.os.peca?.titulo ?? "Peça (detalhes não informados)"}</div>
                  ) : (
                    <div className="text-sm">
                      {data.os.veiculo
                        ? `${data.os.veiculo.marca ?? ""} ${data.os.veiculo.modelo ?? ""} • ${
                            data.os.veiculo.placa ?? ""
                          }`.trim()
                        : "—"}
                    </div>
                  )}
                </div>

                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <CheckSquare className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Status de Aprovação</span>
                  </div>
                  <div className="text-sm">{data.os.statusaprovacao ?? "—"}</div>
                </div>
              </section>

              {/* Descrição / Observações */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Descrição</span>
                  </div>
                  <div className="text-sm whitespace-pre-wrap">{data.os.descricao || "—"}</div>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <StickyNote className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Observações</span>
                  </div>
                  <div className="text-sm whitespace-pre-wrap">{data.os.observacoes || "—"}</div>
                </div>
              </section>

              {/* Produtos / Serviços / Totais */}
              <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Package className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Produtos</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      Total: <b>{fmtMoney(totalProdutos)}</b>
                    </span>
                  </div>
                  {(data.itensProduto ?? []).length === 0 ? (
                    <div className="text-sm text-muted-foreground">—</div>
                  ) : (
                    <ul className="space-y-2 text-sm">
                      {data.itensProduto.map((it, idx) => (
                        <li
                          key={`${it.ordemservicoid}-${it.produtoid}-${idx}`}
                          className="flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <div className="font-medium truncate">
                              {it.produto?.descricao || it.produto?.codigo || `Produto #${it.produtoid}`}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {it.quantidade} × {fmtMoney(it.precounitario)}
                            </div>
                          </div>
                          <div className="shrink-0 font-medium">{fmtMoney(it.subtotal)}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Wrench className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Serviços</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      Total: <b>{fmtMoney(totalServicos)}</b>
                    </span>
                  </div>
                  {(data.itensServico ?? []).length === 0 ? (
                    <div className="text-sm text-muted-foreground">—</div>
                  ) : (
                    <ul className="space-y-2 text-sm">
                      {data.itensServico.map((it, idx) => (
                        <li
                          key={`${it.ordemservicoid}-${it.servicoid}-${idx}`}
                          className="flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <div className="font-medium truncate">
                              {it.servico?.descricao || it.servico?.codigo || `Serviço #${it.servicoid}`}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {it.quantidade} × {fmtMoney(it.precounitario)}
                            </div>
                          </div>
                          <div className="shrink-0 font-medium">{fmtMoney(it.subtotal)}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="lg:col-span-2 rounded-lg border p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Calculator className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Total geral</span>
                  </div>
                  <div className="text-lg font-semibold">{fmtMoney(totalGeral)}</div>
                </div>
              </section>

              {/* Checklist */}
              <section className="rounded-lg border p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <ListChecks className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Checklist</span>
                </div>
                {(data.checklist ?? []).length === 0 ? (
                  <div className="text-sm text-muted-foreground">—</div>
                ) : (
                  <ul className="text-sm">
                    {data.checklist.map((c, idx) => (
                      <Fragment key={c.id}>
                        {idx > 0 && <Separator className="my-0" />}
                        <li className="py-4">
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <div className="font-medium truncate">{c.item}</div>
                              <div className="text-xs text-muted-foreground">
                                {fmtDate(c.createdat)}
                                {c.observacao ? ` • ${c.observacao}` : ""}
                              </div>
                            </div>
                            <Badge variant="outline" className={badgeClassForChecklistStatus(c.status)}>
                              {c.status}
                            </Badge>
                          </div>

                          {Array.isArray(c.imagens) && c.imagens.length > 0 && (
                            <div className="mt-3 space-y-1.5">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <ImageIcon className="h-3.5 w-3.5" />
                                Imagens anexadas
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {c.imagens.map((img) => {
                                  const name = fileNameFromUrl(img.url);
                                  return (
                                    <a
                                      key={img.id}
                                      href={img.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1 rounded border px-2 py-1 text-xs underline hover:bg-muted break-all"
                                      title={img.descricao || name}
                                    >
                                      {name}
                                      <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                                    </a>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </li>
                      </Fragment>
                    ))}
                  </ul>
                )}
              </section>

              {/* Links de aprovação */}
              {Array.isArray(data.aprovacoes) && (
                <section className="rounded-lg border p-4">
                  <div className="text-sm font-medium mb-1.5">Links de aprovação</div>
                  {data.aprovacoes.length === 0 ? (
                    <div className="text-sm text-muted-foreground">—</div>
                  ) : (
                    <ul className="space-y-2 text-sm">
                      {data.aprovacoes.map((a) => {
                        const url = approvalUrlFromToken(a.token);
                        return (
                          <li key={a.id} className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="truncate">
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="underline break-all"
                                  title={url}
                                >
                                  {url}
                                </a>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                criado: {fmtDate(a.created_at)} • expira: {fmtDate(a.expira_em)} • usado:{" "}
                                {fmtDate(a.usado_em)}
                              </div>
                            </div>
                            <div className="shrink-0 flex gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                title="Copiar link"
                                onClick={async () => {
                                  try {
                                    await navigator.clipboard.writeText(url);
                                    toast.success("Link copiado");
                                  } catch {
                                    toast.error("Não foi possível copiar");
                                  }
                                }}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                title="Abrir link"
                                onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </section>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
