import DashboardClientes from "./components/dashboard-clientes";
import { CartaoStatusClientes } from "./components/cartao-status-clientes";

export default function DashboardClientesPage() {
  return (
    <div className="space-y-4">
      <DashboardClientes />
      <CartaoStatusClientes />
    </div>
  );
}
