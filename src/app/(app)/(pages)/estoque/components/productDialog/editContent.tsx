"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { ChevronDown, Edit, Undo2, Upload } from "lucide-react";
import { Grupo_produto, Produto, Unidade_medida } from "../../types";
import { Estoque_status } from "../../types";
import { Textarea } from "@/components/ui/textarea";
import ValueInput from "./valueInput";
import axios from "axios";
import { toast } from "sonner";
import { formatDate } from "@/utils/formatDate";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import formatarEmReal from "@/utils/formatarEmReal";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// --- Helper data ---

type CstCsosn = {
  cod: string;
  desc: string;
};

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
// Ajuste aos possíveis valores do enum public.estoque_status
// Se o seu enum tiver valores diferentes, ajuste abaixo para casar com o banco.
const ESTOQUE_STATUS: {
  value: Estoque_status;
  badge?: "default" | "secondary" | "destructive" | "outline";
}[] = [
  { value: Estoque_status.OK, badge: "outline" },
  { value: Estoque_status.BAIXO, badge: "secondary" },
  { value: Estoque_status.CRITICO, badge: "destructive" },
  { value: Estoque_status.SEM_ESTOQUE, badge: "default" },
];

function onlyDigits(v: string) {
  return v.replace(/\D/g, "");
}

// --- NOVO: tipo para unidade vinda da API ---
type UnidadeFromApi = {
  id: number;
  sigla: string;
  descricao: string | null;
  ativo: boolean;
};

type ProdutoImagem = {
  id: number;
  produto_id: number;
  url: string;
  ordem: number;
  createdat?: string;
};

interface EditContentProps {
  productId: number;
  onAfterSaveProduct?: () => void;
}

