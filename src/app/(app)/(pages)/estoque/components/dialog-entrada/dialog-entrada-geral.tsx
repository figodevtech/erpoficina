"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Plus, Truck, PackagePlus, Search, X } from "lucide-react";
import FornecedorSelect from "@/app/(app)/components/fornecedorSelect";
import { Fornecedor } from "../../types";

// Ajuste o import depois
// import { Entrada_tipo } from "@/app/(app)/types";
export enum Entrada_tipo {
  COMPRA_FORNECEDOR = "COMPRA FORNECEDOR",
  COMPRA_PF = "COMPRA PF",
  DEVOLUCAO = "DEVOLUÇÃO",
}

type EntradaTipoKey = keyof typeof Entrada_tipo;

type Produto = {
  id: number;
  titulo: string;
  descricao?: string | null;
  precovenda: number;

  ncm?: string | null;
  unidade?: string | null; // unidade_medida
  csosn?: string | null;
  cfop?: string | null;
  cest?: string | null;

  cst?: string | null;
  aliquotaicms?: number | null;

  cst_pis?: string | null;
  aliquota_pis?: number | null;

  cst_cofins?: string | null;
  aliquota_cofins?: number | null;
};

type EntradaItemForm = {
  // principais
  produto_id: number;
  descricao: string | null;

  ncm: string | null;
  csosn: string | null;
  cfop: string | null;
  cest: string | null;
  unidade: string | null;

  quantidade: number;
  valor_unitario: number;
  valor_desconto: number;
  valor_total: number;
  valor_total_manual: boolean;

  // icms
  cst: string | null;
  aliquotaicms: number | null;
  valor_bc_icms: number | null;
  valor_icms: number | null;

  // pis/cofins
  cst_pis: string | null;
  aliquota_pis: number | null;
  valor_pis: number | null;

  cst_cofins: string | null;
  aliquota_cofins: number | null;
  valor_cofins: number | null;
};

type FornecedorStub = { id: number; nome: string };

function n(v: unknown, fallback = 0) {
  const x = typeof v === "number" ? v : Number(v);
  return Number.isFinite(x) ? x : fallback;
}

function recalcTotal(item: EntradaItemForm) {
  const total =
    n(item.quantidade) * n(item.valor_unitario) - n(item.valor_desconto);
  return Math.max(total, 0);
}

function criarItemDeProduto(produto: Produto): EntradaItemForm {
  const quantidade = 1;
  const valor_unitario = n(produto.precovenda, 0);
  const valor_desconto = 0;

  return {
    produto_id: produto.id,
    descricao: produto.titulo ?? produto.descricao ?? null,

    ncm: produto.ncm ?? null,
    csosn: produto.csosn ?? null,
    cfop: produto.cfop ?? null,
    cest: produto.cest ?? null,
    unidade: produto.unidade ?? null,

    quantidade,
    valor_unitario,
    valor_desconto,
    valor_total: Math.max(quantidade * valor_unitario - valor_desconto, 0),
    valor_total_manual: false,

    cst: produto.cst ?? null,
    aliquotaicms: produto.aliquotaicms ?? null,
    valor_bc_icms: null,
    valor_icms: null,

    cst_pis: produto.cst_pis ?? null,
    aliquota_pis: produto.aliquota_pis ?? null,
    valor_pis: null,

    cst_cofins: produto.cst_cofins ?? null,
    aliquota_cofins: produto.aliquota_cofins ?? null,
    valor_cofins: null,
  };
}

interface DialogCriarEntradaProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (v: boolean) => void;

  // stubs — você vai ligar no seu seletor
  fornecedorSelecionado?: FornecedorStub | null;

  /**
   * Se você passar isso, o botão "Selecionar fornecedor/produto" chamará esses callbacks.
   * Caso não passe, ele adiciona um produto mock só pra você ver a lista funcionando.
   */
  onRequestSelectFornecedor?: () => void;
  onRequestSelectProduto?: () => void;

  // Se você quiser, pode chamar isso ao clicar em "Concluir"
  onConcluir?: (payload: {
    tipo: EntradaTipoKey;
    fornecedorId: number | null;
    itens: EntradaItemForm[];
  }) => void;
}

