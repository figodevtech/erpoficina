"use client";

import type React from "react";
import { useState } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Upload,
  User,
  Building2,
  Mail,
  Phone,
  FileText,
  Camera,
  ChevronsUpDown,
  Check,
} from "lucide-react";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  NewCustomer,
  StatusCliente,
  TipoPessoa,
  ESTADOS_BRASIL,
} from "./types";
import { formatCep, formatCpfCnpj, formatTelefone } from "./utils";
import { useGetCidades } from "@/app/(app)/hooks/useGetCidades";
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
import axios, { isAxiosError } from "axios";
import { toast } from "sonner";

interface RegisterContentProps {
  newCustomer: NewCustomer;
  setNewCustomer: (value: NewCustomer) => void;
  setSelectedCustomerId?: (value: number | undefined) => void;
}

export default function RegisterContent({
  newCustomer,
  setNewCustomer,
  setSelectedCustomerId,
}: RegisterContentProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { cidades, loading } = useGetCidades(newCustomer?.estado);
  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(false);

  const handleInputChange = (field: keyof NewCustomer, value: string) => {
    setNewCustomer({ ...newCustomer, [field]: value });
  };

  // useEffect(()=>{
  //   console.log(newCustomer)
  // },[newCustomer])

  const handleCreateCustomer = async () => {
    setIsSubmitting(true);
    try {
      const response = await axios.post("/api/customers", {
        newCustomer,
      });

      if (response.status === 201) {
        console.log(response.data.data);
        toast.success("Sucesso!", {
          description: "Cliente cadastrado.",
          duration: 2000,
        });
        if(setSelectedCustomerId){

          setSelectedCustomerId(response.data.id);
        }
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
  return (
    // <DialogContent className="h-dvh sm:max-w-[1100px] w-[95vw] p-2 overflow-hidden">
    <DialogContent className="h-svh min-w-screen p-0 overflow-hidden sm:max-w-[1100px] sm:max-h-[850px] sm:w-[95vw] sm:min-w-0">
      <div className="flex h-full min-h-0 flex-col">
        <DialogHeader className="shrink-0 px-6 py-4 border-b-1">
          <DialogTitle>Cadastro de Cliente</DialogTitle>
          <DialogDescription>
            Preencha dados para registrar um novo cliente
          </DialogDescription>
        </DialogHeader>

        {/* CONTEÚDO DA ABA: o scroll fica no wrapper interno */}

        <div className="h-full min-h-0 overflow-auto dark:bg-muted-foreground/5 px-6 py-10 space-y-2">
          {/* Foto do Cliente */}
          <div className="flex flex-col items-center space-y-3 sm:space-y-4">
            <div className="relative">
              <Avatar className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24">
                <AvatarImage
                  // src={fotoPreview || "/placeholder.svg"}
                  alt="Foto do cliente"
                />
                <AvatarFallback className="text-sm sm:text-lg">
                  {newCustomer.tipopessoa === "FISICA" ? (
                    <User className="h-6 w-6 sm:h-8 sm:w-8" />
                  ) : (
                    <Building2 className="h-6 w-6 sm:h-8 sm:w-8" />
                  )}
                </AvatarFallback>
              </Avatar>
              <Label
                htmlFor="foto-upload"
                className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 cursor-pointer"
              >
                <div className="bg-primary text-primary-foreground rounded-full p-1.5 sm:p-2 hover:bg-primary/90 transition-colors">
                  <Camera className="h-3 w-3 sm:h-4 sm:w-4" />
                </div>
                <input
                  id="foto-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                />
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm sm:text-base">
              Status
            </Label>
            <Select
              value={newCustomer.status || ""}
              onValueChange={(value: StatusCliente) =>
                handleInputChange("status", value)
              }
            >
              <SelectTrigger className="h-10 sm:h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ATIVO">
                  <Badge variant="default" className="bg-green-500">
                    Ativo
                  </Badge>
                </SelectItem>
                <SelectItem value="INATIVO">
                  <Badge variant="secondary">Inativo</Badge>
                </SelectItem>
                <SelectItem value="PENDENTE">
                  <Badge variant="destructive">Pendente</Badge>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Tipo de Pessoa */}
          <div className="space-y-2">
            <Label htmlFor="tipopessoa" className="text-sm sm:text-base">
              Tipo de Pessoa *
            </Label>
            <Select
              value={newCustomer.tipopessoa}
              onValueChange={(value: TipoPessoa) =>
                handleInputChange("tipopessoa", value)
              }
            >
              <SelectTrigger className="h-10 sm:h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FISICA">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="text-sm sm:text-base">Pessoa Física</span>
                  </div>
                </SelectItem>
                <SelectItem value="JURIDICA">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    <span className="text-sm sm:text-base">
                      Pessoa Jurídica
                    </span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Dados Principais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="cpfcnpj" className="text-sm sm:text-base">
                {newCustomer.tipopessoa === "FISICA" ? "CPF" : "CNPJ"} *
              </Label>
              <Input
                inputMode="numeric"
                id="cpfcnpj"
                className=""
                value={formatCpfCnpj(
                  newCustomer.cpfcnpj,
                  newCustomer.tipopessoa
                )}
                onChange={(e) => handleInputChange("cpfcnpj", e.target.value)}
                placeholder={
                  newCustomer.tipopessoa === "FISICA"
                    ? "000.000.000-00"
                    : "00.000.000/0000-00"
                }
                maxLength={newCustomer.tipopessoa === "FISICA" ? 14 : 18}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nomerazaosocial" className="">
                {newCustomer.tipopessoa === "FISICA"
                  ? "Nome Completo"
                  : "Razão Social"}{" "}
                *
              </Label>
              <Input
                id="nomerazaosocial"
                className=""
                value={newCustomer.nomerazaosocial}
                onChange={(e) =>
                  handleInputChange("nomerazaosocial", e.target.value)
                }
                placeholder={
                  newCustomer.tipopessoa === "FISICA"
                    ? "João da Silva"
                    : "Empresa LTDA"
                }
              />
            </div>
          </div>

          {/* Contato */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="flex items-center gap-2 text-sm sm:text-base"
              >
                <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
                Email *
              </Label>
              <Input
                inputMode="email"
                id="email"
                type="email"
                className=""
                value={newCustomer.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="cliente@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="telefone"
                className="flex items-center gap-2 text-sm sm:text-base"
              >
                <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
                Telefone *
              </Label>
              <Input
                inputMode="tel"
                id="telefone"
                className=""
                value={formatTelefone(newCustomer.telefone)}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, "").slice(0, 11);
                  handleInputChange("telefone", raw);
                }}
                placeholder="(11) 99999-9999"
                maxLength={15}
              />
            </div>
          </div>
          <Separator className="mt-4" />
          {/* Endereço */}
          <div className="space-y-3 sm:space-y-4">
            {/* <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
              <h3 className="text-base sm:text-lg font-semibold">Endereço</h3>
            </div> */}

              <div className=" flex flex-row items-center gap-2">

            <div className="space-y-2 w-full">
              <Label htmlFor="endereco" className="text-sm sm:text-base">
                Endereço Completo
              </Label>
              <Input
                id="endereco"
                className=""
                value={newCustomer.endereco || ""}
                onChange={(e) => handleInputChange("endereco", e.target.value)}
                placeholder="Rua, avenida..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="numero" className="text-sm sm:text-base">
                Número
              </Label>
              <Input
                id="endereconumero"
                className=""
                value={newCustomer.endereconumero || ""}
                onChange={(e) => handleInputChange("endereconumero", e.target.value)}
                placeholder="123"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="complemento" className="text-sm sm:text-base">
                Complemento
              </Label>
              <Input
                id="enderecocomplemento"
                className=""
                value={newCustomer.enderecocomplemento || ""}
                onChange={(e) => handleInputChange("enderecocomplemento", e.target.value)}
                placeholder="Ap, Bloco..."
              />
            </div>
              </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              

              <div className="space-y-2">
                <Label htmlFor="estado" className="text-sm sm:text-base">
                  Estado
                </Label>


                <Popover open={open2} onOpenChange={setOpen2}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open2}
                      className="w-[200px] justify-between"
                    >
                      {newCustomer.estado
                        ? ESTADOS_BRASIL.find(
                            (estado) => estado === newCustomer.estado
                          )
                        :  "Selecione..."}
                      <ChevronsUpDown className="opacity-50" />
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent
                    className="w-[200px] p-0"
                    onWheelCapture={(e) => e.stopPropagation()}
                  >
                    <Command>
                      <CommandInput
                        placeholder="Buscar estado..."
                        className="h-9"
                      />
                      <CommandList className="max-h-45 overflow-y-auto overscroll-contain">
                        <CommandEmpty>Nenhum estado encontrada.</CommandEmpty>

                        {/* Aqui NÃO precisa de overflow/max-h */}
                          <CommandGroup>
                            {ESTADOS_BRASIL.map((estado,i) => (
                              <CommandItem
                                className="hover:cursor-pointer"
                                key={i}
                                value={estado}
                                onSelect={(currentValue) => {
                                  setNewCustomer({
                                    ...newCustomer,
                                    estado: currentValue,
                                  });
                                  setOpen2(false);
                                }}
                              >
                                {estado}
                                <Check
                                  className={cn(
                                    "ml-auto",
                                    newCustomer.estado === estado
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
                <Label htmlFor="cidade" className="text-sm sm:text-base">
                  Cidade
                </Label>

                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger disabled={newCustomer.estado ? false : true} asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-[200px] justify-between"
                    >
                      {newCustomer.cidade
                        ? cidades.find(
                            (cidade) => cidade.nome === newCustomer.cidade
                          )?.nome
                        : loading ? "Carregando..." : newCustomer.estado ? "Selecione..." : "Selecione o estado"}
                      <ChevronsUpDown className="opacity-50" />
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent
                    className="w-[200px] p-0"
                    onWheelCapture={(e) => e.stopPropagation()}
                  >
                    <Command>
                      <CommandInput
                        placeholder="Buscar cidade..."
                        className="h-9"
                      />
                      <CommandList className="max-h-45 overflow-y-auto overscroll-contain">
                        <CommandEmpty>Nenhuma cidade encontrada.</CommandEmpty>

                        {/* Aqui NÃO precisa de overflow/max-h */}
                          <CommandGroup>
                            {cidades.map((cidade) => (
                              <CommandItem
                                className="hover:cursor-pointer"
                                key={cidade.id}
                                value={cidade.nome}
                                onSelect={(currentValue) => {
                                  setNewCustomer({
                                    ...newCustomer,
                                    cidade: currentValue,
                                  });
                                  setOpen(false);
                                }}
                              >
                                {cidade.nome}
                                <Check
                                  className={cn(
                                    "ml-auto",
                                    newCustomer.cidade === cidade.nome
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

              <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                <Label htmlFor="cep" className="text-sm sm:text-base">
                  CEP
                </Label>
                <Input
                  id="cep"
                  className=""
                  value={formatCep(newCustomer.cep)}
                  onChange={(e) => handleInputChange("cep", e.target.value)}
                  placeholder="00000-000"
                  maxLength={9}
                />
              </div>
            </div>
          </div>

          {/* Dados Fiscais - Apenas para Pessoa Jurídica */}
          {newCustomer.tipopessoa === "JURIDICA" && (
            <>
              <Separator />
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                  <h3 className="text-base sm:text-lg font-semibold">
                    Dados Fiscais
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="inscricaoestadual"
                      className="text-sm sm:text-base"
                    >
                      Inscrição Estadual
                    </Label>
                    <Input
                      id="inscricaoestadual"
                      className=""
                      value={newCustomer.inscricaoestadual || ""}
                      onChange={(e) =>
                        handleInputChange("inscricaoestadual", e.target.value)
                      }
                      placeholder="123456789"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="inscricaomunicipal"
                      className="text-sm sm:text-base"
                    >
                      Inscrição Municipal
                    </Label>
                    <Input
                      id="inscricaomunicipal"
                      className=""
                      value={newCustomer.inscricaomunicipal || ""}
                      onChange={(e) =>
                        handleInputChange("inscricaomunicipal", e.target.value)
                      }
                      placeholder="123456789"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="codigomunicipio"
                    className="text-sm sm:text-base"
                  >
                    Código do Município
                  </Label>
                  <Input
                    id="codigomunicipio"
                    className=""
                    value={newCustomer.codigomunicipio || ""}
                    onChange={(e) =>
                      handleInputChange("codigomunicipio", e.target.value)
                    }
                    placeholder="3550308"
                  />
                </div>
              </div>
            </>
          )}

          {/* Botões */}
        </div>
        <DialogFooter className="px-6 py-4">
          <div className="flex sm:flex-row gap-3 sm:gap-4">
            <Button
              type="submit"
              form="register-form"
              disabled={isSubmitting}
              onClick={handleCreateCustomer}
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
                  Cadastrar Cliente
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
