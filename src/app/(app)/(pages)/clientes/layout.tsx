// src/app/(app)/(pages)/clientes/layout.tsx
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { hasClientesAccess } from "@/app/api/_authz/perms";

export default async function ClientesLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect(`/login?callbackUrl=${encodeURIComponent("/clientes")}`);
  }

  const ok = await hasClientesAccess();
  if (!ok) {
    redirect("/nao-autorizado");
  }

  return <>{children}</>;
}
