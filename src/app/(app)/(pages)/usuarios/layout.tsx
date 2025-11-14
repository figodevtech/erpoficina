// src/app/(app)/(pages)/usuarios/layout.tsx
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { hasUsuariosAccess } from "@/app/api/_authz/perms";

export default async function UsuariosLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect(`/login?callbackUrl=${encodeURIComponent("/usuarios")}`);
  }

  const ok = await hasUsuariosAccess();
  if (!ok) {
    redirect("/nao-autorizado");
  }

  return <>{children}</>;
}
