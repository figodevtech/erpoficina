// app/api/os/_authz.ts
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { auth } from "@/lib/auth";

export async function getMeuSetorId(): Promise<number | null> {
  const session = await auth();
  if (!session?.user) throw new Error("Não autenticado");

  const uid = (session.user as any).id as string;
  const email = (session.user as any).email as string | undefined;

  // tenta por ID
  const byId = await supabaseAdmin
    .from("usuario")
    .select("setorid")
    .eq("id", uid)
    .maybeSingle();

  if (byId.data?.setorid != null) return Number(byId.data.setorid);

  // fallback por e-mail (se o registro foi criado por e-mail primeiro)
  if (email) {
    const byEmail = await supabaseAdmin
      .from("usuario")
      .select("setorid")
      .eq("email", email)
      .maybeSingle();
    if (byEmail.data?.setorid != null) return Number(byEmail.data.setorid);
  }

  return null;
}
