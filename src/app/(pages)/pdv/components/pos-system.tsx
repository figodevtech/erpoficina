"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ShoppingCart, Search, Plus, Minus, Trash2, Wrench, AlertCircle, Loader2 } from "lucide-react"

interface Produto {
  id: number
  titulo: string
  descricao: string | null
  precovenda: number
  estoque: number
  estoqueminimo: number
  grupo: string
  unidade: string
  status_estoque: string
  codigobarras: string | null
}

interface CartItem {
  id: number
  titulo: string
  precovenda: number
  quantity: number
  grupo: string
  estoque: number
}

export function POSSystem() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/products?limit=100")
        if (!response.ok) throw new Error("Erro ao carregar produtos")
        const result = await response.json()
        setProdutos(result.data || [])
      } catch (error) {
        console.error("[v0] Erro ao buscar produtos:", error)
        setProdutos([])
      } finally {
        setLoading(false)
      }
    }

    fetchProdutos()
  }, [])

  const categories = [...new Set(produtos.map((p) => p.grupo))]
  const filteredProducts = produtos.filter(
    (product) =>
      product.titulo.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (!selectedCategory || product.grupo === selectedCategory),
  )

  const addToCart = (product: Produto) => {
    if (product.estoque <= 0) return

    const existingItem = cart.find((item) => item.id === product.id)
    if (existingItem) {
      const newQuantity = existingItem.quantity + 1
      if (newQuantity <= product.estoque) {
        setCart(cart.map((item) => (item.id === product.id ? { ...item, quantity: newQuantity } : item)))
      }
    } else {
      setCart([
        ...cart,
        {
          id: product.id,
          titulo: product.titulo,
          precovenda: product.precovenda,
          quantity: 1,
          grupo: product.grupo,
          estoque: product.estoque,
        },
      ])
    }
  }

  const removeFromCart = (productId: number) => {
    setCart(cart.filter((item) => item.id !== productId))
  }

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
    } else {
      const product = produtos.find((p) => p.id === productId)
      if (product && quantity <= product.estoque) {
        setCart(cart.map((item) => (item.id === productId ? { ...item, quantity } : item)))
      }
    }
  }

  const subtotal = cart.reduce((sum, item) => sum + item.precovenda * item.quantity, 0)
  const tax = subtotal * 0.1
  const total = subtotal + tax

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
          <p className="text-foreground font-semibold">Carregando produtos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
              <Wrench className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">PDV Oficina</h1>
              <p className="text-sm text-muted-foreground">Ponto de Venda - Serviços e Peças</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Total em Carrinho</div>
            <div className="text-3xl font-bold text-primary">R$ {total.toFixed(2)}</div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Products Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search and Filter */}
            <Card className="bg-card border-border">
              <CardContent className="pt-6 space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar produtos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-border bg-card pl-10 text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                {/* Categories */}
                <div className="flex gap-2 flex-wrap">
                  <Button
                    onClick={() => setSelectedCategory(null)}
                    variant={selectedCategory === null ? "default" : "outline"}
                    size="sm"
                    className={
                      selectedCategory === null ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""
                    }
                  >
                    Todos
                  </Button>
                  {categories.map((category, i) => (
                    <Button
                      key={category + i}
                      onClick={() => setSelectedCategory(category)}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      className={
                        selectedCategory === category ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""
                      }
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Products Grid */}
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className={`bg-card border-border hover:border-primary/50 transition-all ${
                    product.estoque <= 0 ? "opacity-60" : "cursor-pointer group"
                  }`}
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="h-24 bg-muted rounded-lg flex items-center justify-center group-hover:bg-primary/10 transition-all relative">
                      <Wrench className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                      {product.status_estoque === "ALERTA" && (
                        <div className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                          <AlertCircle className="h-3 w-3 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-foreground text-sm line-clamp-2">{product.titulo}</h3>
                      <p className="text-xs text-muted-foreground">{product.grupo}</p>
                      <p className="text-xs text-muted-foreground">Estoque: {product.estoque}</p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <span className="font-bold text-primary">R$ {product.precovenda.toFixed(2)}</span>
                      <Button
                        onClick={() => addToCart(product)}
                        disabled={product.estoque <= 0}
                        size="sm"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground h-8 px-2 disabled:opacity-50"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Cart Section */}
          <div className="lg:col-span-1">
            <Card className="bg-card border-border h-fit sticky top-4">
              <CardHeader className="border-b border-border">
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  Carrinho
                  <span className="ml-auto text-sm font-normal text-muted-foreground">({cart.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {cart.length === 0 ? (
                  <div className="py-8 text-center">
                    <ShoppingCart className="h-8 w-8 text-muted mx-auto mb-2 opacity-50" />
                    <p className="text-sm text-muted-foreground">Carrinho vazio</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {cart.map((item) => (
                        <div key={item.id} className="bg-muted/50 p-3 rounded-lg space-y-2">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground">{item.titulo}</p>
                              <p className="text-xs text-muted-foreground">R$ {item.precovenda.toFixed(2)}</p>
                            </div>
                            <Button
                              onClick={() => removeFromCart(item.id)}
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                size="sm"
                                variant="outline"
                                className="h-6 w-6 p-0"
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="text-sm font-semibold text-foreground w-8 text-center">
                                {item.quantity}
                              </span>
                              <Button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                size="sm"
                                variant="outline"
                                className="h-6 w-6 p-0"
                                disabled={item.quantity >= item.estoque}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <span className="text-sm font-semibold text-primary">
                              R$ {(item.precovenda * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Totals */}
                    <div className="border-t border-border pt-4 space-y-2">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Subtotal:</span>
                        <span>R$ {subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Taxa (10%):</span>
                        <span>R$ {tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold text-primary-foreground bg-primary p-2 rounded">
                        <span>Total:</span>
                        <span>R$ {total.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2 pt-2">
                      <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                        Finalizar Venda
                      </Button>
                      <Button
                        onClick={() => setCart([])}
                        variant="outline"
                        className="w-full text-muted-foreground hover:bg-destructive/20 hover:text-destructive"
                      >
                        Limpar Carrinho
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
