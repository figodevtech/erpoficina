"use client";

import { useEffect, useMemo, useState } from "react";
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
import { Check, ChevronsUpDown, Save, Search, X } from "lucide-react";
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
import { tabTheme, Veiculo, Veiculo_tipos } from "../types";
import { cn } from "@/lib/utils";
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
import { useVeiculosCores } from "../../configuracoes/tipos/hooks/use-veiculos-cores";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import CustomerSelect from "@/app/(app)/components/customerSelect";
import { useFipe } from "./useFipe";
import ValueInput from "../../(financeiro)/fluxodecaixa/components/transactionDialog/valueInput";

function somenteAlphaNumMaiusculo(valor: string) {
  return valor.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function formatarPlacaParaExibicao(valorSemFormatacao: string) {
  const v = somenteAlphaNumMaiusculo(valorSemFormatacao).slice(0, 7);
  if (v.length <= 3) return v;
  return `${v.slice(0, 3)}-${v.slice(3)}`;
}

function normalizarTextoBusca(valor: string) {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, " ")
    .trim();
}

function marcaCompativel(nomeFipe: string, marca: string) {
  const fipe = normalizarTextoBusca(nomeFipe);
  const alvo = normalizarTextoBusca(marca);
  if (!alvo) return false;
  if (fipe === alvo) return true;
  if ((alvo === "VW" || alvo === "VOLKSWAGEN") && (fipe.includes("VW") || fipe.includes("VOLKSWAGEN"))) return true;
  if ((alvo === "GM" || alvo === "CHEVROLET") && (fipe.includes("GM") || fipe.includes("CHEVROLET"))) return true;
  if ((alvo === "M BENZ" || alvo === "MERCEDES BENZ") && fipe.includes("MERCEDES")) return true;
  return fipe.split(" ").includes(alvo);
}

function encontrarMarcaFipe<T extends { name: string; code: string }>(marcas: T[], marca?: string) {
  if (!marca) return undefined;
  return marcas.find((m) => marcaCompativel(m.name, marca));
}

interface GetVeiculoResponse {
  veiculo: Veiculo & {
    cliente?: { id: number; cpfcnpj: string; nomerazaosocial: string };
    placa_formatada?: string;
  };
}

interface EditContentProps {
  veiculoId?: number;
  isOpen: boolean;
  onUpdated?: (v: Veiculo) => void;
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

export default function EditContent({
  veiculoId,
  isOpen,
  onUpdated,
}: EditContentProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingVeiculo, setIsLoadingVeiculo] = useState(false);
  const [loadingPlaca, setLoadingPlaca] = useState(false);

  const [openCustomer, setOpenCustomer] = useState(false);
  const [openMarca, setOpenMarca] = useState(false);
  const [openModelo, setOpenModelo] = useState(false);
  const [openVersao, setOpenVersao] = useState(false);

  const [selectedVeiculo, setSelectedVeiculo] = useState<
    (Veiculo & { marcaId?: number }) | undefined
  >(undefined);

