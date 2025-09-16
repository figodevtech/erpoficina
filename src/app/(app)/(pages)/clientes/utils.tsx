// StatusBadge.tsx
import { ClientStatus } from "./types"
import { Badge } from "@/components/ui/badge"

export const getStatusBadge = (status: ClientStatus) => {
    switch (status) {
      case ClientStatus.ATIVO:
        return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">Ativo</Badge>
      case ClientStatus.INATIVO:
        return <Badge variant="secondary" className="bg-red-100 text-gray-800">Inativo</Badge>
      case ClientStatus.PENDENTE:
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Pendente</Badge>
      default:
        return <Badge variant="secondary">Desconhecido</Badge>
    }
  }
