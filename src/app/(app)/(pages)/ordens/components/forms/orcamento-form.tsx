"use client";

import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Search, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ===== Tipos de dados =====
type Produto = {
  id: number;
  codigo: string;
  descricao: string;
  precounitario: number;
  estoque?: number | null;
};

type Servico = {
  id: number;
  codigo: string;
  descricao: string;
  precohora: number;
};

type LinhaProduto = {
  id: string;          // uuid local da linha
  produtoid?: number | null;
  codigo?: string;
  descricao: string;
  quantidade: number;
  precounitario: number;
};

type LinhaServico = {
  id: string;          // uuid local da linha
  servicoid?: number | null;
  codigo?: string;
  descricao: string;
  quantidade: number;
  precounitario: number;
};

export type OrcamentoFormProps = {
  ordemServico: {
    id: number;
    numero: string;
    cliente?: string;
    veiculo?: string;
  };
  onGerarOrcamento: () => void;
  onEnviarFinanceiro: () => void;

  /** Novo: informa totais ao diálogo para exibir no footer fixo */
  onTotaisChange?: (totais: {
    totalProdutos: number;
    totalServicos: number;
    totalGeral: number;
  }) => void;
};

// ===== Helpers =====
const money = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v) || 0);

const uid = () => Math.random().toString(36).substring(2, 9);

