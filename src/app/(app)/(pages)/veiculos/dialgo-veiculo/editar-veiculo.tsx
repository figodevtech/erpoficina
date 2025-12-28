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
import { Check, ChevronsUpDown, Save } from "lucide-react";
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

function somenteAlphaNumMaiusculo(valor: string) {
  return valor.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function formatarPlacaParaExibicao(valorSemFormatacao: string) {
  const v = somenteAlphaNumMaiusculo(valorSemFormatacao).slice(0, 7);
  if (v.length <= 3) return v;
  return `${v.slice(0, 3)}-${v.slice(3)}`;
}

interface Marca {
  nome: string;
  valor: number;
}
interface Modelo {
  modelo: string;
}

interface GetVeiculoResponse {
  veiculo: Veiculo & {
    // pelo seu exemplo, vem um objeto cliente junto
    cliente?: { id: number; cpfcnpj: string; nomerazaosocial: string };
    placa_formatada?: string;
  };
}

interface EditContentProps {
  veiculoId?: number;
  isOpen: boolean;
  onUpdated?: (v: Veiculo) => void;
}

export default function EditContent({ veiculoId, isOpen, onUpdated }: EditContentProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingVeiculo, setIsLoadingVeiculo] = useState(false);

  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [loadingMarcas, setLoadingMarcas] = useState(false);
  const [loadingModelos, setLoadingModelos] = useState(false);

  const [openMarca, setOpenMarca] = useState(false);
  const [openModelo, setOpenModelo] = useState(false);

  const [selectedVeiculo, setSelectedVeiculo] = useState<(Veiculo & { marcaId?: number }) | undefined>(undefined);

  const { cores, loadingCores } = useVeiculosCores();

  const handleInputChange = (field: keyof Veiculo, value: any) => {
    setSelectedVeiculo((prev) => {
      if (!prev) return prev;
      return { ...prev, [field]: value };
    });
  };

  const handleGetVeiculo = async () => {
    if (!veiculoId) return;

    setIsLoadingVeiculo(true);
    try {
      const response = await axios.get<GetVeiculoResponse>(`/api/veiculos/${veiculoId}`);
      if (response.status === 200) {
        const v = response.data.veiculo;

        // garantia: placa no state sem hífen e com 7 chars
        const placaNormalizada = somenteAlphaNumMaiusculo(String(v.placa ?? "")).slice(0, 7);

        setSelectedVeiculo({
          ...v,
          placa: placaNormalizada,
          // marcaId vai ser preenchido depois (quando carregarmos as marcas)
        });
      }
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error("Erro", { description: error.response?.data?.error ?? "Falha ao buscar veículo" });
      }
    } finally {
      setIsLoadingVeiculo(false);
    }
  };

  const handleGetMarcas = async (tipo: string) => {
    setLoadingMarcas(true);
    try {
      const response = await axios.get<Marca[]>(
        `https://brasilapi.com.br/api/fipe/marcas/v1/${String(tipo).toLowerCase()}`
      );
      if (response.status === 200) setMarcas(response.data);
    } catch (error) {
      if (isAxiosError(error)) toast.error("Erro", { description: error.response?.data?.error });
    } finally {
      setLoadingMarcas(false);
    }
  };

  const handleGetModelos = async (tipo: string, marcaId: number) => {
    setLoadingModelos(true);
    try {
      const response = await axios.get<Modelo[]>(
        `https://brasilapi.com.br/api/fipe/veiculos/v1/${String(tipo).toLowerCase()}/${marcaId}`
      );
      if (response.status === 200) setModelos(response.data);
    } catch (error) {
      if (isAxiosError(error)) toast.error("Erro", { description: error.response?.data?.error });
    } finally {
      setLoadingModelos(false);
    }
  };

  const handleUpdateVeiculo = async () => {
    if (!selectedVeiculo?.id) return;

    setIsSubmitting(true);
    try {
      // Ajuste aqui se seu endpoint/método for diferente:
      const response = await axios.put(`/api/veiculos/${selectedVeiculo.id}`, {
        selectedVeiculo,
      });

      if (response.status === 200) {
        toast.success("Sucesso!", { description: "Veículo atualizado.", duration: 2000 });

        // se seu endpoint retornar o veículo atualizado, você pode usar response.data.veiculo
        onUpdated?.(selectedVeiculo);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error("Erro", {
          description: error.response?.data?.error ?? "Falha ao atualizar veículo",
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

  // 2) Quando tiver tipo, buscar marcas
  useEffect(() => {
    if (!isOpen) return;
    if (!selectedVeiculo?.tipo) return;

    handleGetMarcas(String(selectedVeiculo.tipo));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, selectedVeiculo?.tipo]);

  // 3) Quando marcas carregarem, tentar resolver marcaId pelo nome vindo do veículo
  useEffect(() => {
    if (!selectedVeiculo?.marca) return;
    if (!marcas.length) return;

    // match por nome (case-insensitive)
    const alvo = String(selectedVeiculo.marca).trim().toLowerCase();
    const achada = marcas.find((m) => m.nome.trim().toLowerCase() === alvo);

    if (achada && selectedVeiculo.marcaId !== achada.valor) {
      setSelectedVeiculo((prev) => (prev ? { ...prev, marcaId: achada.valor } : prev));
    }
  }, [marcas, selectedVeiculo?.marca, selectedVeiculo?.marcaId]);

  // 4) Quando tiver tipo + marcaId, buscar modelos
  useEffect(() => {
    if (!isOpen) return;
    if (!selectedVeiculo?.tipo) return;
    if (!selectedVeiculo?.marcaId) return;

    handleGetModelos(String(selectedVeiculo.tipo), Number(selectedVeiculo.marcaId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, selectedVeiculo?.tipo, selectedVeiculo?.marcaId]);

  const disabledForm = isLoadingVeiculo || !selectedVeiculo;

  const marcaSelecionada = useMemo(() => {
    if (!selectedVeiculo?.marcaId) return undefined;
    return marcas.find((m) => m.valor === selectedVeiculo.marcaId);
  }, [marcas, selectedVeiculo?.marcaId]);

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
  

    if(selectedVeiculo){

      return (
        <DialogContent className="h-svh min-w-screen p-0 overflow-hidden sm:max-w-[1100px] sm:max-h-[850px] sm:w-[95vw] sm:min-w-0">
          <div className="flex h-full min-h-0 flex-col">
            <DialogHeader className="shrink-0 px-6 py-4 border-b-1">
              <DialogTitle>
                {isLoadingVeiculo ? "Carregando..." : `Editar Veículo ID #${selectedVeiculo?.id ?? "-"}`}
              </DialogTitle>
              <DialogDescription>Atualize os dados do veículo</DialogDescription>
            </DialogHeader>
    
            <div className="h-full min-h-0 overflow-auto dark:bg-muted-foreground/5 px-6 py-10 space-y-4">
              {/* Tipo */}
              <div className="space-y-2">
                <Label htmlFor="tipo" className="text-sm sm:text-base">
                  Tipo de Veículo *
                </Label>
                <Select
                  value={(selectedVeiculo?.tipo as unknown as string) || ""}
                  onValueChange={(value: Veiculo_tipos) => {
                    // ao trocar o tipo, resetar marca/modelo para evitar inconsistência
                    setSelectedVeiculo((prev) => {
                      if (!prev) return prev;
                      return {
                        ...prev,
                        tipo: value as any,
                        marca: "",
                        modelo: "",
                        marcaId: undefined,
                      };
                    });
                  }}
                  disabled={disabledForm}
                >
                  <SelectTrigger className="h-10 sm:h-11">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(Veiculo_tipos).map((tipo, i) => (
                      <SelectItem className="hover:cursor-pointer" key={i} value={tipo}>
                        {tipo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
    
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4">
                {/* Placa */}
                <div className="space-y-2">
                  <Label htmlFor="placa" className="text-sm sm:text-base">
                    Placa *
                  </Label>
                  <Input
                    id="placa"
                    value={formatarPlacaParaExibicao(selectedVeiculo?.placa || "")}
                    onChange={(e) => {
                      const digitado = e.target.value;
                      const semHifen = somenteAlphaNumMaiusculo(digitado).slice(0, 7);
                      setSelectedVeiculo((prev) => (prev ? { ...prev, placa: semHifen } : prev));
                    }}
                    maxLength={8}
                    placeholder="ABC-1D23 ou ABC-1234"
                    autoCapitalize="characters"
                    disabled={disabledForm}
                  />
                </div>
    
                {/* Marca */}
                <div className="space-y-2">
                  <Label htmlFor="marca" className="text-sm sm:text-base">
                    Marca *
                  </Label>
    
                  <Popover open={openMarca} onOpenChange={setOpenMarca}>
                    <PopoverTrigger asChild>
                      <Button
                        id="marca"
                        variant="outline"
                        role="combobox"
                        aria-expanded={openMarca}
                        className="w-[200px] justify-between text-xs"
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
    
                    <PopoverContent className="w-[200px] p-0" onWheelCapture={(e) => e.stopPropagation()}>
                      <Command>
                        <CommandInput placeholder="Buscar marca..." className="h-9" />
                        <CommandList className="max-h-64 overflow-y-auto overscroll-contain">
                          <CommandEmpty>Nenhuma marca encontrada.</CommandEmpty>
                          <CommandGroup>
                            {marcas.map((m) => (
                              <CommandItem
                                className="hover:cursor-pointer"
                                key={m.valor}
                                value={m.nome}
                                onSelect={() => {
                                  setSelectedVeiculo((prev) => {
                                    if (!prev) return prev;
                                    return {
                                      ...prev,
                                      marcaId: m.valor,
                                      marca: m.nome.toUpperCase(),
                                      modelo: "",
                                    };
                                  });
                                  setOpenMarca(false);
                                }}
                              >
                                {m.nome.toUpperCase()}
                                <Check
                                  className={cn(
                                    "ml-auto",
                                    selectedVeiculo?.marcaId === m.valor ? "opacity-100" : "opacity-0"
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
    
                {/* Modelo */}
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="modelo" className="text-sm sm:text-base">
                    Modelo *
                  </Label>
    
                  <Popover open={openModelo} onOpenChange={setOpenModelo}>
                    <PopoverTrigger asChild>
                      <Button
                        id="modelo"
                        variant="outline"
                        role="combobox"
                        aria-expanded={openModelo}
                        className="w-[400px] justify-between text-xs"
                        disabled={
                          disabledForm ||
                          loadingModelos ||
                          !selectedVeiculo?.tipo ||
                          !selectedVeiculo?.marcaId
                        }
                      >
                        {loadingModelos
                          ? "Carregando..."
                          : selectedVeiculo?.modelo
                          ? selectedVeiculo.modelo
                          : "Selecione..."}
                        <ChevronsUpDown className="opacity-50" />
                      </Button>
                    </PopoverTrigger>
    
                    <PopoverContent className="w-[400px] p-0" onWheelCapture={(e) => e.stopPropagation()}>
                      <Command>
                        <CommandInput placeholder="Buscar modelo..." className="h-9" />
                        <CommandList className="max-h-64 overflow-y-auto overscroll-contain">
                          <CommandEmpty>Nenhum modelo encontrado.</CommandEmpty>
    
                          <CommandGroup>
                            {modelos.map((m, i) => (
                              <CommandItem
                                className="hover:cursor-pointer text-xs"
                                key={i}
                                value={m.modelo}
                                onSelect={() => {
                                  setSelectedVeiculo((prev) =>
                                    prev ? { ...prev, modelo: m.modelo.toUpperCase() } : prev
                                  );
                                  setOpenModelo(false);
                                }}
                              >
                                {m.modelo.toUpperCase()}
                                <Check
                                  className={cn(
                                    "ml-auto",
                                    selectedVeiculo?.modelo === m.modelo.toUpperCase()
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
    
                  {/* Dica rápida pra debug: */}
                  {/* <div className="text-xs opacity-60">
                    marcaId resolvida: {marcaSelecionada?.valor ?? "-"}
                  </div> */}
                </div>
    
                {/* Cor */}
                <div className="space-y-2">
                  <Label htmlFor="cor" className="text-sm sm:text-base">
                    Cor
                  </Label>
                  <Select
                    value={selectedVeiculo?.cor || ""}
                    onValueChange={(value) => handleInputChange("cor", value)}
                    disabled={disabledForm || loadingCores}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={loadingCores ? "Carregando..." : "Selecione a cor"} />
                    </SelectTrigger>
                    <SelectContent>
                      {cores.map((c) => (
                        <SelectItem className="hover:cursor-pointer" key={c.id} value={c.nome}>
                          {c.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
    
                {/* Ano */}
                <div className="space-y-2">
                  <Label htmlFor="ano" className="text-sm sm:text-base">
                    Ano
                  </Label>
                  <Input
                    id="ano"
                    inputMode="numeric"
                    className="w-30"
                    maxLength={4}
                    value={selectedVeiculo?.ano ? String(selectedVeiculo.ano) : ""}
                    onChange={(e) => handleInputChange("ano", e.target.value)}
                    placeholder="Ex.: 2019"
                    disabled={disabledForm}
                  />
                </div>
              </div>
    
              {/* KM atual */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="kmatual" className="text-sm sm:text-base">
                    KM atual
                  </Label>
                  <Input
                    className="w-30"
                    id="kmatual"
                    inputMode="numeric"
                    value={selectedVeiculo?.kmatual ? String(selectedVeiculo.kmatual) : ""}
                    onChange={(e) => handleInputChange("kmatual", e.target.value)}
                    placeholder="Ex.: 85000"
                    disabled={disabledForm}
                  />
                </div>
              </div>
            </div>
    
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
