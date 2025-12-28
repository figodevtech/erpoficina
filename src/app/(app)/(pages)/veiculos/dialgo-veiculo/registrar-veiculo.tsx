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
import { Check, ChevronsUpDown, Upload } from "lucide-react";
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
  clienteId: number;
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
  const [open1, setOpen1] = useState(false);
  const [open2, setOpen2] = useState(false);
  const {cores, errorCores, loadingCores} = useVeiculosCores()

  const handleInputChange = (field: keyof Veiculo, value: string) => {
    setNovoVeiculo({ ...novoVeiculo, [field]: value });
  };

  const handleGetMarcas = async () => {
    if (!novoVeiculo.tipo) return;

    setLoadingMarcas(true);
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
      if (isAxiosError(error)) {
        toast("Erro", { description: error.response?.data?.error });
      }
      console.log(error);
    } finally {
      setLoadingMarcas(false);
    }
  };

  const handleGetModelos = async () => {
    if (!novoVeiculo.marcaId || !novoVeiculo.tipo) return;

    setLoadingModelos(true);
    try {
      const response = await axios.get(
        `https://brasilapi.com.br/api/fipe/veiculos/v1/${novoVeiculo.tipo.toLowerCase()}/${
          novoVeiculo.marcaId
        }`
      );
      if (response.status === 200) {
        console.log(response.data);
        setModelos(response.data);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        toast("Erro", { description: error.response?.data?.error });
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
        console.log(response)
        if (setSelectedVeiculoId) {
          setSelectedVeiculoId(response.data.veiculo.id);
        }

        onRegister?.(response.data.veiculo);
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
    if (isOpen && clienteId && novoVeiculo.tipo) {
      handleGetMarcas();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, novoVeiculo.tipo, clienteId]);

  useEffect(() => {
    if (isOpen && clienteId && novoVeiculo.tipo && novoVeiculo.marcaId) {
      handleGetModelos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, novoVeiculo.tipo, clienteId, novoVeiculo.marcaId]);

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

        <div className="h-full min-h-0 overflow-auto dark:bg-muted-foreground/5 px-6 py-10 space-y-2">
          {/* Tipo */}
          <div className="space-y-2">
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
                  <SelectItem className="hover:cursor-pointer" key={i} value={tipo}>
                    {tipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4">
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

            <div className="space-y-2">
              <Label htmlFor="marca" className="text-sm sm:text-base">
                Marca *
              </Label>

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
                  className="w-[200px] p-0"
                  onWheelCapture={(e) => e.stopPropagation()}
                >
                  <Command>
                    <CommandInput
                      placeholder="Buscar marca..."
                      className="h-9"
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
            </div>

            <div className="space-y-2 col-span-2">
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
                  className="w-[400px] p-0"
                  onWheelCapture={(e) => e.stopPropagation()}
                >
                  <Command>
                    <CommandInput
                      placeholder="Buscar modelo..."
                      className="h-9"
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="cor" className="text-sm sm:text-base">
                Cor
              </Label>
              <Select value={novoVeiculo.cor || ""}
              onValueChange={(value)=>setNovoVeiculo({...novoVeiculo, cor: value})}
              >
                <SelectTrigger className="w-full" disabled={loadingCores}>
                  <SelectValue placeholder={loadingCores ?"Carregando..." : "Selecione a cor"}></SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {cores.map((c)=>(
                    <SelectItem className="hover:cursor-pointer" key={c.id} value={c.nome}>{c.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* <Input
                id="cor"
                value={novoVeiculo.cor || ""}
                onChange={(e) => handleInputChange("cor", e.target.value)}
                placeholder="Ex.: Prata"
              /> */}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ano" className="text-sm sm:text-base">
                Ano
              </Label>
              <Input
                id="ano"
                inputMode="numeric"
                className="w-30"
                maxLength={4}
                value={novoVeiculo.ano || ""}
                onChange={(e) => handleInputChange("ano", e.target.value)}
                placeholder="Ex.: 2019"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="kmatual" className="text-sm sm:text-base">
                KM atual
              </Label>
              <Input
                className="w-30"
                id="kmatual"
                inputMode="numeric"
                value={novoVeiculo.kmatual || ""}
                onChange={(e) => handleInputChange("kmatual", e.target.value)}
                placeholder="Ex.: 85000"
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
