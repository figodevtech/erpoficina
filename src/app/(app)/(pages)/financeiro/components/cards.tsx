"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Package, AlertTriangle, TrendingDown, TrendingUp, BanknoteArrowUp, BanknoteArrowDown, Coins } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface CardsProps {
  totalProducts: number;
  loadingStatusCounter: boolean;
  statusCounts: Record<string, number>;
}

export default function Cards() {
  return (
    <div className="text-nowrap grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
      <Card className="gap-1 py-4 h-fit ">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Receita total <span className="text-muted-foreground">(Este mês)</span></CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="flex flex-row justify-between">
          {/* {loadingStatusCounter ? (
              <Skeleton className="h-8 w-8"></Skeleton>
            ) : (
              <div className="text-2xl font-bold">{totalProducts}</div>
            )} */}
            <div className="flex flex-col justify-between">
              <BanknoteArrowUp className="text-green-800 dark:text-green-200"/>

            <span className="text-xl font-bold">

            R$ 124.000,00
            </span>
          <p className="text-xs text-muted-foreground">Mensal</p>
            </div>
          <div className="flex flex-col items-end text-sm" >
            <Badge className="bg-green-700">18% <TrendingUp/></Badge>
            <span>Mês anterior</span>
            <span className="w-fit text-muted-foreground">R$ 98.000,00</span>
          </div>
        </CardContent>
      </Card>
      <Card className="gap-1 py-4 h-fit ">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Despesa total <span className="text-muted-foreground">(Este mês)</span></CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="flex flex-row justify-between">
          {/* {loadingStatusCounter ? (
              <Skeleton className="h-8 w-8"></Skeleton>
            ) : (
              <div className="text-2xl font-bold">{totalProducts}</div>
            )} */}
            <div className="flex flex-col justify-between">
              <BanknoteArrowDown className=" dark:text-red-200 not-dark:text-red-600"/>

            <span className="text-xl font-bold">

            R$ 35.000,00
            </span>
          <p className="text-xs text-muted-foreground">Mensal</p>
            </div>
          <div className="flex flex-col items-end text-sm" >
            <Badge className="dark:bg-red-700 not-dark:bg-red-500">18% <TrendingUp/></Badge>
            <span>Mês anterior</span>
            <span className="w-fit text-muted-foreground">R$ 29.000,00</span>
          </div>
        </CardContent>
      </Card>
      <Card className="gap-1 py-4 h-fit col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Renda líquida total <span className="text-muted-foreground">(Este mês)</span></CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="flex flex-row justify-between">
          {/* {loadingStatusCounter ? (
              <Skeleton className="h-8 w-8"></Skeleton>
            ) : (
              <div className="text-2xl font-bold">{totalProducts}</div>
            )} */}
            <div className="flex flex-col justify-between">
              <Coins className=" dark:text-amber-200 not-dark:text-amber-600"/>

            <span className="text-xl font-bold">

            R$ 89.000,00
            </span>
          <p className="text-xs text-muted-foreground">Mensal</p>
            </div>
          <div className="flex flex-col items-end text-sm" >
            <Badge className="dark:bg-green-700 not-dark:bg-green-500">18% <TrendingUp/></Badge>
            <span>Mês anterior</span>
            <span className="w-fit text-muted-foreground">R$ 75.000,00</span>
          </div>
        </CardContent>
      </Card>

      
    </div>
  );
}
