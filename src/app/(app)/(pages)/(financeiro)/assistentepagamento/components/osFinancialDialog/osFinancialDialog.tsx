import {
  Dialog,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ReactNode, } from "react";

import OsContent from "./osContent";

interface OsFinancialDialogProps {
  children: ReactNode;
  osId: number;
}
export default function OsFinancialDialog({
  children,
  osId,
}: OsFinancialDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <OsContent osId={osId} />
    </Dialog>
  );
}
