// src/app/api/customers/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type Status = "ATIVO" | "INATIVO" | "PENDENTE";
const STATUS_SET = new Set<Status>(["ATIVO", "INATIVO", "PENDENTE"]);

const CLIENTE_FIELDS = `
  id, tipopessoa, cpfcnpj, nomerazaosocial, email, telefone, endereco,
  cidade, estado, bairro, cep, inscricaoestadual, inscricaomunicipal, codigomunicipio,
  createdat, updatedat, endereconumero, enderecocomplemento, status
`;

const VEICULO_FIELDS = `
  id, clienteid, placa, modelo, marca, ano, cor, kmatual, createdat, updatedat
`;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Math.max(Number(searchParams.get("page") ?? 1), 1);
    const limitRaw =
      searchParams.get("limit") ?? searchParams.get("pageSize") ?? "20";
    const limit = Math.min(Math.max(Number(limitRaw), 1), 100);

    const q = (
      searchParams.get("search") ??
      searchParams.get("q") ??
      ""
    ).trim();

    const statusParam = (searchParams.get("status") ?? "TODOS").toUpperCase();
    const statusFilter = STATUS_SET.has(statusParam as Status)
      ? (statusParam as Status)
      : null;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabaseAdmin
      .from("cliente")
      .select(
        `
        ${CLIENTE_FIELDS},
        veiculos:veiculo ( ${VEICULO_FIELDS} )
        `,
        { count: "exact" }
      )
      .order("id", { ascending: false })
      .range(from, to);

    if (q) {
      query = query.or(
        `nomerazaosocial.ilike.%${q}%,cpfcnpj.ilike.%${q}%,email.ilike.%${q}%,telefone.ilike.%${q}%`
      );
    }

    if (statusFilter) {
      query = query.eq("status", statusFilter);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    const items = data ?? [];
    const total = count ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    const pageCount = items.length;
    const hasPrevPage = page > 1;
    const hasNextPage = page * limit < total;

    return NextResponse.json({
      data: items,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        pageCount,
        hasPrevPage,
        hasNextPage,
      },
      filters: { search: q, status: statusFilter ?? "TODOS" },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Erro ao listar clientes" },
      { status: 500 }
    );
  }
}
