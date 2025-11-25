import {
  Dialog,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ReactNode, } from "react";
import { StatusOS } from "@/app/(app)/(pages)/ordens/types";
import VendasContent from "./vendasContent";
import { vendaStatus } from "@/app/(app)/(pages)/historicovendas/types";

interface VendasFinancialDialogProps {
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
  children?: ReactNode;
  vendaId: number;
    handleGetVendas: (
        status: vendaStatus,
        pageNumber?: number,
        limit?: number,
        search?: string
      ) => void;
  
}
export default function VendasFinancialDialog({
  open,
  onOpenChange,
  children,
  vendaId,
}: VendasFinancialDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <VendasContent IsOpen={open} vendaId={vendaId} />
    </Dialog>
  );
}