export function DialogEntradaGeral({
  children,
  open,
  onOpenChange,
  onRequestSelectFornecedor,
  onRequestSelectProduto,
  onConcluir,
}: DialogCriarEntradaProps) {
  const [tipo, setTipo] = useState<EntradaTipoKey>("COMPRA_FORNECEDOR");
  const [itens, setItens] = useState<EntradaItemForm[]>([]);
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState<
    Fornecedor | undefined
  >(undefined);
  const [openFornecedor, setOpenFornecedor] = useState(false);
  const totalGeral = useMemo(
    () => itens.reduce((acc, it) => acc + n(it.valor_total), 0),
    [itens],
  );

  const handleAdicionarProduto = (produto: Produto) => {
    setItens((prev) => {
      const idx = prev.findIndex((i) => i.produto_id === produto.id);
      if (idx >= 0) {
        const copy = [...prev];
        const item = { ...copy[idx] };
        item.quantidade = n(item.quantidade) + 1;

        if (!item.valor_total_manual) {
          item.valor_total = recalcTotal(item);
        }

        copy[idx] = item;
        return copy;
      }
      return [...prev, criarItemDeProduto(produto)];
    });
  };

  // MOCK (somente para visualizar a lista)
  const addMockProduct = () => {
    const mock: Produto = {
      id: Math.floor(Math.random() * 100000),
      titulo: "Produto Exemplo",
      precovenda: 10,
      ncm: "00000000",
      unidade: "UN",
      csosn: "102",
      cfop: "1102",
      cest: null,
      cst: null,
      aliquotaicms: null,
      cst_pis: null,
      aliquota_pis: null,
      cst_cofins: null,
      aliquota_cofins: null,
    };
    handleAdicionarProduto(mock);
  };

  const updateItem = <K extends keyof EntradaItemForm>(
    index: number,
    key: K,
    value: EntradaItemForm[K],
  ) => {
    setItens((prev) => {
      const copy = [...prev];
      const item = { ...copy[index], [key]: value } as EntradaItemForm;

      // Se mexeu nos campos que compõem o total, recalcula (a menos que total esteja manual)
      if (
        !item.valor_total_manual &&
        (key === "quantidade" ||
          key === "valor_unitario" ||
          key === "valor_desconto")
      ) {
        item.valor_total = recalcTotal(item);
      }

      copy[index] = item;
      return copy;
    });
  };

  const handleRemove = (index: number) => {
    setItens((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConcluir = () => {
    onConcluir?.({
      tipo,
      fornecedorId: fornecedorSelecionado?.id ?? null,
      itens,
    });
  };

  const tipoOptions: Array<{ value: EntradaTipoKey; label: string }> = [
    { value: "COMPRA_FORNECEDOR", label: Entrada_tipo.COMPRA_FORNECEDOR },
    { value: "COMPRA_PF", label: Entrada_tipo.COMPRA_PF },
    { value: "DEVOLUCAO", label: Entrada_tipo.DEVOLUCAO },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="h-svh min-w-screen p-0 overflow-hidden sm:max-w-[1100px] sm:max-h-[850px] sm:w-[95vw] sm:min-w-0">
        <div className="flex h-full min-h-0 flex-col">
          <DialogHeader className="shrink-0 px-6 py-4 border-b-1">
            <DialogTitle>Criar entrada</DialogTitle>
            <DialogDescription>
              Monte a entrada com fornecedor e itens. Depois, conclua.
            </DialogDescription>
          </DialogHeader>

          <FornecedorSelect
            OnSelect={(f) => {
              setFornecedorSelecionado(f);
              setOpenFornecedor(false);
            }}
            open={openFornecedor}
            setOpen={setOpenFornecedor}
          />

          {/* Conteúdo */}
          <div className="h-full min-h-0 overflow-auto dark:bg-muted-foreground/5 px-6 py-10 space-y-2">
            {/* Lado esquerdo: dados da entrada */}
            <div className="lg:col-span-2 border-b lg:border-b-0 lg:border-r p-6 space-y-4">
              <div className="space-y-2">
                <Label>Tipo da entrada</Label>
                <Select
                  value={tipo}
                  onValueChange={(v) => setTipo(v as EntradaTipoKey)}
                >
                  <SelectTrigger className="w-50">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tipoOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Fornecedor</Label>

                <div className="flex items-center gap-2">
                  {/* <Button
                    type="button"
                    variant="outline"
                    className="gap-2"
                    onClick={() => {
                      // Você vai plugar seu seletor aqui
                      if (onRequestSelectFornecedor) return onRequestSelectFornecedor();
                    }}
                  >
                    <Truck className="h-4 w-4" />
                    Selecionar fornecedor
                  </Button> */}

                  <div className="text-sm text-muted-foreground truncate">
                    {fornecedorSelecionado ? (
                        <div className="flex flex-row items-center gap-2">

                      <div className="px-2 py-1 rounded-xl bg-muted">
                        <span className="font-medium text-yellow-600">
                          #{fornecedorSelecionado.id}
                        </span>{" "}
                        <span className="text-primary">{fornecedorSelecionado?.nomerazaosocial}</span>
                      </div>
                        <div
                        onClick={()=>setFornecedorSelecionado(undefined)}
                        className="rounded-full p-1.5 bg-muted hover:cursor-pointer">
                            <X className="text-red-500 w-3 h-3"/>
                        </div>
                        </div>
                    ) : (
                      <div className="flex felx-row items-center gap-2">
                        <span>Nenhum fornecedor selecionado</span>
                        <div
                          onClick={() => setOpenFornecedor(true)}
                          className="group p-1.5 rounded-full bg-muted/50 hover:bg-muted transition-all hover:cursor-pointer"
                        >
                          <Search className="w-3 h-3 text-primary/80 group-hover:text-primary transition-all" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Produtos</Label>

                <div className="flex items-center gap-2">
                  <Button
                  variant={"outline"}
                    type="button"
                    size={"sm"}
                    className="gap-2 text-xs hover:cursor-pointer"
                    onClick={() => {
                      // Você vai plugar seu seletor aqui
                      if (onRequestSelectProduto)
                        return onRequestSelectProduto();

                      // Exemplo visual: se você não passar callback, adiciona um item mock só pra ver a lista funcionando
                      addMockProduct();
                    }}
                  >
                    <Search className="h-3 w-3" />
                    Adicionar produto
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    className="gap-2 text-xs hover:cursor-pointer"
                    size={"sm"}
                    onClick={() => setItens([])}
                    disabled={itens.length === 0}
                  >
                    Limpar lista
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground">
                  Ao integrar seu seletor, chame{" "}
                  <span className="font-mono">
                    handleAdicionarProduto(produto)
                  </span>{" "}
                  (ou replique a lógica) para inserir o item na lista.
                </p>
              </div>

              <Separator />

              <div className="rounded-lg border p-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Itens</span>
                  <span className="font-medium">{itens.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-semibold">{totalGeral.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Lado direito: lista interativa de itens */}
            <div className="lg:col-span-3 p-6 min-h-0">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold">Itens da entrada</h3>
                  <p className="text-xs text-muted-foreground">
                    Edite todos os campos do item e remova quando quiser.
                  </p>
                </div>
              </div>

              <ScrollArea className="h-full pr-2">
                <div className="space-y-4">
                  {itens.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                      Nenhum produto adicionado ainda.
                    </div>
                  ) : (
                    itens.map((item, index) => (
                      <div
                        key={`${item.produto_id}-${index}`}
                        className="rounded-xl border p-4 space-y-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-sm font-semibold truncate">
                              Produto #{item.produto_id} —{" "}
                              {item.descricao ?? "Sem descrição"}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              NCM: {item.ncm ?? "-"} • CFOP: {item.cfop ?? "-"}{" "}
                              • CSOSN: {item.csosn ?? "-"} • Unidade:{" "}
                              {item.unidade ?? "-"}
                            </div>
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            className="text-destructive hover:text-destructive gap-2"
                            onClick={() => handleRemove(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Remover
                          </Button>
                        </div>

                        <Separator />

                        {/* Grid de edição */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label>Descrição</Label>
                            <Input
                              value={item.descricao ?? ""}
                              onChange={(e) =>
                                updateItem(
                                  index,
                                  "descricao",
                                  e.target.value || null,
                                )
                              }
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label>Unidade</Label>
                            <Input
                              value={item.unidade ?? ""}
                              onChange={(e) =>
                                updateItem(
                                  index,
                                  "unidade",
                                  e.target.value || null,
                                )
                              }
                              placeholder="UN, CX..."
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label>NCM</Label>
                            <Input
                              value={item.ncm ?? ""}
                              onChange={(e) =>
                                updateItem(index, "ncm", e.target.value || null)
                              }
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label>CEST</Label>
                            <Input
                              value={item.cest ?? ""}
                              onChange={(e) =>
                                updateItem(
                                  index,
                                  "cest",
                                  e.target.value || null,
                                )
                              }
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label>CSOSN</Label>
                            <Input
                              value={item.csosn ?? ""}
                              onChange={(e) =>
                                updateItem(
                                  index,
                                  "csosn",
                                  e.target.value || null,
                                )
                              }
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label>CFOP</Label>
                            <Input
                              value={item.cfop ?? ""}
                              onChange={(e) =>
                                updateItem(
                                  index,
                                  "cfop",
                                  e.target.value || null,
                                )
                              }
                            />
                          </div>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <div className="space-y-1.5">
                            <Label>Quantidade</Label>
                            <Input
                              type="number"
                              min={0}
                              step={1}
                              value={item.quantidade}
                              onChange={(e) =>
                                updateItem(
                                  index,
                                  "quantidade",
                                  n(e.target.value),
                                )
                              }
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label>Valor unitário</Label>
                            <Input
                              type="number"
                              min={0}
                              step={0.01}
                              value={item.valor_unitario}
                              onChange={(e) =>
                                updateItem(
                                  index,
                                  "valor_unitario",
                                  n(e.target.value),
                                )
                              }
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label>Desconto</Label>
                            <Input
                              type="number"
                              min={0}
                              step={0.01}
                              value={item.valor_desconto}
                              onChange={(e) =>
                                updateItem(
                                  index,
                                  "valor_desconto",
                                  n(e.target.value),
                                )
                              }
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label>Total</Label>
                            <div className="flex gap-2">
                              <Input
                                type="number"
                                min={0}
                                step={0.01}
                                value={item.valor_total}
                                onChange={(e) => {
                                  updateItem(
                                    index,
                                    "valor_total",
                                    n(e.target.value),
                                  );
                                  updateItem(index, "valor_total_manual", true);
                                }}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                className="gap-2"
                                onClick={() => {
                                  // volta para cálculo automático
                                  setItens((prev) => {
                                    const copy = [...prev];
                                    const it = { ...copy[index] };
                                    it.valor_total_manual = false;
                                    it.valor_total = recalcTotal(it);
                                    copy[index] = it;
                                    return copy;
                                  });
                                }}
                              >
                                <Plus className="h-4 w-4" />
                                Auto
                              </Button>
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                              Se você editar manualmente, o total fica travado.
                              Use “Auto” pra recalcular.
                            </p>
                          </div>
                        </div>

                        <Separator />

                        {/* Tributos (todos editáveis) */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="space-y-1.5">
                            <Label>CST</Label>
                            <Input
                              value={item.cst ?? ""}
                              onChange={(e) =>
                                updateItem(index, "cst", e.target.value || null)
                              }
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label>Alíquota ICMS</Label>
                            <Input
                              type="number"
                              step={0.01}
                              value={item.aliquotaicms ?? ""}
                              onChange={(e) =>
                                updateItem(
                                  index,
                                  "aliquotaicms",
                                  e.target.value === ""
                                    ? null
                                    : n(e.target.value),
                                )
                              }
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label>Base ICMS</Label>
                            <Input
                              type="number"
                              step={0.01}
                              value={item.valor_bc_icms ?? ""}
                              onChange={(e) =>
                                updateItem(
                                  index,
                                  "valor_bc_icms",
                                  e.target.value === ""
                                    ? null
                                    : n(e.target.value),
                                )
                              }
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label>Valor ICMS</Label>
                            <Input
                              type="number"
                              step={0.01}
                              value={item.valor_icms ?? ""}
                              onChange={(e) =>
                                updateItem(
                                  index,
                                  "valor_icms",
                                  e.target.value === ""
                                    ? null
                                    : n(e.target.value),
                                )
                              }
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label>CST PIS</Label>
                            <Input
                              value={item.cst_pis ?? ""}
                              onChange={(e) =>
                                updateItem(
                                  index,
                                  "cst_pis",
                                  e.target.value || null,
                                )
                              }
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label>Alíquota PIS</Label>
                            <Input
                              type="number"
                              step={0.01}
                              value={item.aliquota_pis ?? ""}
                              onChange={(e) =>
                                updateItem(
                                  index,
                                  "aliquota_pis",
                                  e.target.value === ""
                                    ? null
                                    : n(e.target.value),
                                )
                              }
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label>Valor PIS</Label>
                            <Input
                              type="number"
                              step={0.01}
                              value={item.valor_pis ?? ""}
                              onChange={(e) =>
                                updateItem(
                                  index,
                                  "valor_pis",
                                  e.target.value === ""
                                    ? null
                                    : n(e.target.value),
                                )
                              }
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label>CST COFINS</Label>
                            <Input
                              value={item.cst_cofins ?? ""}
                              onChange={(e) =>
                                updateItem(
                                  index,
                                  "cst_cofins",
                                  e.target.value || null,
                                )
                              }
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label>Alíquota COFINS</Label>
                            <Input
                              type="number"
                              step={0.01}
                              value={item.aliquota_cofins ?? ""}
                              onChange={(e) =>
                                updateItem(
                                  index,
                                  "aliquota_cofins",
                                  e.target.value === ""
                                    ? null
                                    : n(e.target.value),
                                )
                              }
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label>Valor COFINS</Label>
                            <Input
                              type="number"
                              step={0.01}
                              value={item.valor_cofins ?? ""}
                              onChange={(e) =>
                                updateItem(
                                  index,
                                  "valor_cofins",
                                  e.target.value === ""
                                    ? null
                                    : n(e.target.value),
                                )
                              }
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between w-full">
              <div className="text-sm">
                <span className="text-muted-foreground">
                  Total da entrada:{" "}
                </span>
                <span className="font-semibold">{totalGeral.toFixed(2)}</span>
              </div>

              <div className="flex gap-3 justify-end">
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </DialogClose>

                <Button
                  type="button"
                  onClick={handleConcluir}
                  disabled={itens.length === 0}
                  className="min-w-[170px]"
                >
                  Concluir entrada
                </Button>
              </div>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
