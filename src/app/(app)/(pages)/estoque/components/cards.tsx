"use client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Package,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";

interface CardsPropos {
    totalProducts: number;
    loadingStatusCounter: boolean;
    statusCounts: Record<string, number>


}

export default function Cards({loadingStatusCounter, totalProducts, statusCounts}: CardsPropos) {

    return(
        <div className="grid gap-4 grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Itens
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingStatusCounter ? (
              <Skeleton className="h-8 w-8"></Skeleton>
            ) : (
              <div className="text-2xl font-bold">{totalProducts}</div>
            )}
            <p className="text-xs text-muted-foreground">Produtos listados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Itens Críticos
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            {loadingStatusCounter ? (
              <Skeleton className="w-8 h-8"></Skeleton>
            ) : (
              <div className="text-2xl font-bold text-destructive">
                {statusCounts.CRITICO}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Reposição urgente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            {loadingStatusCounter ? (
              <Skeleton className="w-8 h-8"></Skeleton>
            ) : (
              <div className="text-2xl font-bold text-orange-500">
                {statusCounts.BAIXO}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Atenção necessária</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Bom</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingStatusCounter ? (
              <Skeleton className="w-8 h-8"></Skeleton>
            ) : (
              <div className="text-2xl font-bold">{statusCounts.OK}</div>
            )}
            <p className="text-xs text-muted-foreground">Valor do inventário</p>
          </CardContent>
        </Card>
      </div>
    )
}