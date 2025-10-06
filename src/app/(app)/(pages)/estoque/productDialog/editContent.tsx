"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload } from "lucide-react";
import { Produto, Unidade_medida } from "../types";
import { Estoque_status } from "../types";
import { Textarea } from "@/components/ui/textarea";
import ValueInput from "./valueInput";
import axios from "axios";
import { formatDate } from "@/utils/formatDate";

// --- Helper data ---

const CSOSN_OPTIONS = [
  "101",
  "102",
  "103",
  "201",
  "202",
  "203",
  "300",
  "400",
  "500",
  "900",
];

// Ajuste aos possíveis valores do enum public.estoque_status
// Se o seu enum tiver valores diferentes, ajuste abaixo para casar com o banco.
const ESTOQUE_STATUS: {
  value: Estoque_status;
  badge?: "default" | "secondary" | "destructive";
}[] = [
  { value: Estoque_status.OK, badge: "default" },
  { value: Estoque_status.BAIXO, badge: "secondary" },
  { value: Estoque_status.CRITICO, badge: "destructive" },
];


function onlyDigits(v: string) {
  return v.replace(/\D/g, "");
}



interface EditContentProps {
  productId: number
}

export default function EditContent({
  productId
}: EditContentProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Produto | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState(true);

  const tabTheme =
    " dark:data-[state=active]:bg-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground";

  const handleChange = (field: keyof Produto, value: string | number) => {
    if(selectedProduct){
        setSelectedProduct({ ...selectedProduct, [field]: value });
    }
  };

  const handleGetProduct = async (id: number) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/products/${id}`);
      if (response.status === 200) {
        const { data } = response;
        setSelectedProduct(data.data);
        // console.log("Cliente carregado:", data.data);
      }
    } catch (error) {
      console.log("Erro ao buscar produto:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("Product:", selectedProduct);
  }, [selectedProduct]);

   useEffect(() => {
       if (productId) {
         handleGetProduct(productId);
       }
     }, []);

  if(isLoading){
    return (
        <DialogContent className="h-dvh min-w-screen p-0 overflow-hidden sm:max-w-[1100px] sm:max-h-[850px] sm:w-[95vw] sm:min-w-0">
            <DialogHeader className="hidden">
              <DialogTitle></DialogTitle>
            </DialogHeader>
            <div className="flex h-full min-h-0 flex-col justify-center items-center">
              <div className="size-8 border-t-2 border-primary rounded-t-full animate-spin"></div>
              <span className="text-primary">Carregando</span>
            </div>
          </DialogContent>
        );
  }

  if(selectedProduct){
      return (
        <DialogContent className="h-svh min-w-screen p-0 overflow-hidden sm:max-w-[1100px] sm:max-h-[850px] sm:w-[95vw] sm:min-w-0">
          <div className="flex h-full min-h-0 flex-col">
            <DialogHeader className="shrink-0 px-6 py-4 border-b-1">
              <DialogTitle>Produto #{selectedProduct.id} - {selectedProduct.titulo}</DialogTitle>
              <DialogDescription>
                Preencha dados para editar um novo produto
              </DialogDescription>
            </DialogHeader>
    
            <Tabs 
                        defaultValue="Geral"

            className="flex-1 min-h-0 overflow-hidden pb-0 mt-4">
              <TabsList
              className="shrink-0 sticky top-0 z-10 bg-background ml-4">
                <TabsTrigger
                  value="Geral"
                  className={"hover:cursor-pointer" + tabTheme}
                >
                  Geral
                </TabsTrigger>
                <TabsTrigger
                  value="Fiscal"
                  className={"hover:cursor-pointer" + tabTheme}
                >
                  Fiscal
                </TabsTrigger>
                <TabsTrigger
                  value="Estoque"
                  className={"hover:cursor-pointer" + tabTheme}
                >
                  Estoque
                </TabsTrigger>
              </TabsList>
    
              {/* --- Aba: Geral --- */}
              <TabsContent
                value="Geral"
                className="h-full min-h-0 overflow-auto dark:bg-muted-foreground/5 px-6 py-10 space-y-2"
              >
                <div className="h-full min-h-0 overflow-auto rounded-md px-4 py-8 space-y-4">
                  <div className="space-y-2">
                      <Label htmlFor="status_estoque">Status de Estoque *</Label>
                      <Select
                        value={selectedProduct.status_estoque}
                        onValueChange={(v: Estoque_status) =>
                          handleChange("status_estoque", v)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ESTOQUE_STATUS.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                              <Badge variant={s.badge}>{s.value}</Badge>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  <div className="space-y-2">
                    <Label htmlFor="titulo">Título *</Label>
                    <Input
                      id="titulo"
                      value={selectedProduct.titulo || ""}
                      onChange={(e) => handleChange("titulo", e.target.value)}
                      placeholder="Nome comercial / vitrine"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="descricao">Descrição *</Label>
                    <Textarea
                      id="descricao"
                      value={selectedProduct.descricao}
                      onChange={(e) => handleChange("descricao", e.target.value)}
                      placeholder="Descrição do produto"
                    />
                  </div>
    
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="referencia">Referência</Label>
                      <Input
                        id="referencia"
                        value={selectedProduct.referencia || ""}
                        onChange={(e) => handleChange("referencia", e.target.value)}
                        placeholder="SKU / Referência interna"
                      />
                    </div>
    
                    <div className="space-y-2">
                      <Label htmlFor="ean">Código de Barras</Label>
                      <Input
                        id="codigobarras"
                        value={selectedProduct.codigobarras || ""}
                        onChange={(e) =>
                          handleChange("codigobarras", onlyDigits(e.target.value))
                        }
                        placeholder="7891234567890"
                        inputMode="numeric"
                        maxLength={14}
                      />
                    </div>
                    
                  </div>
    
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="precounitario">Preço Unitário *</Label>
                      <ValueInput
                      price={selectedProduct.precovenda}
                      setPrice={(v) => handleChange("precovenda", v)}
                      />
                      {/* <Input
                        id="precovenda"
                        value={newProduct.precovenda}
                        onChange={(e) =>
                          handleChange(
                            "precovenda",
                            formatCurrencyInput(e.target.value)
                          )
                        }
                        placeholder="R$ 0,00"
                        inputMode="decimal"
                      /> */}
                    </div>
    
                    <div className="space-y-2">
                      <Label htmlFor="unidade">Unidade *</Label>
                      <Select
                        value={selectedProduct.unidade}
                        onValueChange={(v) => handleChange("unidade", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(Unidade_medida).map((u) => (
                            <SelectItem key={u} value={u}>
                              {u}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
    
                    
                  </div>
                  <Separator/>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-nowrap">

                  <div className="space-x-1 flex items-center text-muted-foreground text-xs">

                  <Label>Criado em:</Label>
                  <span className=" text-muted-foreground">

                  {formatDate(selectedProduct.createdat)}
                  </span>
                  </div>
                  <div className="space-x-1 flex items-center text-muted-foreground text-xs">

                  <Label>Última modificação:</Label>
                  <span className=" text-muted-foreground">

                  {formatDate(selectedProduct.updatedat)}
                  </span>
                  </div>
                  </div>
                </div>
              </TabsContent>
    
              {/* --- Aba: Fiscal --- */}
              <TabsContent
                value="Fiscal"
                className="h-full min-h-0 overflow-auto dark:bg-muted-foreground/5 px-6 py-10 space-y-2"
              >
                <div className="h-full min-h-0 overflow-auto rounded-md px-4 py-8 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ncm">NCM *</Label>
                      <Input
                        id="ncm"
                        value={selectedProduct.ncm}
                        onChange={(e) =>
                          handleChange("ncm", onlyDigits(e.target.value))
                        }
                        placeholder="00000000"
                        inputMode="numeric"
                        maxLength={8}
                      />
                    </div>
    
                    <div className="space-y-2">
                      <Label htmlFor="cfop">CFOP *</Label>
                      <Input
                        id="cfop"
                        value={selectedProduct.cfop}
                        onChange={(e) =>
                          handleChange("cfop", onlyDigits(e.target.value))
                        }
                        placeholder="5102"
                        inputMode="numeric"
                        maxLength={4}
                      />
                    </div>
    
                    <div className="space-y-2">
                      <Label htmlFor="csosn">CSOSN *</Label>
                      <Select
                        value={selectedProduct.csosn}
                        onValueChange={(v) => handleChange("csosn", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {CSOSN_OPTIONS.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
    
                    <div className="space-y-2">
                      <Label htmlFor="origem">Fornecedor *</Label>
                      <Select
                        value={String(selectedProduct.fornecedor)}
                        onValueChange={(v) => handleChange("fornecedor", Number(v))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DESCONHECIDO">DESCONHECIDO</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
    
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cest">CEST</Label>
                      <Input
                        id="cest"
                        value={selectedProduct.cest || ""}
                        onChange={(e) =>
                          handleChange("cest", onlyDigits(e.target.value))
                        }
                        placeholder="0000000"
                        inputMode="numeric"
                        maxLength={7}
                      />
                    </div>
    
                    <div className="space-y-2">
                      <Label htmlFor="aliquotaicms">Alíquota ICMS (%)</Label>
                      <Input
                        id="aliquotaicms"
                        value={selectedProduct.aliquotaicms || ""}
                        onChange={(e) =>
                          handleChange("aliquotaicms", e.target.value)
                        }
                        placeholder="18,00"
                        inputMode="decimal"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
    
              {/* --- Aba: Estoque --- */}
              <TabsContent
                value="Estoque"
                className="h-full min-h-0 overflow-auto dark:bg-muted-foreground/5 px-6 py-10 space-y-2"
              >
                <div className="h-full min-h-0 overflow-auto rounded-md px-4 py-8 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="estoque">Estoque (Qtd)</Label>
                      <Input
                        id="estoque"
                        value={selectedProduct.estoque}
                        onChange={(e) =>
                          handleChange("estoque", onlyDigits(e.target.value))
                        }
                        placeholder="0"
                        inputMode="numeric"
                        maxLength={9}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estoqueminimo">Estoque Mínimo</Label>
                      <Input
                        id="estoqueminimo"
                        value={selectedProduct.estoqueminimo}
                        onChange={(e) =>
                          handleChange("estoqueminimo", onlyDigits(e.target.value))
                        }
                        placeholder="0"
                        inputMode="numeric"
                        maxLength={9}
                      />
                    </div>
                  </div>
    
                </div>
              </TabsContent>
            </Tabs>
    
            <DialogFooter className="px-6 py-4">
                        <div className="flex sm:flex-row gap-3 sm:gap-4">
                          <Button
                            type="submit"
                            form="register-form"
                            disabled={isSubmitting}
                            className="flex-1 text-sm sm:text-base hover:cursor-pointer"
                            // onClick={handleUpdateCustomer}
                          >
                            {isSubmitting ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                Salvando...
                              </>
                            ) : (
                              <>
                                <Upload className="h-4 w-4 mr-2" />
                                Salvar
                              </>
                            )}
                          </Button>
                          <DialogClose asChild>
                            <Button className="hover:cursor-pointer" variant={"outline"}>
                              Cancelar
                            </Button>
                          </DialogClose>
                        </div>
                      </DialogFooter>
          </div>
        </DialogContent>
      );
  }
}
