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
import { Loader2, Search, CarFront, User2, ClipboardList, Building2, Wrench } from "lucide-react";
import { toast } from "sonner";

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

// Agora os status exibidos seguem o enum do banco
const CHECK_STATUS = ["OK", "ALERTA", "FALHA"] as const;
type Marcacao = (typeof CHECK_STATUS)[number] | ""; // "" = não marcado

export type FormularioNovaOSProps = {
  onSubmit?: (payload: any) => Promise<void> | void;
  exposeSubmit?: (fn: () => void) => void;
};

const NONE = "__none__";

// status visual -> status do banco (apenas quando marcado)
function toDbStatus(sel: Marcacao): "OK" | "ALERTA" | "FALHA" | null {
  if (sel === "OK") return "OK";
  if (sel === "ALERTA") return "ALERTA";
  if (sel === "FALHA") return "FALHA";
  return null; // não marcado
}

export function FormularioNovaOS({ onSubmit, exposeSubmit }: FormularioNovaOSProps) {
  // Setores
  const [setores, setSetores] = useState<Array<{ id: number; nome: string }>>([]);
  const [loadingSetores, setLoadingSetores] = useState(false);
  const [setoresError, setSetoresError] = useState<string | null>(null);
  const [setor, setSetor] = useState<string>("");

  // Atendimento
  const [modoAtendimento, setModoAtendimento] = useState<"cadastrado" | "avulso">("cadastrado");
  const [prioridade, setPrioridade] = useState<"BAIXA" | "NORMAL" | "ALTA">("NORMAL");

  // Cliente/Veículo existentes
  const [docBusca, setDocBusca] = useState("");
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [veiculosDoCliente, setVeiculosDoCliente] = useState<Veiculo[]>([]);
  const [veiculoSelecionadoId, setVeiculoSelecionadoId] = useState<number | null>(null);
  const [buscandoCliente, setBuscandoCliente] = useState(false);
  const [erroCliente, setErroCliente] = useState<string | null>(null);

  // Avulso (obs: schema exige email e telefone)
  const [avulsoNome, setAvulsoNome] = useState<string>("");
  const [avulsoDoc, setAvulsoDoc] = useState<string>("");
  const [avulsoTelefone, setAvulsoTelefone] = useState<string>("");
  const [avulsoEmail, setAvulsoEmail] = useState<string>("");

  // Descrição/Observações
  const [descricao, setDescricao] = useState<string>("");
  const [observacoes, setObservacoes] = useState<string>("");

  // Checklist
  const [templates, setTemplates] = useState<ChecklistTemplateModel[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [templatesError, setTemplatesError] = useState<string | null>(null);
  const [templateId, setTemplateId] = useState<string>("");
  const [templateItems, setTemplateItems] = useState<ChecklistTemplateModel["itens"]>([]);
  const [checklist, setChecklist] = useState<Record<string, Marcacao>>({});

  // === ALVO DO REPARO ===
  type AlvoTipo = "VEICULO" | "PECA";
  const [alvoTipo, setAlvoTipo] = useState<AlvoTipo>("VEICULO");

  // Veículo (dados básicos na OS, mesmo sem cadastro)
  const [vPlaca, setVPlaca] = useState("");
  const [vModelo, setVModelo] = useState("");
  const [vMarca, setVMarca] = useState("");
  const [vAno, setVAno] = useState<string>("");
  const [vCor, setVCor] = useState("");
  const [vKm, setVKm] = useState<string>("");

  // Peça (sem pesquisa, só nome e opcional descrição)
  const [pNome, setPNome] = useState("");
  const [pDesc, setPDesc] = useState("");

  const veiculoVinculado = veiculoSelecionadoId !== null;

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
        if (it?.titulo) novo[it.titulo] = ""; // começa sem marcação
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

  // Veículos existentes do cliente
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
    prioridade,
    alvoTipo,
    vPlaca,
    vModelo,
    vMarca,
    vAno,
    vCor,
    vKm,
    pNome,
    pDesc,
  ]);

  function validar(): string | null {
    if (!setor) return "Selecione o setor responsável.";

    if (modoAtendimento === "cadastrado" && !cliente) {
      return "Busque o cliente pelo CPF/CNPJ.";
    }

    if (modoAtendimento === "avulso") {
      if (!avulsoNome || !avulsoDoc) return "Preencha Nome/Razão Social e CPF/CNPJ para atendimento avulso.";
      if (!avulsoTelefone?.trim() || !avulsoEmail?.trim()) {
        return "Para atendimento avulso, telefone e e-mail são obrigatórios.";
      }
    }

    if (alvoTipo === "VEICULO") {
      // se não houver veículo vinculado, placa é necessária para criar (constraint do banco)
      if (!veiculoVinculado) {
        if (!vPlaca.trim()) {
          return "Para criar um veículo novo, informe ao menos a PLACA (modelo/marca ajudam, mas placa é obrigatória).";
        }
      }
    } else {
      if (!pNome.trim()) return "Informe o nome da peça.";
    }
    return null;
  }

  function validarChecklistObrigatorios(): string | null {
    if (!templateItems?.length) return null;
    const faltando = templateItems
      .filter((it) => it.obrigatorio)
      .filter((it) => !checklist[it.titulo]); // vazio/sem seleção
    if (faltando.length) {
      const nomes = faltando.slice(0, 3).map((f) => f.titulo).join(", ");
      return `Marque todos os itens obrigatórios do checklist. Ex.: ${nomes}${faltando.length > 3 ? "…" : ""}`;
    }
    return null;
  }

  const salvar = async () => {
    const errBase = validar();
    if (errBase) return toast.error(errBase);

    const errChk = validarChecklistObrigatorios();
    if (errChk) return toast.error(errChk);

    // Apenas itens marcados (OK/ALERTA/FALHA). Não marcado -> não envia.
    const checklistArray =
      templateItems
        .map((it) => {
          const sel = checklist[it.titulo] ?? "";
          const db = toDbStatus(sel as Marcacao);
          if (!db) return null;
          return { item: it.titulo, status: db };
        })
        .filter(Boolean) as Array<{ item: string; status: "OK" | "ALERTA" | "FALHA" }>;

    const payload: any = {
      setorid: setor ? Number(setor) : null,
      descricao: descricao || null,
      observacoes: (observacoes || "").trim() || null,
      checklistTemplateId: templateId || null,
      prioridade,

      cliente:
        modoAtendimento === "cadastrado"
          ? { id: cliente!.id }
          : {
              nome: avulsoNome,
              documento: avulsoDoc,
              telefone: avulsoTelefone || null,
              email: avulsoEmail || null,
            },

      veiculoid: veiculoSelecionadoId,

      checklist: checklistArray,

      alvo:
        alvoTipo === "VEICULO"
          ? veiculoVinculado
            ? { tipo: "VEICULO" }
            : {
                tipo: "VEICULO",
                veiculo: {
                  placa: vPlaca || null,
                  modelo: vModelo || null,
                  marca: vMarca || null,
                  ano: vAno ? Number(vAno) : null,
                  cor: vCor || null,
                  kmatual: vKm ? Number(vKm) : null,
                },
              }
          : {
              tipo: "PECA",
              peca: { nome: pNome.trim(), descricao: pDesc?.trim() || null },
            },
    };

    if (onSubmit) {
      await onSubmit(payload);
      return;
    }

    try {
      const r = await fetch("/api/ordens/criar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.error || "Falha ao criar OS");
      toast.success(`OS criada com sucesso!${j?.id ? ` ID: ${j.id}` : ""}`);
      // você pode disparar um evento global para recarregar listas, se quiser:
      window.dispatchEvent(new CustomEvent("os:refresh"));
    } catch (e: any) {
      toast.error(e?.message || "Erro ao salvar OS");
    }
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
              onValueChange={(v: "cadastrado" | "avulso") => {
                setModoAtendimento(v);
                setCliente(null);
                setVeiculosDoCliente([]);
                setVeiculoSelecionadoId(null);
              }}
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
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
            <div className="space-y-3">
              <Label>Prioridade</Label>
              <Select value={prioridade} onValueChange={(v) => setPrioridade(v as any)}>
                <SelectTrigger className="h-10 w-full md:w-[380px] min-w-[260px] truncate">
                  <SelectValue placeholder="Selecione a prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BAIXA">Baixa</SelectItem>
                  <SelectItem value="NORMAL">Normal</SelectItem>
                  <SelectItem value="ALTA">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* ALVO DO REPARO */}
          <div className="rounded-lg border p-3">
            <div className="flex items-center gap-2 mb-2">
              <Wrench className="h-4 w-4 text-primary" />
              <Label className="font-medium">Alvo do reparo</Label>
            </div>
            <RadioGroup
              value={alvoTipo}
              onValueChange={(v: "VEICULO" | "PECA") => setAlvoTipo(v)}
              className="flex flex-wrap gap-4 mb-4"
            >
              <label className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem id="alvo-veic" value="VEICULO" />
                <span>Veículo</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem id="alvo-peca" value="PECA" />
                <span>Peça</span>
              </label>
            </RadioGroup>

            {alvoTipo === "VEICULO" ? (
              <div className="space-y-4">
                {/* Vincular veículo já cadastrado (opcional) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Vincular a um veículo já cadastrado (opcional)</Label>
                    <Badge variant="outline" className="font-normal">
                      {cliente ? `${veiculoOptions.length} veículo(s)` : "—"}
                    </Badge>
                  </div>
                  <Select
                    value={veiculoSelecionadoId === null ? NONE : String(veiculoSelecionadoId)}
                    onValueChange={(v) => {
                      const id = v === NONE ? null : Number(v);
                      setVeiculoSelecionadoId(id);
                      if (id !== null) {
                        setVPlaca("");
                        setVModelo("");
                        setVMarca("");
                        setVAno("");
                        setVCor("");
                        setVKm("");
                      }
                    }}
                    disabled={(modoAtendimento === "cadastrado" && !cliente) || veiculoOptions.length === 0}
                  >
                    <SelectTrigger className="h-10 w-full md:w-[380px] min-w-[260px] truncate">
                      <SelectValue
                        placeholder={
                          modoAtendimento === "cadastrado"
                            ? !cliente
                              ? "Busque o cliente"
                              : veiculoOptions.length
                              ? "Selecione um veículo"
                              : "Cliente sem veículos"
                            : "Nenhum veículo cadastrado"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>Não vincular</SelectItem>
                      {veiculoOptions.map((v) => (
                        <SelectItem key={v.value} value={v.value}>
                          {v.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Dados básicos do veículo */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label>Placa</Label>
                    <Input value={vPlaca} onChange={(e) => setVPlaca(e.target.value)} placeholder="ABC1D23" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Modelo</Label>
                    <Input value={vModelo} onChange={(e) => setVModelo(e.target.value)} placeholder="Ex.: i30 2.0" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Marca</Label>
                    <Input value={vMarca} onChange={(e) => setVMarca(e.target.value)} placeholder="Ex.: Hyundai" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Ano</Label>
                    <Input value={vAno} onChange={(e) => setVAno(e.target.value)} inputMode="numeric" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Cor</Label>
                    <Input value={vCor} onChange={(e) => setVCor(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>KM atual</Label>
                    <Input value={vKm} onChange={(e) => setVKm(e.target.value)} inputMode="numeric" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Nome da peça</Label>
                  <Input value={pNome} onChange={(e) => setPNome(e.target.value)} placeholder="Ex.: Bomba d’água" />
                </div>
                <div className="space-y-1.5">
                  <Label>Descrição (opcional)</Label>
                  <Input value={pDesc} onChange={(e) => setPDesc(e.target.value)} placeholder="Detalhes da peça" />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* DESCRIÇÃO DO PROBLEMA */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            <CardTitle className="text-base sm:text-lg">Descrição do Problema</CardTitle>
          </div>
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

      {/* CHECKLIST */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <CarFront className="h-5 w-5 text-primary" />
            <CardTitle className="text-base sm:text-lg">Checklist de Inspeção</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
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
                  <div key={key} className="p-3 rounded-lg border bg-muted/50 border-border text-foreground">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-medium">{it.titulo}</div>
                        {it.descricao ? <div className="text-xs text-muted-foreground mt-1">{it.descricao}</div> : null}
                      </div>
                      {it.obrigatorio && (
                        <Badge variant="secondary" className="text-[11px]">
                          Obrigatório
                        </Badge>
                      )}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {(["OK", "ALERTA", "FALHA"] as const).map((status) => {
                        const selected = marcado === status;
                        const base =
                          "px-3 py-1.5 rounded-md text-sm border transition disabled:opacity-50 disabled:cursor-not-allowed";
                        const selectedClass =
                          status === "OK"
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : status === "ALERTA"
                            ? "bg-amber-500 text-white border-amber-500"
                            : "bg-red-600 text-white border-red-600";
                        const unselectedClass = "bg-background hover:bg-muted border-border text-foreground";
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
                            className={[base, selected ? selectedClass : unselectedClass].join(" ")}
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
              {templateId ? "Este modelo não possui itens." : "Selecione um modelo para exibir os itens do checklist."}
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
