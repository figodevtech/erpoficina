// src/app/(app)/(pages)/ordens/forms/ordem-form.tsx
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";

/** Tipos mínimos */
type Cliente = { id: number; nome: string; telefone?: string | null; email?: string | null; documento?: string | null };
type Veiculo = { id: number; clienteid: number; placa: string; modelo: string; ano?: number | null };
type ChecklistTemplateModel = {
  id: string;
  nome: string;
  itens: { titulo: string; descricao?: string | null; obrigatorio?: boolean }[];
};
type Marcacao = "OK" | "NOK" | "NA" | "";

/** Props */
export type FormularioNovaOSProps = {
  onSubmit?: (payload: any) => void;
  mode?: "create";
  exposeSubmit?: (fn: () => void) => void;
};

/** Sentinela para Select */
const NONE = "__none__";

export function FormularioNovaOS({ onSubmit, exposeSubmit }: FormularioNovaOSProps) {
  // campos
  const [tipoOS, setTipoOS] = useState<string>("");
  const [setor, setSetor] = useState<string>("");
  const [descricao, setDescricao] = useState<string>("");
  const [observacoes, setObservacoes] = useState<string>("");

  const [modoAtendimento, setModoAtendimento] = useState<"cadastrado" | "avulso">("cadastrado");

  const [cpfBusca, setCpfBusca] = useState("");
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [veiculosDoCliente, setVeiculosDoCliente] = useState<Veiculo[]>([]);
  const [veiculoSelecionadoId, setVeiculoSelecionadoId] = useState<number | null>(null);
  const [buscandoCliente, setBuscandoCliente] = useState(false);
  const [erroCliente, setErroCliente] = useState<string | null>(null);

  const [avulsoNome, setAvulsoNome] = useState<string>("");
  const [avulsoDoc, setAvulsoDoc] = useState<string>("");
  const [avulsoTelefone, setAvulsoTelefone] = useState<string>("");
  const [avulsoEmail, setAvulsoEmail] = useState<string>("");

  // modelos de checklist
  const [templates, setTemplates] = useState<ChecklistTemplateModel[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [templatesError, setTemplatesError] = useState<string | null>(null);
  const [templateId, setTemplateId] = useState<string>("");
  const [templateItems, setTemplateItems] = useState<ChecklistTemplateModel["itens"]>([]);
  const [checklist, setChecklist] = useState<Record<string, Marcacao>>({});

  // setores (dinâmico)
  const [setores, setSetores] = useState<Array<{ id: number; nome: string }>>([]);
  const [loadingSetores, setLoadingSetores] = useState(false);
  const [setoresError, setSetoresError] = useState<string | null>(null);

  /** Carregar setores do backend */
  useEffect(() => {
    (async () => {
      try {
        setLoadingSetores(true);
        setSetoresError(null);
        const r = await fetch("/api/setores", { cache: "no-store" });
        const j = await r.json();
        const items: Array<{ id: number; nome: string }> = Array.isArray(j) ? j : j?.items ?? [];
        setSetores(items);
      } catch (e: any) {
        setSetoresError(e?.message ?? "Falha ao carregar setores.");
        setSetores([]);
      } finally {
        setLoadingSetores(false);
      }
    })();
  }, []);

  /** Carregar modelos de checklist */
  useEffect(() => {
    const load = async () => {
      try {
        setLoadingTemplates(true);
        setTemplatesError(null);
        const url = new URL("/api/checklist-modelos", window.location.origin);
        url.searchParams.set("ativos", "1");
        const r = await fetch(url.toString(), { cache: "no-store" });
        const j = await r.json();
        const items: ChecklistTemplateModel[] = Array.isArray(j) ? j : Array.isArray(j?.items) ? j.items : [];
        setTemplates(items);
      } catch (e: any) {
        setTemplatesError(e?.message ?? "Falha ao carregar modelos de checklist.");
      } finally {
        setLoadingTemplates(false);
      }
    };
    load();
  }, []);

  const applyTemplate = useCallback(
    (id: string) => {
      setTemplateId(id);
      const tpl = templates.find((t) => t.id === id);
      const itens = tpl?.itens ?? [];
      setTemplateItems(itens);
      const novo: Record<string, Marcacao> = {};
      itens.forEach((it) => {
        if (it?.titulo) novo[it.titulo] = "";
      });
      setChecklist(novo);
    },
    [templates]
  );

  useEffect(() => {
    if (!templateId || templates.length === 0) return;
    const tpl = templates.find((t) => t.id === templateId);
    const itens = tpl?.itens ?? [];
    setTemplateItems(itens);
    const novo: Record<string, Marcacao> = {};
    itens.forEach((it) => {
      if (it?.titulo) novo[it.titulo] = "";
    });
    setChecklist(novo);
  }, [templateId, templates]);

  const toggleChecklist = (itemTitulo: string, valor: Marcacao) => {
    setChecklist((prev) => {
      const atual = prev[itemTitulo] ?? "";
      const novo = atual === valor ? "" : valor;
      return { ...prev, [itemTitulo]: novo as Marcacao };
    });
  };

  // busca cliente
  const veiculoOptions = useMemo(
    () =>
      veiculosDoCliente.map((v) => ({
        value: String(v.id),
        label: `${v.modelo} - ${v.placa}${v.ano ? ` (${v.ano})` : ""}`,
      })),
    [veiculosDoCliente]
  );

  const buscarClientePorCPF = async () => {
    const cpf = cpfBusca.replace(/\D/g, "");
    if (!cpf || cpf.length < 11) {
      setErroCliente("Informe um CPF válido (11 dígitos).");
      return;
    }

    setErroCliente(null);
    setBuscandoCliente(true);
    setCliente(null);
    setVeiculosDoCliente([]);
    setVeiculoSelecionadoId(null);

    try {
      const url = new URL("/api/clientes/by-cpf", window.location.origin);
      url.searchParams.set("cpf", cpf);
      const r = await fetch(url.toString(), { cache: "no-store" });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || "Não foi possível buscar o cliente.");

      const c: Cliente | null = j?.cliente ?? null;
      setCliente(c);

      if (c) {
        const vUrl = new URL("/api/veiculos/by-cliente", window.location.origin);
        vUrl.searchParams.set("clienteid", String(c.id));
        const rV = await fetch(vUrl.toString(), { cache: "no-store" });
        const jV = await rV.json();
        if (!rV.ok) throw new Error(jV?.error || "Falha ao buscar veículos.");
        setVeiculosDoCliente(jV?.veiculos ?? []);
      } else {
        setErroCliente("Cliente não encontrado.");
      }
    } catch (e: any) {
      setErroCliente(e?.message ?? "Erro na consulta.");
    } finally {
      setBuscandoCliente(false);
    }
  };

  // expose submit
  useEffect(() => {
    exposeSubmit?.(salvar);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    tipoOS,
    setor,
    descricao,
    observacoes,
    modoAtendimento,
    cliente,
    veiculosDoCliente,
    veiculoSelecionadoId,
    templateId,
    templateItems,
    checklist,
    avulsoNome,
    avulsoDoc,
    avulsoTelefone,
    avulsoEmail,
  ]);

  const salvar = () => {
    if (!tipoOS || !setor) {
      alert("Selecione Tipo de OS e Setor responsável.");
      return;
    }
    if (modoAtendimento === "cadastrado") {
      if (!cliente) {
        alert("Busque o cliente e selecione um veículo (se houver).");
        return;
      }
    } else {
      if (!avulsoNome || !avulsoDoc) {
        alert("Preencha Nome e CPF/CNPJ para atendimento avulso.");
        return;
      }
    }

    const checklistArray = Object.entries(checklist).map(([item, status]) => ({ item, status }));
    const base = {
      tipoos: tipoOS,
      setorid: setor ? Number(setor) : null,
      descricao: descricao || null,
      observacoes: observacoes || null,
      checklistTemplateId: templateId || null,
      cliente:
        modoAtendimento === "cadastrado"
          ? { id: cliente!.id }
          : { nome: avulsoNome, documento: avulsoDoc, telefone: avulsoTelefone || null, email: avulsoEmail || null },
      veiculoid: veiculoSelecionadoId, // number | null
      checklist: checklistArray,
    };

    onSubmit?.(base);
  };

  return (
    <div className="space-y-6">
      {/* Cliente */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Dados do Cliente</CardTitle>
          <CardDescription>Busque por CPF ou cadastre como avulso.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Tipo de Atendimento</Label>
            <RadioGroup
              value={modoAtendimento}
              onValueChange={(v: "cadastrado" | "avulso") => setModoAtendimento(v)}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cadastrado" id="r-cadastrado" />
                <Label htmlFor="r-cadastrado" className="cursor-pointer">
                  Cliente Cadastrado
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="avulso" id="r-avulso" />
                <Label htmlFor="r-avulso" className="cursor-pointer">
                  Atendimento Avulso
                </Label>
              </div>
            </RadioGroup>
          </div>

          {modoAtendimento === "cadastrado" ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
                <div className="space-y-2">
                  <Label>CPF do cliente</Label>
                  <Input
                    inputMode="numeric"
                    placeholder="Somente números"
                    value={cpfBusca}
                    onChange={(e) => setCpfBusca(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && buscarClientePorCPF()}
                  />
                </div>
                <div className="flex items-end">
                  <Button className="w-full md:w-auto" onClick={buscarClientePorCPF} disabled={buscandoCliente}>
                    {buscandoCliente ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Buscando…
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Buscar
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {erroCliente && <div className="text-sm text-red-600">{erroCliente}</div>}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input value={cliente?.nome ?? ""} readOnly placeholder="—" />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input value={cliente?.telefone ?? ""} readOnly placeholder="—" />
                </div>
                <div className="space-y-2">
                  <Label>E-mail</Label>
                  <Input value={cliente?.email ?? ""} readOnly placeholder="—" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Veículo do cliente</Label>
                <Select
                  value={veiculoSelecionadoId === null ? NONE : String(veiculoSelecionadoId)}
                  onValueChange={(v) => setVeiculoSelecionadoId(v === NONE ? null : Number(v))}
                  disabled={!cliente || veiculoOptions.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        !cliente
                          ? "Busque o cliente"
                          : veiculoOptions.length
                          ? "Selecione um veículo"
                          : "Cliente sem veículos"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>Sem veículo</SelectItem>
                    {veiculoOptions.map((v) => (
                      <SelectItem key={v.value} value={v.value}>
                        {v.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Nome do Cliente</Label>
                <Input value={avulsoNome} onChange={(e) => setAvulsoNome(e.target.value)} placeholder="Nome completo" />
              </div>
              <div className="space-y-2">
                <Label>CPF/CNPJ</Label>
                <Input value={avulsoDoc} onChange={(e) => setAvulsoDoc(e.target.value)} placeholder="000.000.000-00" />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input
                  value={avulsoTelefone}
                  onChange={(e) => setAvulsoTelefone(e.target.value)}
                  placeholder="(99) 99999-9999"
                />
              </div>
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input
                  value={avulsoEmail}
                  onChange={(e) => setAvulsoEmail(e.target.value)}
                  placeholder="email@dominio.com"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Descrição */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">Descrição do Problema</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Descreva o problema…"
            className="min-h-[100px] resize-y"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Checklist */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base sm:text-lg">Checklist de Inspeção</CardTitle>
          <CardDescription>Selecione um modelo e marque os itens.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Modelo de Checklist</Label>
            <div className="flex items-center gap-2">
              <Select
                value={templateId}
                onValueChange={applyTemplate}
                disabled={loadingTemplates || (!!templatesError && templates.length === 0)}
              >
                <SelectTrigger className="h-10 w-full md:w-[380px] min-w-[260px] truncate">
                  <SelectValue
                    placeholder={
                      loadingTemplates
                        ? "Carregando…"
                        : templates.length
                        ? "Selecione um modelo"
                        : "Nenhum modelo disponível"
                    }
                    className="truncate"
                  />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={6} className="w-[var(--radix-select-trigger-width)]">
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id} className="truncate">
                      {t.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {templateId && (
                <Button
                  variant="outline"
                  className="shrink-0"
                  onClick={() => {
                    setTemplateId("");
                    setTemplateItems([]);
                    setChecklist({});
                  }}
                >
                  Limpar
                </Button>
              )}
            </div>
            {templatesError && <p className="text-sm text-red-500">{templatesError}</p>}
          </div>

          {templateItems.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {templateItems.map((it) => {
                const key = it.titulo ?? "";
                const marcado = checklist[key] ?? "";
                return (
                  <div key={key} className="p-3 rounded-lg border border-border bg-muted text-foreground">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-medium">{it.titulo}</div>
                        {it.descricao ? <div className="text-xs text-muted-foreground mt-1">{it.descricao}</div> : null}
                      </div>
                      {it.obrigatorio && (
                        <span className="text-xs px-2 py-0.5 rounded bg-destructive/15 text-destructive border border-destructive/20">
                          Obrigatório
                        </span>
                      )}
                    </div>
                    <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
                      <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                        <Checkbox
                          checked={marcado === "OK"}
                          onCheckedChange={() => toggleChecklist(key, "OK")}
                          className="h-5 w-5 border-2 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                        />
                        <span className="text-sm font-medium text-emerald-700">OK</span>
                      </label>
                      <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                        <Checkbox
                          checked={marcado === "NOK"}
                          onCheckedChange={() => toggleChecklist(key, "NOK")}
                          className="h-5 w-5 border-2 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                        />
                        <span className="text-sm font-medium text-red-700">NOK</span>
                      </label>
                      <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                        <Checkbox
                          checked={marcado === "NA"}
                          onCheckedChange={() => toggleChecklist(key, "NA")}
                          className="h-5 w-5 border-2 data-[state=checked]:bg-zinc-700 data-[state=checked]:border-zinc-700"
                        />
                        <span className="text-sm font-medium text-zinc-700">N/A</span>
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {templateId ? "Este modelo não possui itens." : "Selecione um modelo para exibir os itens do checklist."}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Observações */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">Observações</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Observações adicionais…"
            className="min-h-[80px] resize-y"
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Definições */}
      <div className="space-y-2 border rounded-lg p-3 md:p-4 bg-muted/40 border-border">
        <p className="text-sm font-medium text-foreground">Definições da OS</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label>Tipo de OS</Label>
            <Select value={tipoOS} onValueChange={setTipoOS}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" className="truncate" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ORCAMENTO">Orçamento</SelectItem>
                <SelectItem value="SERVICO">Serviço</SelectItem>
                <SelectItem value="GARANTIA">Garantia</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Setor responsável</Label>
            <Select
              value={setor}
              onValueChange={setSetor}
              disabled={loadingSetores || (!!setoresError && setores.length === 0)}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    loadingSetores
                      ? "Carregando setores…"
                      : setores.length
                      ? "Selecione o setor"
                      : "Nenhum setor disponível"
                  }
                  className="truncate"
                />
              </SelectTrigger>
              <SelectContent>
                {setores.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {setoresError && <p className="text-xs text-red-500">{setoresError}</p>}
          </div>

          {/* Coluna 3 deixada livre para futuros campos (ex.: prioridade) */}
          <div className="space-y-1.5">{/* espaço reservado */}</div>
        </div>
      </div>
      {/* sem botões internos */}
    </div>
  );
}
