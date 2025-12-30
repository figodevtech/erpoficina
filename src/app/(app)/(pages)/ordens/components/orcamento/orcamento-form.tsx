// src/app/(app)/(pages)/ordens/components/orcamento/orcamento-form.tsx
"use client";

import React, { forwardRef, useEffect, useImperativeHandle, useState, useCallback } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Plus, Wrench } from "lucide-react";
import { toast } from "sonner";

import { OrcamentoFormHandle, OrcamentoFormProps, ProdutoBusca, ServicoBusca } from "./tipos";

import { useCarrinhoOrcamento } from "./ganchos/use-carrinho-orcamento";
import { salvarOrcamentoAPI, EstoqueInsuficienteError } from "./servicos/api-orcamento";

import { TabelaItensProduto } from "./components/tabela-itens-produto";
import { TabelaItensServico } from "./components/tabela-tens-servico";
import ProductSelect from "@/app/(app)/components/productSelect";
import ServiceSelect from "@/app/(app)/components/serviceSelect";
import { Button } from "@/components/ui/button";

export const OrcamentoForm = forwardRef<OrcamentoFormHandle, OrcamentoFormProps>(function OrcamentoForm(
  { ordemServico, onTotaisChange, onLoadingChange },
  ref
) {
  const osId = ordemServico?.id;

  const {
    itensProduto,
    itensServico,
    carregarItensDaOS,
    adicionarProduto,
    adicionarServico,
    atualizarProduto,
    atualizarServico,
    removerProduto,
    removerServico,
  } = useCarrinhoOrcamento(osId, onTotaisChange);

  // Gate de render: só mostra o Card quando carregou os dados
  const [ready, setReady] = useState(false);

  // mapa: produtoid -> {disponivel, solicitado}
  const [errosEstoque, setErrosEstoque] = useState<Record<number, { disponivel: number; solicitado: number }>>({});

  const [isProductSelectOpen, setIsProductSelectOpen] = useState(false);
  const [isServiceSelectOpen, setIsServiceSelectOpen] = useState(false);

  useEffect(() => {
    if (!osId) {
      setReady(false);
      return;
    }

    let alive = true;

    (async () => {
      onLoadingChange?.(true);
      setReady(false);

      try {
        await carregarItensDaOS();
        if (!alive) return;

        setErrosEstoque({});
        setReady(true);
      } catch (e: any) {
        if (!alive) return;
        console.error(e);
        toast.error(e?.message ?? "Falha ao carregar orçamento");
        // Mantém ready=false para não renderizar o Card “vazio” por trás.
        setReady(false);
      } finally {
        if (alive) onLoadingChange?.(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [osId, carregarItensDaOS, onLoadingChange]);

  const salvarOrcamento = useCallback(async () => {
    if (!osId) {
      const err = new Error("OS inválida para salvar orçamento");
      toast.error(err.message);
      throw err;
    }

    try {
      setErrosEstoque({});
      await salvarOrcamentoAPI(osId, itensProduto, itensServico);
      toast.success("Orçamento salvo com sucesso");
      window.dispatchEvent(new Event("os:refresh"));
    } catch (e: any) {
      if (e instanceof EstoqueInsuficienteError || e?.name === "EstoqueInsuficienteError") {
        const faltas = (e.faltas ?? []) as Array<{
          produtoid: number;
          disponivel: number;
          solicitado: number;
        }>;

        const map: Record<number, { disponivel: number; solicitado: number }> = {};
        for (const f of faltas) {
          map[f.produtoid] = {
            disponivel: f.disponivel,
            solicitado: f.solicitado,
          };
        }
        setErrosEstoque(map);

        if (faltas.length) {
          const msg =
            faltas.length === 1
              ? `Estoque insuficiente para 1 item. Ajuste as quantidades destacadas.`
              : `Estoque insuficiente para ${faltas.length} itens. Ajuste as quantidades destacadas.`;
          toast.error(msg);
        } else {
          toast.error(e.message || "Estoque insuficiente");
        }

        // IMPORTANTE: lança erro para o pai NÃO fechar o dialog
        throw e;
      }

      toast.error(e?.message ?? "Erro ao salvar orçamento");

      // IMPORTANTE: lança erro para o pai NÃO fechar o dialog
      throw e;
    }
  }, [osId, itensProduto, itensServico]);

  useImperativeHandle(ref, () => ({ salvarOrcamento }), [salvarOrcamento]);

  // wrappers para limpar aviso do item ao alterar/remover
  const atualizarProdutoComReset = (index: number, patch: Partial<(typeof itensProduto)[number]>) => {
    const prod = itensProduto[index];
    if (prod) {
      setErrosEstoque((prev) => {
        if (!prev[prod.produtoid]) return prev;
        const rest = { ...prev };
        delete rest[prod.produtoid];
        return rest;
      });
    }
    atualizarProduto(index, patch);
  };

  const removerProdutoComReset = (index: number) => {
    const prod = itensProduto[index];
    if (prod) {
      setErrosEstoque((prev) => {
        if (!prev[prod.produtoid]) return prev;
        const rest = { ...prev };
        delete rest[prod.produtoid];
        return rest;
      });
    }
    removerProduto(index);
    toast.success("Produto removido");
  };

  // 🔹 Adapta o produto vindo do ProductSelect para ProdutoBusca
  const handleSelecionarProduto = (produtoSelecionado: any) => {
    const descricao = produtoSelecionado.titulo ?? produtoSelecionado.descricao ?? String(produtoSelecionado.id);

    const codigo = String(
      produtoSelecionado.codigo ??
        produtoSelecionado.referencia ??
        produtoSelecionado.codigobarras ??
        produtoSelecionado.id
    );

    const estoque = Number(produtoSelecionado.estoque ?? produtoSelecionado.estoque_atual) || 0;

    const precounitario = Number(produtoSelecionado.precovenda ?? produtoSelecionado.precounitario ?? 0);

    const adaptado: ProdutoBusca = {
      id: produtoSelecionado.id,
      codigo,
      descricao,
      precounitario,
      estoque,
    };

    adicionarProduto(adaptado);
    toast.success(`Produto "${adaptado.descricao}" adicionado ao orçamento.`);
  };

  // 🔹 Adapta o serviço vindo do ServiceSelect para ServicoBusca
  const handleSelecionarServico = (servicoSelecionado: any) => {
    const descricao = servicoSelecionado.descricao ?? String(servicoSelecionado.id);
    const codigo = String(servicoSelecionado.codigo ?? servicoSelecionado.id);
    const precohora = Number(servicoSelecionado.precohora ?? servicoSelecionado.valor ?? servicoSelecionado.preco ?? 0);

    const adaptado: ServicoBusca = {
      id: servicoSelecionado.id,
      codigo,
      descricao,
      precohora,
    };

    adicionarServico(adaptado);
    toast.success(`Serviço "${adaptado.descricao}" adicionado ao orçamento.`);
  };

  // Enquanto carrega: não renderiza nada (evita card “no fundo”)
  if (!ready) return null;

  return (
    <div className="space-y-6">
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-primary" />
            <CardTitle className="text-base sm:text-lg">Itens do orçamento</CardTitle>
          </div>

          <CardDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm">
              Use os botões para buscar e adicionar produtos e serviços ao orçamento. Ajuste as quantidades diretamente
              na tabela.
            </span>

            <div className="flex flex-row items-center gap-3">
              <ServiceSelect
                open={isServiceSelectOpen}
                setOpen={setIsServiceSelectOpen}
                OnSelect={handleSelecionarServico}
              >
                <Button className="hover:cursor-pointer" type="button">
                  <Plus className="h-4 w-4" />
                  Serviço
                </Button>
              </ServiceSelect>

              <ProductSelect
                open={isProductSelectOpen}
                setOpen={setIsProductSelectOpen}
                OnSelect={handleSelecionarProduto}
              >
                <Button className="hover:cursor-pointer" type="button">
                  <Plus className="h-4 w-4" />
                  Produto
                </Button>
              </ProductSelect>
            </div>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <TabelaItensProduto
            itens={itensProduto}
            errosEstoque={errosEstoque}
            onAtualizar={atualizarProdutoComReset}
            onRemover={removerProdutoComReset}
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
