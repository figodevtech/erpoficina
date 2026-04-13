"use client"

import { useCallback, useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar,
  User,
  Package,
  Hash,
  ShoppingCart,
  AlertCircle,
  Truck,
  FileText,
  Upload,
} from "lucide-react"
import { toast } from "sonner"
import type { VendaCanal, VendaStatusEntrega, vendaStatus } from "../types"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"

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
  status: vendaStatus
  canal: VendaCanal
  status_entrega?: VendaStatusEntrega | null
  codigo_rastreio?: string | null
  transportadora_rastreio?: string | null
  ultimo_evento_rastreio?: string | null
  ultimo_evento_rastreio_em?: string | null
  nfe_chave_acesso?: string | null
  danfe_url?: string | null
  valortotal: number
  datavenda: string | null
  createdat: string | null
  updatedat: string | null
  created_by: string | null
  criador?: {
    id: string
    nome: string
  } | null
  desconto_tipo: string | null
  desconto_valor: number
  sub_total: number
  observacoes_fiscais?: string | null
  itens: VendaProduto[]
}

interface VendaDetailsDialogProps {
  vendaId: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const statusColors: Record<vendaStatus, string> = {
  ORCAMENTO: "bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/20",
  ABERTA: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  PAGAMENTO: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  PENDENTE: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  AUTORIZADO: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  PAGO: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  FINALIZADA: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  CANCELADA: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
  CANCELADO: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
}

const statusLabels: Record<vendaStatus, string> = {
  ORCAMENTO: "Orçamento",
  ABERTA: "Aberta",
  PAGAMENTO: "Pagamento",
  PENDENTE: "Pendente",
  AUTORIZADO: "Autorizado",
  PAGO: "Pago",
  FINALIZADA: "Finalizada",
  CANCELADA: "Cancelada",
  CANCELADO: "Cancelada",
}

export function VendaDetailsDialog({ vendaId, open, onOpenChange }: VendaDetailsDialogProps) {
  const [venda, setVenda] = useState<Venda | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentTab, setCurrentTab] = useState<string>("Geral")
  const isDesktop = useMediaQuery("(min-width: 768px)")

