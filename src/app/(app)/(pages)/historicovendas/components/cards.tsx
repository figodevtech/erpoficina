"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Package, AlertTriangle, TrendingDown, TrendingUp, BanknoteArrowUp, ChartSpline, Check, Clock } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { VendaStatusMetricsData } from "../types";
import formatarEmReal from "@/utils/formatarEmReal";

interface CardsPropos {
  totalVendas: number;
  loadingStatusCounter: boolean;
  statusCounts: VendaStatusMetricsData | null;
}

export default function Cards({
  loadingStatusCounter,
  statusCounts,
}: CardsPropos) {
  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valor Total Vendido <span className="text-xs text-muted-foreground">(Este Mês)</span></CardTitle>
          <BanknoteArrowUp className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {loadingStatusCounter ? (
            <Skeleton className="h-8 w-8"></Skeleton>
          ) : (
            <div className="text-2xl">{formatarEmReal(statusCounts?.byStatus.finalizadas?.totalValor || 0) }</div>
          )}
          <p className="text-xs text-muted-foreground">Mensal</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ticket Médio <span className="text-xs text-muted-foreground">(Este Mês)</span></CardTitle>
          <ChartSpline className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {loadingStatusCounter ? (
            <Skeleton className="h-8 w-8"></Skeleton>
          ) : (
            <div className="text-2xl">{formatarEmReal(statusCounts?.byStatus.finalizadas?.ticketMedio || 0) }</div>
          )}
          <p className="text-xs text-muted-foreground">Mensal</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Vendas Concluídas <span className="text-xs text-muted-foreground">(Este Mês)</span></CardTitle>
          <Check className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {loadingStatusCounter ? (
            <Skeleton className="h-8 w-8"></Skeleton>
          ) : (
            <div className="text-2xl">{statusCounts?.byStatus.finalizadas?.totalPedidos}</div>
          )}
          <p className="text-xs text-muted-foreground">Mensal</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recebimento em aberto <span className="text-xs text-muted-foreground">(Este Mês)</span></CardTitle>
          <Clock className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {loadingStatusCounter ? (
            <Skeleton className="h-8 w-8"></Skeleton>
          ) : (
            <div className="text-2xl">{formatarEmReal(statusCounts?.byStatus.abertas?.totalValor || 0)}</div>
          )}
          <p className="text-xs text-muted-foreground">Mensal</p>
        </CardContent>
      </Card>
    </div>
  );
}
