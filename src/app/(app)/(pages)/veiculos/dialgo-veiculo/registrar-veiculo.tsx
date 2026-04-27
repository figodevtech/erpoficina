"use client";

import { useEffect, useMemo, useState } from "react";
import axios, { isAxiosError } from "axios";
import { BadgePlus, CarFront, Check, ChevronsUpDown, Loader2, Search, Save } from "lucide-react";
import CustomerSelect from "@/app/(app)/components/customerSelect";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useVeiculosCores } from "../../configuracoes/tipos/hooks/use-veiculos-cores";
import { Veiculo, Veiculo_tipos } from "../types";

function somenteAlphaNumMaiusculo(valor: string) {
  return valor.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function formatarPlacaParaExibicao(valorSemFormatacao: string) {
  const valor = somenteAlphaNumMaiusculo(valorSemFormatacao).slice(0, 7);
  if (valor.length <= 3) return valor;
  return `${valor.slice(0, 3)}-${valor.slice(3)}`;
}

function normalizarTextoBusca(valor: string) {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();
}

type Marca = {
  nome: string;
  valor: number;
};

type Modelo = {
  modelo: string;
};

type VeiculoPlacaLookup = {
  placa: string;
  marca: string | null;
  modelo: string | null;
  ano: number | null;
  cor: string | null;
  chassi: string | null;
  tipo: Veiculo_tipos | null;
};

interface RegisterContentProps {
  novoVeiculo: Veiculo;
  setNovoVeiculo: (value: Veiculo) => void;
  setSelectedVeiculoId?: (value: number | undefined) => void;
  onRegister?: (c: Veiculo) => void;
  clienteId?: number;
  isOpen: boolean;
}

export default function RegisterContent({
  novoVeiculo,
  setNovoVeiculo,
  setSelectedVeiculoId,
  onRegister,
  clienteId,
  isOpen,
}: RegisterContentProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLookingUpPlate, setIsLookingUpPlate] = useState(false);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [loadingMarcas, setLoadingMarcas] = useState(false);
  const [loadingModelos, setLoadingModelos] = useState(false);
  const [openModelo, setOpenModelo] = useState(false);
  const [openMarca, setOpenMarca] = useState(false);
  const [openCustomer, setOpenCustomer] = useState(false);
  const [marcaPendente, setMarcaPendente] = useState<string | null>(null);
  const [modeloPendente, setModeloPendente] = useState<string | null>(null);
  const { cores, loadingCores } = useVeiculosCores();

  const placaNormalizada = useMemo(
    () => somenteAlphaNumMaiusculo(novoVeiculo.placa || "").slice(0, 7),
    [novoVeiculo.placa]
  );

  const podeBuscarPlaca = placaNormalizada.length === 7;

  const aplicarAtualizacao = (patch: Partial<Veiculo>) => {
    setNovoVeiculo({
      ...novoVeiculo,
      ...patch,
    });
  };

  const atualizarTipo = (tipo: Veiculo_tipos) => {
    setMarcaPendente(null);
    setModeloPendente(null);
    setMarcas([]);
    setModelos([]);
    setOpenMarca(false);
    setOpenModelo(false);
    aplicarAtualizacao({
      tipo,
      marcaId: undefined,
      marca: "",
      modelo: "",
    });
  };

  const handleGetMarcas = async (tipo: Veiculo_tipos) => {
    setLoadingMarcas(true);
    try {
      const response = await axios.get("/api/fipe/veiculos", {
        params: { tipo: String(tipo).toLowerCase() },
      });
      setMarcas(Array.isArray(response.data?.marcas) ? response.data.marcas : []);
    } catch (error) {
      setMarcas([]);
      if (isAxiosError(error)) {
        toast.error("Erro ao carregar marcas", {
          description: error.response?.data?.error || error.message,
        });
      }
    } finally {
      setLoadingMarcas(false);
    }
  };

  const handleGetModelos = async (tipo: Veiculo_tipos, marcaId: number) => {
    setLoadingModelos(true);
    try {
      const response = await axios.get("/api/fipe/veiculos", {
        params: {
          tipo: String(tipo).toLowerCase(),
          marcaId,
        },
      });
      setModelos(Array.isArray(response.data?.modelos) ? response.data.modelos : []);
    } catch (error) {
      setModelos([]);
      if (isAxiosError(error)) {
        toast.error("Erro ao carregar modelos", {
          description: error.response?.data?.error || error.message,
        });
      }
    } finally {
      setLoadingModelos(false);
    }
  };

  const handleBuscarPorPlaca = async () => {
    if (!podeBuscarPlaca) {
      toast.error("Placa inválida", {
        description: "Informe uma placa com 7 caracteres para consultar.",
      });
      return;
    }

    setIsLookingUpPlate(true);
    try {
      const response = await axios.get<{ data: VeiculoPlacaLookup }>("/api/veiculos/placa", {
        params: { placa: placaNormalizada },
      });

      const lookup = response.data?.data;
      if (!lookup) {
        throw new Error("Nenhum dado retornado para a placa informada.");
      }

      const corNormalizada = lookup.cor
        ? cores.find(
            (cor) =>
              normalizarTextoBusca(cor.nome) === normalizarTextoBusca(lookup.cor || "")
          )?.nome ?? lookup.cor
        : novoVeiculo.cor;

      setMarcaPendente(lookup.marca ? normalizarTextoBusca(lookup.marca) : null);
      setModeloPendente(lookup.modelo ? normalizarTextoBusca(lookup.modelo) : null);

      aplicarAtualizacao({
        placa: lookup.placa || placaNormalizada,
        tipo: lookup.tipo ?? novoVeiculo.tipo,
        marcaId: undefined,
        marca: lookup.marca?.toUpperCase() || novoVeiculo.marca || "",
        modelo: lookup.modelo?.toUpperCase() || novoVeiculo.modelo || "",
        ano: lookup.ano ?? novoVeiculo.ano,
        cor: corNormalizada || "",
        chassi: lookup.chassi?.toUpperCase() || novoVeiculo.chassi || "",
      });

      toast.success("Dados preenchidos", {
        description: "As informações do veículo foram carregadas a partir da placa.",
      });
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error("Não foi possível consultar a placa", {
          description: error.response?.data?.error || error.message,
        });
      } else if (error instanceof Error) {
        toast.error("Não foi possível consultar a placa", {
          description: error.message,
        });
      }
    } finally {
      setIsLookingUpPlate(false);
    }
  };

  const handleCreateVeiculo = async () => {
    setIsSubmitting(true);
    try {
      const response = await axios.post("/api/veiculos", {
        novoVeiculo,
      });

      if (response.status === 201) {
        toast.success("Sucesso", {
          description: "Veículo cadastrado.",
          duration: 2000,
        });

        setSelectedVeiculoId?.(response.data.data.id);
        onRegister?.(response.data.data);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error("Erro", {
          description: error.response?.data?.error || error.message,
          duration: 2000,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!clienteId) return;
    aplicarAtualizacao({ clienteid: clienteId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clienteId]);

  useEffect(() => {
    if (!isOpen || !novoVeiculo.tipo) return;
    handleGetMarcas(novoVeiculo.tipo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, novoVeiculo.tipo]);

  useEffect(() => {
    if (!marcas.length || !marcaPendente) return;

    const marcaEncontrada = marcas.find(
      (marca) => normalizarTextoBusca(marca.nome) === marcaPendente
    );

    if (!marcaEncontrada) return;

    aplicarAtualizacao({
      marcaId: marcaEncontrada.valor,
      marca: marcaEncontrada.nome.toUpperCase(),
    });
    setMarcaPendente(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marcas, marcaPendente]);

  useEffect(() => {
    if (!isOpen || !novoVeiculo.tipo || !novoVeiculo.marcaId) return;
    handleGetModelos(novoVeiculo.tipo, novoVeiculo.marcaId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, novoVeiculo.tipo, novoVeiculo.marcaId]);

  useEffect(() => {
    if (!modelos.length || !modeloPendente) return;

    const modeloEncontrado = modelos.find(
      (modelo) => normalizarTextoBusca(modelo.modelo) === modeloPendente
    );

    if (!modeloEncontrado) return;

    aplicarAtualizacao({
      modelo: modeloEncontrado.modelo.toUpperCase(),
    });
    setModeloPendente(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelos, modeloPendente]);

  return (
    <DialogContent className="h-svh min-w-screen overflow-hidden p-0 sm:h-auto sm:max-h-[860px] sm:min-w-0 sm:max-w-[980px]">
      <div className="flex h-full min-h-0 flex-col">
        <DialogHeader className="shrink-0 border-b px-6 py-4">
          <DialogTitle className="flex items-center gap-2">
            <BadgePlus className="h-5 w-5 text-primary" />
            Cadastro de Veículo
          </DialogTitle>
          <DialogDescription>
            Preencha os dados abaixo para registrar um novo veículo.
          </DialogDescription>
        </DialogHeader>

        <CustomerSelect
          open={openCustomer}
          setOpen={setOpenCustomer}
          OnSelect={(cliente) =>
            aplicarAtualizacao({ clienteid: cliente.id, cliente })
          }
        />

        <div className="min-h-0 flex-1 overflow-auto bg-muted/5 px-6 py-6">
          <div className="space-y-6">
            <section className="rounded-xl border bg-background p-4">
              <div className="mb-4 flex items-center gap-2">
                <CarFront className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Identificação
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="tipo">Tipo de veículo *</Label>
                  <Select
                    value={(novoVeiculo.tipo as string) || ""}
                    onValueChange={(value: Veiculo_tipos) => atualizarTipo(value)}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(Veiculo_tipos).map((tipo) => (
                        <SelectItem
                          className="hover:cursor-pointer"
                          key={tipo}
                          value={tipo}
                        >
                          {tipo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {!clienteId && (
                  <div className="space-y-2 md:col-span-3">
                    <Label>Cliente proprietário</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        className="w-full"
                        value={novoVeiculo.cliente?.nomerazaosocial || ""}
                        disabled
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="shrink-0"
                        onClick={() => setOpenCustomer(true)}
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="placa">Placa *</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="placa"
                      value={formatarPlacaParaExibicao(placaNormalizada)}
                      onChange={(e) => {
                        aplicarAtualizacao({
                          placa: somenteAlphaNumMaiusculo(e.target.value).slice(0, 7),
                        });
                      }}
                      maxLength={8}
                      placeholder="ABC-1D23 ou ABC-1234"
                      autoCapitalize="characters"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="shrink-0"
                      disabled={isLookingUpPlate || !podeBuscarPlaca}
                      onClick={handleBuscarPorPlaca}
                    >
                      {isLookingUpPlate ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                      Buscar
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Marca *</Label>
                  <Popover open={openMarca} onOpenChange={setOpenMarca}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openMarca}
                        className="h-10 w-full justify-between text-xs"
                        disabled={loadingMarcas || !novoVeiculo.tipo}
                      >
                        {loadingMarcas
                          ? "Carregando..."
                          : novoVeiculo.marca || "Selecione a marca"}
                        <ChevronsUpDown className="opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      align="start"
                      className="w-[var(--radix-popover-trigger-width)] p-0"
                      onWheel={(e) => e.stopPropagation()}
                      onTouchMove={(e) => e.stopPropagation()}
                      onOpenAutoFocus={(e) => e.preventDefault()}
                    >
                      <Command>
                        <CommandInput placeholder="Buscar marca..." className="h-9 text-base" />
                        <CommandList className="max-h-64 overflow-y-auto overscroll-contain">
                          <CommandEmpty>Nenhuma marca encontrada.</CommandEmpty>
                          <CommandGroup>
                            {marcas.map((marca) => (
                              <CommandItem
                                className="hover:cursor-pointer"
                                key={marca.valor}
                                value={marca.nome}
                                onSelect={() => {
                                  setMarcaPendente(null);
                                  setModeloPendente(null);
                                  setModelos([]);
                                  aplicarAtualizacao({
                                    marcaId: marca.valor,
                                    marca: marca.nome.toUpperCase(),
                                    modelo: "",
                                  });
                                  setOpenMarca(false);
                                }}
                              >
                                {marca.nome.toUpperCase()}
                                <Check
                                  className={cn(
                                    "ml-auto",
                                    novoVeiculo.marcaId === marca.valor
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

                <div className="space-y-2 md:col-span-2">
                  <Label>Modelo *</Label>
                  <Popover open={openModelo} onOpenChange={setOpenModelo}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openModelo}
                        className="h-10 w-full justify-between text-xs"
                        disabled={loadingModelos || !novoVeiculo.tipo || !novoVeiculo.marcaId}
                      >
                        {loadingModelos
                          ? "Carregando..."
                          : novoVeiculo.modelo || "Selecione o modelo"}
                        <ChevronsUpDown className="opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      align="start"
                      className="w-[var(--radix-popover-trigger-width)] p-0"
                      onWheel={(e) => e.stopPropagation()}
                      onTouchMove={(e) => e.stopPropagation()}
                      onOpenAutoFocus={(e) => e.preventDefault()}
                    >
                      <Command>
                        <CommandInput placeholder="Buscar modelo..." className="h-9 text-base" />
                        <CommandList className="max-h-64 overflow-y-auto overscroll-contain">
                          <CommandEmpty>Nenhum modelo encontrado.</CommandEmpty>
                          <CommandGroup>
                            {modelos.map((modelo, index) => (
                              <CommandItem
                                className="hover:cursor-pointer text-xs"
                                key={`${modelo.modelo}-${index}`}
                                value={modelo.modelo}
                                onSelect={() => {
                                  setModeloPendente(null);
                                  aplicarAtualizacao({
                                    modelo: modelo.modelo.toUpperCase(),
                                  });
                                  setOpenModelo(false);
                                }}
                              >
                                {modelo.modelo.toUpperCase()}
                                <Check
                                  className={cn(
                                    "ml-auto",
                                    novoVeiculo.modelo === modelo.modelo.toUpperCase()
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
              </div>
            </section>

            <section className="rounded-xl border bg-background p-4">
              <div className="mb-4 flex items-center gap-2">
                <CarFront className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Detalhes do veículo
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="cor">Cor</Label>
                  <Select
                    value={novoVeiculo.cor || ""}
                    onValueChange={(value) => aplicarAtualizacao({ cor: value })}
                  >
                    <SelectTrigger className="h-10 w-full" disabled={loadingCores}>
                      <SelectValue
                        placeholder={loadingCores ? "Carregando..." : "Selecione a cor"}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {cores.map((cor) => (
                        <SelectItem
                          className="hover:cursor-pointer"
                          key={cor.id}
                          value={cor.nome}
                        >
                          {cor.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ano">Ano</Label>
                  <Input
                    id="ano"
                    inputMode="numeric"
                    maxLength={4}
                    value={novoVeiculo.ano ?? ""}
                    onChange={(e) =>
                      aplicarAtualizacao({
                        ano: e.target.value === "" ? undefined : Number(e.target.value),
                      })
                    }
                    placeholder="Ex.: 2019"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="kmatual">KM atual</Label>
                  <Input
                    id="kmatual"
                    inputMode="numeric"
                    value={novoVeiculo.kmatual ?? ""}
                    onChange={(e) =>
                      aplicarAtualizacao({
                        kmatual: e.target.value === "" ? undefined : Number(e.target.value),
                      })
                    }
                    placeholder="Ex.: 85000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="chassi">Chassi</Label>
                  <Input
                    id="chassi"
                    value={novoVeiculo.chassi || ""}
                    onChange={(e) =>
                      aplicarAtualizacao({ chassi: e.target.value.toUpperCase() })
                    }
                    placeholder="Ex.: 9BWZZZ377VT004251"
                    autoCapitalize="characters"
                  />
                </div>
              </div>
            </section>
          </div>
        </div>

        <DialogFooter className="shrink-0 border-t px-6 py-4">
          <div className="flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="sm:min-w-[120px]">
                Cancelar
              </Button>
            </DialogClose>
            <Button
              type="submit"
              form="register-form"
              disabled={isSubmitting}
              onClick={handleCreateVeiculo}
              className="sm:min-w-[110px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </div>
    </DialogContent>
  );
}
