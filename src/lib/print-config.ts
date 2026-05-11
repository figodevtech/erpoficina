import { supabaseAdmin } from "@/lib/supabaseAdmin";

const DEFAULT_PRINT_COLORS = {
  primary: "#2563eb",
  secondary: "#0891b2",
};

function normalizeHexColor(value: unknown, fallback: string) {
  const color = String(value ?? "").trim();
  return /^#[0-9a-fA-F]{6}$/.test(color) ? color.toLowerCase() : fallback;
}

export async function fetchPrintColors() {
  const { data, error } = await supabaseAdmin
    .from("config_geral")
    .select("impressao_cor_primaria, impressao_cor_secundaria")
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Erro ao buscar cores de impressao:", error);
    return DEFAULT_PRINT_COLORS;
  }

  return {
    primary: normalizeHexColor(data?.impressao_cor_primaria, DEFAULT_PRINT_COLORS.primary),
    secondary: normalizeHexColor(data?.impressao_cor_secundaria, DEFAULT_PRINT_COLORS.secondary),
  };
}
