// app/api/entradas/[id]/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type Params = { params: { id: string } };

export async function GET(_req: Request, { params }: Params) {
  const id = params.id?.trim();

  // bigint geralmente chega como string (e o PostgREST costuma retornar bigint/numeric como string)
  if (!id || !/^\d+$/.test(id)) {
    return NextResponse.json(
      { error: "Parâmetro 'id' inválido." },
      { status: 400 }
    );
  }


  const { data, error } = await supabaseAdmin
    .from("entrada")
    .select(
      `
      id,
      created_at,
      fornecedorid,
      fiscal,
      notachave,
      tipo,
      status,

      fornecedor:fornecedorid (
        id,
        cpfcnpj,
        nomerazaosocial,
        nomefantasia
      ),

      itens:entradaitens (
        id,
        produto_id,
        unidade,
        quantidade,
        precovenda,
        ncm,
        cest,
        csosn,
        referencia,
        titulo,
        "cClassTrib",
        "cstIbs",
        "cstCbs",
        cst,
        aliquotaicms,
        cfop,
        cst_pis,
        aliquota_pis,
        cst_cofins,
        aliquota_cofins,
        created_at,
        updated_at,

        produto:produto_id (
          id,
          titulo,
          referencia,
          codigobarras,
          ncm,
          unidade,
          precovenda
        )
      )
    `
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "Erro ao buscar entrada.", details: error.message },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json({ error: "Entrada não encontrada." }, { status: 404 });
  }

  // (Opcional) ordenar itens no backend, sem depender de .order(...) (que varia por versão)
  const entrada = {
    ...data,
    itens: Array.isArray(data.itens)
      ? [...data.itens].sort((a, b) => Number(a.id) - Number(b.id))
      : [],
  };

  return NextResponse.json({ entrada }, { status: 200 });
}
