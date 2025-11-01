import {
  Dialog,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ReactNode, } from "react";

import OsContent from "./osContent";
import { StatusOS } from "@/app/(app)/(pages)/ordens/types";

interface OsFinancialDialogProps {
  children: ReactNode;
  osId: number;
    handleGetOrdens: (
      status: StatusOS,
      pageNumber?: number,
      limit?: number,
      search?: string
    ) => void;
  
}
export default function OsFinancialDialog({
  children,
  osId,
  handleGetOrdens,
}: OsFinancialDialogProps) {
  return (
    <Dialog onOpenChange={() => {}}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <OsContent osId={osId} />
    </Dialog>
  );
}
