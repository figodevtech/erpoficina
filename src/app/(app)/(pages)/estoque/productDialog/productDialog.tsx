"use client";

import type React from "react";
import { useMemo, useState } from "react";
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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Upload, Package, Barcode, Boxes, Database } from "lucide-react";

// === Schema mapping (public.produto) ===
// id (identity) -> handled by DB
// codigo (varchar, unique, required)
// descricao (varchar, required)
// precounitario (numeric, required)
// estoque (int, nullable, default 0)
// estoqueminimo (int, nullable, default 0)
// ncm (varchar, required)
// cfop (varchar, required)
// unidade (varchar, required)
// cest (varchar, nullable)
// csosn (varchar, required)
// aliquotaicms (numeric, nullable)
// origem (int, required)
// ean (varchar, nullable)
// referencia (varchar, nullable)
// titulo (varchar, nullable)
// status_estoque (public.estoque_status, required, default 'OK')
// createdat/updatedat handled by DB

// --- Helper data ---
const UNIDADES = [
  "UN",
  "PC",
  "CX",
  "KG",
  "G",
  "LT",
  "ML",
  "MT",
  "M2",
  "M3",
];

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

// Origem ICMS (0-8) – conforme tabela nacional
const ORIGENS: { value: number; label: string }[] = [
  { value: 0, label: "0 • Nacional" },
  { value: 1, label: "1 • Estrangeira (importação direta)" },
  { value: 2, label: "2 • Estrangeira (adquirida no mercado interno)" },
  { value: 3, label: "3 • Nacional (conteúdo de importação > 40% e ≤ 70%)" },
  { value: 4, label: "4 • Nacional (processos básicos)" },
  { value: 5, label: "5 • Nacional (conteúdo de importação ≤ 40%)" },
  { value: 6, label: "6 • Estrangeira (importação direta, sem similar nacional)" },
  { value: 7, label: "7 • Estrangeira (mercado interno, sem similar nacional)" },
  { value: 8, label: "8 • Nacional (conteúdo de importação > 70%)" },
];

// Ajuste aos possíveis valores do enum public.estoque_status
// Se o seu enum tiver valores diferentes, ajuste abaixo para casar com o banco.
export type EstoqueStatus = "OK" | "BAIXO" | "ESGOTADO";
const ESTOQUE_STATUS: { value: EstoqueStatus; badge?: "default" | "secondary" | "destructive" }[] = [
  { value: "OK", badge: "default" },
  { value: "BAIXO", badge: "secondary" },
  { value: "ESGOTADO", badge: "destructive" },
];

// --- Types ---
export interface ProdutoFormData {
  codigo: string;
  descricao: string;
  precounitario: string; // mantemos como string para formatação amigável; converteremos ao enviar
  estoque: string; // opcional -> DB default 0
  estoqueminimo: string; // opcional -> DB default 0
  ncm: string;
  cfop: string;
  unidade: string;
  cest?: string;
  csosn: string;
  aliquotaicms?: string; // % (ex.: 18) – converteremos ao enviar
  origem: number;
  ean?: string;
  referencia?: string;
  titulo?: string;
  status_estoque: EstoqueStatus;
}

const emptyProduct: ProdutoFormData = {
  codigo: "",
  descricao: "",
  precounitario: "",
  estoque: "",
  estoqueminimo: "",
  ncm: "",
  cfop: "",
  unidade: "UN",
  cest: "",
  csosn: "102",
  aliquotaicms: "",
  origem: 0,
  ean: "",
  referencia: "",
  titulo: "",
  status_estoque: "OK",
};

// --- Formatters/Masks ---
const currencyBR = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
});

function onlyDigits(v: string) {
  return v.replace(/\D/g, "");
}

function maskNCM(v: string) {
  // 8 dígitos
  return onlyDigits(v).slice(0, 8);
}

function maskCFOP(v: string) {
  // 4 dígitos
  return onlyDigits(v).slice(0, 4);
}

function maskCEST(v: string) {
  // 7 dígitos
  return onlyDigits(v).slice(0, 7);
}

function maskEAN(v: string) {
  // até 14 dígitos (EAN-8/12/13/14); validação completa pode ser feita no backend
  return onlyDigits(v).slice(0, 14);
}

function maskInt(v: string) {
  return onlyDigits(v).slice(0, 9);
}

function parseCurrencyToNumber(v: string): number | null {
  const digits = v.replace(/[R$\s.]/g, "").replace(",", ".");
  if (digits === "") return null;
  const n = Number(digits);
  return Number.isFinite(n) ? n : null;
}

function formatCurrencyInput(raw: string) {
  // aceita tanto "1234,56" como "1234.56" ou "123456"
  if (raw.trim() === "") return "";
  const normalized = raw.replace(/[^\d,\.]/g, "").replace(/\.(?=\d{3}(\D|$))/g, "");
  const withComma = normalized.includes(",") ? normalized : normalized.replace(/\.(\d{1,2})$/, ",$1");
  const asNumber = parseCurrencyToNumber(withComma);
  return asNumber == null ? raw : currencyBR.format(asNumber);
}

