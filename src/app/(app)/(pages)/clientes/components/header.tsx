import { Button } from "@/components/ui/button";
import { CustomerDialog } from "./customerDialogRegister/customerDialog";

export default function Header() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-balance">
          Gestão de Clientes
        </h1>
        <p className="text-muted-foreground text-pretty">
          Controle completo da base de clientes da oficina
        </p>
      </div>
      <div className="flex items-center gap-2">
        <CustomerDialog>
          <Button>Novo Cliente</Button>
        </CustomerDialog>
      </div>
    </div>
  );
}
