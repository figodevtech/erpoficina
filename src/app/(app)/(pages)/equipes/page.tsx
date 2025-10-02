// /src/app/(app)/(pages)/equipes/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import EquipesClient from "./components/ordens-equipe";

export default async function Page() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id as string;

  // setorId via session -> fallback no banco
  let setorId: number | null = ((session.user as any)?.setorId as number | null) ?? null;
  if (!setorId) {
    const { data: urow } = await supabaseAdmin
      .from("usuario")
      .select("setorid")
      .eq("id", userId)
      .maybeSingle();
    setorId = (urow?.setorid as number | null) ?? null;
  }

  if (!setorId) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Equipes</h1>
        <p className="text-muted-foreground mt-2">
          Seu usuário não possui um setor associado. Fale com um administrador.
        </p>
      </div>
    );
  }

  // ⚠️ pega o nome do setor pelo ID
  const { data: srow } = await supabaseAdmin
    .from("setor")
    .select("nome")
    .eq("id", setorId)
    .single();

  const setorNome = srow?.nome ?? `Setor #${setorId}`;

  return <EquipesClient setorId={setorId} setorNome={setorNome} />;
}
