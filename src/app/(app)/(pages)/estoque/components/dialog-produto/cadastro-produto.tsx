"use client";

import { TabsTrigger } from "@/components/ui/tabs";
import { Save, Upload } from "lucide-react";
import axios, { isAxiosError } from "axios";
import { toast } from "sonner";
import { Produto } from "../../types";
import { ProductDialogLayout } from "./tabs/dialog-layout";
import { TabGeral } from "./tabs/tab-geral";
import { TabFiscal } from "./tabs/tab-fiscal";
import { TabEstoque } from "./tabs/tab-estoque";
import { TabImagensCreate } from "./tabs/tab-imagens-create";
import { useUnidadesMedida } from "./hooks/use-unidades-medida";
import { useEffect, useState } from "react";
import { Unidade_medida } from "../../types";
import { set } from "nprogress";

interface ConteudoCadastroProdutoProps {
  setSelectedProductId?: (value: number | undefined) => void;
  newProduct: Produto;
  setNewProduct: (value: Produto) => void;
  handleSearchFornecedor?: () => void;
}

export default function CadastroProduto({
  handleSearchFornecedor,
  setSelectedProductId,
  newProduct,
  setNewProduct,
}: ConteudoCadastroProdutoProps) {
  const [salvando, setSalvando] = useState(false);
  const [imagensArquivos, setImagensArquivos] = useState<File[]>([]);
  const [imagensPreview, setImagensPreview] = useState<string[]>([]);
  const { unidades, loadingUnidades, errorUnidades } = useUnidadesMedida();

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

  const handlePickImages = (files: File[]) => {
    setImagensArquivos(files);
    setImagensPreview(files.map((f) => URL.createObjectURL(f)));
  };

  const cadastrarProduto = async () => {
    setSalvando(true);

    const payload = { ...newProduct } as any;
    if (!payload.tituloMarketplace) payload.tituloMarketplace = payload.titulo;

    try {
      const response = await axios.post("/api/products", { newProduct: payload });

      if (response.status === 201) {
        toast.success("Sucesso!", { description: "Produto cadastrado.", duration: 2000 });

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
              description: "Produto criado, mas não foi possível enviar as imagens.",
              duration: 2500,
            });
          }
        }

        setSelectedProductId?.(produtoId);
        handleSearchFornecedor?.();

        setImagensArquivos([]);
        setImagensPreview([]);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error("Erro", { description: error.response?.data?.error ?? "Erro ao criar produto", duration: 2000 });
      } else {
        toast.error("Erro", { description: "Erro ao criar produto", duration: 2000 });
      }
    } finally {
      setSalvando(false);
    }
  };

  return (
    <ProductDialogLayout
      title="Cadastro de Produtos"
      description="Preencha dados para registrar um novo produto"
      defaultTab="Geral"
      submitLabel="Cadastrar Produto"
      submitting={salvando}
      onSubmit={cadastrarProduto}
      tabs={
        <>
          <TabsTrigger value="Geral" className={"hover:cursor-pointer" + tabTheme}>
            Geral
          </TabsTrigger>
          <TabsTrigger value="Fiscal" className={"hover:cursor-pointer" + tabTheme}>
            Fiscal
          </TabsTrigger>
          <TabsTrigger value="Estoque" className={"hover:cursor-pointer" + tabTheme}>
            Estoque
          </TabsTrigger>
          <TabsTrigger value="Imagens" className={"hover:cursor-pointer" + tabTheme}>
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
        loadingUnidades={loadingUnidades}
        errorUnidades={errorUnidades}
      />

      <TabFiscal produto={newProduct} onChange={handleChange} />
      <TabEstoque mode="create" produto={newProduct} onChange={handleChange} />
      <TabImagensCreate previews={imagensPreview} onPick={handlePickImages} />
    </ProductDialogLayout>
  );
}