function sanitizePercent(raw: string) {
  // retorna apenas números e vírgula/ponto (limita 2 casas)
  const cleaned = raw.replace(/[^\d,\.]/g, "");
  const standardized = cleaned.replace(",", ".");
  const n = Number(standardized);
  if (!Number.isFinite(n)) return raw;
  return n.toFixed(Math.min(2, (standardized.split(".")[1] || "").length)).replace(".", ",");
}

// --- Component ---
export function ProductDialog() {
  const [formData, setFormData] = useState<ProdutoFormData>(emptyProduct);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tabTheme =
    " dark:data-[state=active]:bg-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground";

  const isValid = useMemo(() => {
    // Requisitos do schema (campos NOT NULL)
    const requiredFilled =
      formData.codigo.trim() !== "" &&
      formData.descricao.trim() !== "" &&
      parseCurrencyToNumber(formData.precounitario || "") !== null &&
      formData.ncm.trim().length >= 4 && // ao menos um tamanho básico
      formData.cfop.trim().length === 4 &&
      formData.unidade.trim() !== "" &&
      formData.csosn.trim() !== "" &&
      Number.isInteger(formData.origem);
    return requiredFilled;
  }, [formData]);

  const handleChange = (field: keyof ProdutoFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value as any }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!isValid) return;
    setIsSubmitting(true);

    // Monta payload alinhado ao schema (tipos corretos)
    const payload = {
      codigo: formData.codigo.trim(),
      descricao: formData.descricao.trim(),
      precounitario: parseCurrencyToNumber(formData.precounitario || "") ?? 0,
      estoque: formData.estoque ? Number(onlyDigits(formData.estoque)) : null,
      estoqueminimo: formData.estoqueminimo ? Number(onlyDigits(formData.estoqueminimo)) : null,
      ncm: maskNCM(formData.ncm),
      cfop: maskCFOP(formData.cfop),
      unidade: formData.unidade,
      cest: formData.cest ? maskCEST(formData.cest) : null,
      csosn: formData.csosn,
      aliquotaicms: formData.aliquotaicms ? Number(formData.aliquotaicms.replace(",", ".")) : null,
      origem: Number(formData.origem),
      ean: formData.ean ? maskEAN(formData.ean) : null,
      referencia: formData.referencia?.trim() || null,
      titulo: formData.titulo?.trim() || null,
      status_estoque: formData.status_estoque,
    } as const;

    // TODO: troque a chamada abaixo pela sua action/API (ex.: /api/produtos)
    // await fetch("/api/produtos", { method: "POST", body: JSON.stringify(payload) })

    // Simulação
    await new Promise((r) => setTimeout(r, 800));
    setIsSubmitting(false);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Package className="h-4 w-4 mr-2" />
          Novo Produto
        </Button>
      </DialogTrigger>

      <DialogContent className="h-dvh sm:max-w-[1100px] w-[95vw] p-2 overflow-hidden">
        <form id="product-form" onSubmit={handleSubmit} className="flex h-full min-h-0 flex-col">
          <DialogHeader className="shrink-0 px-6 py-4">
            <DialogTitle>Cadastro de Produto</DialogTitle>
          </DialogHeader>

          <Tabs className="flex-1 min-h-0 overflow-hidden px-6 pb-0">
            <TabsList className="shrink-0 sticky top-0 z-10 bg-background">
              <TabsTrigger value="Geral" className={"hover:cursor-pointer" + tabTheme}>
                Geral
              </TabsTrigger>
              <TabsTrigger value="Fiscal" className={"hover:cursor-pointer" + tabTheme}>
                Fiscal
              </TabsTrigger>
              <TabsTrigger value="Estoque" className={"hover:cursor-pointer" + tabTheme}>
                Estoque
              </TabsTrigger>
            </TabsList>

            {/* --- Aba: Geral --- */}
            <TabsContent value="Geral" className="h-full min-h-0 overflow-hidden p-0">
              <div className="h-full min-h-0 overflow-auto rounded-md px-4 py-8 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2 sm:col-span-1">
                    <Label htmlFor="codigo">Código *</Label>
                    <Input
                      id="codigo"
                      value={formData.codigo}
                      onChange={(e) => handleChange("codigo", e.target.value)}
                      placeholder="PROD-0001"
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="descricao">Descrição *</Label>
                    <Input
                      id="descricao"
                      value={formData.descricao}
                      onChange={(e) => handleChange("descricao", e.target.value)}
                      placeholder="Descrição do produto"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="titulo">Título</Label>
                    <Input
                      id="titulo"
                      value={formData.titulo || ""}
                      onChange={(e) => handleChange("titulo", e.target.value)}
                      placeholder="Nome comercial / vitrine"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="referencia">Referência</Label>
                    <Input
                      id="referencia"
                      value={formData.referencia || ""}
                      onChange={(e) => handleChange("referencia", e.target.value)}
                      placeholder="SKU / Referência interna"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ean">EAN</Label>
                    <Input
                      id="ean"
                      value={formData.ean || ""}
                      onChange={(e) => handleChange("ean", maskEAN(e.target.value))}
                      placeholder="7891234567890"
                      inputMode="numeric"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="precounitario">Preço Unitário *</Label>
                    <Input
                      id="precounitario"
                      value={formData.precounitario}
                      onChange={(e) => handleChange("precounitario", formatCurrencyInput(e.target.value))}
                      placeholder="R$ 0,00"
                      inputMode="decimal"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unidade">Unidade *</Label>
                    <Select value={formData.unidade} onValueChange={(v) => handleChange("unidade", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {UNIDADES.map((u) => (
                          <SelectItem key={u} value={u}>
                            {u}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status_estoque">Status de Estoque *</Label>
                    <Select
                      value={formData.status_estoque}
                      onValueChange={(v: EstoqueStatus) => handleChange("status_estoque", v)}
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
                </div>
              </div>
            </TabsContent>

            {/* --- Aba: Fiscal --- */}
            <TabsContent value="Fiscal" className="h-full min-h-0 overflow-hidden p-0">
              <div className="h-full min-h-0 overflow-auto rounded-md px-4 py-8 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ncm">NCM *</Label>
                    <Input
                      id="ncm"
                      value={formData.ncm}
                      onChange={(e) => handleChange("ncm", maskNCM(e.target.value))}
                      placeholder="00000000"
                      inputMode="numeric"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cfop">CFOP *</Label>
                    <Input
                      id="cfop"
                      value={formData.cfop}
                      onChange={(e) => handleChange("cfop", maskCFOP(e.target.value))}
                      placeholder="5102"
                      inputMode="numeric"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="csosn">CSOSN *</Label>
                    <Select value={formData.csosn} onValueChange={(v) => handleChange("csosn", v)}>
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
                    <Label htmlFor="origem">Origem *</Label>
                    <Select
                      value={String(formData.origem)}
                      onValueChange={(v) => handleChange("origem", Number(v))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ORIGENS.map((o) => (
                          <SelectItem key={o.value} value={String(o.value)}>
                            {o.label}
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
                      value={formData.cest || ""}
                      onChange={(e) => handleChange("cest", maskCEST(e.target.value))}
                      placeholder="0000000"
                      inputMode="numeric"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="aliquotaicms">Alíquota ICMS (%)</Label>
                    <Input
                      id="aliquotaicms"
                      value={formData.aliquotaicms || ""}
                      onChange={(e) => handleChange("aliquotaicms", sanitizePercent(e.target.value))}
                      placeholder="18,00"
                      inputMode="decimal"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Pré-visualização fiscal</Label>
                    <div className="text-sm text-muted-foreground border rounded-md p-3">
                      <div className="flex items-center gap-2"><Barcode className="h-4 w-4" /> NCM {formData.ncm || "—"}</div>
                      <div className="flex items-center gap-2"><Database className="h-4 w-4" /> CFOP {formData.cfop || "—"}</div>
                      <div className="flex items-center gap-2"><Boxes className="h-4 w-4" /> CSOSN {formData.csosn || "—"}</div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* --- Aba: Estoque --- */}
            <TabsContent value="Estoque" className="h-full min-h-0 overflow-hidden p-0">
              <div className="h-full min-h-0 overflow-auto rounded-md px-4 py-8 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="estoque">Estoque (Qtd)</Label>
                    <Input
                      id="estoque"
                      value={formData.estoque}
                      onChange={(e) => handleChange("estoque", maskInt(e.target.value))}
                      placeholder="0"
                      inputMode="numeric"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estoqueminimo">Estoque Mínimo</Label>
                    <Input
                      id="estoqueminimo"
                      value={formData.estoqueminimo}
                      onChange={(e) => handleChange("estoqueminimo", maskInt(e.target.value))}
                      placeholder="0"
                      inputMode="numeric"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Resumo</Label>
                    <div className="text-sm text-muted-foreground border rounded-md p-3">
                      <div>Preço: {formData.precounitario || "—"}</div>
                      <div>Unidade: {formData.unidade || "—"}</div>
                      <div>
                        Status: {formData.status_estoque ? <Badge>{formData.status_estoque}</Badge> : "—"}
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />
                <p className="text-xs text-muted-foreground">
                  * Campos obrigatórios. Valores nulos ou em branco serão enviados como <code>null</code> quando permitido pelo schema.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="px-6 py-4">
            <div className="flex sm:flex-row gap-3 sm:gap-4 w-full">
              <Button
                type="submit"
                form="product-form"
                disabled={isSubmitting || !isValid}
                className="flex-1 text-sm sm:text-base hover:cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Cadastrar Produto
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
