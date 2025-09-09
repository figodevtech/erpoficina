"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  MoreHorizontal,
  Edit,
  Eye,
  FileText,
  Clock,
  CheckCircle,
  Car,
  DollarSign,
  PlusIcon,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface OrdemServico {
  id: string;
  numero: string;
  clienteId: string;
  clienteNome: string;
  veiculo: {
    marca: string;
    modelo: string;
    ano: string;
    placa: string;
    cor: string;
    km: string;
  };
  servicos: {
    id: string;
    descricao: string;
    valor: number;
    status: "pendente" | "em_andamento" | "concluido";
  }[];
  pecas: {
    id: string;
    descricao: string;
    quantidade: number;
    valorUnitario: number;
    valorTotal: number;
  }[];
  status:
    | "orcamento"
    | "aprovado"
    | "em_andamento"
    | "aguardando_pecas"
    | "concluido"
    | "entregue"
    | "cancelado";
  prioridade: "baixa" | "normal" | "alta" | "urgente";
  dataAbertura: string;
  dataPrevisao?: string;
  dataConclusao?: string;
  valorTotal: number;
  observacoes?: string;
  mecanico?: string;
}

const mockOrdens: OrdemServico[] = [
  {
    id: "1",
    numero: "OS-001",
    clienteId: "1",
    clienteNome: "João Silva",
    veiculo: {
      marca: "Honda",
      modelo: "Civic",
      ano: "2020",
      placa: "ABC-1234",
      cor: "Prata",
      km: "45000",
    },
    servicos: [
      { id: "1", descricao: "Troca de óleo", valor: 80, status: "concluido" },
      {
        id: "2",
        descricao: "Troca de filtro de óleo",
        valor: 25,
        status: "concluido",
      },
      {
        id: "3",
        descricao: "Troca de filtro de ar",
        valor: 35,
        status: "em_andamento",
      },
    ],
    pecas: [
      {
        id: "1",
        descricao: "Óleo 5W30",
        quantidade: 4,
        valorUnitario: 15,
        valorTotal: 60,
      },
      {
        id: "2",
        descricao: "Filtro de óleo",
        quantidade: 1,
        valorUnitario: 25,
        valorTotal: 25,
      },
    ],
    status: "em_andamento",
    prioridade: "normal",
    dataAbertura: "2024-01-15",
    dataPrevisao: "2024-01-16",
    valorTotal: 225,
    mecanico: "Carlos Santos",
    observacoes: "Cliente solicitou revisão completa",
  },
];

