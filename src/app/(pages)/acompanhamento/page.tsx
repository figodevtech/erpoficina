import PainelAcompanhamento from "./ui/painel";

export const dynamic = "force-dynamic"; // sempre pegar dados frescos

// Página pública (sem auth)
export default function AcompanhamentoPage() {
  return <PainelAcompanhamento />;
}
