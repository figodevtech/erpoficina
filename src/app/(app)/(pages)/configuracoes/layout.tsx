// src/app/(app)/(pages)/dashboard/layout.tsx
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { hasConfigAccess } from "@/app/api/_authz/perms";

export default async function ConfigdLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect(`/login?callbackUrl=${encodeURIComponent("/dashboard")}`);
  }

  const ok = await hasConfigAccess();
  if (!ok) {
    redirect("/nao-autorizado");
  }

  return <>{children}</>;
}
