"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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

const CHECK_STATUS = ["OK", "NOK", "NA"] as const;
type Marcacao = (typeof CHECK_STATUS)[number] | "";

export type OrdemEditFormProps = {
  /** Mínimo necessário: id da OS. Os demais campos são carregados da API. */
  defaultValues: { id: number } | null;
  exposeSubmit?: (fn: () => void) => void;
  /** Se não passar, o form faz PUT /api/ordens/{id} internamente. */
  onSubmit?: (payload: any) => Promise<void> | void;
};

// --- utils ---
const NONE = "__none__";
const mapStatusToDB = (s: Marcacao): "PENDENTE" | "OK" | "FALHA" => {
  if (s === "OK") return "OK";
  if (s === "NOK") return "FALHA";
  return "PENDENTE";
};
const mapDBToStatus = (db: string | null | undefined): Marcacao => {
  if (!db) return "";
  const up = db.toUpperCase();
  if (up === "OK") return "OK";
  if (up === "FALHA") return "NOK";
  return "";
};

export function OrdemEditForm({ defaultValues, exposeSubmit, onSubmit }: OrdemEditFormProps) {
  const osId = defaultValues?.id ?? null;

  // ========= Estado base (espelha o criar) =========
  // Setores
  const [setores, setSetores] = useState<Array<{ id: number; nome: string }>>([]);
  const [loadingSetores, setLoadingSetores] = useState(false);
  const [setoresError, setSetoresError] = useState<string | null>(null);
  const [setor, setSetor] = useState<string>("");

  // Atendimento
  const [modoAtendimento, setModoAtendimento] = useState<"cadastrado" | "avulso">("cadastrado");
  const [prioridade, setPrioridade] = useState<"BAIXA" | "NORMAL" | "ALTA">("NORMAL");

  // Cliente/Veículo existentes
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [veiculosDoCliente, setVeiculosDoCliente] = useState<Veiculo[]>([]);
  const [veiculoSelecionadoId, setVeiculoSelecionadoId] = useState<number | null>(null);

  // Avulso
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

  // Alvo do reparo
  type AlvoTipo = "VEICULO" | "PECA";
  const [alvoTipo, setAlvoTipo] = useState<AlvoTipo>("VEICULO");

  // Veículo (dados livres)
  const [vPlaca, setVPlaca] = useState("");
  const [vModelo, setVModelo] = useState("");
  const [vMarca, setVMarca] = useState("");
  const [vAno, setVAno] = useState<string>("");
  const [vCor, setVCor] = useState("");
  const [vKm, setVKm] = useState<string>("");

  // Peça (avulsa)
  const [pNome, setPNome] = useState("");
  const [pDesc, setPDesc] = useState("");

  // Loading/saving
  const [initialLoading, setInitialLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // ========= Carregamentos =========
  // Setores
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

  // Templates de checklist
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

  // Carregar dados da OS para preencher o formulário
  useEffect(() => {
    if (!osId) return;
    (async () => {
      try {
        setInitialLoading(true);

        const r = await fetch(`/api/ordens/${osId}`, { cache: "no-store" });
        const j = await r.json();
        if (!r.ok) throw new Error(j?.error || "Não foi possível carregar a OS.");

        // Esperado do endpoint:
        // j.os: { setorid, clienteid, veiculoid, prioridade, descricao, observacoes, alvo_tipo, checklist_modelo_id, ... }
        // j.cliente: { id, nomerazaosocial, cpfcnpj, telefone, email }  (se cadastrado)  OU dados avulso
        // j.veiculo: { id, placa, modelo, marca, ano, cor, kmatual }    (opcional)
        // j.peca:    { titulo, descricao }                              (se alvo peça)
        // j.checklist: [{ item, status }]
        const os = j?.os ?? {};
        const cli = j?.cliente ?? j?.os?.cliente ?? null;
        const vei = j?.veiculo ?? j?.os?.veiculo ?? null;

        setSetor(os?.setorid ? String(os.setorid) : "");
        setPrioridade((os?.prioridade as any) || "NORMAL");
        setDescricao(os?.descricao || "");
        setObservacoes(os?.observacoes || "");

        // atendimento
        if (cli?.id) {
          setModoAtendimento("cadastrado");
          setCliente({
            id: cli.id,
            nomerazaosocial: cli.nomerazaosocial ?? cli.nome ?? "Cliente",
            cpfcnpj: cli.cpfcnpj ?? "",
            email: cli.email ?? null,
            telefone: cli.telefone ?? null,
          });
          // carregar veículos do cliente (best-effort)
          try {
            const rv = await fetch(`/api/clientes/${cli.id}/veiculos`, { cache: "no-store" });
            if (rv.ok) {
              const vj = await rv.json();
              const arr: Veiculo[] = (Array.isArray(vj) ? vj : vj?.items ?? []).map((v: any) => ({
                id: v.id,
                placa: v.placa,
                modelo: v.modelo,
                marca: v.marca,
                ano: v.ano ?? null,
                cor: v.cor ?? null,
                kmatual: v.kmatual ?? null,
              }));
              setVeiculosDoCliente(arr);
            }
          } catch {
            // silencioso
          }
        } else {
          setModoAtendimento("avulso");
          setCliente(null);
          setAvulsoNome(cli?.nomerazaosocial ?? cli?.nome ?? "");
          setAvulsoDoc(cli?.cpfcnpj ?? "");
          setAvulsoTelefone(cli?.telefone ?? "");
          setAvulsoEmail(cli?.email ?? "");
        }

        // vínculo de veículo existente
        setVeiculoSelecionadoId(os?.veiculoid ?? vei?.id ?? null);

        // alvo
        const alvo = (os?.alvo_tipo as "VEICULO" | "PECA") || "VEICULO";
        setAlvoTipo(alvo);

        if (alvo === "VEICULO") {
          setVPlaca(vei?.placa ?? os?.veiculo?.placa ?? "");
          setVModelo(vei?.modelo ?? os?.veiculo?.modelo ?? "");
          setVMarca(vei?.marca ?? os?.veiculo?.marca ?? "");
          setVAno(vei?.ano ? String(vei.ano) : os?.veiculo?.ano ? String(os.veiculo.ano) : "");
          setVCor(vei?.cor ?? os?.veiculo?.cor ?? "");
          setVKm(vei?.kmatual ? String(vei.kmatual) : os?.veiculo?.kmatual ? String(os.veiculo.kmatual) : "");
        } else {
          setPNome(j?.peca?.titulo ?? os?.peca?.nome ?? "");
          setPDesc(j?.peca?.descricao ?? os?.peca?.descricao ?? "");
        }

        // checklist
        const modeloId = os?.checklist_modelo_id ? String(os.checklist_modelo_id) : "";
        setTemplateId(modeloId);

        const itensOS: Array<{ item: string; status: string }> = Array.isArray(j?.checklist)
          ? j.checklist.map((c: any) => ({ item: c.item, status: c.status }))
          : [];
        // pré-carrega marcações
        const marcacoes: Record<string, Marcacao> = {};
        for (const c of itensOS) marcacoes[c.item] = mapDBToStatus(c.status);
        setChecklist(marcacoes);
      } catch (e: any) {
        toast.error(e?.message ?? "Falha ao carregar a OS para edição.");
      } finally {
        setInitialLoading(false);
      }
    })();
  }, [osId]);

  // veiculos options
  const veiculoOptions = useMemo(
    () =>
      veiculosDoCliente.map((v) => ({
        value: String(v.id),
        label: `${v.modelo} • ${v.placa}${v.ano ? ` (${v.ano})` : ""}`,
      })),
    [veiculosDoCliente]
  );

  // aplicar template: espelha o criar
  const applyTemplate = useCallback(
    (id: string) => {
      setTemplateId(id);
      const tpl = templates.find((t) => t.id === id);
      const itens = tpl?.itens ?? [];
      setTemplateItems(itens);

      // mantém marcações já existentes quando títulos coincidem
      const novo: Record<string, Marcacao> = {};
      itens.forEach((it) => {
        const key = it?.titulo ?? "";
        if (!key) return;
        const prev = checklist[key];
        novo[key] = prev ?? "";
      });
      setChecklist(novo);
    },
    [templates, checklist]
  );

  // sincroniza itens exibidos com templateId quando templates chegam
  useEffect(() => {
    if (!templateId || templates.length === 0) return;
    const tpl = templates.find((t) => t.id === templateId);
    const itens = tpl?.itens ?? [];
    setTemplateItems(itens);
    const novo: Record<string, Marcacao> = {};
    itens.forEach((it) => {
      if (it?.titulo) novo[it.titulo] = checklist[it.titulo] ?? "";
    });
    setChecklist(novo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId, templates]);

  // ========= Validação / Salvar =========
  function validar(): string | null {
    if (!osId) return "OS inválida.";
    if (!setor) return "Selecione o setor responsável.";

    if (modoAtendimento === "cadastrado" && !cliente) {
      return "Este registro aponta para cliente cadastrado, mas os dados do cliente não foram carregados.";
    }
    if (modoAtendimento === "avulso") {
      if (!avulsoNome || !avulsoDoc) return "Preencha Nome/Razão Social e CPF/CNPJ no atendimento avulso.";
      if (!avulsoTelefone?.trim() || !avulsoEmail?.trim()) {
        return "Para atendimento avulso, telefone e e-mail são obrigatórios.";
      }
    }

    if (alvoTipo === "VEICULO") {
      // se NÃO houver um veículo vinculado, exigimos mínimo de identificação (modelo ou placa)
      if (!veiculoSelecionadoId && !vModelo.trim() && !vPlaca.trim()) {
        return "Informe pelo menos o Modelo ou a Placa do veículo, ou vincule um veículo existente.";
      }
    } else {
      if (!pNome.trim()) return "Informe o nome da peça.";
    }
    return null;
  }

  const buildPayload = () => {
    const checklistArray = Object.entries(checklist).map(([item, status]) => ({
      item,
      status: mapStatusToDB((status || "") as Marcacao),
    }));

    const payload: any = {
      id: osId,
      setorid: setor ? Number(setor) : null,
      descricao: (descricao || "").trim() || null,
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
      veiculoid: veiculoSelecionadoId, // pode ser null
      checklist: checklistArray,
      alvo:
        alvoTipo === "VEICULO"
          ? {
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
              peca: {
                nome: pNome.trim(),
                descricao: pDesc?.trim() || null,
              },
            },
    };

    return payload;
  };

  const salvar = async () => {
    const err = validar();
    if (err) return toast.error(err);

    const payload = buildPayload();

    if (onSubmit) {
      await onSubmit(payload);
      return;
    }

    try {
      setSaving(true);
      const r = await fetch(`/api/ordens/${osId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.error || "Falha ao atualizar OS");
      toast.success("OS atualizada com sucesso");
      window.dispatchEvent(new CustomEvent("os:refresh"));
    } catch (e: any) {
      toast.error(e?.message || "Erro ao salvar alterações");
    } finally {
      setSaving(false);
    }
  };

  // expõe submit ao Dialog pai
  useEffect(() => {
    exposeSubmit?.(salvar);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    osId,
    setor,
    prioridade,
    modoAtendimento,
    cliente,
    veiculoSelecionadoId,
    avulsoNome,
    avulsoDoc,
    avulsoTelefone,
    avulsoEmail,
    descricao,
    observacoes,
    templateId,
    templateItems,
    checklist,
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

  // ========= UI =========
  if (!osId) {
    return <div className="text-sm text-red-600">OS inválida para edição.</div>;
  }

  return (
    <div className="space-y-6">
      {initialLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando dados…
        </div>
      ) : (
        <>
          {/* Definição da OS */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">Definição da OS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-3">
                  <Label>Setor responsável</Label>
                  <Select
                    value={setor}
                    onValueChange={setSetor}
                    disabled={loadingSetores || (!!setoresError && setores.length === 0) || saving}
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
                  <Select value={prioridade} onValueChange={(v) => setPrioridade(v as any)} disabled={saving}>
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
            </CardContent>
          </Card>

          {/* Cliente (separado como em Nova OS) */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <User2 className="h-5 w-5 text-primary" />
                <CardTitle className="text-base sm:text-lg">Cliente</CardTitle>
              </div>
              <CardDescription>
                {modoAtendimento === "cadastrado"
                  ? "Cliente cadastrado — dados exibidos para conferência; vínculo com veículo pode ser alterado."
                  : "Atendimento avulso — edite os dados abaixo."}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              {modoAtendimento === "cadastrado" ? (
                <>
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

                  {/* Vincular a um veículo existente */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Vincular a um veículo do cliente (opcional)</Label>
                      <Badge variant="outline" className="font-normal">
                        {cliente ? `${veiculoOptions.length} veículo(s)` : "—"}
                      </Badge>
                    </div>
                    <Select
                      value={veiculoSelecionadoId === null ? NONE : String(veiculoSelecionadoId)}
                      onValueChange={(v) => setVeiculoSelecionadoId(v === NONE ? null : Number(v))}
                      disabled={!cliente || veiculoOptions.length === 0 || saving}
                    >
                      <SelectTrigger className="h-10 w-full md:w-[380px] min-w-[260px] truncate">
                        <SelectValue
                          placeholder={
                            !cliente
                              ? "Carregando cliente…"
                              : veiculoOptions.length
                              ? "Selecione um veículo"
                              : "Cliente sem veículos"
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
                </>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Nome/Razão Social</Label>
                    <Input
                      value={avulsoNome}
                      onChange={(e) => setAvulsoNome(e.target.value)}
                      placeholder="Nome completo"
                      disabled={saving}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>CPF/CNPJ</Label>
                    <Input
                      value={avulsoDoc}
                      onChange={(e) => setAvulsoDoc(e.target.value)}
                      placeholder="000.000.000-00"
                      disabled={saving}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Telefone</Label>
                    <Input
                      value={avulsoTelefone}
                      onChange={(e) => setAvulsoTelefone(e.target.value)}
                      placeholder="(99) 99999-9999"
                      disabled={saving}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>E-mail</Label>
                    <Input
                      value={avulsoEmail}
                      onChange={(e) => setAvulsoEmail(e.target.value)}
                      placeholder="email@dominio.com"
                      disabled={saving}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Alvo do reparo */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-primary" />
                <CardTitle className="text-base sm:text-lg">Alvo do reparo</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup
                value={alvoTipo}
                onValueChange={(v: "VEICULO" | "PECA") => setAlvoTipo(v)}
                className="flex flex-wrap gap-4"
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
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label>Placa</Label>
                      <Input value={vPlaca} onChange={(e) => setVPlaca(e.target.value)} placeholder="ABC1D23" disabled={saving} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Modelo</Label>
                      <Input value={vModelo} onChange={(e) => setVModelo(e.target.value)} placeholder="Ex.: i30 2.0" disabled={saving} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Marca</Label>
                      <Input value={vMarca} onChange={(e) => setVMarca(e.target.value)} placeholder="Ex.: Hyundai" disabled={saving} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Ano</Label>
                      <Input value={vAno} onChange={(e) => setVAno(e.target.value)} inputMode="numeric" disabled={saving} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Cor</Label>
                      <Input value={vCor} onChange={(e) => setVCor(e.target.value)} disabled={saving} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>KM atual</Label>
                      <Input value={vKm} onChange={(e) => setVKm(e.target.value)} inputMode="numeric" disabled={saving} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Nome da peça</Label>
                    <Input value={pNome} onChange={(e) => setPNome(e.target.value)} placeholder="Ex.: Bomba d’água" disabled={saving} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Descrição (opcional)</Label>
                    <Input value={pDesc} onChange={(e) => setPDesc(e.target.value)} placeholder="Detalhes da peça" disabled={saving} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Descrição do problema */}
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
                disabled={saving}
              />
            </CardContent>
          </Card>

          {/* Checklist */}
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
                    disabled={loadingTemplates || (!!templatesError && templates.length === 0) || saving}
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
                      disabled={saving}
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
                          {(["OK", "NOK", "NA"] as const).map((status) => {
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
                                disabled={saving}
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

          {/* Observações */}
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
                disabled={saving}
              />
            </CardContent>
          </Card>

          {saving && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Salvando alterações…
            </div>
          )}
        </>
      )}
    </div>
  );
}
