import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Users, Search, Plus, UserCheck, UserX, TrendingUp, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react"

interface CustomerItem {
  id: number
  name: string
  email: string
  phone: string
  cpfCnpj: string
  address: string
  city: string
  status: "active" | "inactive" | "pending"
  totalServices: number
  totalSpent: number
  lastService: string
  registrationDate: string
}

const customerItems: CustomerItem[] = [
  {
    id: 1,
    name: "João Silva Santos",
    email: "joao.silva@email.com",
    phone: "(11) 99999-1234",
    cpfCnpj: "123.456.789-00",
    address: "Rua das Flores, 123",
    city: "São Paulo",
    status: "active",
    totalServices: 15,
    totalSpent: 2850.5,
    lastService: "2024-01-15",
    registrationDate: "2023-03-10",
  },
  {
    id: 2,
    name: "Maria Oliveira Costa",
    email: "maria.oliveira@email.com",
    phone: "(11) 98888-5678",
    cpfCnpj: "987.654.321-00",
    address: "Av. Paulista, 456",
    city: "São Paulo",
    status: "active",
    totalServices: 8,
    totalSpent: 1420.0,
    lastService: "2024-01-10",
    registrationDate: "2023-06-15",
  },
  {
    id: 3,
    name: "Carlos Eduardo Lima",
    email: "carlos.lima@email.com",
    phone: "(11) 97777-9012",
    cpfCnpj: "456.789.123-00",
    address: "Rua Augusta, 789",
    city: "São Paulo",
    status: "pending",
    totalServices: 2,
    totalSpent: 380.0,
    lastService: "2023-12-20",
    registrationDate: "2023-12-01",
  },
  {
    id: 4,
    name: "Ana Paula Ferreira",
    email: "ana.ferreira@email.com",
    phone: "(11) 96666-3456",
    cpfCnpj: "789.123.456-00",
    address: "Rua Oscar Freire, 321",
    city: "São Paulo",
    status: "active",
    totalServices: 22,
    totalSpent: 4250.75,
    lastService: "2024-01-18",
    registrationDate: "2022-08-20",
  },
  {
    id: 5,
    name: "Roberto Almeida",
    email: "roberto.almeida@email.com",
    phone: "(11) 95555-7890",
    cpfCnpj: "321.654.987-00",
    address: "Rua Consolação, 654",
    city: "São Paulo",
    status: "inactive",
    totalServices: 5,
    totalSpent: 890.0,
    lastService: "2023-10-15",
    registrationDate: "2023-02-28",
  },
  {
    id: 6,
    name: "Fernanda Santos",
    email: "fernanda.santos@email.com",
    phone: "(11) 94444-2468",
    cpfCnpj: "654.987.321-00",
    address: "Av. Faria Lima, 987",
    city: "São Paulo",
    status: "active",
    totalServices: 12,
    totalSpent: 2100.25,
    lastService: "2024-01-12",
    registrationDate: "2023-04-05",
  },
  {
    id: 7,
    name: "Pedro Henrique Costa",
    email: "pedro.costa@email.com",
    phone: "(11) 93333-1357",
    cpfCnpj: "147.258.369-00",
    address: "Rua Bela Vista, 147",
    city: "São Paulo",
    status: "active",
    totalServices: 18,
    totalSpent: 3200.8,
    lastService: "2024-01-20",
    registrationDate: "2022-11-12",
  },
  {
    id: 8,
    name: "Luciana Rodrigues",
    email: "luciana.rodrigues@email.com",
    phone: "(11) 92222-8024",
    cpfCnpj: "258.369.147-00",
    address: "Rua Liberdade, 258",
    city: "São Paulo",
    status: "pending",
    totalServices: 1,
    totalSpent: 150.0,
    lastService: "2024-01-05",
    registrationDate: "2024-01-02",
  },
]

export default function ClientesPage() {
  const totalCustomers = customerItems.length
  const activeCustomers = customerItems.filter((customer) => customer.status === "active").length
  const inactiveCustomers = customerItems.filter((customer) => customer.status === "inactive").length
  const pendingCustomers = customerItems.filter((customer) => customer.status === "pending").length
  const totalRevenue = customerItems.reduce((sum, customer) => sum + customer.totalSpent, 0)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
            Ativo
          </Badge>
        )
      case "inactive":
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
            Inativo
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            Pendente
          </Badge>
        )
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

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
              <p className="text-xs text-muted-foreground">Com serviços recentes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes Inativos</CardTitle>
              <UserX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-muted-foreground">{inactiveCustomers}</div>
              <p className="text-xs text-muted-foreground">Sem atividade recente</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">Faturamento acumulado</p>
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

        {/* Customers Table */}
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
                  <TableHead>Status</TableHead>
                  <TableHead>Serviços</TableHead>
                  <TableHead>Total Gasto</TableHead>
                  <TableHead>Último Serviço</TableHead>
                  <TableHead className="w-[50px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customerItems.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-muted-foreground">{customer.city}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">{customer.email}</div>
                        <div className="text-sm text-muted-foreground">{customer.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{customer.cpfCnpj}</TableCell>
                    <TableCell>{getStatusBadge(customer.status)}</TableCell>
                    <TableCell className="text-center">{customer.totalServices}</TableCell>
                    <TableCell className="font-medium">
                      R$ {customer.totalSpent.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(customer.lastService).toLocaleDateString("pt-BR")}
                    </TableCell>
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
