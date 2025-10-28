import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 0;
export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // server
  { auth: { persistSession: false, autoRefreshToken: false } }
);

// GET: retorna a primeira empresa cadastrada
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("empresa")
      .select(
        "id, cnpj, razaosocial, nomefantasia, inscricaoestadual, inscricaomunicipal, endereco, codigomunicipio, regimetributario, ambiente"
      )
      .order("id", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      // ainda não configurado
      return NextResponse.json({ empresa: null }, { headers: { "Cache-Control": "no-store" } });
    }

    const empresa = {
      empresaId: data.id,
      cnpj: data.cnpj || "",
      razaosocial: data.razaosocial || "",
      nomefantasia: data.nomefantasia || "",
      inscricaoestadual: data.inscricaoestadual || "",
      inscricaomunicipal: data.inscricaomunicipal || "",
      endereco: data.endereco || "",
      codigomunicipio: data.codigomunicipio || "",
      regimetributario: (data.regimetributario || "SIMPLES_NACIONAL") as
        | "SIMPLES_NACIONAL"
        | "LUCRO_PRESUMIDO"
        | "LUCRO_REAL",
      ambiente: (data.ambiente || "HOMOLOGACAO") as "HOMOLOGACAO" | "PRODUCAO",
    };

    return NextResponse.json({ empresa }, { headers: { "Cache-Control": "no-store" } });
  } catch (e: any) {
    console.error("GET /api/config/empresa", e);
    return NextResponse.json({ error: "Falha ao carregar empresa" }, { status: 500 });
  }
}

// PUT: salva/upserta (por CNPJ). Se quiser forçar 1 registro só, pode fixar id=1.
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const v = body?.empresa || {};

    // normalizações simples de dígitos
    const onlyDigits = (s: string) => (s || "").replace(/\D+/g, "");

    const payload = {
      cnpj: onlyDigits(v.cnpj || ""),
      razaosocial: String(v.razaosocial || ""),
      nomefantasia: v.nomefantasia ? String(v.nomefantasia) : null,
      inscricaoestadual: v.inscricaoestadual ? onlyDigits(v.inscricaoestadual) : null,
      inscricaomunicipal: v.inscricaomunicipal ? onlyDigits(v.inscricaomunicipal) : null,
      endereco: String(v.endereco || ""),
      codigomunicipio: onlyDigits(v.codigomunicipio || ""),
      regimetributario: String(v.regimetributario || "SIMPLES_NACIONAL"),
      ambiente: String(v.ambiente || "HOMOLOGACAO"),
      updatedat: new Date().toISOString(),
    };

    // upsert por cnpj (unique)
    const { data, error } = await supabase
      .from("empresa")
      .upsert(payload, { onConflict: "cnpj" })
      .select("id")
      .maybeSingle();

    if (error) throw error;

    return NextResponse.json({ ok: true, id: data?.id ?? null });
  } catch (e: any) {
    console.error("PUT /api/config/empresa", e);
    return NextResponse.json({ error: e?.message || "Falha ao salvar empresa" }, { status: 500 });
  }
}