export default function EditContent({ productId, onAfterSaveProduct }: EditContentProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Produto | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  // --- NOVO: estados para unidades do banco ---
  const [unidades, setUnidades] = useState<UnidadeFromApi[]>([]);
  const [loadingUnidades, setLoadingUnidades] = useState(false);
  const [errorUnidades, setErrorUnidades] = useState<string | null>(null);

  // --- NOVO: imagens (múltiplas) ---
  const [imagens, setImagens] = useState<ProdutoImagem[]>([]);
  const [novasImagens, setNovasImagens] = useState<File[]>([]);
  const [novasPreview, setNovasPreview] = useState<string[]>([]);
  const [carregandoImagens, setCarregandoImagens] = useState(false);
  const [subindoImagens, setSubindoImagens] = useState(false);

  const tabTheme =
    " dark:data-[state=active]:bg-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground";

  const handleChange = (field: keyof Produto, value: string | number) => {
    if (selectedProduct) {
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
      }
    } catch (error) {
      console.log("Erro ao buscar produto:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProduct = async () => {
    setIsSubmitting(true);
    try {
      const response = await axios.put("/api/products/" + productId, selectedProduct);

      if (response.status === 200) {
        const { data } = response;
        setSelectedProduct(data.data);
        handleGetProduct(data.data.id);
        onAfterSaveProduct?.();
      }
    } catch (error) {
      console.log("Erro ao atualizar produto:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- NOVO: imagens (múltiplas) ---
  const carregarImagens = async () => {
    setCarregandoImagens(true);
    try {
      const res = await axios.get(`/api/products/${productId}/images`);
      setImagens(res.data?.imagens ?? []);
    } catch (err) {
      console.error("Erro ao carregar imagens:", err);
      toast.error("Erro", { description: "Não foi possível carregar as imagens do produto.", duration: 2500 });
    } finally {
      setCarregandoImagens(false);
    }
  };

  const enviarImagens = async () => {
    if (novasImagens.length === 0) return;
    setSubindoImagens(true);
    try {
      const fd = new FormData();
      novasImagens.forEach((f) => fd.append("files", f));

      await axios.post(`/api/products/${productId}/images`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Sucesso!", { description: "Imagens enviadas.", duration: 2000 });

      setNovasImagens([]);
      setNovasPreview([]);
      await carregarImagens();
      await handleGetProduct(productId);
    } catch (err) {
      console.error("Erro ao enviar imagens:", err);
      toast.error("Erro", { description: "Não foi possível enviar as imagens.", duration: 2500 });
    } finally {
      setSubindoImagens(false);
    }
  };

  const definirImagemPrincipal = async (imageId: number) => {
    try {
      await axios.patch(`/api/products/${productId}/images/${imageId}`, { principal: true });
      toast.success("Sucesso!", { description: "Imagem principal atualizada.", duration: 2000 });
      await handleGetProduct(productId);
      await carregarImagens();
    } catch (err) {
      console.error("Erro ao definir imagem principal:", err);
      toast.error("Erro", { description: "Não foi possível definir a imagem principal.", duration: 2500 });
    }
  };

  const removerImagem = async (imageId: number) => {
    try {
      await axios.delete(`/api/products/${productId}/images/${imageId}`);
      toast.success("Sucesso!", { description: "Imagem removida.", duration: 2000 });
      await handleGetProduct(productId);
      await carregarImagens();
    } catch (err) {
      console.error("Erro ao remover imagem:", err);
      toast.error("Erro", { description: "Não foi possível remover a imagem.", duration: 2500 });
    }
  };

  // --- NOVO: buscar unidades de medida ativas ---
  useEffect(() => {
    const fetchUnidades = async () => {
      try {
        setLoadingUnidades(true);
        setErrorUnidades(null);

        const res = await axios.get("/api/tipos/unidades-medida");
        const items: UnidadeFromApi[] = res.data?.items ?? [];

        // apenas ativas
        const ativas = items.filter((u) => u.ativo);
        setUnidades(ativas);
      } catch (err) {
        console.error("Erro ao carregar unidades de medida:", err);
        setErrorUnidades("Erro ao carregar unidades de medida");
      } finally {
        setLoadingUnidades(false);
      }
    };

    fetchUnidades();
  }, []);

  useEffect(() => {
    console.log("Product:", selectedProduct);
  }, [selectedProduct]);

  useEffect(() => {
    if (productId) {
      handleGetProduct(productId);
    }
  }, [productId]);

  useEffect(() => {
    if (productId) {
      carregarImagens();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  if (isLoading) {
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

  if (selectedProduct) {
    return (
      <DialogContent
        onDoubleClick={(e) => e.stopPropagation()}
        className="h-svh min-w-screen p-0 overflow-hidden sm:max-w-[1100px] sm:max-h-[850px] sm:w-[95vw] sm:min-w-0"
      >
        <div className="flex h-full min-h-0 flex-col">
          <DialogHeader className="shrink-0 px-6 py-4 border-b-1">
            <DialogTitle>
              Produto #{selectedProduct.id} - {selectedProduct.titulo}
            </DialogTitle>
            <DialogDescription>Preencha dados para editar um novo produto</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="Geral" className="flex-1 min-h-0 overflow-hidden pb-0 mt-4">
            <TabsList className="shrink-0 sticky top-0 z-10 bg-background ml-4">
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

                    {ESTOQUE_STATUS.filter((s) => s.value === selectedProduct.status_estoque).map((s) => (
                      <Badge className="" key={s.value} variant={s.badge}>
                        {s.value}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex flex-nowrap space-x-2">
                    <Label>Grupo:</Label>
                    <Select value={selectedProduct.grupo || "OUTROS"} onValueChange={(v) => handleChange("grupo", v)}>
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
                    value={selectedProduct.titulo || ""}
                    onChange={(e) => handleChange("titulo", e.target.value)}
                    placeholder="Nome comercial / vitrine"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={selectedProduct.descricao || ""}
                    onChange={(e) => handleChange("descricao", e.target.value)}
                    placeholder="Descrição do produto"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="referencia">Fabricante</Label>
                    <Input
                      id="fabricante"
                      value={selectedProduct.fabricante || ""}
                      onChange={(e) => handleChange("fabricante", e.target.value)}
                      placeholder="SKU / Referência interna"
                    />
                  </div>
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
                    <ValueInput price={selectedProduct.precovenda} setPrice={(v) => handleChange("precovenda", v)} />
                  </div>

                  {/* --- Unidade vinda da API --- */}
                  <div className="space-y-2">
                    <Label htmlFor="unidade">Unidade</Label>
                    <Select
                      value={selectedProduct.unidade || undefined}
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
                        {Object.values(Unidade_medida).map((u) => (
                          <SelectItem key={u} value={u}>
                            {u}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errorUnidades && <p className="mt-1 text-xs text-destructive">{errorUnidades}</p>}
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-nowrap">
                  <div className="space-x-1 flex items-center text-muted-foreground text-xs">
                    <Label>Criado em:</Label>
                    <span className=" text-muted-foreground">{formatDate(selectedProduct.createdat)}</span>
                  </div>
                  <div className="space-x-1 flex items-center text-muted-foreground text-xs">
                    <Label>Última modificação:</Label>
                    <span className=" text-muted-foreground">{formatDate(selectedProduct.updatedat)}</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* --- Aba: MarketPlace --- */}
            <TabsContent
              value="MarketPlace"
              className="h-full min-h-0 overflow-auto dark:bg-muted-foreground/5 px-6 py-10 space-y-2"
            >
              <div className="h-full min-h-0 overflow-auto rounded-md px-4 py-8 space-y-4">
                <div className="flex flex-row gap-2">
                  <Label htmlFor="exibirPdv">Exibir no Marketplace:</Label>
                  <Switch
                    checked={selectedProduct.exibirPdv}
                    onCheckedChange={(v) => setSelectedProduct({ ...selectedProduct, exibirPdv: v })}
                  ></Switch>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tituloMarketplace">Título no Marketplace *</Label>
                  <Input
                    id="tituloMarketplace"
                    value={selectedProduct.tituloMarketplace || ""}
                    onChange={(e) => handleChange("tituloMarketplace", e.target.value)}
                    placeholder="Nome comercial / Site"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="descricaoMarketplace">Descrição no Marketplace</Label>
                  <Textarea
                    id="descricaoMarketplace"
                    value={selectedProduct.descricaoMarketplace || ""}
                    onChange={(e) => handleChange("descricaoMarketplace", e.target.value)}
                    placeholder="Descrição do produto"
                  />
                </div>
              </div>
            </TabsContent>

            {/* --- Aba: Imagens --- */}
            <TabsContent
              value="Imagens"
              className="h-full min-h-0 overflow-auto dark:bg-muted-foreground/5 px-6 py-10 space-y-2"
            >
              <div className="h-full min-h-0 overflow-auto rounded-md px-4 py-8 space-y-6">
                <div className="space-y-2">
                  <Label>Adicionar imagens</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files ?? []);
                      setNovasImagens(files);
                      setNovasPreview(files.map((f) => URL.createObjectURL(f)));
                    }}
                  />

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={novasImagens.length === 0 || subindoImagens}
                      onClick={enviarImagens}
                      className="hover:cursor-pointer"
                    >
                      {subindoImagens ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Enviar imagens
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {novasPreview.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {novasPreview.map((src, idx) => (
                      <div key={idx} className="aspect-square rounded-md border overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt={`preview-${idx}`} className="h-full w-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Imagens cadastradas</Label>
                    {carregandoImagens && <span className="text-xs text-muted-foreground">Carregando...</span>}
                  </div>

                  {!carregandoImagens && imagens.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhuma imagem cadastrada.</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {imagens.map((img) => {
                        const imgUrlPrincipal = (selectedProduct as any)?.imgUrl as string | null | undefined;
                        const ehPrincipal = !!imgUrlPrincipal && imgUrlPrincipal === img.url;

                        return (
                          <div key={img.id} className="rounded-md border overflow-hidden">
                            <div className="aspect-square">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={img.url} alt={`img-${img.id}`} className="h-full w-full object-cover" />
                            </div>

                            <div className="p-2 flex gap-2">
                              <Button
                                type="button"
                                size="sm"
                                variant={ehPrincipal ? "default" : "outline"}
                                onClick={() => definirImagemPrincipal(img.id)}
                                disabled={ehPrincipal}
                                className="hover:cursor-pointer"
                              >
                                {ehPrincipal ? "Principal" : "Definir"}
                              </Button>

                              <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                onClick={() => removerImagem(img.id)}
                                className="hover:cursor-pointer"
                              >
                                Remover
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* --- Aba: Fiscal --- */}
            <TabsContent
              value="Fiscal"
              className="h-full min-h-0 overflow-auto dark:bg-muted-foreground/5 px-6 py-10 space-y-2"
            >
              <div className="h-full min-h-0 overflow-auto rounded-md px-4 py-8 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ncm">NCM</Label>
                    <Input
                      id="ncm"
                      value={selectedProduct.ncm || ""}
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
                      value={selectedProduct.cfop || ""}
                      onChange={(e) => handleChange("cfop", onlyDigits(e.target.value))}
                      placeholder="5102"
                      inputMode="numeric"
                      maxLength={4}
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="csosn">CSOSN</Label>
                    <Select
                      value={selectedProduct.csosn || "Selecione"}
                      onValueChange={(v) => handleChange("csosn", v)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem className="hover:cursor-pointer" value="Selecione">
                          Selecione
                        </SelectItem>
                        {CST_OPTIONS.map((c) => (
                          <SelectItem className="hover:cursor-pointer" key={c.cod} value={c.cod}>
                            {c.cod} - {c.desc}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="csosn">CST</Label>
                    <Select value={selectedProduct.cst || "Selecione"} onValueChange={(v) => handleChange("cst", v)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem className="hover:cursor-pointer" value="Selecione">
                          Selecione
                        </SelectItem>
                        {CST_OPTIONS.map((c) => (
                          <SelectItem className="hover:cursor-pointer" key={c.cod} value={c.cod}>
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
                      value={selectedProduct.cest || ""}
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
                      value={selectedProduct.aliquotaicms || ""}
                      onChange={(e) => handleChange("aliquotaicms", e.target.value)}
                      placeholder="18,00"
                      inputMode="decimal"
                    />
                  </div>
                </div>
                {/* PIS */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cst_pis">CST PIS</Label>
                    <Select
                      value={selectedProduct.cst_pis || "Selecione"}
                      onValueChange={(v) => handleChange("cst_pis", v)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem className="hover:cursor-pointer" value="Selecione">
                          Selecione
                        </SelectItem>
                        {CST_PIS_OPTIONS.map((c) => (
                          <SelectItem className="hover:cursor-pointer" key={c.cod} value={c.cod}>
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
                      value={selectedProduct.aliquota_pis || ""}
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
                      value={selectedProduct.cst_cofins || "Selecione"}
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
                          <SelectItem className="hover:cursor-pointer" key={c.cod} value={c.cod}>
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
                      value={selectedProduct.aliquota_cofins || ""}
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
                    <Label htmlFor="estoque">Estoque (Qtd) *</Label>
                    <Input
                      disabled
                      id="estoque"
                      value={selectedProduct.estoque || ""}
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
                      value={selectedProduct.estoqueminimo || ""}
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

            {/* --- Aba: Vendas ---- */}
            <TabsContent
              value="Vendas"
              className="h-full min-h-0 overflow-auto dark:bg-muted-foreground/5 px-6 py-10 space-y-2"
            >
              <div className="h-full min-h-0 overflow-auto rounded-md px-4 py-8 space-y-4">
                <div className="flex flex-row items-center justify-between">
                  <span className="text-xs">Participações em vendas</span>
                  <span className="text-xs">Quantidade: {selectedProduct.vendasdoproduto?.length}</span>
                </div>
                <Table className="text-xs border-1">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center">ID</TableHead>
                      <TableHead className="text-center">Data</TableHead>
                      <TableHead className="text-center">Quantidade</TableHead>
                      <TableHead className="text-center">Valor Total</TableHead>
                      <TableHead className="text-center"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedProduct.vendasdoproduto?.length && selectedProduct.vendasdoproduto?.length > 0 ? (
                      selectedProduct.vendasdoproduto.map((v) => (
                        <TableRow key={v.id} className="hover:cursor-pointer text-center">
                          <TableCell>{v.venda_id}</TableCell>
                          <TableCell>{formatDate(v.venda.datavenda)}</TableCell>
                          <TableCell>{v.quantidade}</TableCell>
                          <TableCell>{formatarEmReal(v.valor_total)}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-3 w-3 p-0 cursor-pointer">
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="space-y-1">
                                <Button
                                  variant={"ghost"}
                                  className="size-full flex justify-start gap-5 px-0 rounded-sm py-2 hover:cursor-pointer"
                                >
                                  <Edit className="-ml-1 -mr-1 h-4 w-4" />
                                  <span>Editar</span>
                                </Button>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell className="text-center h-20" colSpan={5}>
                          Produto não possui histórico de vendas
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* --- Aba: Ordens ---- */}
            <TabsContent
              value="Ordens"
              className="h-full min-h-0 overflow-auto dark:bg-muted-foreground/5 px-6 py-10 space-y-2"
            >
              <div className="h-full min-h-0 overflow-auto rounded-md px-4 py-8 space-y-4">
                <div className="flex flex-row items-center justify-between">
                  <span className="text-xs">Participações em Ordens de Serviço</span>
                  <span className="text-xs">Quantidade: {selectedProduct.ordensdoproduto?.length}</span>
                </div>
                <Table className="text-xs border-1">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center">ID</TableHead>
                      <TableHead className="text-center">Descrição</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-center"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedProduct.ordensdoproduto?.length && selectedProduct.ordensdoproduto?.length > 0 ? (
                      selectedProduct.ordensdoproduto.map((o) => (
                        <TableRow key={o.ordem.id} className="hover:cursor-pointer text-center">
                          <TableCell>{o.ordem.id}</TableCell>
                          <TableCell>{o.ordem.descricao || "-"}</TableCell>
                          <TableCell>{o.ordem.status}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-3 w-3 p-0 cursor-pointer">
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="space-y-1">
                                <Button
                                  variant={"ghost"}
                                  className="size-full flex justify-start gap-5 px-0 rounded-sm py-2 hover:cursor-pointer"
                                >
                                  <Edit className="-ml-1 -mr-1 h-4 w-4" />
                                  <span>Editar</span>
                                </Button>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell className="text-center h-20" colSpan={5}>
                          Produto não possui histórico de Ordens de Serviço
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            {/* --- Aba: Fluxo ---- */}
            <TabsContent
              value="Fluxo"
              className="h-full min-h-0 overflow-auto dark:bg-muted-foreground/5 px-6 py-10 space-y-2"
            >
              <div className="h-full min-h-0 overflow-auto rounded-md px-4 py-8 space-y-4">
                <div className="flex flex-row items-center justify-between">
                  <span className="text-xs">Movimentações em estoque</span>
                  <span className="text-xs">Quantidade: {selectedProduct.entradas?.length}</span>
                </div>
                <Table className="text-xs border-1">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center">ID</TableHead>
                      <TableHead className="text-center">Data:</TableHead>
                      <TableHead className="text-center">Fornecedor</TableHead>
                      <TableHead className="text-center">Quantidade</TableHead>
                      <TableHead className="text-center"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedProduct.entradas?.length && selectedProduct.entradas?.length > 0 ? (
                      selectedProduct.entradas.map((e) => (
                        <TableRow key={e.id} className="hover:cursor-pointer text-center">
                          <TableCell>{e.id}</TableCell>
                          <TableCell>{formatDate(e.created_at)}</TableCell>
                          <TableCell>{e.fornecedor.nomerazaosocial}</TableCell>
                          <TableCell className="text-green-600 font-bold">+ {e.quantidade}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-3 w-3 p-0 cursor-pointer">
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="space-y-1">
                                <Button
                                  variant={"ghost"}
                                  className="size-full flex justify-start gap-5 px-0 rounded-sm py-2 hover:cursor-pointer"
                                >
                                  <Edit className="-ml-1 -mr-1 h-4 w-4" />
                                  <span>Editar</span>
                                </Button>
                                <Button className="size-full flex justify-start gap-5 bg-red-500/50 hover:bg-red-500 px-0 rounded-sm py-2 hover:cursor-pointer">
                                  <Undo2 className="-ml-1 -mr-1 h-4 w-4" />
                                  <span>Cancelar Entrada</span>
                                </Button>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell className="text-center h-20" colSpan={5}>
                          Produto não possui histórico de movimentação no estoque
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="px-6 py-4">
            <div className="flex sm:flex-row gap-3 sm:gap-4">
              <Button
                form="register-form"
                disabled={isSubmitting}
                className="flex-1 text-sm sm:text-base hover:cursor-pointer"
                onClick={handleUpdateProduct}
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

  return null;
}
