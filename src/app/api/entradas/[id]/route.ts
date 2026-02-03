// src/app/api/entradas/[id]/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// No Next.js 15, `params` pode ser assíncrono em rotas dinâmicas.
// Por isso tipamos como Promise e usamos `await params`.
type Params = { params: Promise<{ id: string }> };

const selectEntradaCompleta = `
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
`;

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const entradaId = id?.trim();

  // bigint geralmente chega como string (e o PostgREST costuma retornar bigint/numeric como string)
  if (!entradaId || !/^\d+$/.test(entradaId)) {
    return NextResponse.json(
      { error: "Parâmetro 'id' inválido." },
      { status: 400 },
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
    `,
    )
    .eq("id", entradaId)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "Erro ao buscar entrada.", details: error.message },
      { status: 500 },
    );
  }

  if (!data) {
    return NextResponse.json(
      { error: "Entrada não encontrada." },
      { status: 404 },
    );
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

export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params;
  const entradaId = id?.trim();

  if (!entradaId || !/^\d+$/.test(entradaId)) {
    return NextResponse.json(
      { error: "Parâmetro 'id' inválido." },
      { status: 400 },
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "JSON inválido no body." },
      { status: 400 },
    );
  }

  const entrada = body?.entrada ?? body; // aceita {entrada:{...}} ou {...}
  const itens = Array.isArray(body?.itens) ? body.itens : [];
  const itensRemover = Array.isArray(body?.itensRemover)
    ? body.itensRemover
    : [];

  // 1) Atualiza dados da ENTRADA (somente campos permitidos)
  const patchEntrada: Record<string, any> = {};
  const camposPermitidos = [
    "fornecedorid",
    "fiscal",
    "notachave",
    "tipo",
    "status",
  ] as const;

  for (const campo of camposPermitidos) {
    if (entrada && Object.prototype.hasOwnProperty.call(entrada, campo)) {
      patchEntrada[campo] = entrada[campo];
    }
  }

  const temAlgoParaAtualizar =
    Object.keys(patchEntrada).length > 0 ||
    itens.length > 0 ||
    itensRemover.length > 0;

  if (!temAlgoParaAtualizar) {
    return NextResponse.json(
      {
        error:
          "Nada para atualizar. Envie 'entrada', 'itens' e/ou 'itensRemover'.",
      },
      { status: 400 },
    );
  }

  // (opcional) valida existência da entrada
  const { data: existeEntrada, error: erroExiste } = await supabaseAdmin
    .from("entrada")
    .select("id")
    .eq("id", entradaId)
    .maybeSingle();

  if (erroExiste) {
    return NextResponse.json(
      { error: "Erro ao validar entrada.", details: erroExiste.message },
      { status: 500 },
    );
  }
  if (!existeEntrada) {
    return NextResponse.json(
      { error: "Entrada não encontrada." },
      { status: 404 },
    );
  }

  // Atualiza a entrada se tiver campos
  if (Object.keys(patchEntrada).length > 0) {
    const { error: erroPatchEntrada } = await supabaseAdmin
      .from("entrada")
      .update(patchEntrada)
      .eq("id", entradaId);

    if (erroPatchEntrada) {
      return NextResponse.json(
        {
          error: "Erro ao atualizar entrada.",
          details: erroPatchEntrada.message,
        },
        { status: 500 },
      );
    }
  }

  // 2) Remove itens (se enviado)
  if (itensRemover.length > 0) {
    const ids = itensRemover
      .map((x: any) => String(x).trim())
      .filter((x: string) => /^\d+$/.test(x));

    if (ids.length > 0) {
      const { error: erroDelete } = await supabaseAdmin
        .from("entradaitens")
        .delete()
        .eq("entrada_id", entradaId)
        .in("id", ids);

      if (erroDelete) {
        return NextResponse.json(
          { error: "Erro ao remover itens.", details: erroDelete.message },
          { status: 500 },
        );
      }
    }
  }

  // 3) Insere/Atualiza itens
  // - Novo item: sem id => INSERT
  // - Item existente: com id => UPDATE (com filtro por entrada_id pra não vazar)
  const itensNovos = itens.filter((i: any) => !i?.id);
  const itensExistentes = itens.filter((i: any) => i?.id);

  if (itensNovos.length > 0) {
    const payloadInsert = itensNovos.map((i: any) => ({
      entrada_id: Number(entradaId),
      produto_id: i.produto_id,
      unidade: i.unidade,
      quantidade: i.quantidade,
      precovenda: i.precovenda,

      // campos opcionais
      ncm: i.ncm ?? null,
      cest: i.cest ?? null,
      csosn: i.csosn ?? null,
      referencia: i.referencia ?? null,
      titulo: i.titulo ?? null,
      cClassTrib: i.cClassTrib ?? i["cClassTrib"] ?? null,
      cstIbs: i.cstIbs ?? i["cstIbs"] ?? null,
      cstCbs: i.cstCbs ?? i["cstCbs"] ?? null,
      cst: i.cst ?? null,
      aliquotaicms: i.aliquotaicms ?? null,
      cfop: i.cfop ?? null,
      cst_pis: i.cst_pis ?? null,
      aliquota_pis: i.aliquota_pis ?? null,
      cst_cofins: i.cst_cofins ?? null,
      aliquota_cofins: i.aliquota_cofins ?? null,
    }));

    const { error: erroInsert } = await supabaseAdmin
      .from("entradaitens")
      .insert(payloadInsert);

    if (erroInsert) {
      return NextResponse.json(
        { error: "Erro ao inserir itens.", details: erroInsert.message },
        { status: 500 },
      );
    }
  }

  if (itensExistentes.length > 0) {
    for (const i of itensExistentes) {
      const itemId = String(i.id).trim();
      if (!/^\d+$/.test(itemId)) continue;

      // update só com campos que vieram no item
      const patchItem: Record<string, any> = {};
      const camposItemPermitidos = [
        "produto_id",
        "unidade",
        "quantidade",
        "precovenda",
        "ncm",
        "cest",
        "csosn",
        "referencia",
        "titulo",
        "cClassTrib",
        "cstIbs",
        "cstCbs",
        "cst",
        "aliquotaicms",
        "cfop",
        "cst_pis",
        "aliquota_pis",
        "cst_cofins",
        "aliquota_cofins",
      ];

      for (const campo of camposItemPermitidos) {
        if (Object.prototype.hasOwnProperty.call(i, campo)) {
          patchItem[campo] = i[campo];
        }
      }

      // mantém updated_at atualizado (sua coluna já tem default, mas não auto-update)
      patchItem.updated_at = new Date().toISOString();

      if (Object.keys(patchItem).length === 0) continue;

      const { error: erroUpdateItem } = await supabaseAdmin
        .from("entradaitens")
        .update(patchItem)
        .eq("entrada_id", entradaId)
        .eq("id", itemId);

      if (erroUpdateItem) {
        return NextResponse.json(
          {
            error: "Erro ao atualizar item.",
            details: erroUpdateItem.message,
            itemId,
          },
          { status: 500 },
        );
      }
    }
  }

  // 4) Retorna a entrada completa atualizada
  const { data: entradaAtualizada, error: erroRetorno } = await supabaseAdmin
    .from("entrada")
    .select(selectEntradaCompleta)
    .eq("id", entradaId)
    .maybeSingle();

  if (erroRetorno) {
    return NextResponse.json(
      {
        error: "Erro ao buscar entrada atualizada.",
        details: erroRetorno.message,
      },
      { status: 500 },
    );
  }

  if (!entradaAtualizada) {
    return NextResponse.json(
      { error: "Entrada não encontrada." },
      { status: 404 },
    );
  }

  const resposta = {
    ...entradaAtualizada,
    itens: Array.isArray(entradaAtualizada.itens)
      ? [...entradaAtualizada.itens].sort((a, b) => Number(a.id) - Number(b.id))
      : [],
  };

  return NextResponse.json({ entrada: resposta }, { status: 200 });
}
