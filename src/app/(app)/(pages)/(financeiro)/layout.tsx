
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { hasFinanceiroAccess } from "@/app/api/_authz/perms";

export default async function FinanceiroLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect(`/login?callbackUrl=${encodeURIComponent("/dashboard")}`);
  }

  const ok = await hasFinanceiroAccess();
  if (!ok) {
    redirect("/nao-autorizado");
  }

  return <>{children}</>;
}
