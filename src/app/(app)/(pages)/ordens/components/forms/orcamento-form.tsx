"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Plus, Trash2, ShoppingCart, Wrench, ClipboardList, Minus } from "lucide-react";

/* ----------------------------- Tipagens básicas ---------------------------- */

type ProdutoBusca = {
  id: number;
  codigo: string;
  descricao: string;
  precounitario: number;
  estoque: number;
};

type ServicoBusca = {
  id: number;
  codigo: string;
  descricao: string;
  precohora: number;
};

type ItemProduto = {
  produtoid: number;
  descricao: string;
  quantidade: number;
  precounitario: number;
  subtotal: number;
};

type ItemServico = {
  servicoid: number;
  descricao: string;
  quantidade: number;
  precounitario: number; // preço unit. do serviço
  subtotal: number;
};

export type OrcamentoFormProps = {
  ordemServico: { id: number; numero?: string; cliente?: string; veiculo?: string };
  onTotaisChange?: (tot: { totalProdutos: number; totalServicos: number }) => void;
   onGerarOrcamento?: () => void | Promise<void>;
  onEnviarFinanceiro?: () => void | Promise<void>;
};

/* ---------------------------------- Utils --------------------------------- */
function money(n: number | string | null | undefined) {
  const v = typeof n === "number" ? n : Number(n ?? 0);
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
const toNum = (v: any) => (v === null || v === undefined || isNaN(+v) ? 0 : +v);

/* --------------------------- Input de Quantidade --------------------------- */
function QtyInput({
  value,
  onChange,
  min = 0,
  step = 1,
  className = "",
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  step?: number;
  className?: string;
}) {
  const dec = () => onChange(Math.max(min, toNum(value) - step));
  const inc = () => onChange(toNum(value) + step);

  return (
    <div className={`flex items-center justify-center gap-1 ${className}`}>
      <Button type="button" size="icon" variant="outline" className="h-8 w-8" onClick={dec}>
        <Minus className="h-3.5 w-3.5" />
      </Button>
      <Input
        type="number"
        inputMode="numeric"
        className="h-8 w-20 text-center"
        value={String(value)}
        onChange={(e) => onChange(toNum(e.target.value || 0))}
        min={min}
        step={step}
      />
      <Button type="button" size="icon" variant="outline" className="h-8 w-8" onClick={inc}>
        <Plus className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

/* --------------------------------- Componente ------------------------------ */
export function OrcamentoForm({ ordemServico, onTotaisChange }: OrcamentoFormProps) {
  const osId = ordemServico?.id;

  // Buscas
  const [aba, setAba] = useState<"produtos" | "servicos">("produtos");

  const [pQ, setPQ] = useState("");
  const [pCodigo, setPCodigo] = useState("");
  const [pLoading, setPLoading] = useState(false);
  const [pResultados, setPResultados] = useState<ProdutoBusca[]>([]);
  const [pErro, setPErro] = useState<string | null>(null);

  const [sQ, setSQ] = useState("");
  const [sCodigo, setSCodigo] = useState("");
  const [sLoading, setSLoading] = useState(false);
  const [sResultados, setSResultados] = useState<ServicoBusca[]>([]);
  const [sErro, setSErro] = useState<string | null>(null);

  // Carrinhos
  const [itensProduto, setItensProduto] = useState<ItemProduto[]>([]);
  const [itensServico, setItensServico] = useState<ItemServico[]>([]);

  // Totais
  const totalProdutos = useMemo(() => itensProduto.reduce((acc, it) => acc + toNum(it.subtotal), 0), [itensProduto]);
  const totalServicos = useMemo(() => itensServico.reduce((acc, it) => acc + toNum(it.subtotal), 0), [itensServico]);

  // Notifica o dialog-shell via onTotaisChange (o footer usa isso)
  useEffect(() => {
    onTotaisChange?.({ totalProdutos, totalServicos });
  }, [totalProdutos, totalServicos, onTotaisChange]);

  /* ------------------------------ Carregar OS ------------------------------ */
  useEffect(() => {
    if (!osId) return;
    let cancel = false;
    async function load() {
      try {
        const r = await fetch(`/api/ordens/${osId}/orcamento`, { cache: "no-store" });
        const j = await r.json();
        if (!r.ok) throw new Error(j?.error || "Falha ao carregar orçamento");
        if (cancel) return;

        const produtos: ItemProduto[] = (j?.produtos ?? []).map((p: any) => ({
          produtoid: Number(p.produtoid),
          descricao: String(p.descricao ?? ""),
          quantidade: toNum(p.quantidade || 1),
          precounitario: toNum(p.precounitario || 0),
          subtotal: toNum(p.subtotal || (p.quantidade || 1) * (p.precounitario || 0)),
        }));

        const servicos: ItemServico[] = (j?.servicos ?? []).map((s: any) => ({
          servicoid: Number(s.servicoid),
          descricao: String(s.descricao ?? ""),
          quantidade: toNum(s.quantidade || 1),
          precounitario: toNum(s.precounitario || 0),
          subtotal: toNum(s.subtotal || (s.quantidade || 1) * (s.precounitario || 0)),
        }));

        setItensProduto(produtos);
        setItensServico(servicos);
      } catch (e: any) {
        console.error(e);
      }
    }
    load();
    return () => {
      cancel = true;
    };
  }, [osId]);

  /* --------------------------------- Buscar -------------------------------- */
  const buscarProdutos = useCallback(async () => {
    try {
      setPLoading(true);
      setPErro(null);
      const url = new URL("/api/produtos/buscar", window.location.origin);
      if (pQ.trim()) url.searchParams.set("q", pQ.trim());
      if (pCodigo.trim()) url.searchParams.set("codigo", pCodigo.trim());
      const r = await fetch(url.toString(), { cache: "no-store" });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || "Erro ao buscar produtos");
      setPResultados(Array.isArray(j?.produtos) ? j.produtos : []);
    } catch (e: any) {
      setPErro(e?.message ?? "Erro ao buscar produtos");
      setPResultados([]);
    } finally {
      setPLoading(false);
    }
  }, [pQ, pCodigo]);

  const buscarServicos = useCallback(async () => {
    try {
      setSLoading(true);
      setSErro(null);
      const url = new URL("/api/servicos/buscar", window.location.origin);
      if (sQ.trim()) url.searchParams.set("q", sQ.trim());
      if (sCodigo.trim()) url.searchParams.set("codigo", sCodigo.trim());
      const r = await fetch(url.toString(), { cache: "no-store" });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || "Erro ao buscar serviços");
      setSResultados(Array.isArray(j?.servicos) ? j.servicos : []);
    } catch (e: any) {
      setSErro(e?.message ?? "Erro ao buscar serviços");
      setSResultados([]);
    } finally {
      setSLoading(false);
    }
  }, [sQ, sCodigo]);

  /* ------------------------------- Adicionar -------------------------------- */
  const addProduto = (p: ProdutoBusca) => {
    setItensProduto((prev) => {
      const idx = prev.findIndex((x) => x.produtoid === p.id);
      if (idx >= 0) {
        const novo = [...prev];
        const q = novo[idx].quantidade + 1;
        const pu = novo[idx].precounitario || p.precounitario || 0;
        novo[idx] = { ...novo[idx], quantidade: q, precounitario: pu, subtotal: q * pu };
        return novo;
      }
      const pu = toNum(p.precounitario || 0);
      return [...prev, { produtoid: p.id, descricao: p.descricao, quantidade: 1, precounitario: pu, subtotal: pu }];
    });
  };

  const addServico = (s: ServicoBusca) => {
    setItensServico((prev) => {
      const idx = prev.findIndex((x) => x.servicoid === s.id);
      if (idx >= 0) {
        const novo = [...prev];
        const q = novo[idx].quantidade + 1;
        const pu = novo[idx].precounitario || s.precohora || 0;
        novo[idx] = { ...novo[idx], quantidade: q, precounitario: pu, subtotal: q * pu };
        return novo;
      }
      const pu = toNum(s.precohora || 0);
      return [...prev, { servicoid: s.id, descricao: s.descricao, quantidade: 1, precounitario: pu, subtotal: pu }];
    });
  };

  /* ----------------------------- Editar/Remover ----------------------------- */
  const updateProduto = (i: number, patch: Partial<ItemProduto>) => {
    setItensProduto((prev) => {
      const novo = [...prev];
      const base = { ...novo[i], ...patch };
      const q = toNum(base.quantidade || 1);
      const pu = toNum(base.precounitario || 0);
      base.quantidade = q;
      base.precounitario = pu;
      base.subtotal = q * pu;
      novo[i] = base;
      return novo;
    });
  };

  const updateServico = (i: number, patch: Partial<ItemServico>) => {
    setItensServico((prev) => {
      const novo = [...prev];
      const base = { ...novo[i], ...patch };
      const q = toNum(base.quantidade || 1);
      const pu = toNum(base.precounitario || 0);
      base.quantidade = q;
      base.precounitario = pu;
      base.subtotal = q * pu;
      novo[i] = base;
      return novo;
    });
  };

  const removeProduto = (i: number) => setItensProduto((prev) => prev.filter((_, idx) => idx !== i));
  const removeServico = (i: number) => setItensServico((prev) => prev.filter((_, idx) => idx !== i));

  /* ----------------------------------- UI ---------------------------------- */
  return (
    <div className="space-y-6">
      {/* CAPA / CONTEXTO */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            <CardTitle className="text-base sm:text-lg">
              Orçamento • OS {ordemServico?.numero ?? ordemServico?.id ?? "—"}
            </CardTitle>
          </div>
          <CardDescription className="text-sm">
            {[ordemServico?.cliente, ordemServico?.veiculo].filter(Boolean).join(" • ") || "—"}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* BUSCA E RESULTADOS */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            <CardTitle className="text-base sm:text-lg">Adicionar itens</CardTitle>
          </div>
          <CardDescription>Pesquise e inclua produtos e serviços no orçamento.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Tabs centralizadas com espaçamento equilibrado */}
          <Tabs value={aba} onValueChange={(v) => setAba(v as any)} className="w-full">
            <TabsList className="flex w-auto gap-4 rounded-xl bg-muted/60">
              <TabsTrigger
                value="produtos"
                className="min-w-[160px] h-9 text-[0.95rem] data-[state=active]:font-semibold"
              >
                Produtos
              </TabsTrigger>
              <TabsTrigger
                value="servicos"
                className="min-w-[160px] h-9 text-[0.95rem] data-[state=active]:font-semibold"
              >
                Serviços
              </TabsTrigger>
            </TabsList>

            <TabsContent value="produtos" className="space-y-4">
              {/* Linha fluída, 100% de largura, responsiva */}
              <div className="flex flex-wrap items-end gap-3">
                <div className="flex-1 min-w-[240px] space-y-1.5">
                  <Label>Pesquisar por descrição / título / referência / EAN</Label>
                  <Input
                    value={pQ}
                    onChange={(e) => setPQ(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && buscarProdutos()}
                    placeholder="Ex.: filtro de óleo, 789..."
                    className="h-10"
                  />
                </div>

                <div className="w-full sm:w-56 space-y-1.5">
                  <Label>Código</Label>
                  <Input
                    value={pCodigo}
                    onChange={(e) => setPCodigo(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && buscarProdutos()}
                    placeholder="Ex.: P-000123"
                    className="h-10"
                  />
                </div>

                <div className="w-full sm:w-40">
                  <Button className="w-full h-10" onClick={buscarProdutos} disabled={pLoading}>
                    {pLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                    Buscar
                  </Button>
                </div>
              </div>

              {pErro && <div className="text-sm text-red-600">{pErro}</div>}

              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50%]">Produto</TableHead>
                      <TableHead className="w-[16%]">Código</TableHead>
                      <TableHead className="w-[18%] text-right">Preço</TableHead>
                      <TableHead className="w-[10%] text-center">Estoque</TableHead>
                      <TableHead className="w-[6%] text-center">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pResultados.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                          Nenhum produto encontrado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      pResultados.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="pr-4">{p.descricao}</TableCell>
                          <TableCell>{p.codigo}</TableCell>
                          <TableCell className="text-right tabular-nums">{money(p.precounitario)}</TableCell>
                          <TableCell className="text-center">{p.estoque}</TableCell>
                          <TableCell className="text-center">
                            <Button size="icon" variant="outline" onClick={() => addProduto(p)} title="Adicionar">
                              <Plus className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="servicos" className="space-y-4">
              <div className="flex flex-wrap items-end gap-3">
                <div className="flex-1 min-w-[240px] space-y-1.5">
                  <Label>Pesquisar por descrição / CNAE / item da lista</Label>
                  <Input
                    value={sQ}
                    onChange={(e) => setSQ(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && buscarServicos()}
                    placeholder="Ex.: revisão, alinhamento..."
                    className="h-10"
                  />
                </div>

                <div className="w-full sm:w-56 space-y-1.5">
                  <Label>Código</Label>
                  <Input
                    value={sCodigo}
                    onChange={(e) => setSCodigo(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && buscarServicos()}
                    placeholder="Ex.: S-000321"
                    className="h-10"
                  />
                </div>

                <div className="w-full sm:w-40">
                  <Button className="w-full h-10" onClick={buscarServicos} disabled={sLoading}>
                    {sLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                    Buscar
                  </Button>
                </div>
              </div>

              {sErro && <div className="text-sm text-red-600">{sErro}</div>}

              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[58%]">Serviço</TableHead>
                      <TableHead className="w-[18%]">Código</TableHead>
                      <TableHead className="w-[18%] text-right">Preço base</TableHead>
                      <TableHead className="w-[6%] text-center">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sResultados.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                          Nenhum serviço encontrado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      sResultados.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell className="pr-4">{s.descricao}</TableCell>
                          <TableCell>{s.codigo}</TableCell>
                          <TableCell className="text-right tabular-nums">{money(s.precohora)}</TableCell>
                          <TableCell className="text-center">
                            <Button size="icon" variant="outline" onClick={() => addServico(s)} title="Adicionar">
                              <Plus className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* ITENS ADICIONADOS */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-primary" />
            <CardTitle className="text-base sm:text-lg">Itens do orçamento</CardTitle>
          </div>
          <CardDescription>Use os botões para ajustar quantidade. Preço é fixo.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Produtos */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Produtos</Label>
              <Badge variant="outline" className="font-normal">
                {itensProduto.length} item(ns)
              </Badge>
            </div>

            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[48%]">Descrição</TableHead>
                    <TableHead className="w-[20%] text-center">Quantidade</TableHead>
                    <TableHead className="w-[16%] text-right">Preço unit.</TableHead>
                    <TableHead className="w-[12%] text-right">Subtotal</TableHead>
                    <TableHead className="w-[4%] text-center">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itensProduto.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                        Nenhum produto adicionado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    itensProduto.map((it, i) => (
                      <TableRow key={`${it.produtoid}-${i}`}>
                        <TableCell className="pr-4">{it.descricao}</TableCell>
                        <TableCell className="text-center">
                          <QtyInput
                            value={it.quantidade}
                            onChange={(n) => updateProduto(i, { quantidade: n })}
                            min={0}
                          />
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{money(it.precounitario)}</TableCell>
                        <TableCell className="text-right tabular-nums">{money(it.subtotal)}</TableCell>
                        <TableCell className="text-center">
                          <Button size="icon" variant="ghost" onClick={() => removeProduto(i)} title="Remover">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <Separator />

          {/* Serviços */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Serviços</Label>
              <Badge variant="outline" className="font-normal">
                {itensServico.length} item(ns)
              </Badge>
            </div>

            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[48%]">Descrição</TableHead>
                    <TableHead className="w-[20%] text-center">Quantidade</TableHead>
                    <TableHead className="w-[16%] text-right">Preço unit.</TableHead>
                    <TableHead className="w-[12%] text-right">Subtotal</TableHead>
                    <TableHead className="w-[4%] text-center">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itensServico.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                        Nenhum serviço adicionado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    itensServico.map((it, i) => (
                      <TableRow key={`${it.servicoid}-${i}`}>
                        <TableCell className="pr-4">{it.descricao}</TableCell>
                        <TableCell className="text-center">
                          <QtyInput
                            value={it.quantidade}
                            onChange={(n) => updateServico(i, { quantidade: n })}
                            min={0}
                          />
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{money(it.precounitario)}</TableCell>
                        <TableCell className="text-right tabular-nums">{money(it.subtotal)}</TableCell>
                        <TableCell className="text-center">
                          <Button size="icon" variant="ghost" onClick={() => removeServico(i)} title="Remover">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Removido: resumo de totais (footer do dialog já mostra) */}
        </CardContent>
      </Card>
    </div>
  );
}

export default OrcamentoForm;
