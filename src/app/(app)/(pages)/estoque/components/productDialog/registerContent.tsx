"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
type CstCsosn = {
  cod: string;
  desc: string;
};

const CSOSN_OPTIONS = [
  {
    cod: "101",
    desc: "Tributada pelo Simples Nacional com permissão de crédito",
  },
  {
    cod: "102",
    desc: "Tributada pelo Simples Nacional sem permissão de crédito",
  },
  {
    cod: "103",
    desc: "Isenção do ICMS no Simples Nacional para faixa de receita",
  },
  { cod: "201", desc: "Tributada com permissão de crédito e com ST" },
  { cod: "202", desc: "Tributada sem permissão de crédito e com ST" },
  { cod: "300", desc: "Imune" },
  { cod: "400", desc: "Não Tributada" },
  {
    cod: "500",
    desc: "ICMS cobrado anteriormente por substituição tributária (ST)",
  },
  { cod: "900", desc: "Outros" },
];

const CST_PIS_OPTIONS: CstCsosn[] = [
  { cod: "01", desc: "Operação Tributável com Alíquota Básica." },
  { cod: "02", desc: "Operação Tributável com Alíquota Diferenciada." },
  {
    cod: "03",
    desc: "Operação Tributável com Alíquota por Unidade de Medida de Produto.",
  },
  {
    cod: "04",
    desc: "Operação Tributável Monofásica - Revenda a Alíquota Zero.",
  },
  { cod: "05", desc: "Operação Tributável por Substituição Tributária." },
  { cod: "06", desc: "Operação Tributável a Alíquota Zero." },
  { cod: "07", desc: "Operação Isenta de Contribuição." },
  { cod: "08", desc: "Operação sem Incidência da Contribuição." },
  { cod: "09", desc: "Operação com Suspensão da Contribuição." },
  { cod: "49", desc: "Outras Operações de Saída" },
];

const CST_OPTIONS: CstCsosn[] = [
  { cod: "000", desc: "Tributada Integralmente" },
  { cod: "010", desc: "Tributada e com cobrança do ICMS por ST" },
  { cod: "020", desc: "Com redução de base de cálculo" },
  { cod: "030", desc: "Isenta/Não tributada e com cobrança do ICMS por ST" },
  { cod: "040", desc: "Isenta" },
  { cod: "041", desc: "Não Tributada" },
  { cod: "050", desc: "Com Suspensão" },
  { cod: "051", desc: "Com Diferimento" },
  {
    cod: "060",
    desc: "ICMS Cobrado na Operação Anterior por Substituição Tributária",
  },
  { cod: "070", desc: "Com redução de base de cálculo no ICMS ST" },
  { cod: "090", desc: "Outras Operações" },
];

// Ajuste aos possíveis valores do enum public.estoque_status
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

// *** NOVO: tipo para unidade vinda da API ***
type UnidadeFromApi = {
  id: number;
  sigla: string;
  descricao: string | null;
  ativo: boolean;
};

interface RegisterContentProps {
  setSelectedProductId?: (value: number | undefined) => void;
  newProduct: Produto;
  setNewProduct: (value: Produto) => void;
  handleSearchFornecedor?: () => void;
}

