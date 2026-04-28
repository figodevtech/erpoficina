// src/app/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getDefaultRouteForPerms } from "@/app/api/_authz/default-route";

export default async function Home() {
  const session = await auth();
  if (!session) {
    redirect("/login");
  } else {
    redirect(getDefaultRouteForPerms((session.user as any)?.permissoes));
  }
}
