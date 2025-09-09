"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Users, Search, Plus, UserCheck, UserX, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react"
import { Timestamp } from "next/dist/server/lib/cache-handlers/types"
import { useEffect, useState } from "react"
import { set } from "nprogress"

enum TipoPessoa {
  FISICA = "FISICA",
  JURIDICA = "JURIDICA",
}

enum ClientStatus {
  ATIVO = "ATIVO",
  INATIVO = "INATIVO",
  PENDENTE = "PENDENTE",
}

interface CustomerItem {
  id: number
  tipopessoa: TipoPessoa
  cpfcnpj: string
  nomerazaosocial: string
  email: string
  telefone: string
  endereco: string
  cidade: string
  estado: string
  cep: string
  inscricaoestadual: string
  inscricaomunicipal: string
  codigomunicipio: string
  createdat: string
  updatedat: Timestamp
  status: ClientStatus
}

// Apenas para mock local — geramos um Timestamp compatível
const nowTs = Date.now() as unknown as Timestamp

export default function ClientesPage() {
  const [customerItems, setCustomerItems] = useState<CustomerItem[]>([])
  const totalCustomers = customerItems.length
  const activeCustomers = customerItems.filter((c) => c.status === ClientStatus.ATIVO).length
  const inactiveCustomers = customerItems.filter((c) => c.status === ClientStatus.INATIVO).length
  const pendingCustomers = customerItems.filter((c) => c.status === ClientStatus.PENDENTE).length
  

  const getCustomers = async () => {
    try {
      const response = await fetch('/api/customers');
      if (response.status === 200) {
        const json = await response.json();
        setCustomerItems(json.data);
        console.log('Clientes carregados:', json.data);
      }
    } catch (error) {
      console.log('Erro ao buscar clientes:', error);
    } finally {
      
    }
  };

  useEffect(()=> {
    getCustomers()
  },[])

  const getStatusBadge = (status: ClientStatus) => {
    switch (status) {
      case ClientStatus.ATIVO:
        return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">Ativo</Badge>
      case ClientStatus.INATIVO:
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Inativo</Badge>
      case ClientStatus.PENDENTE:
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Pendente</Badge>
      default:
        return <Badge variant="secondary">Desconhecido</Badge>
    }
  }

  return (
    <div className="mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-balance">Gestão de Clientes</h1>
          <p className="text-muted-foreground text-pretty">Controle completo da base de clientes da oficina</p>
        </div>
        <div className="flex items-center gap-2">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Cliente
          </Button>
        </div>
      </div>

      {/* KPI Cards (ajustados para a interface) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">Clientes cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
            <UserCheck className="h-4 w-4 text-chart-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-4">{activeCustomers}</div>
            <p className="text-xs text-muted-foreground">Status {ClientStatus.ATIVO}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Inativos</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">{inactiveCustomers}</div>
            <p className="text-xs text-muted-foreground">Status {ClientStatus.INATIVO} • Pendentes: {pendingCustomers}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Clientes</CardTitle>
          <CardDescription>Encontre rapidamente os clientes da sua oficina</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar por nome, email ou telefone..." className="pl-10" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline">Todos</Button>
              <Button variant="outline">Ativos</Button>
              <Button variant="outline">Inativos</Button>
              <Button variant="outline">Pendentes</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table (colunas compatíveis com a interface) */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
          <CardDescription>Visualização detalhada da base de clientes</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>CPF/CNPJ</TableHead>
                <TableHead>Cidade/UF</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customerItems.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{customer.nomerazaosocial}</div>
                      <div className="text-sm text-muted-foreground">{customer.tipopessoa}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm">{customer.email}</div>
                      <div className="text-sm text-muted-foreground">{customer.telefone}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{customer.cpfcnpj}</TableCell>
                  <TableCell className="text-sm">
                    {customer.cidade}/{customer.estado}
                  </TableCell>
                  <TableCell>{getStatusBadge(customer.status)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          Visualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
