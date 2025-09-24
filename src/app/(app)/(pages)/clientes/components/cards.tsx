import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { UserCheck, Users, UserX } from "lucide-react";
import { ClientStatus, CardsProps } from "../types";


export default function Cards ( {loadingStatusCounter, totalCustomers, statusCounts} : CardsProps) {
    
    return (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Clientes
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingStatusCounter ? (
              <Skeleton className="h-8 w-8" />
            ) : (
              <div className="text-2xl font-bold">{totalCustomers || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Clientes cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Clientes Ativos
            </CardTitle>
            <UserCheck className="h-4 w-4 text-chart-4" />
          </CardHeader>
          <CardContent>
            {loadingStatusCounter ? (
              <Skeleton className="h-8 w-8" />
            ) : (
              <div className="text-2xl font-bold text-chart-4">
                {statusCounts.ATIVO || 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Status {ClientStatus.ATIVO}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Clientes Inativos
            </CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingStatusCounter ? (
              <Skeleton className="h-8 w-8" />
            ) : (
              <div className="text-2xl font-bold text-muted-foreground">
                {statusCounts.INATIVO || 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Status {ClientStatus.INATIVO || 0} • Pendentes:{" "}
              {statusCounts.PENDENTE || 0}
            </p>
          </CardContent>
        </Card>
      </div>
    )

}