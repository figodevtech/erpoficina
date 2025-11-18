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
import { Grupo_produto, Produto, Unidade_medida } from "../../types";
import { Estoque_status } from "../../types";
import { Textarea } from "@/components/ui/textarea";
import ValueInput from "./valueInput";
import axios, { isAxiosError } from "axios";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

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

interface RegisterContentProps {
  setSelectedProductId?: (value: number | undefined) => void;
  newProduct: Produto;
  setNewProduct: (value: Produto) => void;
}

export default function RegisterContent({
  setSelectedProductId,
  newProduct,
  setNewProduct,
}: RegisterContentProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tabTheme =
    " dark:data-[state=active]:bg-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground";

  const handleChange = (field: keyof Produto, value: string | number) => {
    setNewProduct({ ...newProduct, [field]: value });
  };

  const handleCreateProduct = async () => {
    setIsSubmitting(true);
    if(!newProduct.tituloMarketplace){
      newProduct.tituloMarketplace = newProduct.titulo;
    }
    try {
      const response = await axios.post("/api/products", {
        newProduct,
      });
      console.log("trese")
      console.log(response.status)

      if (response.status === 201) {
        console.log(response.data.data.id);
        toast.success("Sucesso!", {
          description: "Produto cadastrado.",
          duration: 2000,
        });
        if(setSelectedProductId){

          setSelectedProductId(response.data.data.id);
        }
        console.log("criado:", response.data);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error("Erro", {
          description: error.response?.data.error,
          duration: 2000,
        });

        console.log(error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    console.log("New Product:", newProduct);
  }, [newProduct]);

  return (
    <DialogContent className="h-svh min-w-screen p-0 overflow-hidden sm:max-w-[1100px] sm:max-h-[850px] sm:w-[95vw] sm:min-w-0">
      <div className="flex h-full min-h-0 flex-col">
        <DialogHeader className="shrink-0 px-6 py-4 border-b-1">
          <DialogTitle>Cadastro de Produtos</DialogTitle>
          <DialogDescription>
            Preencha dados para registrar um novo produto
          </DialogDescription>
        </DialogHeader>

        <Tabs className="flex-1 min-h-0 overflow-hidden pb-0 mt-4">
          <TabsList className="shrink-0 sticky top-0 z-10 bg-background ml-4">
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
              <div className="flex items-center space-x-4">
                <div className="flex flex-nowrap space-x-2">
                  <Label htmlFor="status_estoque">Status do Estoque:</Label>

                  {ESTOQUE_STATUS.filter(
                    (s) => s.value === newProduct.status_estoque
                  ).map((s) => (
                    <Badge className="" key={s.value} variant={s.badge}>
                      {s.value}
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-nowrap space-x-2">
                  <Label>Grupo:</Label>
                  <Select
                    value={newProduct.grupo || "OUTROS"}
                    onValueChange={(v) => handleChange("grupo", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(Grupo_produto).map((g) => (
                        <SelectItem
                          className="hover:cursor-pointer"
                          key={g}
                          value={g}
                        >
                          {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  value={newProduct.titulo || ""}
                  onChange={(e) => handleChange("titulo", e.target.value)}
                  placeholder="Título interno"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="descricao">Descrição *</Label>
                <Textarea
                  id="descricao"
                  value={newProduct.descricao || ""}
                  onChange={(e) => handleChange("descricao", e.target.value)}
                  placeholder="Descrição do produto"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="referencia">Fabricante</Label>
                  <Input
                    id="fabricante"
                    value={newProduct.fabricante || ""}
                    onChange={(e) => handleChange("fabricante", e.target.value)}
                    placeholder="Fabricante"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="referencia">Referência</Label>
                  <Input
                    id="referencia"
                    value={newProduct.referencia || ""}
                    onChange={(e) => handleChange("referencia", e.target.value)}
                    placeholder="SKU / Referência interna"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ean">Código de Barras</Label>
                  <Input
                    id="codigobarras"
                    value={newProduct.codigobarras || ""}
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
                    price={newProduct.precovenda}
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
                    value={newProduct.unidade}
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
                    value={newProduct.ncm || ""}
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
                    value={newProduct.cfop || ""}
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
                    value={newProduct.csosn || "Selecione"}
                    onValueChange={(v) => handleChange("csosn", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Selecione">Selecione</SelectItem>
                      {CSOSN_OPTIONS.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cest">CEST</Label>
                  <Input
                    id="cest"
                    value={newProduct.cest || ""}
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
                    value={newProduct.aliquotaicms || ""}
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
                    value={newProduct.estoque || ""}
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
                    value={newProduct.estoqueminimo || ""}
                    onChange={(e) =>
                      handleChange("estoqueminimo", onlyDigits(e.target.value))
                    }
                    placeholder="0"
                    inputMode="numeric"
                    maxLength={9}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="origem">Fornecedor *</Label>
                <Select
                  value={String(newProduct.fornecedor)}
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
              <Separator />
              <div className="text-xs text-muted-foreground">
                <span>Regra de estoque:</span>
                <ul className="mt-2 list-disc list-inside">
                  <li>
                    <strong>OK:</strong> Estoque acima do estoque mínimo.
                  </li>
                  <li>
                    <strong>BAIXO:</strong> Estoque igual ou abaixo do estoque
                    mínimo.
                  </li>
                  <li>
                    <strong>CRÍTICO:</strong> Estoque atingiu a metade do
                    estoque mínimo.
                  </li>
                  <li>
                    <strong>SEM ESTOQUE:</strong> Estoque indisponível.
                  </li>
                </ul>
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
              //   onClick={handleCreateCustomer}
              onClick={handleCreateProduct}
              className="flex-1 text-sm sm:text-base hover:cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Cadastrando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Cadastrar Produto
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
