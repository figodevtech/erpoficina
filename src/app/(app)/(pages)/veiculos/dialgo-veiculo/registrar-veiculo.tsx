"use client";

import type React from "react";
import { useEffect, useState, useMemo } from "react";
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
import { Check, ChevronsUpDown, Search, Upload } from "lucide-react";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import axios, { isAxiosError } from "axios";
import { toast } from "sonner";
import { Veiculo, Veiculo_tipos } from "../types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useVeiculosCores } from "../../configuracoes/tipos/hooks/use-veiculos-cores";
import CustomerSelect from "@/app/(app)/components/customerSelect";
import { useFipe } from "./useFipe";
import ValueInput from "../../(financeiro)/fluxodecaixa/components/transactionDialog/valueInput";

function somenteAlphaNumMaiusculo(valor: string) {
  return valor.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function formatarPlacaParaExibicao(valorSemFormatacao: string) {
  const v = somenteAlphaNumMaiusculo(valorSemFormatacao).slice(0, 7); // placa tem 7 chars
  if (v.length <= 3) return v;
  return `${v.slice(0, 3)}-${v.slice(3)}`;
}

interface RegisterContentProps {
  novoVeiculo: Veiculo;
  setNovoVeiculo: (value: Veiculo) => void;
  setSelectedVeiculoId?: (value: number | undefined) => void;
  onRegister?: (c: Veiculo) => void;
  clienteId?: number;
  isOpen: boolean;
}

const handleCombustivelFromAno = (anoStr: string) => {
  const s = anoStr.toUpperCase();
  if (s.includes("GASOLINA")) return "GASOLINA";
  if (s.includes("ALCOOL") || s.includes("ETANOL")) return "ETANOL";
  if (s.includes("DIESEL")) return "DIESEL";
  if (s.includes("ELETRICO") || s.includes("ELÉTRICO")) return "ELETRICO";
  if (s.includes("HIBRIDO") || s.includes("HÍBRIDO")) return "HIBRIDO";
  if (s.includes("FLEX")) return "FLEX";
  return null;
};

export default function RegisterContent({
  novoVeiculo,
  setNovoVeiculo,
  setSelectedVeiculoId,
  onRegister,
  clienteId,
  isOpen,
}: RegisterContentProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open1, setOpen1] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [openVersao, setOpenVersao] = useState(false);
  const { cores, errorCores, loadingCores } = useVeiculosCores();
  const [openCustomer, setOpenCustomer] = useState(false);
  const [loadingPlaca, setLoadingPlaca] = useState(false);

  const {
    marcasFipe,
    modelosRaw,
    anosFipe,
    loadingMarcas,
    loadingModelos,
    loadingAnos,
    loadingPrice,
    fetchBrands,
    fetchModels,
    fetchYears,
    fetchYearsByBrand,
    fetchModelsByBrandAndYear,
    fetchPrice,
  } = useFipe();

  const handleInputChange = (field: keyof Veiculo, value: string | number | null) => {
    setNovoVeiculo({ ...novoVeiculo, [field]: value });
  };

  const handleBuscarPlaca = async () => {
    if (!novoVeiculo.placa || novoVeiculo.placa.length < 7) return;

    setLoadingPlaca(true);
    const toastId = toast.loading("Consultando placa...");
    try {
      const response = await axios.get(`/api/veiculos/consulta-placa/${novoVeiculo.placa}`);
      const data = response.data;
      
      let combustivelRaw = "";
      if (typeof data.extra?.combustivel === "string") {
        combustivelRaw = data.extra.combustivel;
      } else if (data.extra?.combustivel && typeof data.extra.combustivel === "object") {
        combustivelRaw = data.extra.combustivel.descricao || data.extra.combustivel.nome || "";
      }

      let combustivelMapped = combustivelRaw || "";
      if (combustivelMapped.toUpperCase().includes("FLEX") || combustivelMapped.toUpperCase().includes("ALCOOL / GASOLINA")) combustivelMapped = "FLEX";
      else if (combustivelMapped.toUpperCase().includes("GASOLINA")) combustivelMapped = "GASOLINA";
      else if (combustivelMapped.toUpperCase().includes("ALCOOL") || combustivelMapped.toUpperCase().includes("ETANOL")) combustivelMapped = "ETANOL";
      else if (combustivelMapped.toUpperCase().includes("DIESEL")) combustivelMapped = "DIESEL";
      else if (combustivelMapped.toUpperCase().includes("HIBRIDO") || combustivelMapped.toUpperCase().includes("HÍBRIDO")) combustivelMapped = "HIBRIDO";
      else if (combustivelMapped.toUpperCase().includes("ELETRICO") || combustivelMapped.toUpperCase().includes("ELÉTRICO")) combustivelMapped = "ELETRICO";

      const rawMarca = data.MARCA || data.marca || "";
      let cleanedMarca = rawMarca.toUpperCase();
      if (cleanedMarca.includes(" - ")) cleanedMarca = cleanedMarca.split(" - ")[1];
      if (cleanedMarca.includes("/")) cleanedMarca = cleanedMarca.split("/")[0];
      cleanedMarca = cleanedMarca.trim();

      const rawModelo = data.SUBMODELO || data.MODELO || data.modelo || "";
      const cleanedModelo = rawModelo.split(" ")[0].toUpperCase().trim();

      const anoFabricacao = data.ano || data.extra?.ano_fabricacao || "";
      const anoModelo = data.anoModelo || data.extra?.ano_modelo || "";

      setNovoVeiculo({
        ...novoVeiculo,
        marca: cleanedMarca || novoVeiculo.marca,
        modelo: cleanedModelo || novoVeiculo.modelo,
        versao: undefined,
        ano: anoFabricacao ? parseInt(String(anoFabricacao)) : novoVeiculo.ano,
        ano_modelo: anoModelo ? parseInt(String(anoModelo)) : novoVeiculo.ano_modelo,
        chassi: data.extra?.chassi || data.chassi || novoVeiculo.chassi,
        cor: data.cor?.toUpperCase() || novoVeiculo.cor,
        combustivel: combustivelMapped || novoVeiculo.combustivel,
        fipe: undefined
      });

      toast.success("Placa consultada", { id: toastId, description: "Dados do veículo preenchidos." });
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.error || "Erro ao consultar a placa.";
      toast.error("Erro na consulta", { id: toastId, description: msg });
    } finally {
      setLoadingPlaca(false);
    }
  };

  const handleCreateVeiculo = async () => {
    setIsSubmitting(true);
    try {
      const response = await axios.post("/api/veiculos", { novoVeiculo });
      if (response.status === 201) {
        toast.success("Sucesso!", { description: "Veículo cadastrado.", duration: 2000 });
        if (setSelectedVeiculoId) setSelectedVeiculoId(response.data.data.id);
        onRegister?.(response.data.data);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error("Erro", { description: error.response?.data.error, duration: 2000 });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (clienteId) setNovoVeiculo({ ...novoVeiculo, clienteid: clienteId });
  }, [clienteId, novoVeiculo, setNovoVeiculo]);

  // FIPE Cascade
  useEffect(() => {
    if (isOpen && novoVeiculo.tipo) {
      fetchBrands(String(novoVeiculo.tipo));
    }
  }, [isOpen, novoVeiculo.tipo, fetchBrands]);

  // Fetch both generic models and years when Marca is selected (supports both flows)
  useEffect(() => {
    if (isOpen && novoVeiculo.tipo && novoVeiculo.marca) {
      const m = marcasFipe.find((x) => x.name.toUpperCase() === novoVeiculo.marca?.toUpperCase());
      if (m) {
        // Fetch generic models only if a year is NOT selected
        if (!novoVeiculo.ano_modelo) {
          fetchModels(String(novoVeiculo.tipo), m.code);
        }
        // Always fetch years for the brand to allow year selection
        if (anosFipe.length === 0) {
          fetchYearsByBrand(String(novoVeiculo.tipo), m.code);
        }
      }
    }
  }, [isOpen, novoVeiculo.tipo, novoVeiculo.marca, marcasFipe, fetchModels, fetchYearsByBrand]);

  const selectedYearCode = useMemo(() => {
    return anosFipe.find(a => {
      const anoMatch = a.name.match(/\d+/);
      const aAno = anoMatch ? Number(anoMatch[0]) : null;
      const aCombustivel = handleCombustivelFromAno(a.name);
      return aAno === novoVeiculo.ano_modelo && (!novoVeiculo.combustivel || aCombustivel === novoVeiculo.combustivel);
    })?.code;
  }, [anosFipe, novoVeiculo.ano_modelo, novoVeiculo.combustivel]);

  // Flow 2: Fetch specific models when Ano is selected
  useEffect(() => {
    if (isOpen && novoVeiculo.tipo && novoVeiculo.marca && novoVeiculo.ano_modelo && selectedYearCode) {
      const m = marcasFipe.find((x) => x.name.toUpperCase() === novoVeiculo.marca?.toUpperCase());
      if (m) {
        fetchModelsByBrandAndYear(String(novoVeiculo.tipo), m.code, selectedYearCode);
      }
    }
  }, [isOpen, novoVeiculo.tipo, novoVeiculo.marca, novoVeiculo.ano_modelo, selectedYearCode, marcasFipe, fetchModelsByBrandAndYear]);

  const extractModeloBase = (name: string) => name.trim().split(" ")[0].toUpperCase();

  const modelosOptions = useMemo(() => Array.from(
    new Set(modelosRaw.map((m) => extractModeloBase(m.name)))
  ).sort(), [modelosRaw]);

  const versoesOptions = useMemo(() => modelosRaw
    .filter(
      (m) =>
        novoVeiculo.modelo &&
        (m.name.toUpperCase().startsWith(novoVeiculo.modelo.toUpperCase() + " ") ||
          m.name.toUpperCase() === novoVeiculo.modelo.toUpperCase())
    )
    .map((m) => {
      let v = m.name.substring(novoVeiculo.modelo!.length).trim();
      if (!v) v = "Standard";
      return { code: m.code, name: v.toUpperCase(), originalName: m.name };
    })
    .sort((a, b) => a.name.localeCompare(b.name)), [modelosRaw, novoVeiculo.modelo]);

  // Cleanup: Clear modelo and versao if they are no longer valid after a list update (e.g., brand or year change)
  useEffect(() => {
    if (isOpen && novoVeiculo.modelo && !loadingModelos && modelosOptions.length > 0) {
      if (!modelosOptions.includes(novoVeiculo.modelo.toUpperCase())) {
        setNovoVeiculo({ ...novoVeiculo, modelo: "", versao: "", fipe: undefined });
      }
    }
  }, [isOpen, modelosOptions, loadingModelos, novoVeiculo.modelo, novoVeiculo, setNovoVeiculo]);

  const selectedVersaoCode = useMemo(() => {
    return versoesOptions.find((v) => v.name === novoVeiculo.versao?.toUpperCase())?.code;
  }, [versoesOptions, novoVeiculo.versao]);

  // Flow 1: Fetch specific years when Versao is selected
  useEffect(() => {
    if (isOpen && novoVeiculo.tipo && novoVeiculo.marca && novoVeiculo.modelo && novoVeiculo.versao && selectedVersaoCode) {
      const m = marcasFipe.find((x) => x.name.toUpperCase() === novoVeiculo.marca?.toUpperCase());
      if (m) {
        fetchYears(String(novoVeiculo.tipo), m.code, selectedVersaoCode);
      }
    }
  }, [isOpen, novoVeiculo.tipo, novoVeiculo.marca, novoVeiculo.modelo, novoVeiculo.versao, marcasFipe, selectedVersaoCode, fetchYears]);



  const isOffline = !!novoVeiculo.tipo && !loadingMarcas && marcasFipe.length === 0;

  const handleBuscarFipe = async () => {
    if (!novoVeiculo.ano_modelo || !novoVeiculo.tipo || !novoVeiculo.marca || !novoVeiculo.versao || !novoVeiculo.modelo) return;
    const m = marcasFipe.find((x) => x.name.toUpperCase() === novoVeiculo.marca?.toUpperCase());
    const selectedVersao = versoesOptions.find((v) => v.name === novoVeiculo.versao?.toUpperCase());

    const y = anosFipe.find(a => {
      const anoMatch = a.name.match(/\d+/);
      const aAno = anoMatch ? Number(anoMatch[0]) : null;
      const aCombustivel = handleCombustivelFromAno(a.name);
      return aAno === novoVeiculo.ano_modelo && (!novoVeiculo.combustivel || aCombustivel === novoVeiculo.combustivel);
    });

    if (m && selectedVersao && y) {
      const data = await fetchPrice(String(novoVeiculo.tipo), m.code, selectedVersao.code, y.code);
      if (data && data.price) {
        const num = Number(data.price.replace(/[^\d,]/g, "").replace(",", "."));
        if (!isNaN(num)) handleInputChange("fipe", num);
      } else {
        toast.error("Erro na busca", { description: "Não foi possível resgatar o valor FIPE." });
      }
    } else {
      toast.error("Dados incompletos", { description: "Selecione o ano FIPE correspondente." });
    }
  };

  return (
    <DialogContent className="h-svh min-w-screen p-0 overflow-hidden sm:max-w-[1100px] sm:max-h-[850px] sm:w-[95vw] sm:min-w-0">
      <div className="flex h-full min-h-0 flex-col">
        <DialogHeader className="shrink-0 px-6 py-4 border-b-1">
          <DialogTitle>Cadastro de Veículo</DialogTitle>
          <DialogDescription>
            Preencha os dados para registrar um novo veículo
          </DialogDescription>
        </DialogHeader>
        <CustomerSelect
          open={openCustomer}
          setOpen={setOpenCustomer}
          OnSelect={(c) =>
            setNovoVeiculo({ ...novoVeiculo, clienteid: c.id, cliente: c })
          }
        />

        <div className="h-full min-h-0 overflow-auto dark:bg-muted-foreground/5 px-6 py-10 space-y-2">
          {/* Tipo */}
          <div className="flex flex-row items-center gap-4">
            <div className="space-y-2 text-nowrap">
              <Label htmlFor="tipo" className="text-sm sm:text-base">
                Tipo de Veículo *
              </Label>
              <Select
                value={(novoVeiculo.tipo as unknown as string) || ""}
                onValueChange={(value: Veiculo_tipos) => {
                  setNovoVeiculo({ ...novoVeiculo, tipo: value, marca: "", modelo: "", versao: "", ano_modelo: undefined, fipe: undefined, combustivel: "" });
                }}
              >
                <SelectTrigger className="h-10 sm:h-11">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(Veiculo_tipos).map((tipo, i) => (
                    <SelectItem
                      className="hover:cursor-pointer"
                      key={i}
                      value={tipo}
                    >
                      {tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="placa" className="text-sm sm:text-base">
                Placa *
              </Label>
              <div className="flex gap-2">
                <Input
                  id="placa"
                  className="w-full uppercase"
                  value={formatarPlacaParaExibicao(novoVeiculo.placa || "")}
                  onChange={(e) => {
                    const digitado = e.target.value;
                    const semHifen = somenteAlphaNumMaiusculo(digitado).slice(
                      0,
                      7
                    );
                    setNovoVeiculo({ ...novoVeiculo, placa: semHifen });
                  }}
                  maxLength={8} // 3 + hífen + 4
                  placeholder="ABC-1D23"
                  autoCapitalize="characters"
                />
                <Button
                  variant="outline"
                  type="button"
                  size="icon"
                  onClick={handleBuscarPlaca}
                  disabled={loadingPlaca || !novoVeiculo.placa || novoVeiculo.placa.length < 7}
                  title="Buscar dados da Placa"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>
            {!clienteId && (

              <div className="space-y-2 w-full">
                <Label htmlFor="tipo" className="text-sm sm:text-base">
                  Cliente proprietário
                </Label>
                <div className="flex flex-row items-center gap-1">
                  <Input
                    className="w-full"
                    value={novoVeiculo?.cliente?.nomerazaosocial || ""}
                    disabled={true}
                  />
                  <div
                    onClick={() => setOpenCustomer(true)}
                    className="flex items-center hover:cursor-pointer p-1.5 rounded-full bg-muted"
                  >
                    <Search className="w-4 h-4 text-primary" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4">


            <div className="space-y-2">
              <Label htmlFor="marca" className="text-sm sm:text-base">
                Marca *
              </Label>
              {isOffline ? (
                <Input
                  id="marca"
                  value={novoVeiculo.marca || ""}
                  onChange={(e) => {
                    setNovoVeiculo({
                      ...novoVeiculo,
                      marca: e.target.value.toUpperCase(),
                      modelo: "",
                      versao: "",
                      ano_modelo: undefined,
                      fipe: undefined,
                      combustivel: ""
                    });
                  }}
                  placeholder="Ex.: CHEVROLET"
                />
              ) : (
                <Popover open={open2} onOpenChange={setOpen2}>
                  <PopoverTrigger asChild>
                    <Button
                      id="marca"
                      variant="outline"
                      role="combobox"
                      aria-expanded={open2}
                      className="w-full justify-between text-xs"
                      disabled={loadingMarcas || !novoVeiculo.tipo}
                    >
                      {loadingMarcas
                        ? "Carregando..."
                        : novoVeiculo.marca
                          ? novoVeiculo.marca
                          : "Selecione..."}
                      <ChevronsUpDown className="opacity-50" />
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent
                    onWheel={(e) => e.stopPropagation()}
                    onTouchMove={(e) => e.stopPropagation()}
                    onOpenAutoFocus={(e) => e.preventDefault()}
                    className="w-[200px] p-0"
                    onWheelCapture={(e) => e.stopPropagation()}
                  >
                    <Command>
                      <CommandInput
                        placeholder="Buscar marca..."
                        className="h-9 text-base"
                      />
                      <CommandList className="max-h-64 overflow-y-auto overscroll-contain">
                        <CommandEmpty>Nenhuma marca encontrada.</CommandEmpty>

                        <CommandGroup>
                          {marcasFipe.map((m) => (
                            <CommandItem
                              className="hover:cursor-pointer"
                              key={m.code}
                              value={m.name}
                              onSelect={() => {
                                setNovoVeiculo({
                                  ...novoVeiculo,
                                  marca: m.name.toUpperCase(),
                                  modelo: "",
                                  versao: "",
                                  ano_modelo: undefined,
                                  fipe: undefined,
                                  combustivel: ""
                                });
                                setOpen2(false);
                              }}
                            >
                              {m.name.toUpperCase()}
                              <Check
                                className={cn(
                                  "ml-auto",
                                  novoVeiculo.marca === m.name.toUpperCase()
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="modelo" className="text-sm sm:text-base">
                Modelo *
              </Label>
              <Popover open={open1} onOpenChange={setOpen1}>
                <PopoverTrigger asChild>
                  <Button
                    id="modelo"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open1}
                    className="w-full justify-between text-xs"
                    disabled={loadingModelos || !novoVeiculo.tipo || !novoVeiculo.marca}
                  >
                    {loadingModelos
                      ? "Carregando..."
                      : novoVeiculo.modelo
                        ? novoVeiculo.modelo
                        : "Selecione..."}
                    <ChevronsUpDown className="opacity-50" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent
                  onWheel={(e) => e.stopPropagation()}
                  onTouchMove={(e) => e.stopPropagation()}
                  onOpenAutoFocus={(e) => e.preventDefault()}
                  className="w-[400px] p-0"
                  onWheelCapture={(e) => e.stopPropagation()}
                >
                  <Command>
                    <CommandInput
                      placeholder="Buscar modelo..."
                      className="h-9 text-base"
                    />
                    <CommandList className="max-h-64 overflow-y-auto overscroll-contain">
                      <CommandEmpty>Nenhum modelo encontrado.</CommandEmpty>

                      <CommandGroup>
                        {modelosOptions.map((m, i) => (
                          <CommandItem
                            className="hover:cursor-pointer text-xs"
                            key={i}
                            value={m}
                            onSelect={() => {
                              setNovoVeiculo({
                                ...novoVeiculo,
                                modelo: m.toUpperCase(),
                                versao: "",
                                fipe: undefined
                              });
                              setOpen1(false);
                            }}
                          >
                            {m.toUpperCase()}
                            <Check
                              className={cn(
                                "ml-auto",
                                novoVeiculo.modelo === m.toUpperCase()
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="versao" className="text-sm sm:text-base">
                Versão
              </Label>
              {isOffline ? (
                <Input
                  id="versao"
                  value={novoVeiculo.versao || ""}
                  onChange={(e) => {
                    setNovoVeiculo({
                      ...novoVeiculo,
                      versao: e.target.value.toUpperCase(),
                      ano_modelo: undefined,
                      combustivel: "",
                      fipe: undefined,
                    });
                  }}
                  placeholder="Ex.: 1.0 MT"
                />
              ) : (
                <Popover open={openVersao} onOpenChange={setOpenVersao}>
                  <PopoverTrigger asChild>
                    <Button
                      id="versao"
                      variant="outline"
                      role="combobox"
                      aria-expanded={openVersao}
                      className="w-full justify-between text-xs truncate"
                      disabled={!novoVeiculo.modelo || modelosRaw.length === 0}
                    >
                      {novoVeiculo.versao ? novoVeiculo.versao : "Selecione..."}
                      <ChevronsUpDown className="opacity-50 shrink-0" />
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent
                    onWheel={(e) => e.stopPropagation()}
                    onTouchMove={(e) => e.stopPropagation()}
                    onOpenAutoFocus={(e) => e.preventDefault()}
                    className="w-[400px] p-0"
                    onWheelCapture={(e) => e.stopPropagation()}
                  >
                    <Command>
                      <CommandInput placeholder="Buscar versão..." className="h-9 text-base" />
                      <CommandList className="max-h-64 overflow-y-auto overscroll-contain">
                        <CommandEmpty>Nenhuma versão encontrada.</CommandEmpty>
                        <CommandGroup>
                          {versoesOptions.map((v, i) => (
                            <CommandItem
                              className="hover:cursor-pointer text-xs"
                              key={i}
                              value={v.name}
                              onSelect={() => {
                                setNovoVeiculo({
                                  ...novoVeiculo,
                                  versao: v.name.toUpperCase(),
                                  ano_modelo: novoVeiculo.versao && novoVeiculo.versao !== v.name.toUpperCase() ? undefined : novoVeiculo.ano_modelo,
                                  combustivel: "",
                                  fipe: undefined,
                                });
                                setOpenVersao(false);
                              }}
                            >
                              {v.name.toUpperCase()}
                              <Check
                                className={cn(
                                  "ml-auto",
                                  novoVeiculo.versao === v.name.toUpperCase() ? "opacity-100" : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ano" className="text-sm sm:text-base">
                Ano de Fabricação
              </Label>
              <Input
                id="ano"
                inputMode="numeric"
                className="w-full"
                maxLength={4}
                value={novoVeiculo.ano || ""}
                onChange={(e) => handleInputChange("ano", e.target.value)}
                placeholder="Ex.: 2019"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ano_modelo" className="text-sm sm:text-base">
                Ano Modelo
              </Label>
              {isOffline ? (
                <Input
                  id="ano_modelo"
                  type="number"
                  inputMode="numeric"
                  maxLength={4}
                  value={novoVeiculo.ano_modelo || ""}
                  onChange={(e) => handleInputChange("ano_modelo", parseInt(e.target.value) || null)}
                  placeholder="Ex.: 2020"
                />
              ) : (
                  <Select
                    value={novoVeiculo.ano_modelo ? (
                      anosFipe.find(a => {
                        const anoMatch = a.name.match(/\d+/);
                        const aAno = anoMatch ? Number(anoMatch[0]) : null;
                        const aCombustivel = handleCombustivelFromAno(a.name);
                        return aAno === novoVeiculo.ano_modelo && (!novoVeiculo.combustivel || aCombustivel === novoVeiculo.combustivel);
                      })?.code || 
                      anosFipe.find(a => {
                        const anoMatch = a.name.match(/\d+/);
                        const aAno = anoMatch ? Number(anoMatch[0]) : null;
                        return aAno === novoVeiculo.ano_modelo;
                      })?.code || ""
                    ) : ""}
                    onValueChange={(code) => {
                      const y = anosFipe.find(a => a.code === code);
                      if (y) {
                        const anoMatch = y.name.match(/\d+/);
                        const ano = anoMatch ? Number(anoMatch[0]) : null;
                        const combustivel = handleCombustivelFromAno(y.name);
                        setNovoVeiculo({
                          ...novoVeiculo,
                          ano_modelo: ano || undefined,
                          combustivel: combustivel || novoVeiculo.combustivel,
                          fipe: undefined
                        });
                      }
                    }}
                    disabled={loadingAnos || !novoVeiculo.marca || anosFipe.length === 0}
                  >
                    <SelectTrigger className="w-full" id="ano_modelo">
                      <SelectValue placeholder={loadingAnos ? "Buscando..." : "Selecione"} />
                    </SelectTrigger>
                    <SelectContent>
                      {anosFipe.map(a => {
                        let displayName = a.name;
                        if (displayName.includes("32000")) {
                          displayName = displayName.replace("32000", "Zero KM");
                        }
                        return (
                          <SelectItem key={a.code} value={a.code}>{displayName}</SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="kmatual" className="text-sm sm:text-base">
                KM atual
              </Label>
              <Input
                className="w-full"
                id="kmatual"
                inputMode="numeric"
                value={novoVeiculo.kmatual || ""}
                onChange={(e) => handleInputChange("kmatual", e.target.value)}
                placeholder="Ex.: 85000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chassi" className="text-sm sm:text-base">
                Chassi
              </Label>
              <Input
                className="w-full"
                id="chassi"
                value={novoVeiculo.chassi || ""}
                onChange={(e) => handleInputChange("chassi", e.target.value.toUpperCase())}
                placeholder="Ex.: 9BW..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">

            <div className="space-y-2">
              <Label htmlFor="combustivel" className="text-sm sm:text-base">
                Combustível
              </Label>
              <Select
                value={novoVeiculo.combustivel || ""}
                onValueChange={(value) => handleInputChange("combustivel", value)}
              >
                <SelectTrigger className="w-full" id="combustivel">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FLEX">FLEX</SelectItem>
                  <SelectItem value="GASOLINA">GASOLINA</SelectItem>
                  <SelectItem value="ETANOL">ETANOL</SelectItem>
                  <SelectItem value="DIESEL">DIESEL</SelectItem>
                  <SelectItem value="GNV">GNV</SelectItem>
                  <SelectItem value="ELETRICO">ELÉTRICO</SelectItem>
                  <SelectItem value="HIBRIDO">HÍBRIDO</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="transmissao" className="text-sm sm:text-base">
                Transmissão
              </Label>
              <Select
                value={novoVeiculo.transmissao || ""}
                onValueChange={(value) => handleInputChange("transmissao", value)}
              >
                <SelectTrigger className="w-full" id="transmissao">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MANUAL">MANUAL</SelectItem>
                  <SelectItem value="AUTOMATICA">AUTOMÁTICA</SelectItem>
                  <SelectItem value="AUTOMATIZADA">AUTOMATIZADA</SelectItem>
                  <SelectItem value="CVT">CVT</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fipe" className="text-sm sm:text-base">
                FIPE (R$)
              </Label>
              <div className="flex gap-2">
                <ValueInput
                  price={novoVeiculo?.fipe || 0}
                  setPrice={(value: number) => handleInputChange("fipe", value)}
                />
                <Button
                  variant="secondary"
                  onClick={handleBuscarFipe}
                  disabled={isOffline || loadingPrice || !novoVeiculo.ano_modelo || !novoVeiculo.versao}
                >
                  {loadingPrice ? "Buscando..." : "Buscar"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4">
          <div className="flex sm:flex-row gap-3 sm:gap-4">
            <Button
              type="submit"
              form="register-form"
              disabled={isSubmitting}
              onClick={handleCreateVeiculo}
              className="flex-1 text-sm sm:text-base hover:cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Cadastrando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Cadastrar Veículo
                </>
              )}
            </Button>
            <DialogClose asChild>
              <Button className="hover:cursor-pointer" variant={"outline"}>
                Cancelar
              </Button>
            </DialogClose>
          </div>
        </DialogFooter>
      </div>
    </DialogContent>
  );
}
