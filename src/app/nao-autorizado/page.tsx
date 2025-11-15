// src/app/nao-autorizado/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import ClientAppShell from "../(app)/ClientAppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function UnauthorizedPage() {
  // garante que só usuário logado veja essa tela
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const user = {
    nome: (session.user as any)?.nome ?? session.user?.name ?? "",
    email: session.user?.email ?? "",
  };

  return (
    <ClientAppShell user={user} hideHeader>
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acesso não autorizado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Você não tem permissão para acessar esta página.
              <br />
              Consulte o administrador do sistema para solicitar acesso.
            </p>
            <Button asChild variant="outline">
              <Link href="/">Ir para o início</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </ClientAppShell>
  );
}
