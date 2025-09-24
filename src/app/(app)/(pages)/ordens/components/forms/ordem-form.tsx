"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, CarFront, User2, ClipboardList, Building2 } from "lucide-react";

type Cliente = {
  id: number;
  nomerazaosocial: string;
  email?: string | null;
  telefone?: string | null;
  cpfcnpj: string;
};

type Veiculo = {
  id: number;
  placa: string;
  modelo: string;
  marca: string;
  ano?: number | null;
  cor?: string | null;
  kmatual?: number | null;
};

type ChecklistTemplateModel = {
  id: string;
  nome: string;
  itens: { titulo: string; descricao?: string | null; obrigatorio?: boolean }[];
};

// ⚠️ Ajuste estes valores se o seu ENUM do banco for diferente
const CHECK_STATUS = ["OK", "NOK", "NA"] as const;
type Marcacao = typeof CHECK_STATUS[number] | "";

export type FormularioNovaOSProps = {
  onSubmit?: (payload: any) => void;
  exposeSubmit?: (fn: () => void) => void;
  
};

const NONE = "__none__";

export function FormularioNovaOS({ onSubmit, exposeSubmit }: FormularioNovaOSProps) {
  // Setores
  const [setores, setSetores] = useState<Array<{ id: number; nome: string }>>([]);
  const [loadingSetores, setLoadingSetores] = useState(false);
  const [setoresError, setSetoresError] = useState<string | null>(null);
  const [setor, setSetor] = useState<string>("");

  // Atendimento
  const [modoAtendimento, setModoAtendimento] = useState<"cadastrado" | "avulso">("cadastrado");

  // Cliente/Veículo
  const [docBusca, setDocBusca] = useState(""); // CPF/CNPJ
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [veiculosDoCliente, setVeiculosDoCliente] = useState<Veiculo[]>([]);
  const [veiculoSelecionadoId, setVeiculoSelecionadoId] = useState<number | null>(null);
  const [buscandoCliente, setBuscandoCliente] = useState(false);
  const [erroCliente, setErroCliente] = useState<string | null>(null);

  // Avulso
  const [avulsoNome, setAvulsoNome] = useState<string>("");
  const [avulsoDoc, setAvulsoDoc] = useState<string>("");
  const [avulsoTelefone, setAvulsoTelefone] = useState<string>("");
  const [avulsoEmail, setAvulsoEmail] = useState<string>("");

  // Texto
  const [descricao, setDescricao] = useState<string>("");
  const [observacoes, setObservacoes] = useState<string>("");

  // Checklist
  const [templates, setTemplates] = useState<ChecklistTemplateModel[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [templatesError, setTemplatesError] = useState<string | null>(null);
  const [templateId, setTemplateId] = useState<string>("");
  const [templateItems, setTemplateItems] = useState<ChecklistTemplateModel["itens"]>([]);
  const [checklist, setChecklist] = useState<Record<string, Marcacao>>({});

  // Carrega Setores
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
        setSetoresError(e?.message ?? "Não foi possível carregar os setores.");
        setSetores([]);
      } finally {
        setLoadingSetores(false);
      }
    })();
  }, []);

  // Carrega Modelos de Checklist
  useEffect(() => {
    (async () => {
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
        setTemplatesError(e?.message ?? "Não foi possível carregar os modelos de checklist.");
      } finally {
        setLoadingTemplates(false);
      }
    })();
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

  // Veículos
  const veiculoOptions = useMemo(
    () =>
      veiculosDoCliente.map((v) => ({
        value: String(v.id),
        label: `${v.modelo} • ${v.placa}${v.ano ? ` (${v.ano})` : ""}`,
      })),
    [veiculosDoCliente]
  );

  // Buscar Cliente por Documento
  const buscarClientePorDocumento = async () => {
    const raw = docBusca.trim();
    if (!raw) {
      setErroCliente("Informe um CPF/CNPJ para buscar.");
      return;
    }
    setErroCliente(null);
    setBuscandoCliente(true);
    setCliente(null);
    setVeiculosDoCliente([]);
    setVeiculoSelecionadoId(null);
    try {
      const url = new URL("/api/clientes/buscar-documento", window.location.origin);
      url.searchParams.set("doc", raw);
      const r = await fetch(url.toString(), { cache: "no-store" });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || "Não foi possível buscar o cliente.");
      setCliente(j?.cliente ?? null);
      setVeiculosDoCliente(j?.veiculos ?? []);
    } catch (e: any) {
      setErroCliente(e?.message ?? "Erro ao consultar o cliente.");
    } finally {
      setBuscandoCliente(false);
    }
  };

  // Expor submit ao Dialog
  useEffect(() => {
    exposeSubmit?.(salvar);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
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

  // Salvar
  const salvar = () => {
    if (!setor) {
      alert("Selecione o Setor responsável.");
      return;
    }
    if (modoAtendimento === "cadastrado") {
      if (!cliente) {
        alert("Busque o cliente pelo CPF/CNPJ e selecione um veículo (se houver).");
        return;
      }
    } else {
      if (!avulsoNome || !avulsoDoc) {
        alert("Preencha Nome/Razão Social e CPF/CNPJ para atendimento avulso.");
        return;
      }
    }

    const checklistArray = Object.entries(checklist).map(([item, status]) => ({
      item,
      status: (status || null) as string | null, // "OK" | "NOK" | "NA" | null
    }));

    const base = {
      // tipoos fica como DEFAULT no banco
      setorid: setor ? Number(setor) : null,
      descricao: descricao || null,
      observacoes: observacoes || null,
      checklistTemplateId: templateId || null,
      cliente:
        modoAtendimento === "cadastrado"
          ? { id: cliente!.id }
          : {
              nome: avulsoNome,
              documento: avulsoDoc,
              telefone: avulsoTelefone || null,
              email: avulsoEmail || null,
            },
      veiculoid: veiculoSelecionadoId, // number | null
      checklist: checklistArray,
    };

    onSubmit?.(base);
  };

  return (
    <div className="space-y-6">
      {/* DADOS DO CLIENTE */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <User2 className="h-5 w-5 text-primary" />
            <CardTitle className="text-base sm:text-lg">Dados do Cliente</CardTitle>
          </div>
          <CardDescription>Busque pelo CPF/CNPJ ou informe os dados para atendimento avulso.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Tipo de atendimento */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Tipo de atendimento</Label>
            <RadioGroup
              value={modoAtendimento}
              onValueChange={(v: "cadastrado" | "avulso") => setModoAtendimento(v)}
              className="flex flex-wrap gap-4"
            >
              <label className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value="cadastrado" id="r-cadastrado" />
                <span>Cliente cadastrado</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value="avulso" id="r-avulso" />
                <span>Atendimento avulso</span>
              </label>
            </RadioGroup>
          </div>

          {modoAtendimento === "cadastrado" ? (
            <>
              {/* Busca por CPF/CNPJ */}
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
                <div className="space-y-2">
                  <Label>CPF/CNPJ</Label>
                  <Input
                    placeholder="Digite com ou sem máscara"
                    value={docBusca}
                    onChange={(e) => setDocBusca(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && buscarClientePorDocumento()}
                  />
                </div>
                <div className="flex items-end">
                  <Button className="w-full md:w-auto" onClick={buscarClientePorDocumento} disabled={buscandoCliente}>
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

              {/* Resumo do cliente */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label>Nome/Razão Social</Label>
                  <Input value={cliente?.nomerazaosocial ?? ""} readOnly placeholder="—" />
                </div>
                <div className="space-y-1.5">
                  <Label>Telefone</Label>
                  <Input value={cliente?.telefone ?? ""} readOnly placeholder="—" />
                </div>
                <div className="space-y-1.5">
                  <Label>E-mail</Label>
                  <Input value={cliente?.email ?? ""} readOnly placeholder="—" />
                </div>
              </div>

              {/* Veículo */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Veículo do cliente</Label>
                  {cliente && (
                    <Badge variant="outline" className="font-normal">
                      {veiculoOptions.length} veículo(s)
                    </Badge>
                  )}
                </div>
                <Select
                  value={veiculoSelecionadoId === null ? NONE : String(veiculoSelecionadoId)}
                  onValueChange={(v) => setVeiculoSelecionadoId(v === NONE ? null : Number(v))}
                  disabled={!cliente || veiculoOptions.length === 0}
                >
                  <SelectTrigger className="h-10 w-full md:w-[380px] min-w-[260px] truncate">
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
              <div className="space-y-1.5">
                <Label>Nome/Razão Social</Label>
                <Input value={avulsoNome} onChange={(e) => setAvulsoNome(e.target.value)} placeholder="Nome completo" />
              </div>
              <div className="space-y-1.5">
                <Label>CPF/CNPJ</Label>
                <Input value={avulsoDoc} onChange={(e) => setAvulsoDoc(e.target.value)} placeholder="000.000.000-00" />
              </div>
              <div className="space-y-1.5">
                <Label>Telefone</Label>
                <Input
                  value={avulsoTelefone}
                  onChange={(e) => setAvulsoTelefone(e.target.value)}
                  placeholder="(99) 99999-9999"
                />
              </div>
              <div className="space-y-1.5">
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

      {/* DEFINIÇÃO DA OS */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <CardTitle className="text-base sm:text-lg">Definição da OS</CardTitle>
          </div>
          <CardDescription>Selecione o setor responsável. O técnico irá assumir mais tarde.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-3">
              <Label>Setor responsável</Label>
              <Select
                value={setor}
                onValueChange={setSetor}
                disabled={loadingSetores || (!!setoresError && setores.length === 0)}
              >
                <SelectTrigger className="h-10 w-full md:w-[380px] min-w-[260px] truncate">
                  <SelectValue
                    placeholder={
                      loadingSetores
                        ? "Carregando setores…"
                        : setores.length
                        ? "Selecione o setor"
                        : "Nenhum setor disponível"
                    }
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
            <div />
            <div />
          </div>
        </CardContent>
      </Card>

      {/* DESCRIÇÃO */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            <CardTitle className="text-base sm:text-lg">Descrição do Problema</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Descreva o problema do veículo…"
            className="min-h-[100px] resize-y"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* CHECKLIST */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <CarFront className="h-5 w-5 text-primary" />
            <CardTitle className="text-base sm:text-lg">Checklist de Inspeção</CardTitle>
          </div>
          <CardDescription>Escolha um modelo e marque cada item como OK, NOK ou N/A.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Modelo */}
          <div className="space-y-3">
            <Label>Modelo de checklist</Label>
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
                  />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  sideOffset={6}
                  className="w-[var(--radix-select-trigger-width)]"
                >
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

          {/* Itens */}
          {templateItems.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {templateItems.map((it) => {
                const key = it.titulo ?? "";
                const marcado = checklist[key] ?? "";

                return (
                  <div
                    key={key}
                    className="p-3 rounded-lg border bg-muted/50 border-border text-foreground"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-medium">{it.titulo}</div>
                        {it.descricao ? (
                          <div className="text-xs text-muted-foreground mt-1">
                            {it.descricao}
                          </div>
                        ) : null}
                      </div>
                      {it.obrigatorio && (
                        <Badge variant="secondary" className="text-[11px]">Obrigatório</Badge>
                      )}
                    </div>

                    {/* Grupo de marcação – harmonizado com o enum (OK/NOK/NA) */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {CHECK_STATUS.map((status) => {
                        const selected = marcado === status;
                        return (
                          <button
                            key={status}
                            type="button"
                            onClick={() =>
                              setChecklist((prev) => ({
                                ...prev,
                                [key]: selected ? "" : status,
                              }))
                            }
                            className={[
                              "px-3 py-1.5 rounded-md text-sm border transition",
                              selected
                                ? status === "OK"
                                  ? "bg-emerald-600 text-white border-emerald-600"
                                  : status === "NOK"
                                  ? "bg-red-600 text-white border-red-600"
                                  : "bg-zinc-700 text-white border-zinc-700"
                                : "bg-background hover:bg-muted border-border text-foreground",
                            ].join(" ")}
                          >
                            {status}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {templateId
                ? "Este modelo não possui itens."
                : "Selecione um modelo para exibir os itens do checklist."}
            </p>
          )}
        </CardContent>
      </Card>

      {/* OBSERVAÇÕES */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base sm:text-lg">Observações</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Informações adicionais…"
            className="min-h-[80px] resize-y"
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
