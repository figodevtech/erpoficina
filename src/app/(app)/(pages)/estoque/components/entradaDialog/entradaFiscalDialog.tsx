import { useIsMobile } from "@/app/(app)/hooks/use-mobile";
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

import { PackagePlus, Search, UserRoundPlus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Estoque_status, Pagination, Unidade_medida } from "../../types";
import BotaoNf from "./botaoNf";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import formatarEmReal from "@/utils/formatarEmReal";
import { NF } from "./types";
import { formatCpfCnpj } from "../../../clientes/components/customerDialogRegister/utils";
import { formatDate } from "@/utils/formatDate";

import ProductSelect from "@/app/(app)/components/productSelect";
import axios, { isAxiosError } from "axios";
import { toast } from "sonner";
import { set } from "nprogress";
import FornecedorSelect from "@/app/(app)/components/fornecedorSelect";
import FornecedorDialog from "../../../configuracoes/tipos/components/fornecedorDialog";
import { ProductDialog } from "../productDialog/productDialog";

interface EntradaDialogProps {
  children?: React.ReactNode;
  isOpen?: boolean;
  setIsOpen?: (value: boolean) => void;
  search?: string;
  handleGetProducts?: (
    pageNumber?: number,
    limit?: number,
    search?: string,
    status?: Estoque_status
  ) => void;
  paginantion?: Pagination;
  status?: Estoque_status;
}

