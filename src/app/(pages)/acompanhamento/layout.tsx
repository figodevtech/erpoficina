export const dynamic = "force-dynamic";

export default function AcompanhamentoPublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 via-background to-background">
      {children}
    </div>
  );
}
