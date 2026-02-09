"use client";

import { TabsTrigger } from "@/components/ui/tabs";
import { Save, Upload } from "lucide-react";
import axios, { isAxiosError } from "axios";
import { toast } from "sonner";
import { Estoque_status, Grupo_produto, Produto } from "../../types";
import { ProductDialogLayout } from "./tabs/dialog-layout";
import { TabGeral } from "./tabs/tab-geral";
import { TabFiscal } from "./tabs/tab-fiscal";
import { TabEstoque } from "./tabs/tab-estoque";
import { TabImagensCreate } from "./tabs/tab-imagens-create";
import { useUnidadesMedida } from "./hooks/use-unidades-medida";
import { useEffect, useState } from "react";
import { Unidade_medida } from "../../types";
import { useGruposProduto } from "./hooks/use-grupo-produtos";

interface ConteudoCadastroProdutoProps {
  setSelectedProductId?: (value: number | undefined) => void;
  newProduct: Produto;
  setNewProduct: (value: Produto) => void;
  handleSearchFornecedor?: () => void;
  onAfterSaveProduct?: () => void;
  isDesktop?: boolean;
}

const initialNewProduct: Produto = {
  id: 0,
  precovenda: 0,
  status_estoque: Estoque_status.OK,
  unidade: Unidade_medida.UN,
  fornecedor: "DESCONHECIDO",
  grupo_produto_id: 1,
};

export default function CadastroProduto({
  handleSearchFornecedor,
  setSelectedProductId,
  newProduct,
  setNewProduct,
  onAfterSaveProduct,
  isDesktop = true,
}: ConteudoCadastroProdutoProps) {
  const [salvando, setSalvando] = useState(false);
  const [imagensArquivos, setImagensArquivos] = useState<File[]>([]);
  const [imagensPreview, setImagensPreview] = useState<string[]>([]);
  const [currentTab, setCurrentTab] = useState<string>("Geral");
  const { unidades, loadingUnidades, errorUnidades } = useUnidadesMedida();
  const { grupos, loadingGrupos, errorGrupos } = useGruposProduto();

  const tabTheme =
    " dark:data-[state=active]:bg-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground";

  const handleChange = (field: keyof Produto, value: any) => {
    setNewProduct({ ...newProduct, [field]: value });
  };

  useEffect(() => {
    // se não tiver unidade definida ainda, tenta setar uma ativa
    if (!newProduct.unidade && unidades.length > 0) {
      handleChange("unidade", unidades[0].sigla as Unidade_medida);
    }
  }, [unidades]);
  useEffect(() => {
    // se não tiver grupo definido ainda, tenta setar uma ativa
    if (!newProduct.grupo_produto_id && grupos.length > 0) {
      handleChange("grupo_produto_id", grupos[0].id);
    }
  }, [grupos]);

  const handlePickImages = (files: File[]) => {
    setImagensArquivos(files);
    setImagensPreview(files.map((f) => URL.createObjectURL(f)));
  };

  const cadastrarProduto = async (registerAgain?: boolean) => {
    setSalvando(true);

    const payload = { ...newProduct } as any;
    if (!payload.tituloMarketplace) payload.tituloMarketplace = payload.titulo;

    try {
      const response = await axios.post("/api/products", {
        newProduct: payload,
      });

      if (response.status === 201) {
        toast.success("Sucesso!", {
          description: "Produto cadastrado.",
          duration: 2000,
        });

        const produtoId = response.data.data.id as number;

        // envia imagens se selecionadas
        if (imagensArquivos.length > 0) {
          try {
            const fd = new FormData();
            imagensArquivos.forEach((f) => fd.append("files", f));

            await axios.post(`/api/products/${produtoId}/images`, fd, {
              headers: { "Content-Type": "multipart/form-data" },
            });
          } catch (err) {
            console.error("Erro ao enviar imagens:", err);
            toast.error("Erro", {
              description:
                "Produto criado, mas não foi possível enviar as imagens.",
              duration: 2500,
            });
          }
        }

        if (registerAgain) {
          setNewProduct(initialNewProduct);
          setSelectedProductId?.(undefined);

          handleSearchFornecedor?.();

          setImagensArquivos([]);
          setImagensPreview([]);
          setCurrentTab("Geral");
          onAfterSaveProduct?.();
        } else {
          setSelectedProductId?.(produtoId);
          handleSearchFornecedor?.();

          setImagensArquivos([]);
          setImagensPreview([]);
          onAfterSaveProduct?.();
        }
      }
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error("Erro", {
          description: error.response?.data?.error ?? "Erro ao criar produto",
          duration: 2000,
        });
      } else {
        toast.error("Erro", {
          description: "Erro ao criar produto",
          duration: 2000,
        });
      }
    } finally {
      setSalvando(false);
    }
  };

  return (
    <ProductDialogLayout
      isDesktop={isDesktop}
      title="Cadastro de Produtos"
      description="Preencha dados para registrar um novo produto"
      defaultTab="Geral"
      submitLabel2="Salvar e Continuar"
      submitLabel="Salvar"
      submitting={salvando}
      onSubmit={cadastrarProduto}
      currentTab={currentTab}
      tabs={
        <>
          <TabsTrigger
            onClick={() => setCurrentTab("Geral")}
            value="Geral"
            className={"hover:cursor-pointer" + tabTheme}
          >
            Geral
          </TabsTrigger>
          <TabsTrigger
            onClick={() => setCurrentTab("Fiscal")}
            value="Fiscal"
            className={"hover:cursor-pointer" + tabTheme}
          >
            Fiscal
          </TabsTrigger>
          <TabsTrigger
            onClick={() => setCurrentTab("Estoque")}
            value="Estoque"
            className={"hover:cursor-pointer" + tabTheme}
          >
            Estoque
          </TabsTrigger>
          <TabsTrigger
            onClick={() => setCurrentTab("Imagens")}
            value="Imagens"
            className={"hover:cursor-pointer" + tabTheme}
          >
            Imagens
          </TabsTrigger>
        </>
      }
    >
      <TabGeral
        mode="create"
        produto={newProduct}
        onChange={handleChange}
        unidades={unidades}
        grupos={grupos}
        loadingUnidades={loadingUnidades}
        errorUnidades={errorUnidades}
      />

      <TabFiscal produto={newProduct} onChange={handleChange} />
      <TabEstoque mode="create" produto={newProduct} onChange={handleChange} />
      <TabImagensCreate previews={imagensPreview} onPick={handlePickImages} />
      <TabImagensCreate previews={imagensPreview} onPick={handlePickImages} />
    </ProductDialogLayout>
  );
}
