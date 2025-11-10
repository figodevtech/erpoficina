"use client";

import type React from "react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  DollarSign,
  Users,
  Package,
  TrendingUp,
  ShoppingCart,
  BarChart3,
  FileBarChart,
  Wallet,
  CalendarDays,
  Receipt,
  Boxes,
  UserCheck,
  CreditCard,
  Archive,
  ListChecks,
  PieChart,
  Activity,
} from "lucide-react";
import { useState } from "react";
import { Dialog } from "@radix-ui/react-dialog";
import DialogFluxo from "./dialogs/dialog-fluxo";
import DialogDespesaCategoria from "./dialogs/dialog-despesa-categoria";

export function ReportsGrid() {
  const [loadingReport, setLoadingReport] = useState<string | null>(null);

  const handleGenerateReport = async (reportId: string, reportName: string) => {
    setLoadingReport(reportId);

    // Simulação de geração de relatório
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Aqui você implementaria a lógica real de geração do relatório
    console.log(`Gerando relatório: ${reportName} (${reportId})`);

    setLoadingReport(null);
  };

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
          {/* <Button
            variant="outline"
            className="h-auto hover:cursor-pointer flex-col items-start justify-start gap-2 p-4 text-left hover:bg-accent hover:text-accent-foreground bg-transparent"
          >
            <div className="flex w-full items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                <Wallet />
              </div>
              <span className="flex-1 font-medium">Fluxo de Caixa</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Movimentações financeiras detalhadas
            </p>
          </Button> */}
          <DialogFluxo/>
          <DialogDespesaCategoria/>
          
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
            variant="outline"
            className="h-auto hover:cursor-pointer flex-col items-start justify-start gap-2 p-4 text-left hover:bg-accent hover:text-accent-foreground bg-transparent"
          >
            <div className="flex w-full items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                <Wallet />
              </div>
              <span className="flex-1 font-medium">Vendas por Produto</span>
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
          <Button
            variant="outline"
            className="h-auto hover:cursor-pointer flex-col items-start justify-start gap-2 p-4 text-left hover:bg-accent hover:text-accent-foreground bg-transparent"
          >
            <div className="flex w-full items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                <Boxes />
              </div>
              <span className="flex-1 font-medium">Produtos Abaixo do Mínimo </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Itens que precisam de remosição.
            </p>
          </Button>
        </div>
      </Card>

      {/* Clientes */}

      <Card className="p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Package />
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
