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
  PackageSearch,
} from "lucide-react";
import { ProductDialog } from "@/app/(app)/(pages)/estoque/components/productDialog/productDialog";

type OsProdutoParaNfeBase = {
  titulo: string;
  osProdutoId: number;
  produtoId: number;
  descricao: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
  ncm: string | null;
  cfop: string | null;
  codigobarras: string | null;

  // campos fiscais que precisamos para validação de NF-e
  csosn?: string | null;
  cst?: string | null;
  cest?: string | null;
  aliquotaicms?: string | number | null;

  // opcionais (não obrigatórios para emitir NF-e)
  cst_pis?: string | null;
  aliquota_pis?: string | number | null;
  cst_cofins?: string | null;
  aliquota_cofins?: string | number | null;
};

type OsProdutoParaNfe = OsProdutoParaNfeBase & {
  podeEmitirNfe: boolean;
  errosNfe: string[];
};

type ListarProdutosOsResponse = {
  ok: boolean;
  message?: string;
  osId?: number;
  itens: OsProdutoParaNfeBase[];
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

function onlyDigits(v: string | null | undefined) {
  return (v ?? "").replace(/\D/g, "");
}

/**
 * Campos obrigatórios para permitir emissão de NF-e:
 *  - NCM (8 dígitos numéricos)
 *  - CFOP (4 dígitos numéricos)
 *  - CSOSN preenchido
 *  - CST preenchido
 *  - CEST preenchido (pode validar tamanho se quiser)
 *  - aliquotaicms preenchida
 *
 * PIS/COFINS ficam opcionais.
 */
function validarProdutoParaNfe(item: OsProdutoParaNfeBase): {
  ok: boolean;
  erros: string[];
} {
  const erros: string[] = [];

  // NCM
  const ncm = onlyDigits(item.ncm);
  if (!ncm) {
    erros.push("NCM não informado");
  } else if (ncm.length !== 8) {
    erros.push("NCM deve ter 8 dígitos numéricos");
  }

  // CFOP
  const cfop = onlyDigits(item.cfop);
  if (!cfop) {
    erros.push("CFOP não informado");
  } else if (cfop.length !== 4) {
    erros.push("CFOP deve ter 4 dígitos numéricos");
  }

  // CSOSN
  const csosn = (item.csosn ?? "").trim();
  if (!csosn || csosn === "Selecione") {
    erros.push("CSOSN não informado");
  }

  // CST
  const cst = (item.cst ?? "").trim();
  if (!cst || cst === "Selecione") {
    erros.push("CST não informado");
  }

  // CEST
  const cest = onlyDigits(item.cest);
  if (!cest) {
    erros.push("CEST não informado");
  }
  // se quiser validar tamanho:
  // else if (cest.length !== 7) {
  //   erros.push("CEST deve ter 7 dígitos numéricos");
  // }

  // Alíquota ICMS
  const aliqIcmsStr = String(item.aliquotaicms ?? "").trim();
  if (!aliqIcmsStr) {
    erros.push("Alíquota de ICMS não informada");
  }

  return {
    ok: erros.length === 0,
    erros,
  };
}

export interface GerarNotaDeOsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  osId: number | null;
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

  async function fetchItensOs(signal?: AbortSignal) {
    if (!osId) return;

    setCarregandoItens(true);
    try {
      const res = await fetch(`/api/ordens/${osId}/produtos-para-nfe`, {
        method: "GET",
        signal,
      });

      const json = (await res.json().catch(() => null)) as
        | ListarProdutosOsResponse
        | null;

      if (!res.ok || !json?.ok) {
        const msg =
          json?.message || `Erro ao buscar produtos da OS (HTTP ${res.status}).`;
        toast.error(msg);
        setItens([]);
        setSelecionados([]);
        return;
      }

      const listaBase = json.itens ?? [];

      const listaComValidacao: OsProdutoParaNfe[] = listaBase.map((item) => {
        const { ok, erros } = validarProdutoParaNfe(item);
        return {
          ...item,
          podeEmitirNfe: ok,
          errosNfe: erros,
        };
      });

      setItens(listaComValidacao);

      const idsValidos = listaComValidacao
        .filter((i) => i.podeEmitirNfe)
        .map((i) => i.produtoId);
      setSelecionados(idsValidos);
    } catch (e: any) {
      if (e?.name === "AbortError") return;
      console.log(e);
      toast.error(e?.message || "Erro ao carregar produtos da OS.");
      setItens([]);
      setSelecionados([]);
    } finally {
      setCarregandoItens(false);
    }
  }

  useEffect(() => {
    if (!podeBuscar || !osId) return;

    const ac = new AbortController();
    fetchItensOs(ac.signal);

    return () => {
      ac.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [podeBuscar, osId]);

  const toggleItem = (produtoId: number, checked: boolean) => {
    setSelecionados((prev) => {
      const set = new Set(prev);
      if (checked) set.add(produtoId);
      else set.delete(produtoId);
      return Array.from(set);
    });
  };

  const totalItens = itens?.length ?? 0;
  const totalItensValidos = itens?.filter((i) => i.podeEmitirNfe).length ?? 0;

  const todosSelecionados = useMemo(() => {
    if (!itens || itens.length === 0) return false;
    const idsValidos = itens
      .filter((i) => i.podeEmitirNfe)
      .map((i) => i.produtoId);
    if (idsValidos.length === 0) return false;
    return idsValidos.every((id) => selecionados.includes(id));
  }, [itens, selecionados]);

  const parcialSelecionado = useMemo(() => {
    if (!itens || itens.length === 0) return false;
    const idsValidos = itens
      .filter((i) => i.podeEmitirNfe)
      .map((i) => i.produtoId);
    const qtdeSelecionadosValidos = idsValidos.filter((id) =>
      selecionados.includes(id)
    ).length;
    return (
      qtdeSelecionadosValidos > 0 && qtdeSelecionadosValidos < idsValidos.length
    );
  }, [itens, selecionados]);

  const toggleSelecionarTodos = (checked: boolean) => {
    if (!itens || itens.length === 0) return;
    if (checked) {
      setSelecionados(
        itens.filter((i) => i.podeEmitirNfe).map((i) => i.produtoId)
      );
    } else {
      setSelecionados([]);
    }
  };

  const resumo = useMemo(() => {
    if (!itens || itens.length === 0) {
      return {
        totalItens: 0,
        totalValidos: 0,
        totalSelecionados: 0,
        valorSelecionado: 0,
      };
    }

    const selecionadosSet = new Set(selecionados);
    const itensSelecionados = itens.filter((i) =>
      selecionadosSet.has(i.produtoId)
    );

    const valorSelecionado = itensSelecionados.reduce(
      (acc, i) => acc + Number(i.subtotal || 0),
      0
    );

    return {
      totalItens: itens.length,
      totalValidos: itens.filter((i) => i.podeEmitirNfe).length,
      totalSelecionados: itensSelecionados.length,
      valorSelecionado,
    };
  }, [itens, selecionados]);

  const titulo = useMemo(
    () =>
      osId ? `Gerar NF-e a partir da OS #${osId}` : "Gerar NF-e a partir da OS",
    [osId]
  );

  async function handleGerarRascunho() {
    if (!osId) return;
    if (!itens || itens.length === 0) {
      toast.error("Nenhum item disponível para gerar NF-e.");
      return;
    }
    if (selecionados.length === 0) {
      toast.error("Selecione pelo menos um item válido para gerar a NF-e.");
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
          itens: selecionados,
        }),
      });

      const json = (await res.json().catch(() => null)) as
        | GerarNfeDeOsResponse
        | null;

      if (!res.ok || !json?.ok) {
        toast.error(json?.message || "Falha ao gerar rascunho da NF-e.");
        return;
      }

      toast.success("Rascunho de NF-e gerado com sucesso.");

      if (onAfterGenerate) {
        onAfterGenerate(json.nfeId ?? null);
      }

      onOpenChange(false);
    } catch (e: any) {
      console.log(e);
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
              Selecione os produtos desta OS que serão incluídos na NF-e. Neste
              passo a nota será montada e salva como rascunho, sem envio para a
              SEFAZ.
            </DialogDescription>
          </DialogHeader>
        </div>

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
                    <span className="text-sm font-medium">Produtos da OS</span>
                    <Badge variant="outline" className="text-[10px]">
                      {totalItens} itens
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {totalItensValidos} aptos p/ NF-e
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
                    <span>Selecionar todos (apenas itens válidos)</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  {itens.map((item) => {
                    const checked = selecionados.includes(item.produtoId);

                    return (
                      <div
                        key={item.osProdutoId}
                        className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/40"
                      >
                        <Checkbox
                          checked={checked}
                          disabled={!item.podeEmitirNfe}
                          onCheckedChange={(c) =>
                            item.podeEmitirNfe &&
                            toggleItem(item.produtoId, !!c)
                          }
                          className="mt-1"
                        />

                        <div className="flex-1 min-w-0 space-y-0.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium">
                              {item.titulo}
                              {/* {item.descricao ? ` — ${item.descricao}` : ""} */}
                            </span>

                            {!item.descricao && (
                              <span className="text-xs text-muted-foreground">
                                Produto sem descrição
                              </span>
                            )}

                            {/* 👉 Aqui passamos o callback para recarregar a lista após salvar o produto */}
                            <ProductDialog
                              productId={item.produtoId}
                              onAfterSaveProduct={() => {
                                // Recarrega itens da OS e revalida campos fiscais
                                fetchItensOs();
                              }}
                            >
                              <div className="p-1 rounded-full bg-primary/50 hover:bg-primary/90 transition-all hover:cursor-pointer">
                                <PackageSearch className="w-2.5 h-2.5 " />
                              </div>
                            </ProductDialog>

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
                            {item.csosn && (
                              <Badge variant="outline" className="text-[10px]">
                                CSOSN {item.csosn}
                              </Badge>
                            )}
                            {item.cst && (
                              <Badge variant="outline" className="text-[10px]">
                                CST {item.cst}
                              </Badge>
                            )}
                            {item.cest && (
                              <Badge variant="outline" className="text-[10px]">
                                CEST {item.cest}
                              </Badge>
                            )}
                            {item.aliquotaicms && (
                              <Badge variant="outline" className="text-[10px]">
                                ALÍQUOTA ICMS {item.aliquotaicms}%
                              </Badge>
                            )}
                            {item.cst_pis && (
                              <Badge variant="outline" className="text-[10px]">
                                CST PIS {item.cst_pis}
                              </Badge>
                            )}
                            {item.aliquota_pis && (
                              <Badge variant="outline" className="text-[10px]">
                                ALÍQUOTA PIS {item.aliquota_pis}%
                              </Badge>
                            )}
                            {item.cst_cofins && (
                              <Badge variant="outline" className="text-[10px]">
                                CST COFINS {item.cst_cofins}
                              </Badge>
                            )}
                            {item.aliquota_cofins && (
                              <Badge variant="outline" className="text-[10px]">
                                ALÍQUOTA COFINS {item.aliquota_cofins}%
                              </Badge>
                            )}

                            

                            {!item.podeEmitirNfe && (
                              <Badge
                                variant="destructive"
                                className="text-[10px]"
                              >
                                Cadastro fiscal incompleto p/ NF-e
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

                          {!item.podeEmitirNfe && item.errosNfe.length > 0 && (
                            <div className="text-[11px] text-red-500 mt-1">
                              Não é possível emitir NF-e deste produto.{" "}
                              {item.errosNfe.join(" • ")}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-lg border p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>
                    Itens selecionados para NF-e:{" "}
                    <b>
                      {resumo.totalSelecionados} de {resumo.totalValidos} itens
                      aptos
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