export default function EntradaFiscalDialog({
  children,
  isOpen,
  setIsOpen,
}: EntradaDialogProps) {
  const [parsed, setParsed] = useState<NF | null>(null);
  const [file, setFile] = useState<File | undefined>(undefined);
  const [isProductOpen, setIsProductOpen] = useState<boolean>(false);
  const [isFornecedorOpen, setIsFornecedorOpen] = useState<boolean>(false);
  const [isLoadingFornecedor, setIsLoadingFornecedor] = useState<boolean>(false);
  const [selectedProductId, setSelectedProductId] = useState<number | undefined>(undefined);
  const [isProductEditOpen, setIsProductEditOpen] = useState<boolean>(false);
  const [searchingFornecedor, setSearchingFornecedor] = useState(false);

  const handleGetFornecedor = async () => {
    setIsLoadingFornecedor(true);
    try {
      const response = await axios.get(`/api/tipos/fornecedores/${parsed?.emitente.cnpj}?by=cpfcnpj`);
      if(response.status === 200){
        const fornecedorData = response.data.item;
        console.log("Fornecedor encontrado:", fornecedorData);
        setParsed((prev) => {
          return{
            ...prev!,
            fornecedorReferente: fornecedorData,
            fornecedorReferenteId: fornecedorData.id
          }
        })
      }
    } catch (error) {
      if(isAxiosError(error)){
        if(error.response?.status === 404){
          return
        }
      }
      
    }finally{
      setIsLoadingFornecedor(false);
    }
  };

  const handleCreateEntradas = async () => {
    if(!parsed){
      toast.error("Nenhum arquivo processado.");
      return;
    }
    if(parsed.itens.some(item => !item.produtoReferenciaId)){
      toast.error("Todos os itens devem estar vinculados a um produto no sistema.");
      return;
    }
    if(!parsed.fornecedorReferenteId){
      toast.error("A nota deve estar vinculada a um fornecedor no sistema.");
      return;
    }
  };

   const handleSearchFornecedor = async () => {
    if(!parsed?.fornecedorReferenteId){
      return;
    }

    setSearchingFornecedor(true);
    try {
      
   
    parsed.itens.map(async (item) => {
      if(item.produtoReferenciaId){
        return;
      }
      console.log("Buscando produto para código do fornecedor:", item.codigo)
      try {
        const response = await axios.get("/api/tipos/fornecedores/produtos", {
          params: {
            fornecedorId: parsed.fornecedorReferenteId,
            codigoFornecedor: item.codigo,
            limit: 1,
          },
        });
        if (response.status === 200) {
          const produtos = response.data.data;
          if (produtos.length > 1) {
            toast.warning(`Mais de um produto encontrado para o código ${item.codigo}.`);
          }
          if (produtos.length === 1) {
            const produto = produtos[0].produto;
            setParsed((prev) => {
              if (!prev) return prev; // aqui prev é null, então só devolve null

              return {
                ...prev,
                itens: prev.itens.map((it) =>
                  it.codigo === item.codigo
                    ? {
                        ...it,
                        produtoReferencia: produto,
                        produtoReferenciaId: produto.id,
                      }
                    : it
                ),
              }
            })
            console.log("Produto do fornecedor encontrado:", produto);
          }
        }
      } catch (error) {
        console.log("Erro ao buscar produto do fornecedor:", error);
      }
    })
     } catch (error) {
      console.log("Erro ao buscar produtos do fornecedor:", error);
      toast.error("Erro ao buscar produtos do fornecedor.", {description: String(error)});
    }finally{
      setSearchingFornecedor(false);
    }
    
  }
  function handleClearFile() {
    setFile(undefined);
    setParsed(null);
    // limpa o input de arquivo também
  }

  useEffect(() => {
    console.log(parsed);
  }, [parsed]);

  useEffect(()=> {
    handleSearchFornecedor();
  }, [parsed?.fornecedorReferenteId]);

  useEffect(() => {
    if (parsed?.emitente.cnpj){
      console.log("Buscando fornecedor para CNPJ:", parsed.emitente.cnpj);
      handleGetFornecedor();
    }
  }, [parsed?.emitente.cnpj]);

  const formatNumber = (value: number, decimals = 2) => {
    return value.toLocaleString("pt-BR", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(nextOpen) => {
        setIsOpen?.(nextOpen);
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className="p-0 overflow-hidden h-[600px]"
        onDoubleClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-full min-h-0 flex-col">
          <DialogHeader className="shrink-0 px-6 py-4 border-b-1">
            <DialogTitle>Entrada de Produto</DialogTitle>
            <DialogDescription className="flex flex-row items-center justify-between"></DialogDescription>
          </DialogHeader>

          {!parsed && (
            <div className="h-full min-h-0 overflow-auto dark:bg-muted-foreground/5 bg-muted px-6 py-10 space-y-2 relative">
              <BotaoNf file={file} setFile={setFile} setParsed={setParsed} />
            </div>
          )}

          {parsed && (
            <div className="h-full min-h-0 overflow-auto dark:bg-muted-foreground/5 bg-muted px-6 py-10 space-y-2 relative">
              <div className="inline-flex items-center gap-2 px-2 py-1 bg-muted rounded-md">
                <span className="text-xs text-muted-foreground">
                  1 arquivo selecionado
                </span>
                <X
                  onClick={handleClearFile}
                  className="w-4 h-4 hover:cursor-pointer text-red-200 hover:text-red-400"
                />
              </div>
              <Card className="mt-2 w-full max-w-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between gap-2">
                    <span>Dados da NF-e</span>
                    {parsed?.numeroNota && (
                      <Badge variant="outline">NF nº {parsed.numeroNota}</Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Informações identificadas a partir do XML enviado.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <div className="space-y-1 min-w-0 flex flex-col">
                      <p className="text-xs text-muted-foreground">
                        Fornecedor:
                      </p>
                      <span className="text-xs text-wrap max-w-[250px]">
                        {parsed.emitente.nome ||
                          "Fornecedor não identificado"}
                      </span>
                      <span className="text-[12px] text-muted-foreground">{parsed.emitente.nomeFantasia}</span>
                      {(parsed.emitente.cnpj || parsed.emitente.ie) && (
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          {parsed.emitente.cnpj && (
                            <span>
                              CNPJ:{" "}
                              {formatCpfCnpj(
                                parsed.emitente.cnpj.toString(),
                                "JURIDICA"
                              )}
                            </span>
                          )}
                          {parsed.emitente.ie && (
                            <span>IE: {parsed.emitente.ie}</span>
                          )}
                        </div>
                      )}


                      {/* verificador de fornecedor */}

                      <div className="flex felx-row items-center gap-2">
                          <div className="inline-flex items-center gap-2 px-2 py-1 bg-muted rounded-md">
                            <span
                              className={`text-xs text-muted-foreground max-w-[250px] ${
                                !parsed.fornecedorReferenteId && "text-red-400"
                              }`}
                            >
                              {isLoadingFornecedor ? "Buscando fornecedor..." :
                              parsed.fornecedorReferenteId
                                ? `Fornecedor vinculado: ${parsed.fornecedorReferente?.nomefantasia || parsed.fornecedorReferente?.nomerazaosocial}`
                                : "Fornecedor não cadastrado no sistema"}
                            </span>

                            
                          </div>
                          {parsed.fornecedorReferenteId === undefined && !isLoadingFornecedor && (

                            <FornecedorDialog
                            dialogOpen={isFornecedorOpen}
                            handleGetFornecedor={handleGetFornecedor}
                            setDialogOpen={setIsFornecedorOpen}
                            dadosNovoFornecedor={{
                              cpfcnpj: parsed.emitente.cnpj.toString(),
                              nomefantasia: parsed.emitente.nomeFantasia,
                              ativo: true,
                              cep: parsed.emitente.endereco.cep.toString(),
                              endereco: parsed.emitente.endereco.logradouro,
                              cidade: parsed.emitente.endereco.municipio,
                              estado: parsed.emitente.endereco.uf,
                              contato: "",
                              nomerazaosocial: parsed.emitente.nome,

                            }}

                            >

                            <div className="p-1.5 rounded-full bg-primary/20 hover:bg-muted hover:cursor-pointer transition-all">
                              <UserRoundPlus className="w-4 h-4" />
                            </div>
                            </FornecedorDialog>
                          )}
                          
                        </div>
                    </div>

                    <div className="text-xs text-muted-foreground text-right space-y-1 min-w-0">
                      {parsed?.dataEmissao && (
                        <div className="flex flex-col">
                          <span>Emissão:</span>
                          <span className="">
                            {formatDate(parsed?.dataEmissao)}
                          </span>
                        </div>
                      )}
                      {parsed?.totais.valorNota != null && (
                        <p>
                          Valor total:{" "}
                          <span className="font-semibold">
                            {formatarEmReal(parsed?.totais.valorNota)}
                          </span>
                        </p>
                      )}
                      
                    </div>
                  </div>
                  <Separator />

                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span>
                      Itens na nota:{" "}
                      <span className="font-semibold">
                        {parsed.itens.length}
                      </span>
                    </span>
                    {parsed?.itens && (
                      <span>
                        Série:{" "}
                        <span className="font-semibold">{parsed.serie}</span>
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                {parsed.itens.length > 0 ? (
                  parsed.itens.map((item, index) => (
                    <div
                      key={`${item.codigo}-${index}`}
                      className="border rounded-lg p-4 text-xs not-dark:bg-white"
                    >
                      <div className="space-y-2 ">
                        {/* Item number and description */}
                        <div className="pb-2 border-b">
                          <div className="flex flex-row justify-between items-center mb-2">
                            <p className=" font-semibold text-muted-foreground uppercase mb-1">
                              Item {item.numeroItem}
                            </p>
                            <p className=" font-bold">
                              Total: {formatarEmReal(item.valorTotal)}
                            </p>
                          </div>
                          <p className=" font-semibold text-muted-foreground">
                            {item.descricao}
                          </p>
                        </div>

                        {/* All data concatenated in single column */}
                        <div className="space-y-1.5 text-xs grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 pt-2">
                          <p>
                            <span className="text-muted-foreground font-medium">
                              Código:
                            </span>{" "}
                            <span className="font-mono font-semibold">
                              {item.codigo}
                            </span>
                          </p>
                          <p>
                            <span className="text-muted-foreground font-medium">
                              EAN:
                            </span>{" "}
                            <span className="font-mono font-semibold">
                              {item.ean}
                            </span>
                          </p>
                          <p>
                            <span className="text-muted-foreground font-medium">
                              Unidade:
                            </span>{" "}
                            <span className="font-semibold">
                              {item.unidade}
                            </span>
                          </p>
                          <p>
                            <span className="text-muted-foreground font-medium">
                              Qtd:
                            </span>{" "}
                            <span className="font-semibold">
                              {formatNumber(item.quantidade)}
                            </span>
                          </p>
                          <p>
                            <span className="text-muted-foreground font-medium">
                              V. Unitário:
                            </span>{" "}
                            <span className="font-mono font-semibold">
                              {formatarEmReal(item.valorUnitario)}
                            </span>
                          </p>
                          <p>
                            <span className="text-muted-foreground font-medium">
                              NCM:
                            </span>{" "}
                            <span className="font-mono font-semibold">
                              {item.ncm}
                            </span>
                          </p>
                          <p>
                            <span className="text-muted-foreground font-medium">
                              CFOP:
                            </span>{" "}
                            <span className="font-mono font-semibold">
                              {item.cfop}
                            </span>
                          </p>
                          <p>
                            <span className="text-muted-foreground font-medium">
                              ICMS:
                            </span>{" "}
                            {/* <span className="font-semibold">
                        {item.icms.aliquota ? `${formatNumber(item.icms.aliquota)}%` : "-"}
                      </span> */}
                          </p>
                        </div>
                        <Separator />
                        <div className="flex felx-row items-center gap-2">
                          <div className="inline-flex items-center gap-2 px-2 py-1 bg-muted rounded-md">
                            <span
                              className={`text-xs text-muted-foreground ${
                                !item.produtoReferenciaId && "text-red-400"
                              }`}
                            >
                              {item.produtoReferenciaId
                                ? `Produto vinculado: ${item.produtoReferencia?.titulo}`
                                : "Produto não vinculado ao estoque"}
                            </span>
                            {item.produtoReferenciaId && (
                              <X
                                onClick={() => {
                                  setParsed((prev) => {
                                    if (!prev) return prev;

                                    return{
                                      ...prev,
                                      itens: prev.itens.map((it, i)=> i=== index ? {
                                        ...it,
                                        produtoReferenciaId: undefined,
                                        produtoReferencia: undefined
                                      } : it)
                                    }
                                  })
                                }}
                                className="w-4 h-4 hover:cursor-pointer text-red-200 hover:text-red-400"
                              />
                            )}
                          </div>
                          <ProductSelect
                          open={isProductOpen}
                          setOpen={setIsProductOpen}

                            OnSelect={(p) => {
                              setParsed((prev) => {
                                if (!prev) return prev; // aqui prev é null, então só devolve null

                                return {
                                  ...prev,
                                  itens: prev.itens.map((item, i) =>
                                    i === index
                                      ? {
                                          ...item,
                                          produtoReferencia: p,
                                          produtoReferenciaId: p.id,
                                        }
                                      : item
                                  ),
                                };
                              });
                            }}
                          >
                            <div className="p-1.5 rounded-full bg-primary/20 hover:bg-muted hover:cursor-pointer transition-all">
                              <Search className="w-4 h-4" />
                            </div>
                          </ProductSelect>
                          {!item.produtoReferenciaId &&(

                          <ProductDialog
                          handleSearchFornecedor={handleSearchFornecedor}
                          productId={selectedProductId}
                          isOpen={isProductEditOpen}
                          setIsOpen={setIsProductEditOpen}
                          setSelectedProductId={setSelectedProductId}
                          newProductData={{
                            titulo: item.descricao,
                            referencia: item.codigo,
                            ncm: item.ncm.toString(),
                            cfop: item.cfop.toString(),
                            precovenda: item.valorUnitario,
                            estoque: 0,
                            fornecedorid: parsed.fornecedorReferenteId || undefined,
                            codigofornecedor: item.codigo,
                          }}
                          >

                          <div className="p-1.5 rounded-full bg-primary/20 hover:bg-muted hover:cursor-pointer transition-all">
                              <PackagePlus className="w-4 h-4" />
                          </div>
                          </ProductDialog>
                          )}
                        </div>

                        {/* Total value highlighted */}
                        <div className="pt-2 border-t mt-3"></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum item para exibir
                  </div>
                )}
              </div>
              <Separator />
              <details className="mt-2">
                {" "}
                <summary className="cursor-pointer text-xs text-muted-foreground">
                  {" "}
                  Ver JSON completo{" "}
                </summary>{" "}
                <pre className="mt-2 text-xs max-h-80 text-wrap text-muted-foreground">
                  {" "}
                  {JSON.stringify(parsed, null, 1)}{" "}
                </pre>{" "}
              </details>
            </div>
          )}

          <DialogFooter className="px-6 py-4">
            <div className="flex sm:flex-row gap-3 sm:gap-4">
              <Button
                onClick={handleCreateEntradas}
                className="hover:cursor-pointer"
                disabled={isLoadingFornecedor || searchingFornecedor}
              >
                Registrar
              </Button>
              <DialogClose asChild>
                <Button
                  // disabled={isSubmitting}
                  className="hover:cursor-pointer"
                  variant="outline"
                >
                  Cancelar
                </Button>
              </DialogClose>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
