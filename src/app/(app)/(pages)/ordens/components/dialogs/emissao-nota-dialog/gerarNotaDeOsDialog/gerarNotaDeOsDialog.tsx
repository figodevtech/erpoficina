// ./src/app/(app)/(pages)/ordens/components/dialogs/gerar-nfe-de-os-dialog.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  Loader2,
  Receipt,
  Package,
  Info,
  X,
} from "lucide-react";

type OsProdutoParaNfe = {
  osProdutoId: number;
  produtoId: number;
  descricao: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
  ncm: string | null;
  cfop: string | null;
  codigobarras: string | null;
};

type ListarProdutosOsResponse = {
  ok: boolean;
  message?: string;
  osId?: number;
  itens: OsProdutoParaNfe[];
};

type GerarNfeDeOsResponse = {
  ok: boolean;
  message?: string;
  nfeId?: number;
};

function fmtMoney(v: number | null | undefined) {
  if (v == null || isNaN(Number(v))) return "—";
  return Number(v).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export interface GerarNotaDeOsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  osId: number | null;
  /** Opcional: para o pai poder recarregar a listagem de NF-e depois de gerar o rascunho */
  onAfterGenerate?: (nfeId: number | null) => void;
}

export function GerarNotaDeOsDialog({
  open,
  onOpenChange,
  osId,
  onAfterGenerate,
}: GerarNotaDeOsDialogProps) {
  const [carregandoItens, setCarregandoItens] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [itens, setItens] = useState<OsProdutoParaNfe[] | null>(null);
  const [selecionados, setSelecionados] = useState<number[]>([]);

  const podeBuscar = open && !!osId;

  // Carregar itens da OS para NF-e
  useEffect(() => {
    if (!podeBuscar || !osId) return;

    const ac = new AbortController();

    async function fetchItens() {
      setCarregandoItens(true);
      try {
        const res = await fetch(`/api/ordens/${osId}/produtos-para-nfe`, {
          method: "GET",
          signal: ac.signal,
        });

        if (!res.ok) {
          let msg = `Erro ao buscar produtos da OS (HTTP ${res.status}).`;
          try {
            const j = (await res.json()) as ListarProdutosOsResponse;
            if (j?.message) msg = j.message;
          } catch {
            // ignora erro de parse
          }
          throw new Error(msg);
        }

        const json = (await res.json()) as ListarProdutosOsResponse;

        if (!json.ok) {
          throw new Error(json.message || "Erro ao buscar produtos da OS.");
        }

        if (!ac.signal.aborted) {
          setItens(json.itens ?? []);
          // Por padrão, todos selecionados
          const ids = (json.itens ?? []).map((i) => i.osProdutoId);
          setSelecionados(ids);
        }
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        console.error(e);
        toast.error(e?.message || "Erro ao carregar produtos da OS.");
        if (!ac.signal.aborted) {
          setItens([]);
          setSelecionados([]);
        }
      } finally {
        if (!ac.signal.aborted) {
          setCarregandoItens(false);
        }
      }
    }

    fetchItens();

    return () => {
      ac.abort();
    };
  }, [podeBuscar, osId]);

  // Helpers seleção
  const toggleItem = (id: number, checked: boolean) => {
    setSelecionados((prev) => {
      const set = new Set(prev);
      if (checked) {
        set.add(id);
      } else {
        set.delete(id);
      }
      return Array.from(set);
    });
  };

  const todosSelecionados = useMemo(() => {
    if (!itens || itens.length === 0) return false;
    return selecionados.length === itens.length;
  }, [itens, selecionados]);

  const parcialSelecionado = useMemo(() => {
    if (!itens || itens.length === 0) return false;
    return selecionados.length > 0 && selecionados.length < itens.length;
  }, [itens, selecionados]);

  const toggleSelecionarTodos = (checked: boolean) => {
    if (!itens || itens.length === 0) return;
    if (checked) {
      setSelecionados(itens.map((i) => i.osProdutoId));
    } else {
      setSelecionados([]);
    }
  };

  const resumo = useMemo(() => {
    if (!itens || itens.length === 0) {
      return {
        totalItens: 0,
        totalSelecionados: 0,
        valorSelecionado: 0,
      };
    }

    const selecionadosSet = new Set(selecionados);
    const itensSel = itens.filter((i) => selecionadosSet.has(i.osProdutoId));

    const valorSelecionado = itensSel.reduce(
      (acc, i) => acc + Number(i.subtotal || 0),
      0
    );

    return {
      totalItens: itens.length,
      totalSelecionados: itensSel.length,
      valorSelecionado,
    };
  }, [itens, selecionados]);

  const titulo = useMemo(
    () =>
      osId
        ? `Gerar NF-e a partir da OS #${osId}`
        : "Gerar NF-e a partir da OS",
    [osId]
  );

  async function handleGerarRascunho() {
    if (!osId) return;
    if (!itens || itens.length === 0) {
      toast.error("Nenhum item disponível para gerar NF-e.");
      return;
    }
    if (selecionados.length === 0) {
      toast.error("Selecione pelo menos um item para gerar a NF-e.");
      return;
    }

    try {
      setSalvando(true);

      const res = await fetch(`/api/nfe/de-os/${osId}/gerar-rascunho`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itens: selecionados, // array de osProdutoId
        }),
      });

      const json = (await res.json()) as GerarNfeDeOsResponse;

      if (!res.ok || !json.ok) {
        throw new Error(
          json.message ||
            `Falha ao gerar rascunho da NF-e (HTTP ${res.status}).`
        );
      }

      toast.success("Rascunho de NF-e gerado com sucesso.");

      if (onAfterGenerate) {
        onAfterGenerate(json.nfeId ?? null);
      }

      onOpenChange(false);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Erro ao gerar rascunho da NF-e.");
    } finally {
      setSalvando(false);
    }
  }

  const botaoDesabilitado =
    !osId ||
    !itens ||
    itens.length === 0 ||
    selecionados.length === 0 ||
    salvando;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          w-[95vw] sm:max-w-3xl
          max-h-[85vh] sm:max-h-[85vh] supports-[height:100svh]:max-h-[85svh]
          overflow-y-auto overscroll-contain
          p-0
        "
      >
        {/* Header sticky + botão fechar */}
        <div className="top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b relative">
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2"
              aria-label="Fechar"
              title="Fechar"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>

          <DialogHeader className="px-5 pt-5 pb-3">
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              {titulo}
            </DialogTitle>
            <DialogDescription>
              Selecione os produtos desta OS que serão incluídos na NF-e.
              Neste passo a nota será montada e salva como rascunho, sem envio
              para a SEFAZ.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Conteúdo */}
        <div className="px-5 pb-5 pt-3 space-y-4">
          {!osId && (
            <div className="h-24 grid place-items-center text-sm text-muted-foreground">
              Nenhuma OS selecionada.
            </div>
          )}

          {osId && carregandoItens && (
            <div className="h-32 grid place-items-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {osId && !carregandoItens && itens && itens.length === 0 && (
            <div className="rounded-lg border border-dashed p-4 text-sm flex gap-3">
              <Info className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <div className="font-medium">
                  Nenhum produto vinculado a esta OS
                </div>
                <div className="text-muted-foreground text-xs">
                  Adicione produtos à OS para poder gerar uma NF-e a partir
                  deles.
                </div>
              </div>
            </div>
          )}

          {osId && !carregandoItens && itens && itens.length > 0 && (
            <>
              <section className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">
                      Produtos da OS
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      {resumo.totalItens} itens
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Checkbox
                      checked={
                        todosSelecionados
                          ? true
                          : parcialSelecionado
                          ? "indeterminate"
                          : false
                      }
                      onCheckedChange={(checked) =>
                        toggleSelecionarTodos(!!checked)
                      }
                    />
                    <span>Selecionar todos</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  {itens.map((item) => {
                    const checked = selecionados.includes(item.osProdutoId);
                    return (
                      <div
                        key={item.osProdutoId}
                        className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/40"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(c) =>
                            toggleItem(item.osProdutoId, !!c)
                          }
                          className="mt-1"
                        />

                        <div className="flex-1 min-w-0 space-y-0.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium">
                              {item.descricao || "Produto sem descrição"}
                            </span>
                            {item.ncm && (
                              <Badge variant="outline" className="text-[10px]">
                                NCM {item.ncm}
                              </Badge>
                            )}
                            {item.cfop && (
                              <Badge variant="outline" className="text-[10px]">
                                CFOP {item.cfop}
                              </Badge>
                            )}
                          </div>

                          <div className="text-xs text-muted-foreground flex flex-wrap gap-3">
                            <span>
                              Qtde: <b>{item.quantidade}</b>
                            </span>
                            <span>
                              Vlr. unitário:{" "}
                              <b>{fmtMoney(item.precoUnitario)}</b>
                            </span>
                            <span>
                              Subtotal: <b>{fmtMoney(item.subtotal)}</b>
                            </span>
                            {item.codigobarras && (
                              <span className="break-all">
                                Código de barras:{" "}
                                <span className="font-mono text-[11px]">
                                  {item.codigobarras}
                                </span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Resumo + Botão de ação */}
              <section className="rounded-lg border p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>
                    Itens selecionados:{" "}
                    <b>
                      {resumo.totalSelecionados} de {resumo.totalItens}
                    </b>
                  </div>
                  <div>
                    Total selecionado para NF-e:{" "}
                    <b>{fmtMoney(resumo.valorSelecionado)}</b>
                  </div>
                  <div className="text-[11px]">
                    A NF-e será criada em status <b>RASCUNHO</b>, permitindo
                    revisão antes de enviar para a SEFAZ.
                  </div>
                </div>

                <Button
                  className="mt-3 sm:mt-0"
                  disabled={botaoDesabilitado}
                  onClick={handleGerarRascunho}
                >
                  {salvando && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Gerar rascunho de NF-e
                </Button>
              </section>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