export default function Ordens() {
  const [ordens, setOrdens] = useState<OrdemServico[]>(mockOrdens);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todas");


  const getStatusColor = (status: string) => {
    switch (status) {
      case "orcamento":
        return "bg-gray-100 text-gray-800";
      case "aprovado":
        return "bg-blue-100 text-blue-800";
      case "em_andamento":
        return "bg-yellow-100 text-yellow-800";
      case "aguardando_pecas":
        return "bg-orange-100 text-orange-800";
      case "concluido":
        return "bg-green-100 text-green-800";
      case "entregue":
        return "bg-emerald-100 text-emerald-800";
      case "cancelado":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "orcamento":
        return "Orçamento";
      case "aprovado":
        return "Aprovado";
      case "em_andamento":
        return "Em Andamento";
      case "aguardando_pecas":
        return "Aguardando Peças";
      case "concluido":
        return "Concluído";
      case "entregue":
        return "Entregue";
      case "cancelado":
        return "Cancelado";
      default:
        return status;
    }
  };

  const getPriorityColor = (prioridade: string) => {
    switch (prioridade) {
      case "urgente":
        return "bg-red-100 text-red-800";
      case "alta":
        return "bg-orange-100 text-orange-800";
      case "normal":
        return "bg-blue-100 text-blue-800";
      case "baixa":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityLabel = (prioridade: string) => {
    switch (prioridade) {
      case "urgente":
        return "Urgente";
      case "alta":
        return "Alta";
      case "normal":
        return "Normal";
      case "baixa":
        return "Baixa";
      default:
        return prioridade;
    }
  };

  return (
    <div className="space-y-6 ">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Ordens de Serviço
          </h1>
          <p className="text-muted-foreground">
            Gerencie as ordens de serviço da sua oficina
          </p>
        </div>
        <Button className="hover:cursor-pointer"><PlusIcon/>Nova OS</Button>
      </div>
      {/* Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de OS</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ordens.length}</div>
            <p className="text-xs text-muted-foreground">
              Cadastradas no sistema
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Sendo executadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Finalizadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento</CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R${" "}
              {ordens
                .reduce((acc, ordem) => acc + ordem.valorTotal, 0)
                .toLocaleString("pt-BR")}
            </div>
            <p className="text-xs text-muted-foreground">Total das OS</p>
          </CardContent>
        </Card>
      </div>
      {/* Search */}
      <Card>
        <CardContent className="pt-6">
            <div className="flex gap-6 flex-col md:flex-row">

          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Busca inteligente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select>
            <SelectTrigger className="w-full md:w-2/6">
                <SelectValue placeholder="Todas"></SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              <SelectItem value="em_andamento">Em Andamento</SelectItem>
              <SelectItem value="orcamento">Orçamento</SelectItem>
              <SelectItem value="aprovado">Aprovado</SelectItem>
              <SelectItem value="aguardando_pecas">Pendência</SelectItem>
              <SelectItem value="concluido">Concluído</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
            </div>
        </CardContent>
      </Card>

      {/* Status Tabs */}
      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList className="grid items-center w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="todas" className="hover:cursor-pointer md:col-start-2 dark:data-[state=active]:bg-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Abertas (0)
          </TabsTrigger>
          <TabsTrigger value="orcamento" className="hover:cursor-pointer md:col-start-3 dark:data-[state=active]:bg-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Finalizadas (0)
          </TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter} className="mt-6">
          {/* Stats */}

          {/* Ordens List */}
          <Card className="min-h-[400px]">
            <CardHeader>
              <CardTitle>Lista de Ordens de Serviço</CardTitle>
              <CardDescription>
                {ordens.length} orde
                {ordens.length !== 1 && "ns"}{ordens.length === 1 && "m"} encontrada
                {ordens.length !== 1 && "s"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ordens.map((ordem) => (
                  <div
                    key={ordem.id}
                    className="hover:cursor-pointer group hover:bg-primary/10 flex items-center justify-between p-4 border border-border rounded-lg relative"
                  >
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium">{ordem.numero}</h3>
                        <Badge className={getStatusColor(ordem.status)}>
                          {getStatusLabel(ordem.status)}
                        </Badge>
                        <Badge className={getPriorityColor(ordem.prioridade)}>
                          {getPriorityLabel(ordem.prioridade)}
                        </Badge>
                      </div>

                      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Car className="h-3 w-3" />
                          {ordem.clienteNome}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {ordem.veiculo.marca} {ordem.veiculo.modelo}{" "}
                          {ordem.veiculo.ano}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Placa: {ordem.veiculo.placa}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          Aberta em{" "}
                          {new Date(ordem.dataAbertura).toLocaleDateString(
                            "pt-BR"
                          )}
                        </span>
                        {ordem.dataPrevisao && (
                          <>
                            <span>•</span>
                            <span>
                              Previsão:{" "}
                              {new Date(ordem.dataPrevisao).toLocaleDateString(
                                "pt-BR"
                              )}
                            </span>
                          </>
                        )}
                        {ordem.mecanico && (
                          <>
                            <span>•</span>
                            <span>Mecânico: {ordem.mecanico}</span>
                          </>
                        )}
                        <span>•</span>
                        <span className="font-medium">
                          R$ {ordem.valorTotal.toLocaleString("pt-BR")}
                        </span>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild className="absolute top-2 right-2 hover:cursor-pointer">
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="hover:cursor-pointer">
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem className="hover:cursor-pointer">
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
