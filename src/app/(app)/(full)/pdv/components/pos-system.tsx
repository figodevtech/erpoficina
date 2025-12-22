"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  Wrench,
  AlertCircle,
  Loader2,
  AlertTriangle,
  Store,
  UserRoundX,
  CircleOff,
} from "lucide-react";
import {
  Estoque_status,
  Grupo_produto,
  Produto,
} from "@/app/(app)/(pages)/estoque/types";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import axios, { isAxiosError } from "axios";
import { toast } from "sonner";
import CustomerSelect from "@/app/(app)/components/customerSelect";
import { Customer } from "@/app/(app)/(pages)/clientes/types";
import Image from "next/image";

interface CartItem {
  id: number;
  titulo: string;
  precovenda: number;
  quantity: number;
  grupo: string;
  estoque: number;
}

export function POSSystem() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("TODOS");
  const [creatingVenda, setCreatingVenda] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCustomerSelectOpen, setIsCustomerSelectOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>(undefined)
  const [discount, setDiscount] = useState(0)
  const [discountType, setDiscountType] = useState<"POCENTAGEM" | "FIXO" | null>(null)
  const [isAlertOpen, setIsAlertOpen] = useState(false)


  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/pdv/products");
        if(response.status === 200){
          const items =  response.data.data;
          setProdutos(items);
        }
      } catch (error) {
        if(isAxiosError(error)){
          toast.error("Falha ao buscar produtos", {description: error.message})
          console.log(error)
        }
        setProdutos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProdutos();
  }, []);

  const ALL = "TODOS";

  const filteredProducts = produtos.filter((p) => {
    const q = searchTerm.trim().toLowerCase();
    const matchesText = p.titulo?.toLowerCase().includes(q);

    // se ALL, não filtra por grupo
    const matchesCategory =
      selectedCategory === ALL || p.grupo === selectedCategory;

    return matchesText && matchesCategory;
  });
  const addToCart = (product: Produto) => {
  // Garante que tem estoque válido
  if (product.estoque == null || product.estoque <= 0) return;

  // Garante que id e precovenda não são undefined/null
  if (product.id == null || product.precovenda == null) {
    console.error("Produto inválido para o PDV (id ou precovenda ausentes)", product);
    return;
  }

  const existingItem = cart.find((item) => item.id === product.id);

  if (existingItem) {
    const newQuantity = existingItem.quantity + 1;
    if (newQuantity <= product.estoque) {
      setCart(
        cart.map((item) =>
          item.id === product.id ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  } else {
    setCart([
      ...cart,
      {
        id: product.id,                     // agora é number garantido
        titulo: product.titulo || "SEM TÍTULO",
        precovenda: product.precovenda,     // agora é number garantido
        quantity: 1,
        grupo: product.grupo || "SEM GRUPO",
        estoque: product.estoque,          // já garantimos que não é null/undefined
      },
    ]);
  }
};


  const removeFromCart = (productId: number) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      const product = produtos.find((p) => p.id === productId);
      if (product?.estoque === undefined) return;
      if (product && quantity <= product.estoque) {
        setCart(
          cart.map((item) =>
            item.id === productId ? { ...item, quantity } : item
          )
        );
      }
    }
  };

  useEffect(()=>{
console.log(cart)
  },[cart])

  const subtotal = cart.reduce(
    (sum, item) => sum + item.precovenda * item.quantity,
    0
  );
  const total = subtotal;

  const createVenda = async () => {
  try {
    if (cart.length === 0) {
      setErrorMessage(
        "Carrinho vazio. Adicione produtos antes de finalizar a venda."
      );
      return;
    }

    if(!selectedCustomer){
      toast.error("Erro ao cadastrar venda.", {description: "É necessário selecionar um cliente para continuar."})
      return;
    }

    setCreatingVenda(true);
    toast(<div className="flex flex-row flex-nowrap gap-2"><Loader2 className="animate-spin w-4 h-4"/> <span>Cadastrando Venda...</span></div>)

    // TODO: substituir pelos valores reais
    const usuarioCriadorId = "6e1c2b36-86d5-4bb9-95ce-d94e6550294e"; // UUID do usuário logado

    const payload = {
      clienteId: selectedCustomer?.id,
      usuarioCriadorId,
      status: "PAGAMENTO", // enum_status_venda
      descontoTipo: undefined,
      descontoValor: discount,
      subTotal: subtotal,
      valorTotal: total,
      dataVenda: null,
      itens: cart.map((item) => ({
        produtoId: item.id,
        quantidade: item.quantity,
        subTotal: item.precovenda * item.quantity,
        valorTotal: item.precovenda * item.quantity,
        valorDesconto: 0,
        tipoDesconto: null,
      })),
    };

    // chamada com axios
    const { data } = await axios.post("/api/venda", payload);


    console.log("Venda criada com sucesso:", data);
    toast.success("Venda cadastrada com sucesso.")

    setCart([]);
    // aqui você pode disparar um toast ou algo do tipo
  } catch (error: any) {

    if (axios.isAxiosError(error)) {
      
        toast.error("Erro código: " + error.status, {
          description: error.response?.data.error
        })
    } else {
      toast.error("Erro interno ao criar venda")
    }
  } finally {
    setCreatingVenda(false);
  }
};

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
          <p className="text-foreground font-semibold">
            Carregando produtos...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 dark:bg-background p-4">
      <div className="mx-auto ">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
              <Store className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Ponto de Venda
              </h1>
              <p className="text-sm text-muted-foreground">Produtos/Peças</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">
              Total em Carrinho
            </div>
            <div className="text-3xl font-bold text-primary">
              R$ {total.toFixed(2)}
            </div>
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
                  <Select
                    value={selectedCategory}
                    onValueChange={(v) => setSelectedCategory(v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="TODOS" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TODOS">TODOS</SelectItem>
                      {Object.values(Grupo_produto).map((group) => (
                        <SelectItem key={group} value={group}>
                          {group}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Products Grid */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className={`bg-card border-border hover:border-primary/50 transition-all ${
                    product.estoque && product.estoque <= 0
                      ? "opacity-60"
                      : "cursor-default group"
                  }`}
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="h-48 bg-muted rounded-lg flex items-center justify-center group-hover:bg-primary/10 transition-all relative">
                      {product.imgUrl ? (
                        <div className="w-full h-full relative">

                        <div className="w-full h-full overflow-hidden flex items-center justify-center absolute">

                          <img alt={product.titulo || "imagem do produto"} className="w-full blur-xs opacity-50" src={product.imgUrl}/>
                        </div>
                        <div className="w-full h-full overflow-hidden flex items-center justify-center absolute z-10">

                          <img alt={product.titulo || "imagem do produto"} className="h-full group-hover:scale-110 transition-all duration-500" src={product.imgUrl}/>
                        </div>
                        </div>

                      ):
                      <Wrench className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                      
                      }
                      {product.status_estoque === Estoque_status.CRITICO && (
                            <div className="absolute z-20 top-1 right-1 flex p-1 items-center justify-center rounded-full bg-red-800 not-dark:bg-red-300">
                        <Tooltip>
                          <TooltipTrigger>
                              <AlertCircle className="h-4 w-4" />
                          </TooltipTrigger>
                          <TooltipContent>Estoque Crítico</TooltipContent>
                        </Tooltip>
                            </div>
                      )}
                      {product.status_estoque === Estoque_status.BAIXO && (
                        <div className="absolute top-1 z-20 right-1 flex p-1 items-center justify-center rounded-full bg-yellow-800 not-dark:bg-yellow-300">
                          <Tooltip>
                          <TooltipTrigger>
                          <AlertTriangle className="h-4 w-4" />
                           </TooltipTrigger>
                          <TooltipContent>Estoque Baixo</TooltipContent>
                        </Tooltip>
                        </div>
                      )}
                      {product.status_estoque === Estoque_status.SEM_ESTOQUE && (
                        <div className="absolute z-20 top-1 right-1 flex p-1 items-center justify-center rounded-full bg-purple-800 not-dark:bg-purple-300">
                          <Tooltip>
                          <TooltipTrigger>
                          <CircleOff className="h-4 w-4" />
                           </TooltipTrigger>
                          <TooltipContent>Sem estoque</TooltipContent>
                        </Tooltip>
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-foreground text-sm line-clamp-2">
                        {product.titulo}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {product.grupo}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Estoque: {product.estoque}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <span className="font-bold text-primary">
                        R$ {product.precovenda?.toFixed(2)}
                      </span>
                      <Button
                        onClick={() => addToCart(product)}
                        disabled={
                          product.estoque && product.estoque <= 0 ? true : false
                        }
                        size="sm"
                        className={`bg-primary hover:cursor-pointer hover:bg-primary/90 text-primary-foreground h-8 px-2 disabled:opacity-50 ${product.estoque ? "hover:cursor-pointer" : "hover:cursor-not-allowed"}`}
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
                <CardTitle className="flex flex-col items-center gap-2 text-foreground">
                  <div className="flex flex-row justify-between w-full items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-primary" />
                    Carrinho
                    <span className="ml-auto text-sm font-normal text-muted-foreground">
                      ({cart.length})
                    </span>
                  </div>
                  
                  <div className="flex w-full justify-start">
                    {selectedCustomer ? 
                    <div className="flex flex-row items-center gap-2 text-sm font-light">
                      <span>Cliente:</span>
                      <span className="">{selectedCustomer.nomerazaosocial}</span>
                      <UserRoundX onClick={()=>setSelectedCustomer(undefined)} className="h-4 w-4 hover:cursor-pointer hover:text-red-500 "/>
                    </div>
                    : 
                    <CustomerSelect
                    open={isCustomerSelectOpen}
                    setOpen={setIsCustomerSelectOpen}
                    OnSelect={(c)=> setSelectedCustomer(c)}
                    >

                    <Button size={"sm"} variant={"outline"} className="text-xs hover:cursor-pointer"><Search className="size-4"/>Selecionar Cliente</Button>
                    </CustomerSelect>
                    }
                    
                  </div>
                  
                </CardTitle>
              
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {cart.length === 0 ? (
                  <div className="py-8 text-center">
                    <ShoppingCart className="h-8 w-8 text-muted mx-auto mb-2 opacity-50" />
                    <p className="text-sm text-muted-foreground">
                      Carrinho vazio
                    </p>
                  </div>
                ) : (
                  <>
                  <div className="flex w-full justify-start">
                    <span
                      onClick={() => setCart([])}
                      className="text-xs text-red-500 not-dark:text-red-500 hover:cursor-pointer hover:underline"
                    >
                      Esvaziar carrinho
                    </span>
                  </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {cart.map((item) => (
                        <div
                          key={item.id}
                          className="bg-muted/50 p-3 rounded-lg space-y-2"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground">
                                {item.titulo}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                R$ {item.precovenda.toFixed(2)}
                              </p>
                            </div>
                            <Button
                              onClick={() => removeFromCart(item.id)}
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/20 hover:cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity - 1)
                                }
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
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)
                                }
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
                        <span>Desconto:</span>
                        <span>R$ 0,00</span>
                      </div>

                      <div className="flex justify-between text-sm text-muted-foreground"></div>
                      <div className="flex justify-between text-lg font-bold text-primary-foreground bg-primary p-2 rounded">
                        <span>Total:</span>
                        <span>R$ {total.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2 pt-2">
                      <Button
                        variant="outline"
                        className="w-full text-muted-foreground hover:bg-destructive/20 hover:text-green-500 hover:cursor-pointer"
                      >
                        Iniciar Pagamento
                      </Button>
                      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                        <AlertDialogTrigger asChild>
                      <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold hover:cursor-pointer">
                        Finalizar Venda
                      </Button>

                        </AlertDialogTrigger>
                        <AlertDialogContent>

                        <AlertDialogHeader>
                          <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                          <AlertDialogDescription> Ao selecionar esta opção, o pagamento da venda ficará em aberto</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="hover:cursor-pointer">Cancelar</AlertDialogCancel>
                          <AlertDialogAction className="hover:cursor-pointer" onClick={()=> createVenda()}>Confirmar</AlertDialogAction>
                        </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
