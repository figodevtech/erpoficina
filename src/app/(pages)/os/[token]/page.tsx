import { use } from "react";
import AprovacaoCliente from "./components/aprovacao-cliente";

export default function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  return <AprovacaoCliente token={token} />;
}
