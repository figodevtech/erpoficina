export const dynamic = "force-dynamic";

export default function AcompanhamentoPublicLayout({ children }: { children: React.ReactNode }) {
  // Layout enxuto: sem sidebar, ocupa a tela toda (root layout geral ainda se aplica).
  return <div className="min-h-screen bg-background text-foreground">{children}</div>;
}