  const { cores, loadingCores } = useVeiculosCores();

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
    setModelosRaw,
    setAnosFipe,
  } = useFipe();

  const handleInputChange = (field: keyof Veiculo, value: any) => {
    setSelectedVeiculo((prev) => {
      if (!prev) return prev;
      return { ...prev, [field]: value };
    });
  };

  const handleBuscarPlaca = async () => {
    if (!selectedVeiculo?.placa || selectedVeiculo.placa.length < 7) return;

    setLoadingPlaca(true);
    const toastId = toast.loading("Consultando placa...");
    try {
      const response = await axios.get(`/api/veiculos/consulta-placa/${selectedVeiculo.placa}`);
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
      const marcaFipe = encontrarMarcaFipe(marcasFipe, cleanedMarca);

      const rawModelo = data.SUBMODELO || data.MODELO || data.modelo || "";
      const cleanedModelo = rawModelo.split(" ")[0].toUpperCase().trim();

      const anoFabricacao = data.ano || data.extra?.ano_fabricacao || "";
      const anoModelo = data.anoModelo || data.extra?.ano_modelo || "";
      const marcaSelecionada = marcaFipe?.name.toUpperCase() || cleanedMarca || selectedVeiculo.marca;
      const anoModeloNumero = anoModelo ? parseInt(String(anoModelo)) : selectedVeiculo.ano_modelo;

      setSelectedVeiculo((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          marca: marcaSelecionada,
          modelo: cleanedModelo || prev.modelo,
          versao: undefined,
          ano: anoFabricacao ? parseInt(String(anoFabricacao)) : prev.ano,
          ano_modelo: anoModeloNumero,
          chassi: data.extra?.chassi || data.chassi || prev.chassi,
          cor: data.cor?.toUpperCase() || prev.cor,
          combustivel: combustivelMapped || "",
          fipe: undefined
        };
      });
      setModelosRaw([]);
      setAnosFipe([]);
      const marcaParaBusca = marcaFipe || encontrarMarcaFipe(marcasFipe, marcaSelecionada);
      if (selectedVeiculo.tipo && marcaParaBusca) {
        await Promise.all([
          fetchModels(String(selectedVeiculo.tipo), marcaParaBusca.code),
          fetchYearsByBrand(String(selectedVeiculo.tipo), marcaParaBusca.code),
        ]);
      }

      toast.success("Placa consultada", { id: toastId, description: "Dados do veículo preenchidos." });
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.error || "Erro ao consultar a placa.";
      toast.error("Erro na consulta", { id: toastId, description: msg });
    } finally {
      setLoadingPlaca(false);
    }
  };

  const handleGetVeiculo = async () => {
    if (!veiculoId) return;

    setIsLoadingVeiculo(true);
    try {
      const response = await axios.get<GetVeiculoResponse>(
        `/api/veiculos/${veiculoId}`
      );
      if (response.status === 200) {
        const v = response.data.veiculo;
        const placaNormalizada = somenteAlphaNumMaiusculo(
          String(v.placa ?? "")
        ).slice(0, 7);

        setSelectedVeiculo({
          ...v,
          placa: placaNormalizada,
        });
      }
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error("Erro", {
          description: error.response?.data?.error ?? "Falha ao buscar veículo",
        });
      }
    } finally {
      setIsLoadingVeiculo(false);
    }
  };

  const handleUpdateVeiculo = async () => {
    if (!selectedVeiculo?.id) return;

    setIsSubmitting(true);
    try {
      const response = await axios.put(`/api/veiculos/${selectedVeiculo.id}`, {
        selectedVeiculo,
      });

      if (response.status === 200) {
        toast.success("Sucesso!", {
          description: "Veículo atualizado.",
          duration: 2000,
        });

        handleGetVeiculo();
        onUpdated?.(selectedVeiculo);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error("Erro", {
          description:
            error.response?.data?.error ?? "Falha ao atualizar veículo",
          duration: 2000,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1) Quando abrir, buscar veículo
  useEffect(() => {
    if (isOpen && veiculoId) handleGetVeiculo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, veiculoId]);

  // FIPE Cascade for Editing
  // Fetch Brands when Tipo is available
  useEffect(() => {
    if (isOpen && selectedVeiculo?.tipo) {
      fetchBrands(String(selectedVeiculo.tipo));
    }
  }, [isOpen, selectedVeiculo?.tipo, fetchBrands]);

  // Fetch both generic models and years when Marca is selected (supports both flows)
  useEffect(() => {
    if (isOpen && selectedVeiculo?.tipo && selectedVeiculo?.marca) {
      const m = encontrarMarcaFipe(marcasFipe, selectedVeiculo.marca);
      if (m) {
        // Without fuel, a plate-provided model year is only a hint.
        if (!selectedVeiculo.ano_modelo || !selectedVeiculo.combustivel) {
          fetchModels(String(selectedVeiculo.tipo), m.code);
        }
        // Always refresh years for the selected brand to avoid stale options.
        fetchYearsByBrand(String(selectedVeiculo.tipo), m.code);
      }
    }
  }, [isOpen, selectedVeiculo?.tipo, selectedVeiculo?.marca, marcasFipe, fetchModels, fetchYearsByBrand]);

  const selectedYearCode = useMemo(() => {
    if (!selectedVeiculo?.ano_modelo || !selectedVeiculo?.combustivel) return undefined;
    return anosFipe.find(a => {
      const anoMatch = a.name.match(/\d+/);
      const aAno = anoMatch ? Number(anoMatch[0]) : null;
      const aCombustivel = handleCombustivelFromAno(a.name);
      return aAno === selectedVeiculo?.ano_modelo && (!selectedVeiculo?.combustivel || aCombustivel === selectedVeiculo.combustivel);
    })?.code;
  }, [anosFipe, selectedVeiculo?.ano_modelo, selectedVeiculo?.combustivel]);

  // Flow 2: Fetch specific models when Ano is selected
  useEffect(() => {
    if (isOpen && selectedVeiculo?.tipo && selectedVeiculo?.marca && selectedVeiculo?.ano_modelo && selectedYearCode) {
      const m = encontrarMarcaFipe(marcasFipe, selectedVeiculo.marca);
      if (m) {
        fetchModelsByBrandAndYear(String(selectedVeiculo.tipo), m.code, selectedYearCode);
      }
    }
  }, [isOpen, selectedVeiculo?.tipo, selectedVeiculo?.marca, selectedVeiculo?.ano_modelo, selectedYearCode, marcasFipe, fetchModelsByBrandAndYear]);

  const extractModeloBase = (name: string) => name.trim().split(" ")[0].toUpperCase();

  const modelosOptions = useMemo(() => Array.from(
    new Set(modelosRaw.map((m) => extractModeloBase(m.name)))
  ).sort(), [modelosRaw]);

  const versoesOptions = useMemo(() => modelosRaw
    .filter(
      (m) =>
        selectedVeiculo?.modelo &&
        (m.name.toUpperCase().startsWith(selectedVeiculo.modelo.toUpperCase() + " ") ||
          m.name.toUpperCase() === selectedVeiculo.modelo.toUpperCase())
    )
    .map((m) => {
      let v = m.name.substring(selectedVeiculo!.modelo!.length).trim();
      if (!v) v = "Standard";
      return { code: m.code, name: v.toUpperCase(), originalName: m.name };
    })
    .sort((a, b) => a.name.localeCompare(b.name)), [modelosRaw, selectedVeiculo?.modelo]);

  // Cleanup: Clear modelo and versao if they are no longer valid after a list update (e.g., brand or year change)
  useEffect(() => {
    if (isOpen && selectedVeiculo?.modelo && !loadingModelos && modelosOptions.length > 0) {
      if (!modelosOptions.includes(selectedVeiculo.modelo.toUpperCase())) {
        setSelectedVeiculo(prev => prev ? { ...prev, modelo: "", versao: "", fipe: undefined } : prev);
      }
    }
  }, [isOpen, modelosOptions, loadingModelos, selectedVeiculo?.modelo, selectedVeiculo, setSelectedVeiculo]);

  const selectedVersaoCode = useMemo(() => {
    return versoesOptions.find((v) => v.name === selectedVeiculo?.versao?.toUpperCase())?.code;
  }, [versoesOptions, selectedVeiculo?.versao]);

  // Flow 1: Fetch specific years when Versao is selected
  useEffect(() => {
    if (isOpen && selectedVeiculo?.tipo && selectedVeiculo?.marca && selectedVeiculo?.modelo && selectedVeiculo?.versao && selectedVersaoCode) {
      const m = encontrarMarcaFipe(marcasFipe, selectedVeiculo.marca);
      if (m) {
        fetchYears(String(selectedVeiculo.tipo), m.code, selectedVersaoCode);
      }
    }
  }, [isOpen, selectedVeiculo?.tipo, selectedVeiculo?.marca, selectedVeiculo?.modelo, selectedVeiculo?.versao, marcasFipe, selectedVersaoCode, fetchYears]);



  const isOffline = !!selectedVeiculo?.tipo && !loadingMarcas && marcasFipe.length === 0;

  const handleBuscarFipe = async () => {
    if (!selectedVeiculo?.ano_modelo || !selectedVeiculo?.tipo || !selectedVeiculo?.marca || !selectedVeiculo?.versao || !selectedVeiculo?.modelo) return;
    if (!selectedVeiculo.combustivel) {
      toast.error("Dados incompletos", { description: "Selecione o ano/combustivel FIPE correspondente." });
      return;
    }
    const m = encontrarMarcaFipe(marcasFipe, selectedVeiculo.marca);
    const selectedVersao = versoesOptions.find((v) => v.name === selectedVeiculo.versao?.toUpperCase());

    const y = anosFipe.find(a => {
      const anoMatch = a.name.match(/\d+/);
      const aAno = anoMatch ? Number(anoMatch[0]) : null;
      const aCombustivel = handleCombustivelFromAno(a.name);
      return aAno === selectedVeiculo.ano_modelo && (!selectedVeiculo.combustivel || aCombustivel === selectedVeiculo.combustivel);
    });

    if (m && selectedVersao && y) {
      const data = await fetchPrice(String(selectedVeiculo.tipo), m.code, selectedVersao.code, y.code);
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



  const disabledForm = isLoadingVeiculo || !selectedVeiculo;

  if (isLoadingVeiculo) {
    return (
      <DialogContent className="h-dvh min-w-screen p-0 overflow-hidden sm:max-w-[1100px] sm:max-h-[850px] sm:w-[95vw] sm:min-w-0">
        <DialogHeader className="hidden">
          <DialogTitle></DialogTitle>
        </DialogHeader>
        <div className="flex h-full min-h-0 flex-col justify-center items-center">
          <div className="size-8 border-t-2 border-primary rounded-t-full animate-spin"></div>
          <span className="text-primary">Carregando</span>
        </div>
      </DialogContent>
    );
  }

  if (selectedVeiculo) {
    return (
      <DialogContent className="h-svh min-w-screen p-0 overflow-hidden sm:max-w-[1100px] sm:max-h-[850px] sm:w-[95vw] sm:min-w-0">
        <div className="flex h-full min-h-0 flex-col">
          <DialogHeader className="shrink-0 px-6 py-4 border-b-1">
            <DialogTitle>
              {isLoadingVeiculo
                ? "Carregando..."
                : `Editar Veículo ID #${selectedVeiculo?.id ?? "-"}`}
            </DialogTitle>
            <DialogDescription>Atualize os dados do veículo</DialogDescription>
          </DialogHeader>
          <CustomerSelect
            open={openCustomer}
            setOpen={setOpenCustomer}
            OnSelect={(c) => setSelectedVeiculo({ ...selectedVeiculo, clienteid: c.id, cliente: c })}
          />

          <Tabs
            defaultValue="Geral"
            className="flex-1 min-h-0 overflow-hidden pb-0"
          >
            <TabsList className="shrink-0 top-0 z-10 bg-background mt-3 ml-3">
              <TabsTrigger
                value="Geral"
                className={"hover:cursor-pointer" + tabTheme}
              >
                Geral
              </TabsTrigger>
              <TabsTrigger
                value="Ordens"
                className={"hover:cursor-pointer" + tabTheme}
              >
                Ordens
              </TabsTrigger>
            </TabsList>
            <TabsContent
              value="Geral"
              className="h-full min-h-0 overflow-hidden p-0 b"
            >
              <div className="h-full min-h-0 overflow-auto px-4 py-10 space-y-2 bg-muted-foreground/5">
                {/* Tipo */}
                <div className="flex flex-row items-center gap-4">

                  <div className="space-y-2 text-nowrap">
                    <Label htmlFor="tipo" className="text-sm sm:text-base">
                      Tipo de Veículo *
                    </Label>
                    <Select
                      value={(selectedVeiculo?.tipo as unknown as string) || ""}
                      onValueChange={(value: Veiculo_tipos) => {
                        setSelectedVeiculo((prev) => {
                          if (!prev) return prev;
                          return {
                            ...prev,
                            tipo: value as any,
                            marca: "",
                            modelo: "",
                            versao: "",
                            ano_modelo: undefined,
                            fipe: undefined,
                            combustivel: "",
                            marcaId: undefined,
                          };
                        });
                        setModelosRaw([]);
                        setAnosFipe([]);
                      }}
                      disabled={disabledForm}
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
                        value={formatarPlacaParaExibicao(
                          selectedVeiculo?.placa || ""
                        )}
                        onChange={(e) => {
                          const digitado = e.target.value;
                          const semHifen = somenteAlphaNumMaiusculo(
                            digitado
                          ).slice(0, 7);
                          setSelectedVeiculo((prev) =>
                            prev ? { ...prev, placa: semHifen } : prev
                          );
                        }}
                        maxLength={8}
                        placeholder="ABC-1D23"
                        autoCapitalize="characters"
                        disabled={disabledForm}
                      />
                      <Button
                        variant="outline"
                        type="button"
                        size="icon"
                        onClick={handleBuscarPlaca}
                        disabled={disabledForm || loadingPlaca || !selectedVeiculo?.placa || selectedVeiculo.placa.length < 7}
                        title="Buscar dados da Placa"
                      >
                        <Search className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2 w-full">
                    <Label htmlFor="tipo" className="text-sm sm:text-base">
                      Cliente proprietário
                    </Label>
                    <div className="flex flex-row items-center gap-1">

                      <Input
                        className="w-full"
                        value={selectedVeiculo?.cliente?.nomerazaosocial || ""}
                        disabled={true}
                      />
                      <div
                        onClick={() => setOpenCustomer(true)}
                        className="flex items-center hover:cursor-pointer p-1.5 rounded-full bg-muted"><Search className="w-4 h-4 text-primary" /></div>
                    </div>
                  </div>
                </div>


                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4">

                  {/* Marca */}
                  <div className="space-y-2">
                    <Label htmlFor="marca" className="text-sm sm:text-base">
                      Marca *
                    </Label>
                    {isOffline ? (
                      <Input
                        id="marca"
                        value={selectedVeiculo?.marca || ""}
                        onChange={(e) => {
                          setSelectedVeiculo((prev) => {
                            if (!prev) return prev;
                            return {
                              ...prev,
                              marca: e.target.value.toUpperCase(),
                              modelo: "",
                              versao: "",
                              ano_modelo: undefined,
                              fipe: undefined,
                              combustivel: "",
                            };
                          });
                          setModelosRaw([]);
                          setAnosFipe([]);
                        }}
                        disabled={disabledForm}
                        placeholder="Ex.: CHEVROLET"
                      />
                    ) : (
                      <Popover open={openMarca} onOpenChange={setOpenMarca}>
                        <PopoverTrigger asChild>
                          <Button
                            id="marca"
                            variant="outline"
                            role="combobox"
                            aria-expanded={openMarca}
                            className="w-full justify-between text-xs"
                            disabled={disabledForm || loadingMarcas || !selectedVeiculo?.tipo}
                          >
                            {loadingMarcas
                              ? "Carregando..."
                              : selectedVeiculo?.marca
                                ? selectedVeiculo.marca
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
                                      setSelectedVeiculo((prev) => {
                                        if (!prev) return prev;
                                        return {
                                          ...prev,
                                          marca: m.name.toUpperCase(),
                                          modelo: "",
                                          versao: "",
                                          ano_modelo: undefined,
                                          fipe: undefined,
                                          combustivel: "",
                                        };
                                      });
                                      setModelosRaw([]);
                                      setAnosFipe([]);
                                      setOpenMarca(false);
                                    }}
                                  >
                                    {m.name.toUpperCase()}
                                    <Check
                                      className={cn(
                                        "ml-auto",
                                        selectedVeiculo?.marca === m.name.toUpperCase()
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

                  {/* Modelo */}
                  <div className="space-y-2">
                    <Label htmlFor="modelo" className="text-sm sm:text-base">
                      Modelo *
                    </Label>
                    {isOffline ? (
                      <Input
                        id="modelo"
                        value={selectedVeiculo?.modelo || ""}
                        onChange={(e) => {
                          setSelectedVeiculo((prev) =>
                            prev
                              ? {
                                ...prev,
                                modelo: e.target.value.toUpperCase(),
                                versao: "",
                                ano_modelo: undefined,
                                fipe: undefined,
                                combustivel: "",
                              }
                              : prev
                          );
                        }}
                        disabled={disabledForm}
                        placeholder="Ex.: ONIX"
                      />
                    ) : (
                      <Popover open={openModelo} onOpenChange={setOpenModelo}>
                        <PopoverTrigger asChild>
                          <Button
                            id="modelo"
                            variant="outline"
                            role="combobox"
                            aria-expanded={openModelo}
                            className="w-full justify-between text-xs"
                            disabled={disabledForm || loadingModelos || !selectedVeiculo?.tipo || !selectedVeiculo?.marca}
                          >
                            {loadingModelos
                              ? "Carregando..."
                              : selectedVeiculo?.modelo
                                ? selectedVeiculo.modelo
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
                                      setSelectedVeiculo((prev) =>
                                        prev
                                          ? {
                                            ...prev,
                                            modelo: m.toUpperCase(),
                                            versao: "",
                                            fipe: undefined,
                                          }
                                          : prev
                                      );
                                      setOpenModelo(false);
                                    }}
                                  >
                                    {m.toUpperCase()}
                                    <Check
                                      className={cn(
                                        "ml-auto",
                                        selectedVeiculo?.modelo === m.toUpperCase()
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

                  {/* Versão */}
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="versao" className="text-sm sm:text-base">
                      Versão
                    </Label>
                    {isOffline ? (
                      <Input
                        id="versao"
                        value={selectedVeiculo?.versao || ""}
                        onChange={(e) => {
                          setSelectedVeiculo((prev) =>
                            prev
                              ? {
                                ...prev,
                                versao: e.target.value.toUpperCase(),
                                ano_modelo: undefined,
                                fipe: undefined,
                                combustivel: "",
                              }
                              : prev
                          );
                        }}
                        disabled={disabledForm}
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
                            disabled={disabledForm || !selectedVeiculo?.modelo || modelosRaw.length === 0}
                          >
                            {selectedVeiculo?.versao ? selectedVeiculo.versao : "Selecione..."}
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
                                      setSelectedVeiculo((prev) =>
                                        prev
                                          ? {
                                            ...prev,
                                            versao: v.name.toUpperCase(),
                                            fipe: undefined,
                                          }
                                          : prev
                                      );
                                      setOpenVersao(false);
                                    }}
                                  >
                                    {v.name.toUpperCase()}
                                    <Check
                                      className={cn(
                                        "ml-auto",
                                        selectedVeiculo?.versao === v.name.toUpperCase() ? "opacity-100" : "opacity-0"
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

                  {/* Ano */}
                  <div className="space-y-2">
                    <Label htmlFor="ano" className="text-sm sm:text-base">
                      Ano de Fabricação
                    </Label>
                    <Input
                      id="ano"
                      inputMode="numeric"
                      className="w-full"
                      maxLength={4}
                      value={selectedVeiculo?.ano ? String(selectedVeiculo.ano) : ""}
                      onChange={(e) => handleInputChange("ano", e.target.value)}
                      placeholder="Ex.: 2019"
                      disabled={disabledForm}
                    />
                  </div>

                  {/* Ano Modelo */}
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
                        value={selectedVeiculo?.ano_modelo ? String(selectedVeiculo.ano_modelo) : ""}
                        onChange={(e) => handleInputChange("ano_modelo", parseInt(e.target.value) || null)}
                        placeholder="Ex.: 2020"
                        disabled={disabledForm}
                      />
                    ) : (
                      <Select
                        value={selectedVeiculo?.ano_modelo && selectedVeiculo?.combustivel ? (
                          anosFipe.find(a => {
                            const anoMatch = a.name.match(/\d+/);
                            const aAno = anoMatch ? Number(anoMatch[0]) : null;
                            const aCombustivel = handleCombustivelFromAno(a.name);
                            return aAno === selectedVeiculo.ano_modelo && aCombustivel === selectedVeiculo.combustivel;
                          })?.code || ""
                        ) : ""}
                        onValueChange={(code) => {
                          const y = anosFipe.find(a => a.code === code);
                          if (y) {
                            const anoMatch = y.name.match(/\d+/);
                            const ano = anoMatch ? Number(anoMatch[0]) : null;
                            const combustivel = handleCombustivelFromAno(y.name);
                            setSelectedVeiculo(prev => prev ? {
                              ...prev,
                              ano_modelo: ano || undefined,
                              combustivel: combustivel || prev.combustivel,
                              fipe: undefined
                            } : prev);
                          }
                        }}
                        disabled={disabledForm || loadingAnos || !selectedVeiculo?.marca || anosFipe.length === 0}
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

                  {/* KM atual */}
                  <div className="space-y-2">
                    <Label htmlFor="kmatual" className="text-sm sm:text-base">
                      KM atual
                    </Label>
                    <Input
                      className="w-full"
                      id="kmatual"
                      inputMode="numeric"
                      value={
                        selectedVeiculo?.kmatual
                          ? String(selectedVeiculo.kmatual)
                          : ""
                      }
                      onChange={(e) =>
                        handleInputChange("kmatual", e.target.value)
                      }
                      placeholder="Ex.: 85000"
                      disabled={disabledForm}
                    />
                  </div>

                  {/* Chassi */}
                  <div className="space-y-2">
                    <Label htmlFor="chassi" className="text-sm sm:text-base">
                      Chassi
                    </Label>
                    <Input
                      className="w-full"
                      id="chassi"
                      value={selectedVeiculo?.chassi || ""}
                      onChange={(e) =>
                        handleInputChange("chassi", e.target.value.toUpperCase())
                      }
                      placeholder="Ex.: 9BW..."
                      disabled={disabledForm}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  {/* Combustível */}
                  <div className="space-y-2">
                    <Label htmlFor="combustivel" className="text-sm sm:text-base">
                      Combustível
                    </Label>
                    <Select
                      value={selectedVeiculo?.combustivel || ""}
                      onValueChange={(value) => handleInputChange("combustivel", value)}
                      disabled={disabledForm}
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

                  {/* Transmissão */}
                  <div className="space-y-2">
                    <Label htmlFor="transmissao" className="text-sm sm:text-base">
                      Transmissão
                    </Label>
                    <Select
                      value={selectedVeiculo?.transmissao || ""}
                      onValueChange={(value) => handleInputChange("transmissao", value)}
                      disabled={disabledForm}
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

                  {/* FIPE */}
                  <div className="space-y-2">
                    <Label htmlFor="fipe" className="text-sm sm:text-base">
                      FIPE (R$)
                    </Label>
                    <div className="flex gap-2">
                      <ValueInput
                        price={selectedVeiculo?.fipe || 0}
                        setPrice={(value: number) => handleInputChange("fipe", value)}
                      />
                      <Button
                        variant="secondary"
                        onClick={handleBuscarFipe}
                        disabled={isOffline || disabledForm || loadingPrice || !selectedVeiculo?.ano_modelo || !selectedVeiculo?.versao}
                      >
                        {loadingPrice ? "Buscando..." : "Buscar"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent
              value="Ordens"
              className="h-full min-h-0 overflow-hidden p-0"
            >
              <div className="h-full min-h-0 overflow-auto rounded-md px-4 py-10 space-y-2 bg-muted-foreground/5">
                <Table className="md:text-xs text-[10px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center">ID</TableHead>
                      <TableHead className="text-center">Descrição</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedVeiculo.ordens ? (
                      selectedVeiculo.ordens.length > 0 ? (
                        selectedVeiculo.ordens.map((ordem) => (
                          <TableRow
                            key={ordem.id}
                            className="hover:cursor-pointer"
                          >
                            <TableCell className="text-center">
                              {ordem.id}
                            </TableCell>
                            <TableCell className="text-center truncate max-w-[200px] md:max-w-xl">
                              {ordem.descricao}
                            </TableCell>
                            <TableCell className="text-center">
                              {ordem.status}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell className="text-center h-20" colSpan={5}>
                            Veículo não possui ordens vinculadas
                          </TableCell>
                        </TableRow>
                      )
                    ) : (
                      <TableRow>
                        <TableCell className="text-center h-20" colSpan={5}>
                          Veículo não possui ordens vinculadas
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="px-6 py-4">
            <div className="flex sm:flex-row gap-3 sm:gap-4">
              <Button
                type="button"
                disabled={isSubmitting || disabledForm}
                onClick={handleUpdateVeiculo}
                className="flex-1 text-sm sm:text-base hover:cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar alterações
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
}
