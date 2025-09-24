import { ReactNode } from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { hasOSAccess } from "@/app/api/_authz/perms";

export default async function OrdensLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  // Não logado? manda pro login (com callback pra voltar)
  if (!session?.user) {
    redirect(`/login?callbackUrl=${encodeURIComponent("/ordens")}`);
  }

  // Logado mas sem permissão? manda pra página de "Não autorizado"
  const ok = await hasOSAccess();
  if (!ok) {
    redirect("/nao-autorizado");
  }

  return <>{children}</>;
}
