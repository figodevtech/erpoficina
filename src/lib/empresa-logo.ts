import { supabaseAdmin } from "@/lib/supabaseAdmin";

const LOGO_EXTENSIONS = /\.(avif|webp|png|jpe?g|gif|svg)$/i;

export async function fetchPrimeiroLogoEmpresa() {
  const { data, error } = await supabaseAdmin.storage
    .from("empresa")
    .list("images/logo", {
      limit: 100,
      sortBy: { column: "name", order: "asc" },
    });

  if (error) {
    console.error("Erro ao listar logos da empresa no Supabase:", error);
    return null;
  }

  const logo = (data ?? []).find((file) => {
    const name = String(file.name ?? "").trim();
    return LOGO_EXTENSIONS.test(name);
  });

  if (!logo) return null;

  const { data: publicUrl } = supabaseAdmin.storage
    .from("empresa")
    .getPublicUrl(`images/logo/${logo.name}`);

  return publicUrl.publicUrl || null;
}
