// src/app/(app)/(pages)/ordens/components/dialogs/os-detalhes-dialog.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";

// ===== Ajuste o prefixo da URL pública =====
// Se o link público do orçamento for, por exemplo, "/orcamento/{token}",
// troque a constante abaixo para "/orcamento".
const PUBLIC_APPROVAL_BASE = "/aprovacao";

function approvalUrlFromToken(token: string) {
  if (!token) return "";
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}${PUBLIC_APPROVAL_BASE}/${token}`;
}

// ===== Helpers visuais =====
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

// ===== Helpers de data/moeda =====
function fmtDate(s?: string | null) {
  if (!s) return "—";
  const d = new Date(s);
  return isNaN(d.getTime()) ? "—" : d.toLocaleString();
}
function fmtMoney(v: number | null | undefined) {
  if (v == null || isNaN(Number(v))) return "—";
  return Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// ===== Tipos mínimos (compatíveis com sua API /api/ordens/[id]) =====
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
  peca?: { id: number; titulo: string } | null; // se sua API incluir peca populada
};

type ItemProduto = {
  ordemservicoid: number;
  produtoid: number;
  quantidade: number;
  precounitario: number;
  subtotal: number;
  produto?: { id: number; codigo?: string | null; descricao?: string | null; precounitario?: number | null; unidade?: string | null } | null;
};

type ItemServico = {
  ordemservicoid: number;
  servicoid: number;
  quantidade: number;
  precounitario: number;
  subtotal: number;
  servico?: { id: number; codigo?: string | null; descricao?: string | null; precohora?: number | null } | null;
};

type ChecklistItem = {
  id: number;
  item: string;
  status: "PENDENTE" | "OK" | "ALERTA" | "FALHA";
  observacao?: string | null;
  createdat?: string | null;
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
  aprovacoes?: Aprovacao[]; // a API mais nova pode retornar este campo
};

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canFetch, osId]);

  const titulo = useMemo(
    () => (data?.os?.id ? `Detalhes da OS #${data.os.id}` : "Detalhes da OS"),
    [data?.os?.id]
  );

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
  const totalGeral = totalProdutos + totalServicos;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-4xl p-0"
        // Altura máxima e rolagem interna para não estourar a tela
      >
        <div className="flex flex-col max-h-[calc(100vh-6rem)]">
          <DialogHeader className="px-5 pt-5">
            <DialogTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-primary" />
              {titulo}
            </DialogTitle>
            <DialogDescription>
              Informações completas da OS, itens, checklist e links de aprovação.
            </DialogDescription>
          </DialogHeader>

          {/* Barra de estado */}
          <div className="px-5 pt-2 pb-3 flex items-center gap-2">
            {statusBadge}
            {prioBadge}
            <div className="ml-auto text-xs text-muted-foreground">
              Entrada: <b>{fmtDate(data?.os?.dataentrada)}</b>
              {" · "}Saída prev.: <b>{fmtDate(data?.os?.datasaidaprevista)}</b>
              {" · "}Saída real: <b>{fmtDate(data?.os?.datasaidareal)}</b>
            </div>
          </div>

          {/* CONTEÚDO SCROLLÁVEL */}
          <div className="px-5 pb-5 overflow-y-auto">
            {loading ? (
              <div className="h-48 grid place-items-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : !data ? (
              <div className="h-24 grid place-items-center text-sm text-muted-foreground">
                Não foi possível carregar os detalhes.
              </div>
            ) : (
              <div className="space-y-8">
                {/* Resumo */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-lg border p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <User2 className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Cliente</span>
                    </div>
                    <div className="text-sm">
                      {data.os.cliente?.nomerazaosocial ?? "—"}
                    </div>
                  </div>

                  <div className="rounded-lg border p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Setor</span>
                    </div>
                    <div className="text-sm">
                      {data.os.setor?.nome ?? "—"}
                    </div>
                  </div>

                  <div className="rounded-lg border p-3">
                    <div className="flex items-center gap-2 mb-2">
                      {data.os.alvo_tipo === "PECA" ? (
                        <Wrench className="h-4 w-4 text-primary" />
                      ) : (
                        <Car className="h-4 w-4 text-primary" />
                      )}
                      <span className="text-sm font-medium">
                        {data.os.alvo_tipo === "PECA" ? "Peça" : "Veículo"}
                      </span>
                    </div>
                    {data.os.alvo_tipo === "PECA" ? (
                      <div className="text-sm">
                        {data.os.peca?.titulo ?? "Peça (detalhes não informados)"}
                      </div>
                    ) : (
                      <div className="text-sm">
                        {data.os.veiculo
                          ? `${data.os.veiculo.marca ?? ""} ${data.os.veiculo.modelo ?? ""} • ${data.os.veiculo.placa ?? ""}`.trim()
                          : "—"}
                      </div>
                    )}
                  </div>

                  <div className="rounded-lg border p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckSquare className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Status de Aprovação</span>
                    </div>
                    <div className="text-sm">
                      {data.os.statusaprovacao ?? "—"}
                    </div>
                  </div>
                </section>

                {/* Descrição / Observações */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-lg border p-3">
                    <div className="text-sm font-medium mb-2">Descrição</div>
                    <div className="text-sm whitespace-pre-wrap">
                      {data.os.descricao || "—"}
                    </div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="text-sm font-medium mb-2">Observações</div>
                    <div className="text-sm whitespace-pre-wrap">
                      {data.os.observacoes || "—"}
                    </div>
                  </div>
                </section>

                {/* Produtos / Serviços / Totais */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="rounded-lg border p-3">
                    <div className="flex items-center gap-2 mb-2">
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
                          <li key={`${it.ordemservicoid}-${it.produtoid}-${idx}`} className="flex items-center justify-between gap-2">
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

                  <div className="rounded-lg border p-3">
                    <div className="flex items-center gap-2 mb-2">
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
                          <li key={`${it.ordemservicoid}-${it.servicoid}-${idx}`} className="flex items-center justify-between gap-2">
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

                  <div className="lg:col-span-2 rounded-lg border p-3">
                    <div className="text-sm font-medium">Total geral</div>
                    <div className="text-lg font-semibold">{fmtMoney(totalGeral)}</div>
                  </div>
                </section>

                {/* Checklist */}
                <section className="rounded-lg border p-3">
                  <div className="text-sm font-medium mb-2">Checklist</div>
                  {(data.checklist ?? []).length === 0 ? (
                    <div className="text-sm text-muted-foreground">—</div>
                  ) : (
                    <ul className="space-y-2 text-sm">
                      {data.checklist.map((c) => (
                        <li key={c.id} className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="font-medium truncate">{c.item}</div>
                            <div className="text-xs text-muted-foreground">
                              {fmtDate(c.createdat)}
                              {c.observacao ? ` • ${c.observacao}` : ""}
                            </div>
                          </div>
                          <Badge variant="outline">{c.status}</Badge>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                {/* Links de aprovação (AGORA com URL completa) */}
                <section className="rounded-lg border p-3">
                  <div className="text-sm font-medium mb-2">Links de aprovação</div>
                  {(data.aprovacoes ?? []).length === 0 ? (
                    <div className="text-sm text-muted-foreground">—</div>
                  ) : (
                    <ul className="space-y-2 text-sm">
                      {data.aprovacoes!.map((a) => {
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
                                criado: {fmtDate(a.created_at)} • expira: {fmtDate(a.expira_em)} • usado: {fmtDate(a.usado_em)}
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
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
