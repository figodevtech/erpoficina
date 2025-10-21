// src/app/(app)/(pages)/ordens/components/orcamento/orcamento-form.tsx
"use client";

import React, { forwardRef, useEffect, useImperativeHandle } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ClipboardList, ShoppingCart, Wrench } from "lucide-react";
import { toast } from "sonner";

import { OrcamentoFormHandle, OrcamentoFormProps } from "./tipos";
import { useCarrinhoOrcamento } from "./ganchos/use-carrinho-orcamento";
import { salvarOrcamentoAPI } from "./servicos/api-orcamento";

import { TabelaItensProduto } from "./components/tabela-itens-produto";
import { TabelaItensServico } from "./components/tabela-tens-servico";
import { SelecaoItensTabs } from "./components/selecao-itens-tabs";

const money = (n: number | string | null | undefined) =>
  (typeof n === "number" ? n : Number(n ?? 0)).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const OrcamentoForm = forwardRef<OrcamentoFormHandle, OrcamentoFormProps>(function OrcamentoForm(
  { ordemServico, onTotaisChange },
  ref
) {
  const osId = ordemServico?.id;

  const {
    itensProduto,
    itensServico,
    totalProdutos,
    totalServicos,
    carregarItensDaOS,
    adicionarProduto,
    adicionarServico,
    atualizarProduto,
    atualizarServico,
    removerProduto,
    removerServico,
  } = useCarrinhoOrcamento(osId, onTotaisChange);

  useEffect(() => {
    if (!osId) return;
    (async () => {
      try {
        await carregarItensDaOS();
      } catch (e: any) {
        console.error(e);
        toast.error(e?.message ?? "Falha ao carregar orçamento");
      }
    })();
  }, [osId, carregarItensDaOS]);

  async function salvarOrcamento() {
    if (!osId) return;
    try {
      await salvarOrcamentoAPI(osId, itensProduto, itensServico);
      toast.success("Orçamento salvo com sucesso");
      window.dispatchEvent(new Event("os:refresh"));
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao salvar orçamento");
    }
  }

  useImperativeHandle(ref, () => ({ salvarOrcamento }), [salvarOrcamento]);

  return (
    <div className="space-y-6">
      {/* CAPA */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            <CardTitle className="text-base sm:text-lg">Orçamento • OS {ordemServico?.numero ?? osId ?? "—"}</CardTitle>
          </div>
          <CardDescription className="text-sm">
            {[ordemServico?.cliente, ordemServico?.veiculo].filter(Boolean).join(" • ") || "—"}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* BUSCAR ITENS */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            <CardTitle className="text-base sm:text-lg">Adicionar itens</CardTitle>
          </div>
          <CardDescription>Pesquise e inclua produtos e serviços no orçamento.</CardDescription>
        </CardHeader>
        <CardContent>
          <SelecaoItensTabs
            onAdicionarProduto={adicionarProduto}
            onAdicionarServico={adicionarServico}
            abaInicial="produtos"
          />
        </CardContent>
      </Card>

      {/* ITENS ADICIONADOS */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-primary" />
            <CardTitle className="text-base sm:text-lg">Itens do orçamento</CardTitle>
          </div>
          <CardDescription>Use os botões para ajustar quantidade. Preço é fixo.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <TabelaItensProduto
            itens={itensProduto}
            onAtualizar={atualizarProduto}
            onRemover={(i) => {
              removerProduto(i);
              toast.success("Produto removido");
            }}
          />

          <Separator />

          <TabelaItensServico
            itens={itensServico}
            onAtualizar={atualizarServico}
            onRemover={(i) => {
              removerServico(i);
              toast.success("Serviço removido");
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
});

export default OrcamentoForm;
