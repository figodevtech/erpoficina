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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  User2,
  ClipboardList,
  Building2,
  Wrench,
  Plus,
  X,
} from "lucide-react";
import { toast } from "sonner";
import CustomerSelect from "@/app/(app)/components/customerSelect";
import { Customer } from "../../../clientes/types";
import { listarSetores } from "../../lib/api";
import { ClienteInfoCard } from "./cliente-info-card";
import { CustomerDialog } from "../../../clientes/components/customerDialogRegister/customerDialog";

/* ========== Props ========== */
export type FormularioNovaOSProps = {
  exposeSubmit?: (fn: () => Promise<void>) => void;
  onDone?: (osId?: number) => void;
  onSavingChange?: (saving: boolean) => void;
};

const NONE = "__none__";
type AlvoTipo = "VEICULO" | "PECA";

export function FormularioNovaOS({
  exposeSubmit,
  onDone,
  onSavingChange,
}: FormularioNovaOSProps) {
  const [saving, setSaving] = useState(false);
  useEffect(() => onSavingChange?.(saving), [saving, onSavingChange]);

  // Setores
  const [setores, setSetores] = useState<Array<{ id: number; nome: string }>>(
    []
  );
  const [loadingSetores, setLoadingSetores] = useState(false);
  const [setoresError, setSetoresError] = useState<string | null>(null);
  const [setor, setSetor] = useState<string>("");

  // Cliente (somente cadastrado)
  const [cliente, setCliente] = useState<Customer | null>(null);
  const [veiculosDoCliente, setVeiculosDoCliente] = useState<any[]>([]);
  const [veiculoSelecionadoId, setVeiculoSelecionadoId] = useState<
    number | null
  >(null);
  const [openCustomer, setOpenCustomer] = useState(false);
  const [customerRegisterOpen, setCustomerRegisterOpen] = useState(false)
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | undefined>(undefined)

  // OS
  const [prioridade, setPrioridade] = useState<"BAIXA" | "NORMAL" | "ALTA">(
    "NORMAL"
  );
  const [descricao, setDescricao] = useState("");
  const [observacoes, setObservacoes] = useState("");

  // Alvo
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

        const items = await listarSetores();
        setSetores(items);
      } catch (e: any) {
        setSetoresError(e?.message ?? "Não foi possível carregar os setores.");
        setSetores([]);
      } finally {
        setLoadingSetores(false);
      }
    })();
  }, []);

  const veiculoOptions = useMemo(
    () =>
      veiculosDoCliente.map((v) => ({
        value: String(v.id),
        label: `${v.modelo} • ${v.placa}${v.ano ? ` (${v.ano})` : ""}`,
      })),
    [veiculosDoCliente]
  );

  // expõe submit
  useEffect(() => {
    exposeSubmit?.(salvar);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    setor,
    descricao,
    observacoes,
    cliente,
    veiculosDoCliente,
    veiculoSelecionadoId,
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

  const validateAll = (): string | null => {
    if (!setor) return "Selecione o setor responsável.";
    if (!cliente) return "Selecione um cliente cadastrado.";

    if (alvoTipo === "VEICULO") {
      const placaNorm = vPlaca.trim().toUpperCase();
      if (!veiculoVinculado && !placaNorm) {
        return "Para criar um veículo novo, informe ao menos a PLACA.";
      }

      // evita duplicar placa em veículo novo
      if (!veiculoVinculado && placaNorm && veiculosDoCliente.length > 0) {
        const normalize = (s: string) =>
          s.replace(/[^A-Z0-9]/gi, "").toUpperCase();
        const jaExiste = veiculosDoCliente.some((v: any) => {
          const placaCliente = (v.placa || "").toString();
          return normalize(placaCliente) === normalize(placaNorm);
        });
        if (jaExiste) {
          return "Já existe um veículo com essa placa para este cliente. Selecione-o na lista em vez de cadastrar outro.";
        }
      }
    } else {
      if (!pNome.trim()) return "Informe o nome da peça.";
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
      const payload: any = {
        setorid: setor ? Number(setor) : null,
        descricao: descricao || null,
        observacoes: (observacoes || "").trim() || null,
        prioridade,

        // ✅ sempre cadastrado
        cliente: { id: cliente!.id },

        veiculoid: veiculoSelecionadoId,

        alvo:
          alvoTipo === "VEICULO"
            ? veiculoVinculado
              ? { tipo: "VEICULO" } // backend usa veiculoid
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

      const r = await fetch("/api/ordens/criar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.error || "Falha ao criar OS");

      const osId: number = j?.id;

      toast.success(`OS criada com sucesso!${osId ? ` ID: ${osId}` : ""}`);
      window.dispatchEvent(new CustomEvent("os:refresh"));
      onDone?.(osId);
    } catch (e: any) {
      toast.error(e?.message || "Erro ao salvar OS");
    } finally {
      setSaving(false);
    }
  };

  /* ===================== RENDER ===================== */
  return (
    <div className="space-y-6">
      {/* DADOS DO CLIENTE */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <User2 className="h-5 w-5 text-primary" />
            <CardTitle className="text-base sm:text-lg">
              Dados do Cliente
            </CardTitle>
          </div>
          <CardDescription>
            Selecione um cliente já cadastrado para abrir a OS.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="w-full flex flex-row justify-between">
            <div className="flex flex-row items-center gap-2">
              <CustomerSelect
                open={openCustomer}
                setOpen={setOpenCustomer}
                OnSelect={(c) => {
                  setCliente(c ?? null);
                  setVeiculoSelecionadoId(null);
                  setVeiculosDoCliente(c?.veiculos ?? []);
                }}
              >
                <Button
                  variant={"outline"}
                  className="hover:cursor-pointer w-min text-xs"
                >
                  <Search className="h-3 w-3" />
                  Selecionar Cliente
                </Button>
              </CustomerSelect>
              {cliente && (
                <div
                  onClick={() => setCliente(null)}
                  className="p-1.5 rounded-full hover:cursor-pointer bg-muted"
                >
                  <X className="w-3 h-3 text-red-500" />
                </div>
              )}
            </div>
            <CustomerDialog
            customerId={selectedCustomerId}
            setSelectedCustomerId={setSelectedCustomerId}
            isOpen={customerRegisterOpen}
            setIsOpen={setCustomerRegisterOpen}
              onRegister={(c) => {
                setCliente(c ?? null);
                setVeiculoSelecionadoId(null);
                setVeiculosDoCliente(c?.veiculos ?? []);
              }}
            />
              <Button
              onClick={()=> setCustomerRegisterOpen(true)}
                variant={"outline"}
                className="hover:cursor-pointer w-min text-xs"
              >
                <Plus className="h-3 w-3" />
                Novo Cliente
              </Button>
          </div>
          {cliente && <ClienteInfoCard customer={cliente} />}
        </CardContent>
      </Card>

      {/* DEFINIÇÃO DA OS */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <CardTitle className="text-base sm:text-lg">
              Definição da OS
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-3">
              <Label>Setor responsável</Label>
              <Select
                value={setor}
                onValueChange={setSetor}
                disabled={
                  loadingSetores || (!!setoresError && setores.length === 0)
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

          <Separator />

          {/* === Alvo do reparo === */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-primary" />
              <Label className="font-medium">Alvo do reparo</Label>
            </div>

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
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>
                      Vincular a um veículo já cadastrado (opcional)
                    </Label>
                    <Badge variant="outline" className="font-normal">
                      {cliente ? `${veiculoOptions.length} veículo(s)` : "—"}
                    </Badge>
                  </div>

                  <Select
                    value={
                      veiculoSelecionadoId === null
                        ? NONE
                        : String(veiculoSelecionadoId)
                    }
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
                    disabled={!cliente || veiculoOptions.length === 0}
                  >
                    <SelectTrigger className="h-10 w-full md:w-[380px] min-w-[260px] truncate">
                      <SelectValue
                        placeholder={
                          !cliente
                            ? "Selecione um cliente"
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

                {/* Campos veículo novo – desabilitados quando um veículo está vinculado */}
                {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label>Placa</Label>
                    <Input
                      value={vPlaca}
                      onChange={(e) => setVPlaca(e.target.value.toUpperCase())}
                      placeholder="ABC1D23"
                      disabled={veiculoVinculado}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Modelo</Label>
                    <Input
                      value={vModelo}
                      onChange={(e) => setVModelo(e.target.value)}
                      placeholder="Ex.: i30 2.0"
                      disabled={veiculoVinculado}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Marca</Label>
                    <Input
                      value={vMarca}
                      onChange={(e) => setVMarca(e.target.value)}
                      placeholder="Ex.: Hyundai"
                      disabled={veiculoVinculado}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Ano</Label>
                    <Input
                      value={vAno}
                      onChange={(e) => setVAno(e.target.value)}
                      inputMode="numeric"
                      disabled={veiculoVinculado}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Cor</Label>
                    <Input
                      value={vCor}
                      onChange={(e) => setVCor(e.target.value)}
                      disabled={veiculoVinculado}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>KM atual</Label>
                    <Input
                      value={vKm}
                      onChange={(e) => setVKm(e.target.value)}
                      inputMode="numeric"
                      disabled={veiculoVinculado}
                    />
                  </div>
                </div> */}
              </>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Nome da peça</Label>
                  <Input
                    value={pNome}
                    onChange={(e) => setPNome(e.target.value)}
                    placeholder="Ex.: Bomba d’água"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Descrição (opcional)</Label>
                  <Input
                    value={pDesc}
                    onChange={(e) => setPDesc(e.target.value)}
                    placeholder="Detalhes da peça"
                  />
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
          />
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
