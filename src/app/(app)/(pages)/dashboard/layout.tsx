// src/app/(app)/(pages)/dashboard/layout.tsx
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { hasDashboardAccess } from "@/app/api/_authz/perms";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  // const session = await auth();
  // if (!session?.user) {
  //   redirect(`/login?callbackUrl=${encodeURIComponent("/dashboard")}`);
  // }

  // const ok = await hasDashboardAccess();
  // if (!ok) {
  //   redirect("/nao-autorizado");
  // }

  return <>{children}</>;
}
