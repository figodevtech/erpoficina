// app/api/tipos/fornecedor/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type FornecedorBody = {
  cpfcnpj?: unknown;
  nomerazaosocial?: unknown;
  nomefantasia?: unknown;
  endereco?: unknown;
  endereconumero?: unknown;
  enderecocomplemento?: unknown;
  bairro?: unknown;
  cidade?: unknown;
  estado?: unknown;
  cep?: unknown;
  contato?: unknown;
};

function toOptionalString(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  return null;
}

function mapFornecedorRow(row: any) {
  return {
    id: String(row.id),
    cpfcnpj: row.cpfcnpj,
    nomerazaosocial: row.nomerazaosocial,
    nomefantasia: row.nomefantasia ?? null,
    endereco: row.endereco ?? null,
    endereconumero: row.endereconumero ?? null,
    enderecocomplemento: row.enderecocomplemento ?? null,
    bairro: row.bairro ?? null,
    cidade: row.cidade ?? null,
    estado: row.estado ?? null,
    cep: row.cep ?? null,
    contato: row.contato ?? null,
    createdat: row.createdat,
    updatedat: row.updatedat,
  };
}

// GET /api/tipos/fornecedor
// Opcional: ?q=termo (busca por razão social, fantasia ou cpfcnpj)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() || "";

    let query = supabaseAdmin
      .from("fornecedor")
      .select(
        "id, cpfcnpj, nomerazaosocial, nomefantasia, endereco, endereconumero, enderecocomplemento, bairro, cidade, estado, cep, contato, createdat, updatedat"
      )
      .order("nomerazaosocial", { ascending: true });

    if (q) {
      // busca em razão social, fantasia ou cpf/cnpj
      query = query.or(
        `nomerazaosocial.ilike.%${q}%,nomefantasia.ilike.%${q}%,cpfcnpj.ilike.%${q}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    const items = (data ?? []).map(mapFornecedorRow);
    return NextResponse.json({ ok: true, items }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Erro inesperado" },
      { status: 500 }
    );
  }
}

// POST /api/tipos/fornecedor
// Body esperado (JSON):
// {
//   "cpfcnpj": "12345678000199",
//   "nomerazaosocial": "Fornecedor X",
//   "nomefantasia": "Fornecedor X LTDA",
//   "endereco": "...",
//   "cidade": "...",
//   "estado": "CE",
//   "cep": "...",
//   "contato": "...",
//   "endereconumero": "...",
//   "enderecocomplemento": "...",
//   "bairro": "..."
// }
export async function POST(req: NextRequest) {
  try {
    const json = (await req.json().catch(() => null)) as FornecedorBody | null;

    if (!json || typeof json !== "object") {
      return NextResponse.json(
        { ok: false, error: "Body JSON inválido" },
        { status: 400 }
      );
    }

    const cpfcnpjRaw = typeof json.cpfcnpj === "string" ? json.cpfcnpj.trim() : "";
    const nomerazaosocialRaw =
      typeof json.nomerazaosocial === "string" ? json.nomerazaosocial.trim() : "";

    if (!cpfcnpjRaw) {
      return NextResponse.json(
        { ok: false, error: "Campo 'cpfcnpj' é obrigatório" },
        { status: 400 }
      );
    }

    if (!nomerazaosocialRaw) {
      return NextResponse.json(
        { ok: false, error: "Campo 'nomerazaosocial' é obrigatório" },
        { status: 400 }
      );
    }

    const insertData = {
      cpfcnpj: cpfcnpjRaw,
      nomerazaosocial: nomerazaosocialRaw,
      nomefantasia: toOptionalString(json.nomefantasia),
      endereco: toOptionalString(json.endereco),
      endereconumero: toOptionalString(json.endereconumero),
      enderecocomplemento: toOptionalString(json.enderecocomplemento),
      bairro: toOptionalString(json.bairro),
      cidade: toOptionalString(json.cidade),
      estado: toOptionalString(json.estado),
      cep: toOptionalString(json.cep),
      contato: toOptionalString(json.contato),
    };

    const { data, error } = await supabaseAdmin
      .from("fornecedor")
      .insert(insertData)
      .select(
        "id, cpfcnpj, nomerazaosocial, nomefantasia, endereco, endereconumero, enderecocomplemento, bairro, cidade, estado, cep, contato, createdat, updatedat"
      )
      .single();

    if (error) {
      // 23505 = unique_violation (cpfcnpj duplicado)
      if ((error as any).code === "23505") {
        return NextResponse.json(
          { ok: false, error: "Já existe um fornecedor com esse CPF/CNPJ" },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { ok: false, error: error.message ?? "Erro ao criar fornecedor" },
        { status: 500 }
      );
    }

    const item = mapFornecedorRow(data);
    return NextResponse.json({ ok: true, item }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Erro inesperado" },
      { status: 500 }
    );
  }
}
