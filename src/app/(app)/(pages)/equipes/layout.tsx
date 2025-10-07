// src/app/(app)/(pages)/equipes/layout.tsx
import { ReactNode } from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { hasEquipesAccess } from "@/app/api/_authz/perms";

export default async function Layout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect(`/login?callbackUrl=${encodeURIComponent("/equipes")}`);
  }
  const ok = await hasEquipesAccess();
  if (!ok) redirect("/nao-autorizado");
  return <>{children}</>;
}
