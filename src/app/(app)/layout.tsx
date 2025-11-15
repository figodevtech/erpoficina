// src/app/(app)/layout.tsx
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import ClientAppShell from "./ClientAppShell";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = {
    nome: (session.user as any)?.nome ?? session.user?.name ?? "",
    email: session.user?.email ?? "",
  };

  return <ClientAppShell user={user}>{children}</ClientAppShell>;
}
