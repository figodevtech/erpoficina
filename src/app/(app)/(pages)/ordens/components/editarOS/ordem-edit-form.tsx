// src/app/(app)/(pages)/ordens/components/editarOS/ordem-edit-form.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Loader2, User2, Wrench, ClipboardList } from "lucide-react";
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

export type OrdemEditFormProps = {
  defaultValues: { id: number } | null;
  exposeSubmit?: (fn: () => void) => void;
  onSavingChange?: (saving: boolean) => void;
};

const NONE = "__none__";

type AlvoTipo = "VEICULO" | "PECA";

function resolvePecaNome(src: any): string {
  return (
    src?.titulo ??
    src?.nome ??
    src?.peca?.titulo ??
    src?.peca?.nome ??
    ""
  );
}

function resolvePecaDescricao(src: any): string {
  return src?.descricao ?? src?.peca?.descricao ?? "";
}

export function OrdemEditForm({
  defaultValues,
  exposeSubmit,
  onSavingChange,
}: OrdemEditFormProps) {
  const osId = defaultValues?.id ?? null;

  const [setores, setSetores] = useState<Array<{ id: number; nome: string }>>(
    []
  );
  const [loadingSetores, setLoadingSetores] = useState(false);
  const [setoresError, setSetoresError] = useState<string | null>(null);
  const [setor, setSetor] = useState<string>("");

  const [modoAtendimento, setModoAtendimento] = useState<
    "cadastrado" | "avulso"
  >("cadastrado");
  const [prioridade, setPrioridade] = useState<"BAIXA" | "NORMAL" | "ALTA">(
    "NORMAL"
  );

  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [veiculosDoCliente, setVeiculosDoCliente] = useState<Veiculo[]>([]);
  const [veiculoSelecionadoId, setVeiculoSelecionadoId] = useState<
    number | null
  >(null);

  const [avulsoNome, setAvulsoNome] = useState("");
  const [avulsoDoc, setAvulsoDoc] = useState("");
  const [avulsoTelefone, setAvulsoTelefone] = useState("");
  const [avulsoEmail, setAvulsoEmail] = useState("");

  const [descricao, setDescricao] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const [alvoTipo, setAlvoTipo] = useState<AlvoTipo>("VEICULO");

  const [vPlaca, setVPlaca] = useState("");
  const [vModelo, setVModelo] = useState("");
  const [vMarca, setVMarca] = useState("");
  const [vAno, setVAno] = useState("");
  const [vCor, setVCor] = useState("");
  const [vKm, setVKm] = useState("");

  const [pNome, setPNome] = useState("");
  const [pDesc, setPDesc] = useState("");

  const [initialLoading, setInitialLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // ===== Carrega lista de setores =====
  useEffect(() => {
    (async () => {
      try {
        setLoadingSetores(true);
        setSetoresError(null);
        const r = await fetch("/api/setores", { cache: "no-store" });
        const j = await r.json();
        const items: Array<{ id: number; nome: string }> = Array.isArray(j)
          ? j
          : j?.items ?? [];
        setSetores(items);
      } catch (e: any) {
        setSetoresError(
          e?.message ?? "Não foi possível carregar os setores."
        );
        setSetores([]);
      } finally {
        setLoadingSetores(false);
      }
    })();
  }, []);

  // ===== Carrega dados da OS para edição =====
  useEffect(() => {
    if (!osId) return;

    (async () => {
      try {
        setInitialLoading(true);
        const r = await fetch(`/api/ordens/${osId}`, { cache: "no-store" });
        const j = await r.json();
        if (!r.ok) throw new Error(j?.error || "Não foi possível carregar a OS.");

        const os = j?.os ?? {};
        const cli = j?.cliente ?? j?.os?.cliente ?? null;
        const vei = j?.veiculo ?? j?.os?.veiculo ?? null;

        const setorIdResolvido =
          os?.setorid != null
            ? os.setorid
            : os?.setor?.id != null
            ? os.setor.id
            : null;
        setSetor(setorIdResolvido != null ? String(setorIdResolvido) : "");

        setPrioridade((os?.prioridade as any) || "NORMAL");
        setDescricao(os?.descricao || "");
        setObservacoes(os?.observacoes || "");

        if (cli?.id) {
          // Cliente cadastrado (inclui o "avulso" que foi salvo na tabela cliente)
          setModoAtendimento("cadastrado");
          setCliente({
            id: cli.id,
            nomerazaosocial: cli.nomerazaosocial ?? cli.nome ?? "Cliente",
            cpfcnpj: cli.cpfcnpj ?? "",
            email: cli.email ?? null,
            telefone: cli.telefone ?? null,
          });

          try {
            const rv = await fetch(`/api/clientes/${cli.id}/veiculos`, {
              cache: "no-store",
            });
            if (rv.ok) {
              const vj = await rv.json();
              const arr: Veiculo[] = (Array.isArray(vj) ? vj : vj?.items ?? []).map(
                (v: any) => ({
                  id: v.id,
                  placa: v.placa,
                  modelo: v.modelo,
                  marca: v.marca,
                  ano: v.ano ?? null,
                  cor: v.cor ?? null,
                  kmatual: v.kmatual ?? null,
                })
              );
              setVeiculosDoCliente(arr);
            }
          } catch {
            // se der erro aqui, só ignora a lista de veículos
          }
        } else {
          // fallback — caso um dia você trate cliente avulso separado
          setModoAtendimento("avulso");
          setCliente(null);
          setAvulsoNome(cli?.nomerazaosocial ?? cli?.nome ?? "");
          setAvulsoDoc(cli?.cpfcnpj ?? "");
          setAvulsoTelefone(cli?.telefone ?? "");
          setAvulsoEmail(cli?.email ?? "");
        }

        const alvo = (os?.alvo_tipo as AlvoTipo) || "VEICULO";
        setAlvoTipo(alvo);

        if (alvo === "VEICULO") {
          setVeiculoSelecionadoId(os?.veiculoid ?? vei?.id ?? null);
          setVPlaca(vei?.placa ?? os?.veiculo?.placa ?? "");
          setVModelo(vei?.modelo ?? os?.veiculo?.modelo ?? "");
          setVMarca(vei?.marca ?? os?.veiculo?.marca ?? "");
          setVAno(
            vei?.ano
              ? String(vei.ano)
              : os?.veiculo?.ano
              ? String(os.veiculo.ano)
              : ""
          );
          setVCor(vei?.cor ?? os?.veiculo?.cor ?? "");
          setVKm(
            vei?.kmatual
              ? String(vei.kmatual)
              : os?.veiculo?.kmatual
              ? String(os.veiculo.kmatual)
              : ""
          );
        } else {
          setPNome(resolvePecaNome(j?.peca ?? os?.peca));
          setPDesc(resolvePecaDescricao(j?.peca ?? os?.peca));
          setVeiculoSelecionadoId(null);
        }
      } catch (e: any) {
        toast.error(e?.message ?? "Falha ao carregar a OS para edição.");
      } finally {
        setInitialLoading(false);
      }
    })();
  }, [osId]);

  useEffect(() => {
    onSavingChange?.(saving);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saving]);

  const veiculoOptions = useMemo(
    () =>
      veiculosDoCliente.map((v) => ({
        value: String(v.id),
        label: `${v.modelo} • ${v.placa}${v.ano ? ` (${v.ano})` : ""}`,
      })),
    [veiculosDoCliente]
  );

  function validar(): string | null {
    if (!osId) return "OS inválida.";
    if (!setor) return "Selecione o setor responsável.";
    if (modoAtendimento === "cadastrado" && !cliente)
      return "Dados do cliente não carregados.";

    if (modoAtendimento === "avulso") {
      if (!avulsoNome || !avulsoDoc)
        return "Preencha Nome/Razão Social e CPF/CNPJ no atendimento avulso.";
      if (!avulsoTelefone?.trim() || !avulsoEmail?.trim())
        return "Para atendimento avulso, telefone e e-mail são obrigatórios.";
    }

    if (alvoTipo === "VEICULO") {
      if (!veiculoSelecionadoId && !vModelo.trim() && !vPlaca.trim())
        return "Informe Modelo ou Placa do veículo, ou vincule um veículo existente.";
    } else if (!pNome.trim()) {
      return "Informe o nome da peça.";
    }
    return null;
  }

  const buildPayload = () => {
    const veiculoPayload =
      alvoTipo === "VEICULO"
        ? {
            placa: vPlaca?.trim() || null,
            modelo: vModelo?.trim() || null,
            marca: vMarca?.trim() || null,
            ano: vAno?.trim() ? Number(vAno) : null,
            cor: vCor?.trim() || null,
            kmatual: vKm?.trim() ? Number(vKm) : null,
          }
        : null;

    const base: any = {
      setorid: setor ? Number(setor) : null,
      prioridade,
      descricao: (descricao || "").trim() || null,
      observacoes: (observacoes || "").trim() || null,
    };

    base.cliente =
      modoAtendimento === "cadastrado"
        ? { id: cliente!.id }
        : {
            nome: avulsoNome?.trim(),
            documento: avulsoDoc?.trim(),
            telefone: avulsoTelefone?.trim() || null,
            email: avulsoEmail?.trim() || null,
          };

    if (alvoTipo === "VEICULO") {
      base.veiculoid = veiculoSelecionadoId ?? null;
      base.alvo = {
        tipo: "VEICULO",
        veiculoid: veiculoSelecionadoId ?? null,
        veiculo: veiculoPayload,
      };
    } else {
      base.veiculoid = null;
      base.alvo = {
        tipo: "PECA",
        peca: {
          nome: pNome.trim(),
          descricao: pDesc?.trim() || null,
        },
      };
    }

    return base;
  };

  const salvar = async () => {
    if (initialLoading || saving) return;
    const err = validar();
    if (err) return toast.error(err);

    const payload = buildPayload();

    setSaving(true);
    try {
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

  useEffect(() => {
    if (!exposeSubmit) return;
    exposeSubmit(salvar);
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

  if (!osId)
    return <div className="text-sm text-red-600">OS inválida para edição.</div>;

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
              <CardTitle className="text-base sm:text-lg">
                Definição da OS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-3">
                  <Label>Setor responsável</Label>
                  <Select
                    value={setor}
                    onValueChange={setSetor}
                    disabled={
                      loadingSetores ||
                      (!!setoresError && setores.length === 0) ||
                      saving
                    }
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
                  {setoresError && (
                    <p className="text-xs text-red-500">{setoresError}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label>Prioridade</Label>
                  <Select
                    value={prioridade}
                    onValueChange={(v) => setPrioridade(v as any)}
                    disabled={saving}
                  >
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

          {/* Cliente */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <User2 className="h-5 w-5 text-primary" />
                <CardTitle className="text-base sm:text-lg">Cliente</CardTitle>
              </div>
              <CardDescription>
                {modoAtendimento === "cadastrado"
                  ? "Cliente cadastrado — dados exibidos somente para conferência."
                  : "Atendimento avulso — edite os dados abaixo."}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              {modoAtendimento === "cadastrado" ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label>Nome/Razão Social</Label>
                    <Input
                      value={cliente?.nomerazaosocial ?? ""}
                      readOnly
                      placeholder="—"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Telefone</Label>
                    <Input
                      value={cliente?.telefone ?? ""}
                      readOnly
                      placeholder="—"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>E-mail</Label>
                    <Input
                      value={cliente?.email ?? ""}
                      readOnly
                      placeholder="—"
                    />
                  </div>
                </div>
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
                <CardTitle className="text-base sm:text-lg">
                  Alvo do reparo
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup
                value={alvoTipo}
                onValueChange={(v: AlvoTipo) => setAlvoTipo(v)}
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
                  {modoAtendimento === "cadastrado" && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>
                          Vincular a um veículo do cliente (opcional)
                        </Label>
                        <Badge variant="outline" className="font-normal">
                          {cliente
                            ? `${veiculoOptions.length} veículo(s)`
                            : "—"}
                        </Badge>
                      </div>
                      <Select
                        value={
                          veiculoSelecionadoId === null
                            ? NONE
                            : String(veiculoSelecionadoId)
                        }
                        onValueChange={(v) =>
                          setVeiculoSelecionadoId(v === NONE ? null : Number(v))
                        }
                        disabled={
                          !cliente || veiculoOptions.length === 0 || saving
                        }
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
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label>Placa</Label>
                      <Input
                        value={vPlaca}
                        onChange={(e) => setVPlaca(e.target.value)}
                        placeholder="ABC1D23"
                        disabled={saving}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Modelo</Label>
                      <Input
                        value={vModelo}
                        onChange={(e) => setVModelo(e.target.value)}
                        placeholder="Ex.: i30 2.0"
                        disabled={saving}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Marca</Label>
                      <Input
                        value={vMarca}
                        onChange={(e) => setVMarca(e.target.value)}
                        placeholder="Ex.: Hyundai"
                        disabled={saving}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Ano</Label>
                      <Input
                        value={vAno}
                        onChange={(e) => setVAno(e.target.value)}
                        inputMode="numeric"
                        disabled={saving}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Cor</Label>
                      <Input
                        value={vCor}
                        onChange={(e) => setVCor(e.target.value)}
                        disabled={saving}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>KM atual</Label>
                      <Input
                        value={vKm}
                        onChange={(e) => setVKm(e.target.value)}
                        inputMode="numeric"
                        disabled={saving}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Nome da peça</Label>
                    <Input
                      value={pNome}
                      onChange={(e) => setPNome(e.target.value)}
                      placeholder="Ex.: Radiador, Bomba d’água…"
                      disabled={saving}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Descrição (opcional)</Label>
                    <Input
                      value={pDesc}
                      onChange={(e) => setPDesc(e.target.value)}
                      placeholder="Detalhes da peça"
                      disabled={saving}
                    />
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
                <CardTitle className="text-base sm:text-lg">
                  Descrição do Problema
                </CardTitle>
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

          {/* Observações */}
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base sm:text-lg">
                Observações
              </CardTitle>
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
