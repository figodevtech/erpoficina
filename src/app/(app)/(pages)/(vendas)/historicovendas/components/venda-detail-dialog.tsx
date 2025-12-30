"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calendar, User, Package, Hash, ShoppingCart, Loader2, AlertCircle } from "lucide-react"
import { useEffect, useState } from "react"

type EnumStatusVenda = "ABERTA" | "PAGAMENTO" | "FINALIZADA" | "CANCELADA"

interface Produto {
  id: number
  titulo: string
  descricao: string
  precovenda: number
  unidade: string
  codigobarras: string | null
  ncm: string
  cest: string
  cfop: string
  csosn: string
  cst: string
  aliquotaicms: number
  cst_pis: string
  aliquota_pis: number | null
  cst_cofins: string
  aliquota_cofins: number
  imgUrl: string | null
}

interface VendaProduto {
  id: number
  created_at: string
  updated_at: string
  venda_id: number
  produtoid: number
  produto: Produto
  sub_total: number
  valor_total: number
  valor_desconto: number
  tipo_desconto: string | null
  quantidade: number
}

interface Cliente {
  id: number
  nomerazaosocial: string
}

interface Venda {
  id: number
  clienteid: number
  cliente: Cliente
  status: EnumStatusVenda
  valortotal: number
  datavenda: string | null
  createdat: string | null
  updatedat: string | null
  created_by: string | null
  desconto_tipo: string | null
  desconto_valor: number
  sub_total: number
  itens: VendaProduto[]
}

interface VendaDetailsDialogProps {
  vendaId: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const statusColors: Record<EnumStatusVenda, string> = {
  ABERTA: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  PAGAMENTO: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  FINALIZADA: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  CANCELADA: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
}

const statusLabels: Record<EnumStatusVenda, string> = {
  ABERTA: "Aberta",
  PAGAMENTO: "Pagamento",
  FINALIZADA: "Finalizada",
  CANCELADA: "Cancelada",
}

export function VendaDetailsDialog({ vendaId, open, onOpenChange }: VendaDetailsDialogProps) {
  const [venda, setVenda] = useState<Venda | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !vendaId) {
      return
    }

    const fetchVenda = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/venda/${vendaId}`)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || "Erro ao buscar venda")
        }

        const result = await response.json()
        setVenda(result.data)
      } catch (err) {
        console.error("[v0] Erro ao buscar venda:", err)
        setError(err instanceof Error ? err.message : "Erro ao carregar dados da venda")
      } finally {
        setLoading(false)
      }
    }

    fetchVenda()
  }, [open, vendaId])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (date: string | null) => {
    if (!date) return "N/A"
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
  }

  const formatQuantity = (qty: number) => {
    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(qty)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        
      <DialogContent className="max-w-3xl max-h-[90vh]">
        
        {loading && (
            <>
            <DialogHeader>
              <DialogTitle></DialogTitle>
            </DialogHeader>
          <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Carregando detalhes da venda...</p>
          </div>
            </>
        )}

        {error && !loading && (

          <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 text-center">
            <div className="rounded-full bg-destructive/10 p-3">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <div className="space-y-2">
              <p className="font-semibold">Erro ao carregar venda</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        )}

        {venda && !loading && !error && (
          <>
            <DialogHeader>
              <div className="flex items-start justify-between gap-4 pr-5">
                <div className="space-y-1">
                  <DialogTitle className="text-2xl font-semibold">Venda #{venda.id}</DialogTitle>
                  <p className="text-sm text-muted-foreground">Detalhes completos da transação</p>
                </div>
                <Badge variant="outline" className={statusColors[venda.status]}>
                  {statusLabels[venda.status]}
                </Badge>
              </div>
            </DialogHeader>

            <ScrollArea className="max-h-[calc(90vh-140px)] pr-4">
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-start gap-3 rounded-lg border bg-card p-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Cliente</p>
                      <p className="text-sm font-semibold leading-tight">{venda.cliente.nomerazaosocial}</p>
                      <p className="text-xs text-muted-foreground">ID: {venda.cliente.id}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-lg border bg-card p-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Data da Venda</p>
                      <p className="text-sm font-semibold">{formatDate(venda.datavenda)}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Resumo Financeiro
                    </h3>
                  </div>

                  <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">{formatCurrency(venda.sub_total)}</span>
                    </div>

                    {venda.desconto_valor > 0 && (
                      <div className="flex items-center justify-between text-sm text-emerald-600 dark:text-emerald-400">
                        <span>Desconto</span>
                        <span className="font-medium">-{formatCurrency(venda.desconto_valor)}</span>
                      </div>
                    )}

                    <Separator className="my-2" />

                    <div className="flex items-center justify-between">
                      <span className="text-base font-semibold">Valor Total</span>
                      <span className="text-xl font-bold text-primary">{formatCurrency(venda.valortotal)}</span>
                    </div>
                  </div>
                </div>

                {venda.itens && venda.itens.length > 0 && (
                  <>
                    <Separator />

                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                          Produtos ({venda.itens.length})
                        </h3>
                      </div>

                      <div className="space-y-3">
                        {venda.itens.map((item, index) => (
                          <div key={item.id} className="rounded-lg border bg-card p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 space-y-2">
                                <div className="flex items-start gap-3">
                                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                    {index + 1}
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-semibold leading-tight">{item.produto.titulo}</p>
                                    <p className="mt-1 text-xs text-muted-foreground">{item.produto.descricao}</p>
                                  </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pl-11 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Hash className="h-3 w-3" />
                                    <span>
                                      {formatQuantity(item.quantidade)} {item.produto.unidade}
                                    </span>
                                  </div>
                                  <span>•</span>
                                  <span>{formatCurrency(item.sub_total / item.quantidade)} / unid.</span>
                                </div>
                              </div>

                              <div className="text-right">
                                <p className="text-lg font-bold">{formatCurrency(item.valor_total)}</p>
                                {item.valor_desconto > 0 && (
                                  <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                                    Desc. {formatCurrency(item.valor_desconto)}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                <div className="rounded-lg bg-muted/30 p-4">
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Informações do Sistema
                  </h3>
                  <div className="grid gap-3 text-xs sm:grid-cols-2">
                    {venda.createdat && (
                      <div>
                        <p className="text-muted-foreground">Criado em</p>
                        <p className="font-medium">{formatDate(venda.createdat)}</p>
                      </div>
                    )}
                    {venda.updatedat && (
                      <div>
                        <p className="text-muted-foreground">Atualizado em</p>
                        <p className="font-medium">{formatDate(venda.updatedat)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
