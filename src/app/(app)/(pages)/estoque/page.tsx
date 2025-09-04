import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Package, Search, Plus, AlertTriangle, Clock, TrendingDown, TrendingUp } from "lucide-react"

const inventoryItems = [
  {
    id: 1,
    name: "Óleo Motor 5W30",
    category: "Lubrificantes",
    stock: 45,
    minStock: 20,
    maxStock: 100,
    price: 35.9,
    supplier: "Castrol",
    location: "A1-B2",
    status: "ok",
  },
  {
    id: 2,
    name: "Filtro de Ar",
    category: "Filtros",
    stock: 12,
    minStock: 15,
    maxStock: 50,
    price: 28.5,
    supplier: "Mann Filter",
    location: "B2-C1",
    status: "low",
  },
  {
    id: 3,
    name: "Pastilhas de Freio Dianteira",
    category: "Freios",
    stock: 8,
    minStock: 10,
    maxStock: 30,
    price: 89.9,
    supplier: "Bosch",
    location: "C1-D2",
    status: "critical",
  },
  {
    id: 4,
    name: "Pneu 185/65 R15",
    category: "Pneus",
    stock: 25,
    minStock: 12,
    maxStock: 48,
    price: 245.0,
    supplier: "Michelin",
    location: "D1-E1",
    status: "ok",
  },
  {
    id: 5,
    name: "Bateria 60Ah",
    category: "Elétrica",
    stock: 18,
    minStock: 8,
    maxStock: 25,
    price: 189.9,
    supplier: "Moura",
    location: "E1-F1",
    status: "ok",
  },
  {
    id: 6,
    name: "Vela de Ignição",
    category: "Motor",
    stock: 35,
    minStock: 25,
    maxStock: 80,
    price: 12.9,
    supplier: "NGK",
    location: "A2-B1",
    status: "ok",
  },
  {
    id: 7,
    name: "Correia Dentada",
    category: "Motor",
    stock: 6,
    minStock: 8,
    maxStock: 20,
    price: 65.5,
    supplier: "Gates",
    location: "B1-C2",
    status: "critical",
  },
  {
    id: 8,
    name: "Amortecedor Traseiro",
    category: "Suspensão",
    stock: 14,
    minStock: 6,
    maxStock: 24,
    price: 156.0,
    supplier: "Monroe",
    location: "C2-D1",
    status: "ok",
  },
]

const getStatusBadge = (status: string, stock: number, minStock: number) => {
  if (status === "critical") {
    return (
      <Badge variant="destructive" className="text-xs">
        <AlertTriangle className="h-3 w-3 mr-1" />
        Crítico
      </Badge>
    )
  }
  if (status === "low") {
    return (
      <Badge variant="secondary" className="text-xs">
        <Clock className="h-3 w-3 mr-1" />
        Baixo
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="text-xs">
      OK
    </Badge>
  )
}

const getStockPercentage = (stock: number, minStock: number, maxStock: number) => {
  return ((stock - minStock) / (maxStock - minStock)) * 100
}

export default function EstoquePage() {
  const totalItems = inventoryItems.length
  const criticalItems = inventoryItems.filter((item) => item.status === "critical").length
  const lowStockItems = inventoryItems.filter((item) => item.status === "low").length
  const totalValue = inventoryItems.reduce((sum, item) => sum + item.stock * item.price, 0)

  return (
      <div className="mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-balance">Controle de Estoque</h1>
            <p className="text-muted-foreground text-pretty">Gestão completa do inventário de peças e produtos</p>
          </div>
          <div className="flex items-center gap-2">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Item
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Itens</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalItems}</div>
              <p className="text-xs text-muted-foreground">Produtos cadastrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Itens Críticos</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{criticalItems}</div>
              <p className="text-xs text-muted-foreground">Reposição urgente</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
              <TrendingDown className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{lowStockItems}</div>
              <p className="text-xs text-muted-foreground">Atenção necessária</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">Valor do inventário</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Buscar Produtos</CardTitle>
            <CardDescription>Encontre rapidamente os itens do seu estoque</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Buscar por nome, categoria ou fornecedor..." className="pl-10" />
              </div>
              <div className="flex gap-2">
                <Button variant="outline">Todos</Button>
                <Button variant="outline">Críticos</Button>
                <Button variant="outline">Baixo Estoque</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Produtos</CardTitle>
            <CardDescription>Visualização detalhada do inventário atual</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Preço Unit.</TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Valor Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventoryItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">ID: {item.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {item.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.stock}</span>
                          <span className="text-xs text-muted-foreground">/ {item.maxStock}</span>
                        </div>
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              item.status === "critical"
                                ? "bg-destructive"
                                : item.status === "low"
                                  ? "bg-orange-500"
                                  : "bg-chart-4"
                            }`}
                            style={{
                              width: `${Math.max(10, getStockPercentage(item.stock, item.minStock, item.maxStock))}%`,
                            }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(item.status, item.stock, item.minStock)}</TableCell>
                    <TableCell>R$ {item.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell className="text-sm">{item.supplier}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs font-mono">
                        {item.location}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      R$ {(item.stock * item.price).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
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
