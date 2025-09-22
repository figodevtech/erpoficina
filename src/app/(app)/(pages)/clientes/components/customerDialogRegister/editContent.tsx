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
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusCliente, TipoPessoa, ESTADOS_BRASIL, tabTheme } from "./types";
import { formatCep, formatCpfCnpj, formatTelefone } from "./utils";
import { Customer } from "../../types";
import axios from "axios";

interface EditContentProps {
  customerId: number;
}
export default function EditContent({ customerId }: EditContentProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCustomer, setselectedCustomer] = useState<
    Customer | undefined
  >(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const handleInputChange = (field: keyof Customer, value: string) => {
    if (selectedCustomer) {
      setselectedCustomer({ ...selectedCustomer, [field]: value });
    }
  };

  const handleGetCustomer = async (customerId: number) => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/customers/" + customerId);

      if (response.status === 200) {
        // console.log(response)
        const { data } = response;
        setselectedCustomer(data.data);
        console.log("Cliente carregado:", data.data);
      }
    } catch (error) {
      console.log("Erro ao buscar cliente:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) {
      handleGetCustomer(customerId);
    }
  }, []);

  if (isLoading) {
    return (
      <DialogContent className="h-dvh sm:max-w-[1100px] w-[95vw] p-2 overflow-hidden ">
        <div className="flex h-full min-h-0 flex-col justify-center items-center">
          <div className="size-8 border-t-2 border-primary rounded-t-full animate-spin"></div>
          <span className="text-primary">Carregando</span>
        </div>
      </DialogContent>
    );
  }

  if (selectedCustomer) {
    return (
      <DialogContent className="h-dvh sm:max-w-[1100px] w-[95vw] p-2 overflow-hidden">
        <div className="flex h-full min-h-0 flex-col">
          <DialogHeader className="shrink-0 px-6 py-4">
            <DialogTitle>Cliente #{selectedCustomer.id}</DialogTitle>
          </DialogHeader>

          {/* Área principal com abas */}
          <Tabs
            defaultValue="Geral"
            className="flex-1 min-h-0 overflow-hidden px-6 pb-0"
          >
            <TabsList className="shrink-0 sticky top-0 z-10 bg-background">
              <TabsTrigger
                value="Geral"
                className={"hover:cursor-pointer" + tabTheme}
              >
                Geral
              </TabsTrigger>
              <TabsTrigger
                value="Veículos"
                className={"hover:cursor-pointer" + tabTheme}
              >
                Veículos
              </TabsTrigger>
              <TabsTrigger
                value="Ordens"
                className={"hover:cursor-pointer" + tabTheme}
              >
                Ordens de Serviço
              </TabsTrigger>
            </TabsList>

            {/* CONTEÚDO DA ABA: o scroll fica no wrapper interno */}
            <TabsContent
              value="Geral"
              className="h-full min-h-0 overflow-hidden p-0"
            >
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
                        {selectedCustomer.tipopessoa === "FISICA" ? (
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
                    value={selectedCustomer.status}
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
                    value={selectedCustomer.tipopessoa}
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
                      {selectedCustomer.tipopessoa === "FISICA"
                        ? "CPF"
                        : "CNPJ"}{" "}
                      *
                    </Label>
                    <Input
                      id="cpfcnpj"
                      className="text-sm sm:text-base"
                      value={formatCpfCnpj(
                        selectedCustomer.cpfcnpj,
                        selectedCustomer.tipopessoa
                      )}
                      onChange={(e) =>
                        handleInputChange("cpfcnpj", e.target.value)
                      }
                      placeholder={
                        selectedCustomer.tipopessoa === "FISICA"
                          ? "000.000.000-00"
                          : "00.000.000/0000-00"
                      }
                      maxLength={
                        selectedCustomer.tipopessoa === "FISICA" ? 14 : 18
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="nomerazaosocial"
                      className="text-sm sm:text-base"
                    >
                      {selectedCustomer.tipopessoa === "FISICA"
                        ? "Nome Completo"
                        : "Razão Social"}{" "}
                      *
                    </Label>
                    <Input
                      id="nomerazaosocial"
                      className="text-sm sm:text-base"
                      value={selectedCustomer.nomerazaosocial}
                      onChange={(e) =>
                        handleInputChange("nomerazaosocial", e.target.value)
                      }
                      placeholder={
                        selectedCustomer.tipopessoa === "FISICA"
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
                      value={selectedCustomer.email}
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
                      value={formatTelefone(selectedCustomer.telefone)}
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
                      value={selectedCustomer.endereco}
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
                        value={selectedCustomer.cidade}
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
                        value={selectedCustomer.estado}
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
                        value={formatCep(selectedCustomer.cep)}
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
                {selectedCustomer.tipopessoa === "JURIDICA" && (
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
                            value={selectedCustomer.inscricaoestadual}
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
                            value={selectedCustomer.inscricaomunicipal}
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
                          value={selectedCustomer.codigomunicipio}
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
            </TabsContent>

            {/* Exemplos para as outras abas (mantêm a mesma estrutura) */}
            <TabsContent
              value="Veículos"
              className="h-full min-h-0 overflow-hidden p-0"
            >
              <div className="h-full min-h-0 overflow-auto rounded-md px-4 py-10 space-y-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Título</TableHead>
                      <TableHead>Placa</TableHead>
                      <TableHead>Cor</TableHead>
                      <TableHead>Fab/Mod</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedCustomer.veiculos.map((vehicle)=>(

                    <TableRow key={vehicle.id} className="hover: cursor-pointer">
                      <TableCell>{vehicle.id}</TableCell>
                      <TableCell>{vehicle.modelo}</TableCell>
                      <TableCell>{vehicle.placa}</TableCell>
                      <TableCell>{vehicle.cor}</TableCell>
                      <TableCell>{vehicle.ano}</TableCell>
                    </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent
              value="Ordens"
              className="h-full min-h-0 overflow-hidden p-0"
            >
              <div className="h-full min-h-0 overflow-auto rounded-md px-4 py-10 space-y-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Descrição</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>1</TableCell>
                      <TableCell>Os tal</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>

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
                    Salvando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
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
}