  const fetchVenda = useCallback(async () => {
    if (!vendaId) return
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
      console.error("[debug] Erro ao buscar venda:", err)
      setError(err instanceof Error ? err.message : "Erro ao carregar dados da venda")
    } finally {
      setLoading(false)
    }
  }, [vendaId])

  useEffect(() => {
    if (open && vendaId) {
      fetchVenda()
    } else if (!open) {
      setVenda(null)
      setCurrentTab("Geral")
    }
  }, [open, vendaId, fetchVenda])

  const handleUpdateVenda = async () => {
    if (!venda || !vendaId) return

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/venda/${vendaId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          observacoesFiscais: venda.observacoes_fiscais,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Erro ao atualizar venda")
      }

      toast.success("Sucesso!", { description: "Venda atualizada com sucesso.", duration: 2000 })
      
      // Trigger full loading state
      setVenda(null) 
      await fetchVenda()
    } catch (err) {
      console.error("Erro ao atualizar venda:", err)
      toast.error("Erro", { description: err instanceof Error ? err.message : "Erro ao atualizar venda", duration: 2500 })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: keyof Venda, value: any) => {
    setVenda((prev) => (prev ? { ...prev, [field]: value } : null))
  }

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

  const tabTheme =
    " dark:data-[state=active]:bg-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"

  const showFullLoading = (loading || isSubmitting) && !venda;
  
  const Content = isDesktop ? DialogContent : DrawerContent;
  const Header = isDesktop ? DialogHeader : DrawerHeader;
  const Title = isDesktop ? DialogTitle : DrawerTitle;
  const Description = isDesktop ? DialogDescription : DrawerDescription;
  const Footer = isDesktop ? DialogFooter : DrawerFooter;
  const Close = isDesktop ? DialogClose : DrawerClose;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Content className={
        isDesktop
          ? `h-svh w-[100dvw] max-w-[100dvw] p-0 overflow-hidden min-w-0 sm:max-w-[1100px] sm:max-h-[850px] sm:w-[95vw] sm:min-w-0`
          : `h-[100dvh] min-h-dvh mt-0 rounded-none max-h-none flex flex-col`
      }>
        <div className="flex h-full min-h-0 min-w-0 flex-col">
          {showFullLoading ? (
            <div className="flex flex-1 flex-col justify-center items-center">
              <Header className="hidden">
                <Title></Title>
                <Description></Description>
              </Header>
              <div className="size-8 border-t-2 border-primary rounded-t-full animate-spin"></div>
              <span className="text-primary mt-3 text-sm font-medium animate-pulse">
                {isSubmitting ? "Salvando alterações..." : "Buscando dados da venda..."}
              </span>
            </div>
          ) : (
            <>
              <Header className={isDesktop ? "shrink-0 px-6 py-4 border-b-1" : "shrink-0 px-4 py-2"}>
                <Title className={isDesktop ? "text-sm sm:text-lg pr-4" : ""}>
                  {venda ? `Venda #${venda.id}` : "Venda"}
                </Title>
                <Description>
                  {venda ? "Detalhes completos da transação" : error ? "Erro ao carregar dados" : "Carregando..."}
                </Description>
              </Header>

              <div className="flex-1 min-h-0 min-w-0 relative">
                {error && !venda ? (
                  <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                    <div className="rounded-full bg-destructive/10 p-3 mb-4">
                      <AlertCircle className="h-8 w-8 text-destructive" />
                    </div>
                    <p className="font-semibold text-destructive">Erro ao carregar venda</p>
                    <p className="text-sm text-muted-foreground">{error}</p>
                    <Button variant="outline" className="mt-4" onClick={() => fetchVenda()}>Tentar novamente</Button>
                  </div>
                ) : venda ? (
                  <Tabs
                    value={currentTab}
                    defaultValue="Geral"
                    className="flex h-full flex-col min-h-0 overflow-hidden"
                  >
                    <div className="shrink-0 sticky top-0 z-10 mt-4">
                      <div className={isDesktop ? "overflow-x-auto px-6 pb-2" : "overflow-x-auto px-4 pb-2"}>
                        <TabsList className="w-max justify-start bg-transparent">
                          <TabsTrigger onClick={() => setCurrentTab("Geral")} value="Geral" className={"hover:cursor-pointer" + tabTheme}>
                            Geral
                          </TabsTrigger>
                          <TabsTrigger onClick={() => setCurrentTab("Entrega")} value="Entrega" className={"hover:cursor-pointer" + tabTheme}>
                            Entrega
                          </TabsTrigger>
                          <TabsTrigger onClick={() => setCurrentTab("Financeiro")} value="Financeiro" className={"hover:cursor-pointer" + tabTheme}>
                            Financeiro
                          </TabsTrigger>
                          <TabsTrigger onClick={() => setCurrentTab("Produtos")} value="Produtos" className={"hover:cursor-pointer" + tabTheme}>
                            Produtos
                          </TabsTrigger>
                          <TabsTrigger onClick={() => setCurrentTab("Fiscal")} value="Fiscal" className={"hover:cursor-pointer" + tabTheme}>
                            Fiscal
                          </TabsTrigger>
                        </TabsList>
                      </div>
                    </div>

                    <ScrollArea className="flex-1 px-6 py-4">
                      <TabsContent value="Geral" className="m-0 space-y-6">
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

                        <div className="rounded-lg bg-muted/30 p-4">
                            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Informações do Sistema</h3>
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
                                {venda.created_by && (
                                    <div>
                                        <p className="text-muted-foreground">Criado por</p>
                                        <p className="font-medium">{venda.criador?.nome || venda.created_by}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-muted-foreground">Status</p>
                                    <Badge variant="outline" className={statusColors[venda.status] + " mt-1"}>
                                        {statusLabels[venda.status]}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="Entrega" className="m-0 space-y-6">
                        {venda.canal === "ONLINE" ? (
                          <div className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="flex items-start gap-3 rounded-lg border bg-card p-4">
                                    <div className="rounded-full bg-primary/10 p-2">
                                        <Package className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <p className="text-xs font-medium text-muted-foreground">Entrega</p>
                                        <p className="text-sm font-semibold">{venda.status_entrega ?? "Não iniciada"}</p>
                                        {venda.ultimo_evento_rastreio && (
                                            <p className="text-xs text-muted-foreground">Rastreio: {venda.ultimo_evento_rastreio}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 rounded-lg border bg-card p-4">
                                    <div className="rounded-full bg-primary/10 p-2">
                                        <Hash className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <p className="text-xs font-medium text-muted-foreground">Código de rastreio</p>
                                        <p className="text-sm font-semibold leading-tight">{venda.codigo_rastreio ?? "Não informado"}</p>
                                        {venda.transportadora_rastreio && (
                                            <p className="text-xs text-muted-foreground">Transportadora: {venda.transportadora_rastreio}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 text-center text-muted-foreground">
                            <Truck className="h-12 w-12 opacity-20" />
                            <p>Esta é uma venda de PDV (presencial). Não possui dados de entrega.</p>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="Financeiro" className="m-0 space-y-6">
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
                      </TabsContent>

                      <TabsContent value="Produtos" className="m-0 space-y-6">
                        <div className="space-y-3">
                          {venda.itens.map((item, index) => (
                            <div key={item.id} className="rounded-lg border bg-card p-4">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <p className="font-semibold leading-tight">{item.produto.titulo}</p>
                                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                    <span>{formatQuantity(item.quantidade)} {item.produto.unidade}</span>
                                    <span>•</span>
                                    <span>{formatCurrency(item.valor_total / item.quantidade)} / unid.</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold">{formatCurrency(item.valor_total)}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </TabsContent>

                      <TabsContent value="Fiscal" className="m-0 space-y-6">
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Observações Fiscais</h3>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="observacoes_fiscais">Observações livres para nota fiscal e impostos</Label>
                            <Textarea
                              id="observacoes_fiscais"
                              placeholder="Ex: Venda com benefício fiscal, isenção de IPI, etc..."
                              className="min-h-[150px] resize-none"
                              value={venda.observacoes_fiscais || ""}
                              onChange={(e) => handleChange("observacoes_fiscais", e.target.value)}
                            />
                          </div>
                        </div>
                      </TabsContent>
                    </ScrollArea>
                  </Tabs>
                ) : null}
              </div>

              <Footer className={isDesktop ? "px-6 py-4" : "px-4 py-4"}>
                <div className="flex justify-end gap-2 w-full">
                  <Close asChild>
                    <Button className="hover:cursor-pointer" variant={"outline"}>
                      Cancelar
                    </Button>
                  </Close>
                  <Button
                    type="button"
                    disabled={isSubmitting || loading || !venda}
                    className="hover:cursor-pointer min-w-[120px]"
                    onClick={handleUpdateVenda}
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
              </Footer>
            </>
          )}
        </div>
      </Content>
    </Dialog>
  )
}
