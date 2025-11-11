"use client";

import type React from "react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  DollarSign,
  Package,
  TrendingUp,
  Wallet,
  User,
  Users,

} from "lucide-react";
import DialogFluxo from "./dialogs/dialog-fluxo";
import DialogDespesaCategoria from "./dialogs/dialog-despesa-categoria";
import DialogReceitaCategoria from "./dialogs/dialog-receita-categoria";
import { ProdutosEstoqueBaixo } from "./produtosEstoqueBaixo";
import { ProdutosEstoqueCritico } from "./produtosEstoqueCrítico";

export function ReportsGrid() {

 

  return (
    <div className="space-y-8">
      <Card className="p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <DollarSign />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-card-foreground">
              Financeiro
            </h2>
            <p className="text-sm text-muted-foreground">
              Relatórios de finanças e contabilidade
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          
          <DialogFluxo/>
          <DialogDespesaCategoria/>
          <DialogReceitaCategoria/>
          
        </div>
      </Card>

      {/* Vendas */}

      <Card className="p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <DollarSign />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-card-foreground">
              Vendas
            </h2>
            <p className="text-sm text-muted-foreground">
              Análise de vendas e faturamento
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Button
          disabled
            variant="outline"
            className="h-auto hover:cursor-not-allowed flex-col items-start justify-start gap-2 p-4 text-left hover:bg-accent hover:text-accent-foreground bg-transparent"
          >
            <div className="flex w-full items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                <Wallet />
              </div>
              <span className="flex-1 font-medium">Vendas por Produto </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Produtos mais vendidos
            </p>
          </Button>
        </div>
      </Card>

      {/* Estoque */}

      <Card className="p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Package />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-card-foreground">
              Estoque
            </h2>
            <p className="text-sm text-muted-foreground">
              Controle e movimentação de estoque
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ProdutosEstoqueBaixo/>
          <ProdutosEstoqueCritico/>
        </div>
      </Card>

      {/* Clientes */}

      <Card className="p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Users />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-card-foreground">
              Clientes
            </h2>
            <p className="text-sm text-muted-foreground">
              Informações sobre a base de clientes
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Button
            variant="outline"
            className="h-auto hover:cursor-pointer flex-col items-start justify-start gap-2 p-4 text-left hover:bg-accent hover:text-accent-foreground bg-transparent"
          >
            <div className="flex w-full items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                <FileText />
              </div>
              <span className="flex-1 font-medium">Histórico de compras </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Compras realizadas por clientes
            </p>
          </Button>
          <Button
            variant="outline"
            className="h-auto hover:cursor-pointer flex-col items-start justify-start gap-2 p-4 text-left hover:bg-accent hover:text-accent-foreground bg-transparent"
          >
            <div className="flex w-full items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                <TrendingUp />
              </div>
              <span className="flex-1 font-medium">Top Clientes </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Maiores compradores
            </p>
          </Button>
        </div>
      </Card>
    </div>
  );
}