export function OrcamentoForm({
  ordemServico,
  onGerarOrcamento,
  onEnviarFinanceiro,
  onTotaisChange,
}: OrcamentoFormProps) {
  // Carrinho
  const [produtos, setProdutos] = useState<LinhaProduto[]>([]);
  const [servicos, setServicos] = useState<LinhaServico[]>([]);

  // Busca Produtos
  const [pTermo, setPTermo] = useState("");
  const [pCodigo, setPCodigo] = useState("");
  const [pLoading, setPLoading] = useState(false);
  const [pErro, setPErro] = useState<string | null>(null);
  const [pResultados, setPResultados] = useState<Produto[]>([]);

  // Busca Serviços
  const [sTermo, setSTermo] = useState("");
  const [sCodigo, setSCodigo] = useState("");
  const [sLoading, setSLoading] = useState(false);
  const [sErro, setSErro] = useState<string | null>(null);
  const [sResultados, setSResultados] = useState<Servico[]>([]);

  // ===== Operações Carrinho (sem inserção manual direta) =====
  const rmProduto = (id: string) => setProdutos((lst) => lst.filter((l) => l.id !== id));
  const rmServico = (id: string) => setServicos((lst) => lst.filter((l) => l.id !== id));

  const updateProduto = (id: string, patch: Partial<LinhaProduto>) =>
    setProdutos((lst) => lst.map((l) => (l.id === id ? { ...l, ...patch } : l)));

  const updateServico = (id: string, patch: Partial<LinhaServico>) =>
    setServicos((lst) => lst.map((l) => (l.id === id ? { ...l, ...patch } : l)));

  // Adicionar a partir do resultado de busca (mescla itens iguais)
  const addProdutoFromResult = (p: Produto) => {
    setProdutos((lst) => {
      const idx = lst.findIndex((l) => l.produtoid === p.id);
      if (idx >= 0) {
        const novo = [...lst];
        const item = { ...novo[idx] };
        item.quantidade = Number(item.quantidade || 0) + 1;
        novo[idx] = item;
        return novo;
      }
      return [
        ...lst,
        {
          id: uid(),
          produtoid: p.id,
          codigo: p.codigo,
          descricao: p.descricao,
          quantidade: 1,
          precounitario: Number(p.precounitario) || 0,
        },
      ];
    });
  };

  const addServicoFromResult = (s: Servico) => {
    setServicos((lst) => {
      const idx = lst.findIndex((l) => l.servicoid === s.id);
      if (idx >= 0) {
        const novo = [...lst];
        const item = { ...novo[idx] };
        item.quantidade = Number(item.quantidade || 0) + 1;
        novo[idx] = item;
        return novo;
      }
      return [
        ...lst,
        {
          id: uid(),
          servicoid: s.id,
          codigo: s.codigo,
          descricao: s.descricao,
          quantidade: 1,
          precounitario: Number(s.precohora) || 0,
        },
      ];
    });
  };

  // Totais
  const totalProdutos = useMemo(
    () => produtos.reduce((acc, l) => acc + (Number(l.quantidade) || 0) * (Number(l.precounitario) || 0), 0),
    [produtos]
  );
  const totalServicos = useMemo(
    () => servicos.reduce((acc, l) => acc + (Number(l.quantidade) || 0) * (Number(l.precounitario) || 0), 0),
    [servicos]
  );
  const totalGeral = totalProdutos + totalServicos;

  // Envia totais pro diálogo (footer fixo)
  useEffect(() => {
    onTotaisChange?.({ totalProdutos, totalServicos, totalGeral });
  }, [onTotaisChange, totalProdutos, totalServicos, totalGeral]);

  // ===== Buscas (AJUSTE as rotas conforme sua API) =====
  async function buscarProdutos() {
    setPLoading(true);
    setPErro(null);
    try {
      const url = new URL("/api/produtos/search", window.location.origin);
      if (pTermo) url.searchParams.set("q", pTermo);
      if (pCodigo) url.searchParams.set("codigo", pCodigo);
      const r = await fetch(url.toString(), { cache: "no-store" });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || "Falha ao buscar produtos.");
      setPResultados(j?.produtos ?? []);
    } catch (e: any) {
      setPErro(e?.message ?? "Erro na consulta.");
      setPResultados([]);
    } finally {
      setPLoading(false);
    }
  }

  async function buscarServicos() {
    setSLoading(true);
    setSErro(null);
    try {
      const url = new URL("/api/servicos/search", window.location.origin);
      if (sTermo) url.searchParams.set("q", sTermo);
      if (sCodigo) url.searchParams.set("codigo", sCodigo);
      const r = await fetch(url.toString(), { cache: "no-store" });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || "Falha ao buscar serviços.");
      setSResultados(j?.servicos ?? []);
    } catch (e: any) {
      setSErro(e?.message ?? "Erro na consulta.");
      setSResultados([]);
    } finally {
      setSLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* CONTEXTO DA OS */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base sm:text-lg">OS {ordemServico.numero}</CardTitle>
          <CardDescription className="text-sm">
            {ordemServico.cliente ? `Cliente: ${ordemServico.cliente} • ` : ""}
            {ordemServico.veiculo ? `Veículo: ${ordemServico.veiculo}` : ""}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* BUSCA E ADIÇÃO */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">Adicionar Itens</CardTitle>
          <CardDescription>Pesquise e adicione produtos ou serviços à OS.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <Tabs defaultValue="produtos" className="w-full">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="produtos" className="sm:min-w-[140px]">Produtos</TabsTrigger>
              <TabsTrigger value="servicos" className="sm:min-w-[140px]">Serviços</TabsTrigger>
            </TabsList>

            {/* PRODUTOS */}
            <TabsContent value="produtos" className="space-y-3">
              {/* Filtros */}
              <div className="grid grid-cols-1 md:grid-cols-[1fr_280px_auto] gap-3">
                <Input
                  value={pTermo}
                  onChange={(e) => setPTermo(e.target.value)}
                  placeholder="Buscar por descrição, NCM, CFOP…"
                  className="h-10"
                  onKeyDown={(e) => e.key === "Enter" && buscarProdutos()}
                />
                <Input
                  value={pCodigo}
                  onChange={(e) => setPCodigo(e.target.value)}
                  placeholder="Código / EAN"
                  className="h-10"
                  onKeyDown={(e) => e.key === "Enter" && buscarProdutos()}
                />
                <div className="flex gap-2">
                  <Button className="h-10 w-full sm:w-auto" onClick={buscarProdutos} disabled={pLoading}>
                    {pLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                    Buscar
                  </Button>
                  <Button
                    variant="outline"
                    className="h-10 w-full sm:w-auto bg-transparent"
                    onClick={() => { setPTermo(""); setPCodigo(""); setPResultados([]); setPErro(null); }}
                  >
                    Limpar
                  </Button>
                </div>
              </div>

              {/* Resultados */}
              <div className="rounded-md border border-border overflow-hidden">
                <div className="max-h-[40vh] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[120px]">Código</TableHead>
                        <TableHead className="min-w-[280px]">Descrição</TableHead>
                        <TableHead className="min-w-[120px] text-right">Preço</TableHead>
                        <TableHead className="min-w-[110px] text-center">Estoque</TableHead>
                        <TableHead className="min-w-[120px] text-center">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pLoading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            <Loader2 className="h-5 w-5 mr-2 inline animate-spin" />
                            Carregando produtos…
                          </TableCell>
                        </TableRow>
                      ) : pErro ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6 text-destructive">
                            {pErro}
                          </TableCell>
                        </TableRow>
                      ) : pResultados.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                            Nenhum produto encontrado.
                          </TableCell>
                        </TableRow>
                      ) : (
                        pResultados.map((p) => (
                          <TableRow key={p.id}>
                            <TableCell className="font-medium">{p.codigo}</TableCell>
                            <TableCell>{p.descricao}</TableCell>
                            <TableCell className="text-right">{money(Number(p.precounitario) || 0)}</TableCell>
                            <TableCell className="text-center">
                              {typeof p.estoque === "number" ? (
                                <Badge
                                  variant="secondary"
                                  className={cn(
                                    "text-xs",
                                    p.estoque <= 0 && "bg-destructive/20 text-destructive",
                                    p.estoque > 0 && p.estoque <= 3 && "bg-amber-500/20 text-amber-500",
                                    p.estoque > 3 && "bg-emerald-500/20 text-emerald-500"
                                  )}
                                >
                                  {p.estoque}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <Button size="sm" onClick={() => addProdutoFromResult(p)}>
                                <Plus className="h-4 w-4 mr-1.5" />
                                Adicionar
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>

            {/* SERVIÇOS */}
            <TabsContent value="servicos" className="space-y-3">
              {/* Filtros */}
              <div className="grid grid-cols-1 md:grid-cols-[1fr_280px_auto] gap-3">
                <Input
                  value={sTermo}
                  onChange={(e) => setSTermo(e.target.value)}
                  placeholder="Buscar por descrição, CNAE, item…"
                  className="h-10"
                  onKeyDown={(e) => e.key === "Enter" && buscarServicos()}
                />
                <Input
                  value={sCodigo}
                  onChange={(e) => setSCodigo(e.target.value)}
                  placeholder="Código do serviço"
                  className="h-10"
                  onKeyDown={(e) => e.key === "Enter" && buscarServicos()}
                />
                <div className="flex gap-2">
                  <Button className="h-10 w-full sm:w-auto" onClick={buscarServicos} disabled={sLoading}>
                    {sLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                    Buscar
                  </Button>
                  <Button
                    variant="outline"
                    className="h-10 w-full sm:w-auto bg-transparent"
                    onClick={() => { setSTermo(""); setSCodigo(""); setSResultados([]); setSErro(null); }}
                  >
                    Limpar
                  </Button>
                </div>
              </div>

              {/* Resultados */}
              <div className="rounded-md border border-border overflow-hidden">
                <div className="max-h-[40vh] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[120px]">Código</TableHead>
                        <TableHead className="min-w-[320px]">Descrição</TableHead>
                        <TableHead className="min-w-[140px] text-right">Preço/Hora</TableHead>
                        <TableHead className="min-w-[120px] text-center">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sLoading ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8">
                            <Loader2 className="h-5 w-5 mr-2 inline animate-spin" />
                            Carregando serviços…
                          </TableCell>
                        </TableRow>
                      ) : sErro ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-6 text-destructive">
                            {sErro}
                          </TableCell>
                        </TableRow>
                      ) : sResultados.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                            Nenhum serviço encontrado.
                          </TableCell>
                        </TableRow>
                      ) : (
                        sResultados.map((s) => (
                          <TableRow key={s.id}>
                            <TableCell className="font-medium">{s.codigo}</TableCell>
                            <TableCell>{s.descricao}</TableCell>
                            <TableCell className="text-right">{money(Number(s.precohora) || 0)}</TableCell>
                            <TableCell className="text-center">
                              <Button size="sm" onClick={() => addServicoFromResult(s)}>
                                <Plus className="h-4 w-4 mr-1.5" />
                                Adicionar
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* CARRINHO: PRODUTOS */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">Produtos adicionados</CardTitle>
          <CardDescription>Edite quantidades e preços conforme necessário.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px]">Código</TableHead>
                  <TableHead className="min-w-[280px]">Descrição</TableHead>
                  <TableHead className="min-w-[110px] text-right">Qtd.</TableHead>
                  <TableHead className="min-w-[160px] text-right">Preço Unit.</TableHead>
                  <TableHead className="min-w-[160px] text-right">Subtotal</TableHead>
                  <TableHead className="min-w-[90px] text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {produtos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Nenhum produto adicionado.
                    </TableCell>
                  </TableRow>
                ) : (
                  produtos.map((l) => {
                    const subtotal = (Number(l.quantidade) || 0) * (Number(l.precounitario) || 0);
                    return (
                      <TableRow key={l.id}>
                        <TableCell>
                          <Input
                            value={l.codigo ?? ""}
                            onChange={(e) => updateProduto(l.id, { codigo: e.target.value })}
                            placeholder="Código/EAN"
                            className="h-9"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={l.descricao}
                            onChange={(e) => updateProduto(l.id, { descricao: e.target.value })}
                            placeholder="Descrição do produto"
                            className="h-9"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Input
                            inputMode="numeric"
                            className="text-right h-9"
                            value={String(l.quantidade)}
                            onChange={(e) =>
                              updateProduto(l.id, { quantidade: Number(e.target.value.replace(/\D/g, "")) || 0 })
                            }
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Input
                            inputMode="decimal"
                            className="text-right h-9"
                            value={String(l.precounitario)}
                            onChange={(e) =>
                              updateProduto(l.id, { precounitario: Number(e.target.value.replace(",", ".")) || 0 })
                            }
                          />
                        </TableCell>
                        <TableCell className="text-right font-medium">{money(subtotal)}</TableCell>
                        <TableCell className="text-center">
                          <Button variant="ghost" size="icon" onClick={() => rmProduto(l.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end pt-4">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Total de Produtos</div>
              <div className="text-lg font-semibold">{money(totalProdutos)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CARRINHO: SERVIÇOS */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">Serviços adicionados</CardTitle>
          <CardDescription>Edite quantidades e preços conforme necessário.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px]">Código</TableHead>
                  <TableHead className="min-w-[320px]">Descrição</TableHead>
                  <TableHead className="min-w-[110px] text-right">Qtd.</TableHead>
                  <TableHead className="min-w-[160px] text-right">Preço Unit.</TableHead>
                  <TableHead className="min-w-[160px] text-right">Subtotal</TableHead>
                  <TableHead className="min-w-[90px] text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {servicos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Nenhum serviço adicionado.
                    </TableCell>
                  </TableRow>
                ) : (
                  servicos.map((l) => {
                    const subtotal = (Number(l.quantidade) || 0) * (Number(l.precounitario) || 0);
                    return (
                      <TableRow key={l.id}>
                        <TableCell>
                          <Input
                            value={l.codigo ?? ""}
                            onChange={(e) => updateServico(l.id, { codigo: e.target.value })}
                            placeholder="Código/Serviço"
                            className="h-9"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={l.descricao}
                            onChange={(e) => updateServico(l.id, { descricao: e.target.value })}
                            placeholder="Descrição do serviço"
                            className="h-9"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Input
                            inputMode="numeric"
                            className="text-right h-9"
                            value={String(l.quantidade)}
                            onChange={(e) =>
                              updateServico(l.id, { quantidade: Number(e.target.value.replace(/\D/g, "")) || 0 })
                            }
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Input
                            inputMode="decimal"
                            className="text-right h-9"
                            value={String(l.precounitario)}
                            onChange={(e) =>
                              updateServico(l.id, { precounitario: Number(e.target.value.replace(",", ".")) || 0 })
                            }
                          />
                        </TableCell>
                        <TableCell className="text-right font-medium">{money(subtotal)}</TableCell>
                        <TableCell className="text-center">
                          <Button variant="ghost" size="icon" onClick={() => rmServico(l.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end pt-4">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Total de Serviços</div>
              <div className="text-lg font-semibold">{money(totalServicos)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      
      
    </div>
  );
}
