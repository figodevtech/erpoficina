// src/app/(app)/(pages)/estoque/layout.tsx
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { hasEstoqueAccess } from "@/app/api/_authz/perms";

export default async function EstoqueLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect(`/login?callbackUrl=${encodeURIComponent("/estoque")}`);
  }

  const ok = await hasEstoqueAccess();
  if (!ok) {
    redirect("/nao-autorizado");
  }

  return <>{children}</>;
}
