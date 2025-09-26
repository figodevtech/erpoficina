// src/app/api/clientes/[id]/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type Params = { params: Promise<{ id: string }> };

const CLIENTE_FIELDS = `
  id, tipopessoa, cpfcnpj, nomerazaosocial, email, telefone, endereco,
  cidade, estado, cep, inscricaoestadual, inscricaomunicipal, codigomunicipio,
  createdat, updatedat, status
`;

const VEICULO_FIELDS = `
  id, clienteid, placa, modelo, marca, ano, cor, kmatual, createdat, updatedat
`;

type Status = "ATIVO" | "INATIVO" | "PENDENTE";
const STATUS_SET = new Set<Status>(["ATIVO", "INATIVO", "PENDENTE"]);

const WRITABLE_FIELDS = new Set([
  "tipopessoa",
  "cpfcnpj",
  "nomerazaosocial",
  "email",
  "telefone",
  "endereco",
  "cidade",
  "estado",
  "cep",
  "inscricaoestadual",
  "inscricaomunicipal",
  "codigomunicipio",
  "status",
]);

function toNullIfEmpty(v: unknown) {
  return typeof v === "string" && v.trim() === "" ? null : v;
}

function sanitizePayload(body: any, { strict }: { strict: boolean }) {
  const out: Record<string, any> = {};
  for (const key of Object.keys(body ?? {})) {
    if (!WRITABLE_FIELDS.has(key)) continue;
    out[key] = toNullIfEmpty(body[key]);
  }

  if (out.status != null) {
    const up = String(out.status).toUpperCase();
    if (!STATUS_SET.has(up as Status)) {
      throw new Error("Status inválido. Use ATIVO, INATIVO ou PENDENTE.");
    }
    out.status = up;
  }

  if (strict) {
    const required = ["tipopessoa", "cpfcnpj", "nomerazaosocial"];
    const missing = required.filter((k) => out[k] == null);
    if (missing.length) {
      throw new Error(
        `Campos obrigatórios ausentes no PUT: ${missing.join(", ")}`
      );
    }
  }

  out.updatedat = new Date().toISOString();
  return out;
}

async function parseId(ctx: Params) {
  const { id: idParam } = await ctx.params;
  const id = Number((idParam ?? "").trim());
  if (!id) throw new Error("ID inválido.");
  return id;
}

/* ========================= GET ========================= */

export async function GET(_: Request, ctx: Params) {
  try {
    const id = await parseId(ctx);

    const { data, error } = await supabaseAdmin
      .from("cliente")
      .select(
        `
        ${CLIENTE_FIELDS},
        veiculos:veiculo ( ${VEICULO_FIELDS} )
        `
      )
      .eq("id", id)
      .single();

    if (error) {
      if ((error as any).code === "PGRST116") {
        return NextResponse.json(
          { error: "Cliente não encontrado." },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({ data });
  } catch (e: any) {
    const msg = e?.message ?? "Erro ao buscar cliente.";
    const status = msg.includes("ID inválido") ? 400 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

/* ========================= PATCH ========================= */

export async function PATCH(req: Request, ctx: Params) {
  try {
    const id = await parseId(ctx);
    const body = await req.json().catch(() => ({}));
    const payload = sanitizePayload(body, { strict: false });

    if (Object.keys(payload).length === 1 && "updatedat" in payload) {
      return NextResponse.json(
        { error: "Nada para atualizar." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("cliente")
      .update(payload)
      .eq("id", id)
      .select(CLIENTE_FIELDS)
      .single();

    if (error) {
      if ((error as any).code === "23505") {
        return NextResponse.json(
          { error: "CPF/CNPJ já cadastrado." },
          { status: 409 }
        );
      }
      if ((error as any).code === "PGRST116") {
        return NextResponse.json(
          { error: "Cliente não encontrado." },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({ data, id: data.id });
  } catch (e: any) {
    const msg = e?.message ?? "Erro ao atualizar cliente.";
    const status = msg.includes("ID inválido") ? 400 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

/* ========================= PUT ========================= */

export async function PUT(req: Request, ctx: Params) {
  console.log(req, ctx)
  console.log("teste")
  try {
    const id = await parseId(ctx);
    const body = await req.json().catch(() => ({}));
    const payload = sanitizePayload(body, { strict: true });

    console.log(payload)
    console.log("teste")
    const { data, error } = await supabaseAdmin
      .from("cliente")
      .update(payload)
      .eq("id", id)
      .select(CLIENTE_FIELDS)
      .single();

    if (error) {
      if ((error as any).code === "23505") {
        return NextResponse.json(
          { error: "CPF/CNPJ já cadastrado." },
          { status: 409 }
        );
      }
      if ((error as any).code === "PGRST116") {
        return NextResponse.json(
          { error: "Cliente não encontrado." },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({ data, id: data.id });
  } catch (e: any) {
    const msg = e?.message ?? "Erro ao atualizar cliente.";
    const status =
      msg.includes("ID inválido") || msg.includes("Campos obrigatórios")
        ? 400
        : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

/* ========================= DELETE =========================
   Se você tiver ON DELETE CASCADE em todas as FKs, pode simplificar
   para deletar apenas o cliente. Abaixo está a versão defensiva,
   apagando em ordem (checklist -> ordemservico -> veiculo -> cliente).
============================================================= */

export async function DELETE(_: Request, ctx: Params) {
  try {
    const { id: idParam } = await ctx.params;
    const id = Number((idParam ?? "").trim());
    if (!id) {
      return NextResponse.json({ error: "ID inválido." }, { status: 400 });
    }

    // Com ON DELETE CASCADE, basta deletar o cliente.
    // Usamos .select('id') para saber se encontrou/deletou algo.
    const { data, error } = await supabaseAdmin
      .from("cliente")
      .delete()
      .eq("id", id)
      .select("id");

    if (error) throw error;

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: "Cliente não encontrado." },
        { status: 404 }
      );
    }

    // 204 No Content é o mais semântico para DELETE bem-sucedido
    return new NextResponse(null, { status: 204 });
    // Se preferir payload:
    // return NextResponse.json({ success: true, deletedId: data[0].id }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Erro ao deletar cliente." },
      { status: 500 }
    );
  }
}
