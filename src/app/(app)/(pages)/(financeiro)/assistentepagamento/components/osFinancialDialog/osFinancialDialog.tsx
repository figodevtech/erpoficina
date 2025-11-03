import {
  Dialog,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ReactNode, } from "react";

import OsContent from "./osContent";
import { StatusOS } from "@/app/(app)/(pages)/ordens/types";

interface OsFinancialDialogProps {
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
  children?: ReactNode;
  osId: number;
    handleGetOrdens: (
      status: StatusOS,
      pageNumber?: number,
      limit?: number,
      search?: string
    ) => void;
  
}
export default function OsFinancialDialog({
  open,
  onOpenChange,
  children,
  osId,
  handleGetOrdens,
}: OsFinancialDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <OsContent IsOpen={open} osId={osId} />
    </Dialog>
  );
}