export default function RegisterContent({
  handleSearchFornecedor,
  setSelectedProductId,
  newProduct,
  setNewProduct,
}: RegisterContentProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- NOVO: imagens (múltiplas) ---
  const [imagensArquivos, setImagensArquivos] = useState<File[]>([]);
  const [imagensPreview, setImagensPreview] = useState<string[]>([]);

  // *** NOVO: estados para unidades de medida vindas do banco ***
  const [unidades, setUnidades] = useState<UnidadeFromApi[]>([]);
  const [loadingUnidades, setLoadingUnidades] = useState(false);
  const [errorUnidades, setErrorUnidades] = useState<string | null>(null);

  const tabTheme =
    " dark:data-[state=active]:bg-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground";

  const handleChange = (field: keyof Produto, value: string | number) => {
    setNewProduct({ ...newProduct, [field]: value });
  };

  const handleCreateProduct = async () => {
    setIsSubmitting(true);
    if (!newProduct.tituloMarketplace) {
      newProduct.tituloMarketplace = newProduct.titulo;
    }
    try {
      const response = await axios.post("/api/products", {
        newProduct,
      });
      console.log("trese");
      console.log(response.status);

      if (response.status === 201) {
        toast.success("Sucesso!", {
          description: "Produto cadastrado.",
          duration: 2000,
        });

        const produtoId = response.data.data.id;

        // --- NOVO: envia imagens (se selecionadas) ---
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
        console.log("criado:", response.data);

        setImagensArquivos([]);
        setImagensPreview([]);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error("Erro", {
          description: error.response?.data.error,
          duration: 2000,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // *** NOVO: buscar unidades de medida ativas do backend ***
  useEffect(() => {
    const fetchUnidades = async () => {
      try {
        setLoadingUnidades(true);
        setErrorUnidades(null);

        const res = await axios.get("/api/tipos/unidades-medida");
        const items: UnidadeFromApi[] = res.data?.items ?? [];

        // Só unidades ativas
        const ativas = items.filter((u) => u.ativo);
        setUnidades(ativas);

        // Se o produto ainda não tem unidade, seta uma padrão
        if (!newProduct.unidade && ativas.length > 0) {
          handleChange("unidade", ativas[0].sigla as Unidade_medida);
        }
      } catch (err) {
        console.error("Erro ao carregar unidades de medida:", err);
        setErrorUnidades("Erro ao carregar unidades de medida");
      } finally {
        setLoadingUnidades(false);
      }
    };

    fetchUnidades();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    console.log("New Product:", newProduct);
  }, [newProduct]);

  return (
    <DialogContent className="h-svh min-w-screen p-0 overflow-hidden sm:max-w-[1100px] sm:max-h-[850px] sm:w-[95vw] sm:min-w-0">
      <div className="flex h-full min-h-0 flex-col">
        <DialogHeader className="shrink-0 px-6 py-4 border-b-1">
          <DialogTitle>Cadastro de Produtos</DialogTitle>
          <DialogDescription>Preencha dados para registrar um novo produto</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="Geral" className="flex-1 min-h-0 overflow-hidden pb-0 mt-4">
          <TabsList className="shrink-0 sticky top-0 z-10 bg-background ml-4">
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

                  {ESTOQUE_STATUS.filter((s) => s.value === newProduct.status_estoque).map((s) => (
                    <Badge className="" key={s.value} variant={s.badge}>
                      {s.value}
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-nowrap space-x-2">
                  <Label>Grupo:</Label>
                  <Select value={newProduct.grupo || "OUTROS"} onValueChange={(v) => handleChange("grupo", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(Grupo_produto).map((g) => (
                        <SelectItem className="hover:cursor-pointer" key={g} value={g}>
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
                <Label htmlFor="descricao">Descrição</Label>
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
                    onChange={(e) => handleChange("codigobarras", onlyDigits(e.target.value))}
                    placeholder="7891234567890"
                    inputMode="numeric"
                    maxLength={14}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="precounitario">Preço Unitário</Label>
                  <ValueInput price={newProduct.precovenda} setPrice={(v) => handleChange("precovenda", v)} />
                </div>

                {/* --- Unidade vindo do banco --- */}
                <div className="space-y-2">
                  <Label htmlFor="unidade">Unidade</Label>
                  <Select
                    value={newProduct.unidade || undefined}
                    onValueChange={(v) => handleChange("unidade", v as Unidade_medida)}
                    disabled={loadingUnidades || !!errorUnidades}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          loadingUnidades ? "Carregando..." : errorUnidades ? "Erro ao carregar" : "Selecione"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {unidades.map((u) => (
                        <SelectItem key={u.id} value={u.sigla as Unidade_medida} className="hover:cursor-pointer">
                          {u.sigla}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errorUnidades && <p className="mt-1 text-xs text-destructive">{errorUnidades}</p>}
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
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ncm">NCM</Label>
                  <Input
                    id="ncm"
                    className="w-30"
                    value={newProduct.ncm || ""}
                    onChange={(e) => handleChange("ncm", onlyDigits(e.target.value))}
                    placeholder="00000000"
                    inputMode="numeric"
                    maxLength={8}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cfop">CFOP</Label>
                  <Input
                    id="cfop"
                    value={newProduct.cfop || ""}
                    onChange={(e) => handleChange("cfop", onlyDigits(e.target.value))}
                    placeholder="5102"
                    className="w-30"
                    inputMode="numeric"
                    maxLength={4}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="csosn">CSOSN</Label>
                  <Select value={newProduct.csosn || "Selecione"} onValueChange={(v) => handleChange("csosn", v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Selecione">Selecione</SelectItem>
                      {CSOSN_OPTIONS.map((c) => (
                        <SelectItem key={c.cod} value={c.cod}>
                          {c.cod} - {c.desc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="csosn">CST</Label>
                  <Select value={newProduct.cst || "Selecione"} onValueChange={(v) => handleChange("cst", v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Selecione">Selecione</SelectItem>
                      {CST_OPTIONS.map((c) => (
                        <SelectItem key={c.cod} value={c.cod}>
                          {c.cod} - {c.desc}
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
                    onChange={(e) => handleChange("cest", onlyDigits(e.target.value))}
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
                    onChange={(e) => handleChange("aliquotaicms", e.target.value)}
                    placeholder="18,00"
                    inputMode="decimal"
                    type="number"
                  />
                </div>
              </div>
              {/* PIS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cst_pis">CST PIS</Label>
                  <Select value={newProduct.cst_pis || "Selecione"} onValueChange={(v) => handleChange("cst_pis", v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem className="hover:cursor-pointer" value="Selecione">
                        Selecione
                      </SelectItem>
                      {CST_PIS_OPTIONS.map((c) => (
                        <SelectItem key={c.cod} value={c.cod}>
                          {c.cod} - {c.desc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aliquota_pis">Alíquota PIS (%)</Label>
                  <Input
                    id="aliquota_pis"
                    value={newProduct.aliquota_pis || ""}
                    onChange={(e) => handleChange("aliquota_pis", e.target.value)}
                    placeholder="18,00"
                    inputMode="decimal"
                    type="number"
                  />
                </div>
              </div>
              {/* CONFINS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cst_cofins">CST COFINS</Label>
                  <Select
                    value={newProduct.cst_cofins || "Selecione"}
                    onValueChange={(v) => handleChange("cst_cofins", v)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem className="hover:cursor-pointer" value="Selecione">
                        Selecione
                      </SelectItem>
                      {CST_PIS_OPTIONS.map((c) => (
                        <SelectItem key={c.cod} value={c.cod}>
                          {c.cod} - {c.desc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aliquota_cofins">Alíquota COFINS (%)</Label>
                  <Input
                    id="aliquota_cofins"
                    value={newProduct.aliquota_cofins || ""}
                    onChange={(e) => handleChange("aliquota_cofins", e.target.value)}
                    placeholder="18,00"
                    inputMode="decimal"
                    type="number"
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
                  <Label htmlFor="estoque">Estoque Inicial (Qtd) *</Label>
                  <Input
                    id="estoque"
                    value={newProduct.estoque || ""}
                    onChange={(e) => handleChange("estoque", onlyDigits(e.target.value))}
                    placeholder="0"
                    inputMode="numeric"
                    maxLength={9}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estoqueminimo">Estoque Mínimo *</Label>
                  <Input
                    id="estoqueminimo"
                    value={newProduct.estoqueminimo || ""}
                    onChange={(e) => handleChange("estoqueminimo", onlyDigits(e.target.value))}
                    placeholder="0"
                    inputMode="numeric"
                    maxLength={9}
                  />
                </div>
              </div>

              <Separator />
              <div className="text-xs text-muted-foreground">
                <span>Regra de estoque:</span>
                <ul className="mt-2 list-disc list-inside">
                  <li>
                    <strong>OK:</strong> Estoque acima do estoque mínimo.
                  </li>
                  <li>
                    <strong>BAIXO:</strong> Estoque igual ou abaixo do estoque mínimo.
                  </li>
                  <li>
                    <strong>CRÍTICO:</strong> Estoque atingiu a metade do estoque mínimo.
                  </li>
                  <li>
                    <strong>SEM ESTOQUE:</strong> Estoque indisponível.
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>

          {/* --- Aba: Imagens --- */}
          <TabsContent
            value="Imagens"
            className="h-full min-h-0 overflow-auto dark:bg-muted-foreground/5 px-6 py-10 space-y-2"
          >
            <div className="h-full min-h-0 overflow-auto rounded-md px-4 py-8 space-y-4">
              <div className="space-y-2">
                <Label>Imagens do produto</Label>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files ?? []);
                    setImagensArquivos(files);
                    setImagensPreview(files.map((f) => URL.createObjectURL(f)));
                  }}
                />
              </div>

              {imagensPreview.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {imagensPreview.map((src, idx) => (
                    <div key={idx} className="aspect-square rounded-md border overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt={`preview-${idx}`} className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="px-6 py-4">
          <div className="flex sm:flex-row gap-3 sm:gap-4">
            <Button
              type="submit"
              form="register-form"
              disabled={isSubmitting}
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
