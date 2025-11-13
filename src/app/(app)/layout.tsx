// /src/app/(app)/layout.tsx
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import ClientAppShell from "./ClientAppShell";

export default async function AppLayout({ children }: { children: ReactNode }) {
  // Exige sessão (NextAuth v5: auth(); v4: getServerSession)
  const session = await auth();
  if (!session) {
    // Middleware já trata ?next=..., aqui só bloqueamos de novo por segurança
    redirect("/login");
  }

  const user = {
    nome: (session.user as any)?.nome ?? session.user?.name ?? "",
    email: session.user?.email ?? "",
  };

  // Layout aninhado não precisa <html>/<body>; isso vem do root layout
  return <ClientAppShell user={user}>{children}</ClientAppShell>;
}
