"use client";

import type React from "react";
import { useEffect, useState } from "react";
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

function somenteAlphaNumMaiusculo(valor: string) {
  return valor.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function formatarPlacaParaExibicao(valorSemFormatacao: string) {
  const v = somenteAlphaNumMaiusculo(valorSemFormatacao).slice(0, 7); // placa tem 7 chars
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
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [loadingMarcas, setLoadingMarcas] = useState(false);
  const [loadingModelos, setLoadingModelos] = useState(false);
  const [errorMarcas, setErrorMarcas] = useState(false);
  const [errorModelos, setErrorModelos] = useState(false);
  const [open1, setOpen1] = useState(false);
  const [open2, setOpen2] = useState(false);
  const { cores, errorCores, loadingCores } = useVeiculosCores();
  const [openCustomer, setOpenCustomer] = useState(false);

  const handleInputChange = (field: keyof Veiculo, value: string) => {
    setNovoVeiculo({ ...novoVeiculo, [field]: value });
  };

  const handleGetMarcas = async () => {
    if (!novoVeiculo.tipo) return;

    setLoadingMarcas(true);
    setErrorMarcas(false);
    try {
      const response = await axios.get(
        `https://brasilapi.com.br/api/fipe/marcas/v1/${String(
          novoVeiculo.tipo
        ).toLowerCase()}`
      );
      if (response.status === 200) {
        setMarcas(response.data);
      }
    } catch (error) {
      setErrorMarcas(true);
      if (isAxiosError(error)) {
        toast("FIPE indisponível", { description: "Por favor, digite a marca manualmente." });
      }
      console.log(error);
    } finally {
      setLoadingMarcas(false);
    }
  };

  const handleGetModelos = async () => {
    if (!novoVeiculo.marcaId || !novoVeiculo.tipo) return;

    setLoadingModelos(true);
    setErrorModelos(false);
    try {
      const response = await axios.get(
        `https://brasilapi.com.br/api/fipe/veiculos/v1/${novoVeiculo.tipo.toLowerCase()}/${novoVeiculo.marcaId
        }`
      );
      if (response.status === 200) {
        console.log(response.data);
        setModelos(response.data);
      }
    } catch (error) {
      setErrorModelos(true);
      if (isAxiosError(error)) {
        toast("FIPE indisponível", { description: "Por favor, digite o modelo manualmente." });
      }
      console.log(error);
    } finally {
      setLoadingModelos(false);
    }
  };

  const handleCreateVeiculo = async () => {
    setIsSubmitting(true);
    try {
      const response = await axios.post("/api/veiculos", {
        novoVeiculo,
      });

      if (response.status === 201) {
        toast.success("Sucesso!", {
          description: "Veículo cadastrado.",
          duration: 2000,
        });
        console.log(response);
        if (setSelectedVeiculoId) {
          setSelectedVeiculoId(response.data.data.id);
        }

        onRegister?.(response.data.data);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error("Erro", {
          description: error.response?.data.error,
          duration: 2000,
        });
        console.log(error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (clienteId) {
      setNovoVeiculo({ ...novoVeiculo, clienteid: clienteId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clienteId]);

  useEffect(() => {
    if (isOpen && novoVeiculo.tipo) {
      handleGetMarcas();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, novoVeiculo.tipo]);

  useEffect(() => {
    if (isOpen && novoVeiculo.tipo && novoVeiculo.marcaId) {
      handleGetModelos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, novoVeiculo.tipo, novoVeiculo.marcaId]);

  const marcaSelecionada = marcas.find((m) => m.valor === novoVeiculo.marcaId);

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
                onValueChange={(value: Veiculo_tipos) =>
                  handleInputChange("tipo", value)
                }
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
              <Input
                id="placa"
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
                placeholder="ABC-1D23 ou ABC-1234"
                autoCapitalize="characters"
              />
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

              {errorMarcas ? (
                <Input
                  id="marca"
                  value={novoVeiculo.marca || ""}
                  onChange={(e) => handleInputChange("marca", e.target.value.toUpperCase())}
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
                      className="w-[200px] justify-between text-xs"
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
                          {marcas.map((m) => (
                            <CommandItem
                              className="hover:cursor-pointer"
                              key={m.valor}
                              value={m.nome} // ajuda a busca pelo nome
                              onSelect={() => {
                                setNovoVeiculo({
                                  ...novoVeiculo,
                                  marcaId: m.valor,
                                  marca: m.nome.toUpperCase(),
                                  modelo: "",
                                });
                                setOpen2(false);
                              }}
                            >
                              {m.nome.toUpperCase()}
                              <Check
                                className={cn(
                                  "ml-auto",
                                  novoVeiculo.marcaId === m.valor
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
              {errorModelos || errorMarcas ? (
                <Input
                  id="modelo"
                  value={novoVeiculo.modelo || ""}
                  onChange={(e) => handleInputChange("modelo", e.target.value.toUpperCase())}
                  placeholder="Ex.: ONIX 1.0"
                />
              ) : (
                <Popover open={open1} onOpenChange={setOpen1}>
                  <PopoverTrigger asChild>
                    <Button
                      id="modelo"
                      variant="outline"
                      role="combobox"
                      aria-expanded={open1}
                      className="w-[400px] justify-between text-xs"
                      disabled={
                        loadingModelos ||
                        !novoVeiculo.tipo ||
                        !novoVeiculo.marcaId
                      }
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
                          {modelos.map((m, i) => (
                            <CommandItem
                              className="hover:cursor-pointer text-xs"
                              key={i}
                              value={m.modelo} // ajuda a busca pelo nome
                              onSelect={() => {
                                setNovoVeiculo({
                                  ...novoVeiculo,
                                  modelo: m.modelo.toUpperCase(),
                                });
                                setOpen1(false);
                              }}
                            >
                              {m.modelo.toUpperCase()}
                              <Check
                                className={cn(
                                  "ml-auto",
                                  novoVeiculo.modelo === m.modelo.toUpperCase()
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

            <div className="space-y-2 col-span-2">
              <Label htmlFor="versao" className="text-sm sm:text-base">
                Versão
              </Label>
              <Input
                className="w-full"
                id="versao"
                value={novoVeiculo.versao || ""}
                onChange={(e) => handleInputChange("versao", e.target.value.toUpperCase())}
                placeholder="Ex.: LTZ"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ano" className="text-sm sm:text-base">
                Ano
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
              <Input
                id="ano_modelo"
                inputMode="numeric"
                className="w-full"

                maxLength={4}
                value={novoVeiculo.ano_modelo || ""}
                onChange={(e) => handleInputChange("ano_modelo", e.target.value)}
                placeholder="Ex.: 2020"
              />
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
              <Input
                className="w-full"
                id="fipe"
                inputMode="numeric"
                value={novoVeiculo.fipe || ""}
                onChange={(e) => handleInputChange("fipe", e.target.value)}
                placeholder="Ex.: 50000"
              />
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
