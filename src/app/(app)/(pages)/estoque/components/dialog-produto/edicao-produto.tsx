"use client";

import { TabsTrigger } from "@/components/ui/tabs";
import { Upload } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { Produto } from "../../types";
import { ProductDialogLayout } from "./tabs/dialog-layout";
import { TabGeral } from "./tabs/tab-geral";
import { TabMarketplace } from "./tabs/tab-marketplace";
import { TabImagensEdit } from "./tabs/tab-imagens-edit";
import { TabFiscal } from "./tabs/tab-fiscal";
import { TabEstoque } from "./tabs/tab-estoque";
import { TabVendas } from "./tabs/tab-vendas";
import { TabOrdens } from "./tabs/tab-ordens";
import { TabFluxo } from "./tabs/tab-fluxo";
import { useUnidadesMedida } from "./hooks/use-unidades-medida";
import { useProdutoImagens } from "./hooks/use-produto-imagens";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface EdicaoProdutoProps {
  productId: number;
  onAfterSaveProduct?: () => void;
}

export default function EdicaoProduto({ productId, onAfterSaveProduct }: EdicaoProdutoProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Produto | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const reqIdRef = useRef(0);
  const { unidades, loadingUnidades, errorUnidades } = useUnidadesMedida();

  const handleGetProduct = async (id: number) => {
    const myId = ++reqIdRef.current;

    setIsLoading(true);
    setLoadError(null);
    setSelectedProduct(undefined);

    try {
      const response = await axios.get(`/api/products/${id}`);
      if (myId !== reqIdRef.current) return;

      if (response.status === 200) {
        setSelectedProduct(response.data.data);
      } else {
        setLoadError("Não foi possível carregar o produto.");
      }
    } catch (error: any) {
      if (myId !== reqIdRef.current) return;
      setLoadError(error?.response?.data?.error ?? "Erro ao buscar produto.");
    } finally {
      if (myId === reqIdRef.current) setIsLoading(false);
    }
  };

  const handleChange = (field: keyof Produto, value: any) => {
    setSelectedProduct((p) => (p ? ({ ...p, [field]: value } as any) : p));
  };

  const handleUpdateProduct = async () => {
    if (!selectedProduct) return;

    setIsSubmitting(true);
    try {
      const response = await axios.put("/api/products/" + productId, selectedProduct);
      if (response.status === 200) {
        const { data } = response;
        setSelectedProduct(data.data);
        await handleGetProduct(data.data.id);
        onAfterSaveProduct?.();
        toast.success("Sucesso!", { description: "Produto atualizado.", duration: 1500 });
      }
    } catch (error) {
      console.log("Erro ao atualizar produto:", error);
      toast.error("Erro", { description: "Não foi possível salvar o produto.", duration: 2500 });
    } finally {
      setIsSubmitting(false);
    }
  };

  const imagensHook = useProdutoImagens({
    productId,
    onAfterChangeCapa: async () => {
      await handleGetProduct(productId);
    },
  });

  useEffect(() => {
    if (productId) handleGetProduct(productId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const tabTheme =
    " dark:data-[state=active]:bg-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground";

  const tabs = (
    <>
      <TabsTrigger value="Geral" className={"hover:cursor-pointer" + tabTheme}>
        Geral
      </TabsTrigger>
      <TabsTrigger value="MarketPlace" className={"hover:cursor-pointer" + tabTheme}>
        MarketPlace
      </TabsTrigger>
      <TabsTrigger value="Imagens" className={"hover:cursor-pointer" + tabTheme}>
        Imagens
      </TabsTrigger>
      <TabsTrigger value="Fiscal" className={"hover:cursor-pointer" + tabTheme}>
        Fiscal
      </TabsTrigger>
      <TabsTrigger value="Estoque" className={"hover:cursor-pointer" + tabTheme}>
        Estoque
      </TabsTrigger>
      <TabsTrigger value="Vendas" className={"hover:cursor-pointer" + tabTheme}>
        Vendas
      </TabsTrigger>
      <TabsTrigger value="Ordens" className={"hover:cursor-pointer" + tabTheme}>
        Ordens
      </TabsTrigger>
      <TabsTrigger value="Fluxo" className={"hover:cursor-pointer" + tabTheme}>
        Fluxo
      </TabsTrigger>
    </>
  );

  return (
    <ProductDialogLayout
      title={
        selectedProduct
          ? `Produto #${(selectedProduct as any).id} - ${(selectedProduct as any).titulo}`
          : `Produto #${productId}`
      }
      description="Preencha dados para editar um produto"
      defaultTab="Geral"
      submitLabel="Salvar"
      submitIcon={<Upload className="h-4 w-4" />}
      submitting={isSubmitting}
      onSubmit={handleUpdateProduct}
      tabs={tabs}
      submitDisabled={isLoading || !!loadError || !selectedProduct}
    >
      <div className="relative flex-1 min-h-0 overflow-hidden">
        {/* CONTEÚDO */}
        {selectedProduct && !loadError && (
          <>
            <TabGeral
              mode="edit"
              produto={selectedProduct}
              onChange={handleChange}
              unidades={unidades}
              loadingUnidades={loadingUnidades}
              errorUnidades={errorUnidades}
              showDates
            />

            <TabMarketplace produto={selectedProduct} onChange={handleChange} />

            <TabImagensEdit
              previews={imagensHook.novasPreview}
              carregando={imagensHook.carregandoImagens}
              subindo={imagensHook.subindoImagens}
              imagens={imagensHook.imagens}
              imgUrlPrincipal={(selectedProduct as any).imgUrl ?? null}
              onPick={imagensHook.onPick}
              onEnviar={imagensHook.enviarImagens}
              onDefinirPrincipal={imagensHook.definirImagemPrincipal}
              onRemover={imagensHook.removerImagem}
              hasSelection={imagensHook.hasSelection}
            />

            <TabFiscal produto={selectedProduct} onChange={handleChange} />
            <TabEstoque mode="edit" produto={selectedProduct} onChange={handleChange} />
            <TabVendas produto={selectedProduct} />
            <TabOrdens produto={selectedProduct} />
            <TabFluxo produto={selectedProduct} />
          </>
        )}

        {/* OVERLAY (sem remontar modal / sem piscar tabs) */}
        {(isLoading || loadError || !selectedProduct) && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-background/95">
            {isLoading ? (
              <>
                <div className="size-8 border-t-2 border-primary rounded-t-full animate-spin" />
                <span className="text-primary">Carregando...</span>
              </>
            ) : loadError ? (
              <>
                <p className="font-medium text-destructive">Falha ao carregar</p>
                <p className="text-sm text-muted-foreground max-w-[520px] text-center">{loadError}</p>
                <Button variant="outline" onClick={() => handleGetProduct(productId)} className="hover:cursor-pointer">
                  Tentar novamente
                </Button>
              </>
            ) : (
              <span className="text-muted-foreground">Produto não encontrado.</span>
            )}
          </div>
        )}
      </div>
    </ProductDialogLayout>
  );
}
