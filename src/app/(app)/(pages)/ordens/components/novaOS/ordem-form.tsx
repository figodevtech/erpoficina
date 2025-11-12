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
import { Separator } from "@/components/ui/separator";
import { Loader2, Search, CarFront, User2, ClipboardList, Building2, Wrench, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";
import { uploadChecklistImages } from "../../lib/upload-checklist-images";

/* ================== Tipos mínimos ================== */
type ChecklistTemplateModel = {
  id: string;
  nome: string;
  itens: { titulo: string; descricao?: string | null; obrigatorio?: boolean }[];
};
const CHECK_OPTIONS = ["OK", "ALERTA", "FALHA"] as const;
type Marcacao = (typeof CHECK_OPTIONS)[number] | "";

/* ========== Props ========== */
export type FormularioNovaOSProps = {
  exposeSubmit?: (fn: () => Promise<void>) => void;
  onDone?: (osId?: number) => void;
  onSavingChange?: (saving: boolean) => void;
};

const NONE = "__none__";
const toDbStatus = (sel: Marcacao): "OK" | "ALERTA" | "FALHA" | null =>
  sel === "OK" || sel === "ALERTA" || sel === "FALHA" ? sel : null;

export function FormularioNovaOS({ exposeSubmit, onDone, onSavingChange }: FormularioNovaOSProps) {
  const [saving, setSaving] = useState(false);
  useEffect(() => onSavingChange?.(saving), [saving, onSavingChange]);

  // Setores
  const [setores, setSetores] = useState<Array<{ id: number; nome: string }>>([]);
  const [loadingSetores, setLoadingSetores] = useState(false);
  const [setoresError, setSetoresError] = useState<string | null>(null);
  const [setor, setSetor] = useState<string>("");

  // Atendimento/cliente
  const [modoAtendimento, setModoAtendimento] = useState<"cadastrado" | "avulso">("cadastrado");
  const [prioridade, setPrioridade] = useState<"BAIXA" | "NORMAL" | "ALTA">("NORMAL");
  const [docBusca, setDocBusca] = useState("");
  const [cliente, setCliente] = useState<any | null>(null);
  const [veiculosDoCliente, setVeiculosDoCliente] = useState<any[]>([]);
  const [veiculoSelecionadoId, setVeiculoSelecionadoId] = useState<number | null>(null);
  const [buscandoCliente, setBuscandoCliente] = useState(false);
  const [erroCliente, setErroCliente] = useState<string | null>(null);

  // Avulso
  const [avulsoNome, setAvulsoNome] = useState("");
  const [avulsoDoc, setAvulsoDoc] = useState("");
  const [avulsoTelefone, setAvulsoTelefone] = useState("");
  const [avulsoEmail, setAvulsoEmail] = useState("");

  // Texto
  const [descricao, setDescricao] = useState("");
  const [observacoes, setObservacoes] = useState("");

  // Checklist
  const [templates, setTemplates] = useState<ChecklistTemplateModel[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [templatesError, setTemplatesError] = useState<string | null>(null);
  const [templateId, setTemplateId] = useState("");
  const [templateItems, setTemplateItems] = useState<ChecklistTemplateModel["itens"]>([]);
  const [checklist, setChecklist] = useState<Record<string, Marcacao>>({});
  const [obsByItem, setObsByItem] = useState<Record<string, string>>({});
  const [imagesByItem, setImagesByItem] = useState<Record<string, File[]>>({});

  // Alvo
  type AlvoTipo = "VEICULO" | "PECA";
  const [alvoTipo, setAlvoTipo] = useState<AlvoTipo>("VEICULO");
  const [vPlaca, setVPlaca] = useState("");
  const [vModelo, setVModelo] = useState("");
  const [vMarca, setVMarca] = useState("");
  const [vAno, setVAno] = useState("");
  const [vCor, setVCor] = useState("");
  const [vKm, setVKm] = useState("");
  const [pNome, setPNome] = useState("");
  const [pDesc, setPDesc] = useState("");
  const veiculoVinculado = veiculoSelecionadoId !== null;

  /* ================== Data loading ================== */
  useEffect(() => {
    (async () => {
      try {
        setLoadingSetores(true);
        setSetoresError(null);
        const r = await fetch("/api/setores", { cache: "no-store" });
        const j = await r.json();
        setSetores(Array.isArray(j) ? j : j?.items ?? []);
      } catch (e: any) {
        setSetoresError(e?.message ?? "Não foi possível carregar os setores.");
        setSetores([]);
      } finally {
        setLoadingSetores(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoadingTemplates(true);
        setTemplatesError(null);
        const url = new URL("/api/checklist-modelos", window.location.origin);
        url.searchParams.set("ativos", "1");
        const r = await fetch(url.toString(), { cache: "no-store" });
        const j = await r.json();
        setTemplates(Array.isArray(j) ? j : Array.isArray(j?.items) ? j.items : []);
      } catch (e: any) {
        setTemplatesError(e?.message ?? "Não foi possível carregar os modelos de checklist.");
      } finally {
        setLoadingTemplates(false);
      }
    })();
  }, []);

  /* ================== Helpers enxutos ================== */
  const applyTemplate = useCallback(
    (id: string) => {
      setTemplateId(id);
      const itens = (templates.find((t) => t.id === id)?.itens ?? []).filter(Boolean);
      setTemplateItems(itens);
      const novo: Record<string, Marcacao> = {};
      const imgs: Record<string, File[]> = {};
      const obs: Record<string, string> = {};
      itens.forEach((it) => {
        if (it.titulo) {
          novo[it.titulo] = "";
          imgs[it.titulo] = imagesByItem[it.titulo] ?? [];
          obs[it.titulo] = obsByItem[it.titulo] ?? "";
        }
      });
      setChecklist(novo);
      setImagesByItem(imgs);
      setObsByItem(obs);
    },
    [templates, imagesByItem, obsByItem]
  );

  const veiculoOptions = useMemo(
    () =>
      veiculosDoCliente.map((v) => ({
        value: String(v.id),
        label: `${v.modelo} • ${v.placa}${v.ano ? ` (${v.ano})` : ""}`,
      })),
    [veiculosDoCliente]
  );

  const buscarClientePorDocumento = async () => {
    const raw = docBusca.trim();
    if (!raw) return setErroCliente("Informe um CPF/CNPJ para buscar.");
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

  // expõe submit
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
    imagesByItem,
    obsByItem,
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

  // validações (unificadas)
  const validateAll = (): string | null => {
    if (!setor) return "Selecione o setor responsável.";
    if (modoAtendimento === "cadastrado" && !cliente) return "Busque o cliente pelo CPF/CNPJ.";
    if (modoAtendimento === "avulso") {
      if (!avulsoNome || !avulsoDoc) return "Preencha Nome/Razão Social e CPF/CNPJ para atendimento avulso.";
      if (!avulsoTelefone?.trim() || !avulsoEmail?.trim())
        return "Para atendimento avulso, telefone e e-mail são obrigatórios.";
    }
    if (alvoTipo === "VEICULO") {
      if (!veiculoVinculado && !vPlaca.trim()) return "Para criar um veículo novo, informe ao menos a PLACA.";
    } else {
      if (!pNome.trim()) return "Informe o nome da peça.";
    }
    if (templateItems?.length) {
      const faltando = templateItems.filter((it) => it.obrigatorio).filter((it) => !checklist[it.titulo]);
      if (faltando.length) {
        const nomes = faltando
          .slice(0, 3)
          .map((f) => f.titulo)
          .join(", ");
        return `Marque todos os itens obrigatórios do checklist. Ex.: ${nomes}${faltando.length > 3 ? "…" : ""}`;
      }
    }
    const semStatusComImagem = Object.keys(imagesByItem).filter(
      (k) => (imagesByItem[k]?.length ?? 0) > 0 && !toDbStatus(checklist[k] as Marcacao)
    );
    if (semStatusComImagem.length) {
      return `Há imagens em itens sem status: ${semStatusComImagem.slice(0, 3).join(", ")}${
        semStatusComImagem.length > 3 ? "…" : ""
      }. Marque OK/ALERTA/FALHA antes de anexar imagens.`;
    }
    return null;
  };

  /* ================== Submit ================== */
  const salvar = async (): Promise<void> => {
    if (saving) return;
    const err = validateAll();
    if (err) return void toast.error(err);

    setSaving(true);
    try {
      const checklistArray = templateItems
        .map((it) => {
          const sel = checklist[it.titulo] ?? "";
          const db = toDbStatus(sel as Marcacao);
          if (!db) return null;
          return { item: it.titulo, status: db, observacao: (obsByItem[it.titulo] || "").trim() || null };
        })
        .filter(Boolean) as Array<{ item: string; status: "OK" | "ALERTA" | "FALHA"; observacao: string | null }>;

      const payload: any = {
        setorid: setor ? Number(setor) : null,
        descricao: descricao || null,
        observacoes: (observacoes || "").trim() || null,
        checklistTemplateId: templateId || null,
        prioridade,
        cliente:
          modoAtendimento === "cadastrado"
            ? { id: cliente!.id }
            : { nome: avulsoNome, documento: avulsoDoc, telefone: avulsoTelefone || null, email: avulsoEmail || null },
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
            : { tipo: "PECA", peca: { nome: pNome.trim(), descricao: pDesc?.trim() || null } },
      };

      // 1) cria OS
      const r = await fetch("/api/ordens/criar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.error || "Falha ao criar OS");

      const osId: number = j?.id;
      const created: Array<{ id: number; item: string }> = j?.checklistCreated ?? [];
      const mapItemToChecklistId: Record<string, number> = {};
      for (const row of created) if (row?.item && row?.id) mapItemToChecklistId[row.item] = row.id;

      // 2) sobe imagens (em lote, com compressão e concorrência controlada)
      const hasAnyImage = Object.values(imagesByItem).some((arr) => (arr?.length ?? 0) > 0);
      if (osId && hasAnyImage) {
        await uploadChecklistImages(osId, imagesByItem, mapItemToChecklistId, {
          concurrency: 3,
          compress: { maxWidth: 1600, maxHeight: 1600, targetMaxBytes: 800 * 1024, minQuality: 0.6, maxQuality: 0.95 },
        });
      }

      toast.success(`OS criada com sucesso!${osId ? ` ID: ${osId}` : ""}`);
      window.dispatchEvent(new CustomEvent("os:refresh"));
      onDone?.(osId);
    } catch (e: any) {
      toast.error(e?.message || "Erro ao salvar OS");
    } finally {
      setSaving(false);
    }
  };

  /* ================== Imagens (UI) ================== */
  const onPickFiles = (itemTitle: string, files: FileList | null) => {
    if (!files?.length) return;
    setImagesByItem((prev) => ({ ...prev, [itemTitle]: [...(prev[itemTitle] ?? []), ...Array.from(files)] }));
  };
  const removeFile = (itemTitle: string, idx: number) => {
    setImagesByItem((prev) => {
      const list = [...(prev[itemTitle] ?? [])];
      list.splice(idx, 1);
      return { ...prev, [itemTitle]: list };
    });
  };

  /* ===================== RENDER ===================== */
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
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Buscando…
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" /> Buscar
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {erroCliente && <div className="text-sm text-red-600">{erroCliente}</div>}

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

          <Separator />
          
          {/* === Alvo do reparo (SEM card aninhado) === */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-primary" />
              <Label className="font-medium">Alvo do reparo</Label>
            </div>
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
              <>
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
              </>
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
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <Select
                value={templateId}
                onValueChange={applyTemplate}
                disabled={loadingTemplates || (!!templatesError && templates.length === 0)}
              >
                <SelectTrigger className="h-10 w-full sm:w-[380px] min-w-[220px] truncate">
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
                  className="w-full sm:w-auto"
                  onClick={() => {
                    setTemplateId("");
                    setTemplateItems([]);
                    setChecklist({});
                    setImagesByItem({});
                    setObsByItem({});
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
                const files = imagesByItem[key] ?? [];
                const obs = obsByItem[key] ?? "";

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
                     {CHECK_OPTIONS.map((status) => {
                        const selected = marcado === status;
                        const base = "px-3 py-1.5 rounded-md text-sm border transition";
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
                            onClick={() => setChecklist((prev) => ({ ...prev, [key]: selected ? "" : status }))}
                            className={[base, selected ? selectedClass : unselectedClass].join(" ")}
                          >
                            {status}
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-3 space-y-1.5">
                      <Label className="text-xs">Observação (opcional)</Label>
                      <Textarea
                        value={obs}
                        onChange={(e) => setObsByItem((p) => ({ ...p, [key]: e.target.value }))}
                        placeholder="Observações sobre o item…"
                        rows={3}
                      />
                    </div>

                    <div className="mt-3 space-y-2">
                      <Label className="text-xs text-muted-foreground">Imagens do item (opcional)</Label>
                      <div className="flex flex-wrap items-center gap-2">
                        <label className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer hover:bg-muted">
                          <UploadCloud className="h-4 w-4" />
                          Adicionar imagens
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => onPickFiles(key, e.target.files)}
                          />
                        </label>
                        {files.length > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {files.length} arquivo(s) selecionado(s)
                          </span>
                        )}
                      </div>

                      {files.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {files.map((f, idx) => (
                            <div
                              key={`${f.name}-${idx}`}
                              className="inline-flex items-center gap-2 border rounded px-2 py-1 text-xs"
                            >
                              <span className="max-w-[180px] truncate">{f.name}</span>
                              <button
                                type="button"
                                className="opacity-70 hover:opacity-100"
                                onClick={() => removeFile(key, idx)}
                                title="Remover"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
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
