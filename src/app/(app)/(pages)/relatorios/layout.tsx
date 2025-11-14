// src/app/(app)/(pages)/relatorios/layout.tsx
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { hasRelatoriosAccess } from "@/app/api/_authz/perms";

export default async function RelatoriosLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect(`/login?callbackUrl=${encodeURIComponent("/relatorios")}`);
  }

  const ok = await hasRelatoriosAccess();
  if (!ok) {
    redirect("/nao-autorizado");
  }

  return <>{children}</>;
}
