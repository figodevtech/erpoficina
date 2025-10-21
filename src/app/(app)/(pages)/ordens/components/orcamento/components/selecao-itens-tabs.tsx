"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BuscaProdutos } from "./busca-produtos";
import { BuscaServicos } from "./busca-servicos";
import type { ProdutoBusca, ServicoBusca } from "../tipos";

type Props = {
  onAdicionarProduto: (p: ProdutoBusca) => void;
  onAdicionarServico: (s: ServicoBusca) => void;
  abaInicial?: "produtos" | "servicos";
  className?: string;
};

export function SelecaoItensTabs({
  onAdicionarProduto,
  onAdicionarServico,
  abaInicial = "produtos",
  className,
}: Props) {
  const [aba, setAba] = useState<"produtos" | "servicos">(abaInicial);

  return (
    <div className={className}>
      <Tabs value={aba} onValueChange={(v) => setAba(v as any)} className="w-full">
        <TabsList className="mb-4 flex w-auto gap-3 rounded-xl bg-muted/60">
          <TabsTrigger value="produtos" className="h-9 min-w-[140px] data-[state=active]:font-semibold">
            Produtos
          </TabsTrigger>
          <TabsTrigger value="servicos" className="h-9 min-w-[140px] data-[state=active]:font-semibold">
            Serviços
          </TabsTrigger>
        </TabsList>

        <TabsContent value="produtos" className="mt-0">
          <BuscaProdutos onAdicionar={onAdicionarProduto} />
        </TabsContent>

        <TabsContent value="servicos" className="mt-0">
          <BuscaServicos onAdicionar={onAdicionarServico} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
