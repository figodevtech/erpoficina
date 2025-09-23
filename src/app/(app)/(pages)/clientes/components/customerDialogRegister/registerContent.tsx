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
} from "lucide-react";
import {
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { NewCustomer, StatusCliente, TipoPessoa, ESTADOS_BRASIL, tabTheme} from "./types";
import { formatCep, formatCpfCnpj, formatTelefone } from "./utils";


export default function RegisterContent () {
      const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [newCustomer, setNewCustomer] = useState<NewCustomer>({
        tipopessoa: "FISICA",
        cpfcnpj: "",
        nomerazaosocial: "",
        email: "",
        telefone: "",
        endereco: "",
        cidade: "",
        estado: "",
        cep: "",
        inscricaoestadual: "",
        inscricaomunicipal: "",
        codigomunicipio: "",
        status: "ATIVO",
        foto: "",
      });
    const handleInputChange = (field: keyof NewCustomer, value: string) => {
        setNewCustomer((prev) => ({ ...prev, [field]: value }));
      };
    return(
        <DialogContent className="h-dvh sm:max-w-[1100px] w-[95vw] p-2 overflow-hidden">
        <div className="flex h-full min-h-0 flex-col">
          <DialogHeader className="shrink-0 px-6 py-4">
            <DialogTitle>Cadastro de Cliente</DialogTitle>
          </DialogHeader>

          {/* Área principal com abas */}
           

            {/* CONTEÚDO DA ABA: o scroll fica no wrapper interno */}
            
              <div className="h-full min-h-0 overflow-auto rounded-md px-4 py-10 space-y-2">
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
                    value={newCustomer.status}
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
                      <SelectItem value="SUSPENSO">
                        <Badge variant="destructive">Suspenso</Badge>
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
                          <span className="text-sm sm:text-base">
                            Pessoa Física
                          </span>
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
                      id="cpfcnpj"
                      className="text-sm sm:text-base"
                      value={formatCpfCnpj(newCustomer.cpfcnpj, newCustomer.tipopessoa)}
                      onChange={(e) =>
                        handleInputChange("cpfcnpj", e.target.value)
                      }
                      placeholder={
                        newCustomer.tipopessoa === "FISICA"
                          ? "000.000.000-00"
                          : "00.000.000/0000-00"
                      }
                      maxLength={newCustomer.tipopessoa === "FISICA" ? 14 : 18}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="nomerazaosocial"
                      className="text-sm sm:text-base"
                    >
                      {newCustomer.tipopessoa === "FISICA"
                        ? "Nome Completo"
                        : "Razão Social"}{" "}
                      *
                    </Label>
                    <Input
                      id="nomerazaosocial"
                      className="text-sm sm:text-base"
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
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      className="text-sm sm:text-base"
                      value={newCustomer.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      placeholder="cliente@email.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="telefone"
                      className="flex items-center gap-2 text-sm sm:text-base"
                    >
                      <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
                      Telefone
                    </Label>
                    <Input
                      id="telefone"
                      className="text-sm sm:text-base"
                      value={formatTelefone(newCustomer.telefone)}
                      onChange={(e) =>
                        handleInputChange("telefone", e.target.value)
                      }
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

                  <div className="space-y-2">
                    <Label htmlFor="endereco" className="text-sm sm:text-base">
                      Endereço Completo
                    </Label>
                    <Input
                      id="endereco"
                      className="text-sm sm:text-base resize-none"
                      value={newCustomer.endereco}
                      onChange={(e) =>
                        handleInputChange("endereco", e.target.value)
                      }
                      placeholder="Rua, número, complemento, bairro"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cidade" className="text-sm sm:text-base">
                        Cidade
                      </Label>
                      <Input
                        id="cidade"
                        className="text-sm sm:text-base"
                        value={newCustomer.cidade}
                        onChange={(e) =>
                          handleInputChange("cidade", e.target.value)
                        }
                        placeholder="São Paulo"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="estado" className="text-sm sm:text-base">
                        Estado
                      </Label>
                      <Select
                        value={newCustomer.estado}
                        onValueChange={(value) =>
                          handleInputChange("estado", value)
                        }
                      >
                        <SelectTrigger className="h-10 sm:h-11">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {ESTADOS_BRASIL.map((estado) => (
                            <SelectItem key={estado} value={estado}>
                              {estado}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                      <Label htmlFor="cep" className="text-sm sm:text-base">
                        CEP
                      </Label>
                      <Input
                        id="cep"
                        className="text-sm sm:text-base"
                        value={formatCep(newCustomer.cep)}
                        onChange={(e) =>
                          handleInputChange("cep", e.target.value)
                        }
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
                            className="text-sm sm:text-base"
                            value={newCustomer.inscricaoestadual}
                            onChange={(e) =>
                              handleInputChange(
                                "inscricaoestadual",
                                e.target.value
                              )
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
                            className="text-sm sm:text-base"
                            value={newCustomer.inscricaomunicipal}
                            onChange={(e) =>
                              handleInputChange(
                                "inscricaomunicipal",
                                e.target.value
                              )
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
                          className="text-sm sm:text-base"
                          value={newCustomer.codigomunicipio}
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

              <Button className="hover:cursor-pointer" variant={"outline"}>Cancelar</Button>
              </DialogClose>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    )
}