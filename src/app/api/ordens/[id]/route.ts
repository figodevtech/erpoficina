// /src/app/api/ordens/[id]/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

type Prioridade = "BAIXA" | "NORMAL" | "ALTA";
type AlvoTipo = "VEICULO" | "PECA";
type CkStatus = "OK" | "ALERTA" | "FALHA";

const toNum = (v: unknown) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const sanitizeCkStatus = (s?: string): CkStatus => {
  const up = String(s || "").toUpperCase();
  return (["OK", "ALERTA", "FALHA"] as const).includes(up as CkStatus)
    ? (up as CkStatus)
    : "OK";
};

type RealizadorLite = { id: string; nome: string | null };

/* =========================================
 * GET: OS + setor + peça + checklist (+imagens) + itens + aprovações
 * ========================================= */
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const osId = Number(id);
    if (!osId) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

    // OS base
    const os_res = await supabase
      .from("ordemservico")
      .select(
        [
          "id",
          "clienteid",
          "veiculoid",
          "usuariocriadorid",
          "setorid",
          "status",
          "statusaprovacao",
          "descricao",
          "dataentrada",
          "datasaida",
          "orcamentototal",
          "observacoes",
          "createdat",
          "updatedat",
          "checklist_modelo_id",
          "prioridade",
          "alvo_tipo",
          "pecaid",
        ].join(",")
      )
      .eq("id", osId)
      .maybeSingle();

    if (os_res.error) throw os_res.error;

    type OrdemRow = {
      id: number;
      clienteid: number;
      veiculoid: number | null;
      usuariocriadorid: string;
      setorid: number | null;
      status: string | null;
      statusaprovacao: string | null;
      descricao: string | null;
      dataentrada: string | null;
      datasaida: string | null;
      orcamentototal: number | null;
      observacoes: string | null;
      createdat: string | null;
      updatedat: string | null;
      checklist_modelo_id: number | null;
      prioridade: Prioridade | null;
      alvo_tipo: AlvoTipo | null;
      pecaid: number | null;
    };

    const osRow = os_res.data as OrdemRow | null;
    if (!osRow) return NextResponse.json({ error: "OS não encontrada" }, { status: 404 });

    // Setor
    const setor_res = await supabase
      .from("setor")
      .select("id, nome, descricao")
      .eq("id", osRow.setorid)
      .maybeSingle();
    if (setor_res.error) throw setor_res.error;

    const setor =
      (setor_res.data as { id: number; nome: string; descricao: string | null } | null) ?? null;

    // Cliente
    const cli_res = await supabase
      .from("cliente")
      .select("id, nomerazaosocial, cpfcnpj, email, telefone")
      .eq("id", osRow.clienteid)
      .maybeSingle();
    if (cli_res.error) throw cli_res.error;

    const clienteRow =
      (cli_res.data as {
        id: number;
        nomerazaosocial: string;
        cpfcnpj: string;
        email: string | null;
        telefone: string | null;
      } | null) ?? null;

    const cliente =
      clienteRow &&
      ({
        id: clienteRow.id,
        nomerazaosocial: clienteRow.nomerazaosocial,
        cpfcnpj: clienteRow.cpfcnpj,
        email: clienteRow.email,
        telefone: clienteRow.telefone,
      } as const);

    // Veículo
    let veiculo:
      | {
          id: number;
          placa: string | null;
          modelo: string | null;
          marca: string | null;
          ano: number | null;
          cor: string | null;
          kmatual: number | null;
        }
      | null = null;

    if (osRow.veiculoid) {
      const v_res = await supabase
        .from("veiculo")
        .select("id, placa, modelo, marca, ano, cor, kmatual")
        .eq("id", osRow.veiculoid)
        .maybeSingle();
      if (v_res.error) throw v_res.error;
      if (v_res.data) {
        veiculo = {
          id: v_res.data.id,
          placa: v_res.data.placa ?? null,
          modelo: v_res.data.modelo ?? null,
          marca: v_res.data.marca ?? null,
          ano: v_res.data.ano ?? null,
          cor: v_res.data.cor ?? null,
          kmatual: v_res.data.kmatual ?? null,
        };
      }
    }

    // Peça (opcional)
    let peca: { id: number; titulo: string; descricao: string | null } | null = null;
    if (osRow.pecaid) {
      const pc_res = await supabase
        .from("peca")
        .select("id, titulo, descricao")
        .eq("id", osRow.pecaid)
        .maybeSingle();
      if (pc_res.error) throw pc_res.error;
      if (pc_res.data) {
        peca = {
          id: pc_res.data.id,
          titulo: pc_res.data.titulo,
          descricao: pc_res.data.descricao ?? null,
        };
      }
    }

    // Checklist + imagens
    const ck_res = await supabase
      .from("checklist")
      .select("id, item, status, observacao, createdat")
      .eq("ordemservicoid", osId);
    if (ck_res.error) throw ck_res.error;

    const ckRows = (ck_res.data ?? []) as Array<{
      id: number;
      item: string;
      status: CkStatus;
      observacao: string | null;
      createdat: string | null;
    }>;

    const ckIds = ckRows.map((r) => r.id);
    const imgsMap = new Map<
      number,
      Array<{ id: number; url: string; descricao: string | null; createdat: string | null }>
    >();

    if (ckIds.length) {
      const img_res = await supabase
        .from("imagemvistoria")
        .select("id, checklistid, url, descricao, createdat")
        .in("checklistid", ckIds);
      if (img_res.error) throw img_res.error;

      for (const it of img_res.data ?? []) {
        const arr = imgsMap.get(it.checklistid) ?? [];
        arr.push({
          id: Number(it.id),
          url: String(it.url),
          descricao: it.descricao ?? null,
          createdat: it.createdat ?? null,
        });
        imgsMap.set(it.checklistid, arr);
      }
    }

    const checklist = ckRows.map((ck) => ({
      id: ck.id,
      item: ck.item,
      status: ck.status,
      observacao: ck.observacao ?? null,
      createdat: ck.createdat ?? null,
      imagens: imgsMap.get(ck.id) ?? [],
    }));

    // Itens — produtos
    const prod_res = await supabase
      .from("osproduto")
      .select(
        "ordemservicoid, produtoid, quantidade, precounitario, subtotal, produto:produtoid (id, titulo, descricao, referencia, codigobarras, precovenda, unidade)"
      )
      .eq("ordemservicoid", osId);
    if (prod_res.error) throw prod_res.error;

    const itensProduto = (prod_res.data ?? []).map((r: any) => ({
      ordemservicoid: osId,
      produtoid: Number(r.produtoid),
      quantidade: toNum(r.quantidade),
      precounitario: toNum(r.precounitario),
      subtotal: toNum(r.subtotal),
      produto: r.produto
        ? {
            id: Number(r.produto.id),
            codigo: String(r.produto.referencia ?? r.produto.codigobarras ?? "") || null,
            descricao: String(r.produto.descricao ?? r.produto.titulo ?? ""),
            precounitario: r.produto.precovenda ?? null,
            unidade: r.produto.unidade ?? null,
          }
        : null,
    }));

    // Itens — serviços (SEM idusuariorealizador; realizadores via tabela N:N)
    const serv_res = await supabase
      .from("osservico")
      .select(
        `
          ordemservicoid,
          servicoid,
          quantidade,
          precounitario,
          subtotal,
          servico:servicoid (id, codigo, descricao, precohora)
        `
      )
      .eq("ordemservicoid", osId);

    if (serv_res.error) throw serv_res.error;

    // Busca realizadores (tabela de junção)
    // Ajuste o nome "osservico_realizador" e as colunas (usuarioid, etc) conforme seu schema.
    const rel_res = await supabase
      .from("osservico_realizador")
      .select(
        `
          ordemservicoid,
          servicoid,
          usuarioid,
          usuario:usuarioid (id, nome)
        `
      )
      .eq("ordemservicoid", osId);

    if (rel_res.error) throw rel_res.error;

    // Indexa realizadores por servicoid (e osId já é fixo no filtro)
    const realizadoresByServico = new Map<number, RealizadorLite[]>();
    for (const rr of rel_res.data ?? []) {
      const sid = Number((rr as any).servicoid);
      const usuario = (rr as any).usuario;
      const usuarioid = (rr as any).usuarioid;

      const item: RealizadorLite = {
        id: String(usuario?.id ?? usuarioid),
        nome: usuario?.nome ?? null,
      };

      const arr = realizadoresByServico.get(sid) ?? [];
      arr.push(item);
      realizadoresByServico.set(sid, arr);
    }

    const itensServico = (serv_res.data ?? []).map((r: any) => ({
      ordemservicoid: osId,
      servicoid: Number(r.servicoid),
      quantidade: toNum(r.quantidade),
      precounitario: toNum(r.precounitario),
      subtotal: toNum(r.subtotal),
      realizadores: realizadoresByServico.get(Number(r.servicoid)) ?? [],
      servico: r.servico
        ? {
            id: Number(r.servico.id),
            codigo: r.servico.codigo ?? null,
            descricao: r.servico.descricao ?? null,
            precohora: r.servico.precohora ?? null,
          }
        : null,
    }));

    // Aprovações (tokens)
    const ap_res = await supabase
      .from("osaprovacao")
      .select("id, token, expira_em, usado_em, created_at")
      .eq("ordemservicoid", osId);
    if (ap_res.error) throw ap_res.error;

    const aprovacoes =
      (ap_res.data as Array<{
        id: number;
        token: string;
        expira_em: string | null;
        usado_em: string | null;
        created_at: string | null;
      }>) ?? [];

    // OS agregada
    const os = {
      id: osRow.id,
      orcamentototal: osRow.orcamentototal,
      descricao: osRow.descricao ?? null,
      observacoes: osRow.observacoes ?? null,
      status: osRow.status ?? null,
      statusaprovacao: osRow.statusaprovacao ?? null,
      prioridade: (osRow.prioridade ?? "NORMAL") as Prioridade,
      dataentrada: osRow.dataentrada ?? null,
      datasaida: osRow.datasaida ?? null,
      alvo_tipo: (osRow.alvo_tipo ?? "VEICULO") as AlvoTipo,
      setor: setor ? { id: setor.id, nome: setor.nome } : null,
      cliente: cliente
        ? {
            id: cliente.id,
            nomerazaosocial: cliente.nomerazaosocial,
            cpfcnpj: cliente.cpfcnpj,
            email: cliente.email,
            telefone: cliente.telefone,
          }
        : null,
      veiculo,
      peca,
    };

    const orcamento = {
      produtos: itensProduto.map((p) => ({
        produtoid: p.produtoid,
        descricao: p.produto?.descricao ?? "Produto",
        quantidade: p.quantidade,
        precounitario: p.precounitario,
        subtotal: p.subtotal,
      })),
      servicos: itensServico.map((s) => ({
        servicoid: s.servicoid,
        descricao: s.servico?.descricao ?? "Serviço",
        quantidade: s.quantidade,
        precounitario: s.precounitario,
        subtotal: s.subtotal,
        realizadores: s.realizadores, // opcional: pode remover se não quiser no "orcamento"
      })),
    };

    return NextResponse.json(
      {
        os,
        cliente: os.cliente,
        itensProduto,
        itensServico,
        checklist,
        aprovacoes,
        orcamento,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (e: any) {
    console.error("GET /api/ordens/[id]", e);
    return NextResponse.json(
      { error: e?.message ?? "Erro ao carregar OS" },
      { status: 500 }
    );
  }
}

/* =====================================================
 * PUT: atualiza campos básicos + substitui checklist
 * ===================================================== */
export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const osId = Number(id);
    if (!osId) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

    const body: any = await req.json().catch(() => ({}));

    const pickNum = (...keys: string[]) => {
      for (const k of keys) {
        if (body[k] !== undefined && body[k] !== null) {
          const n = Number(body[k]);
          return Number.isFinite(n) ? n : null;
        }
      }
      return undefined;
    };
    const pickStr = (...keys: string[]) => {
      for (const k of keys) {
        if (body[k] !== undefined) {
          const v = body[k];
          if (v === null) return null;
          const s = String(v);
          return s.length ? s : null;
        }
      }
      return undefined;
    };

    const setorid = pickNum("setorid", "setorId");
    const prioridade = pickStr("prioridade") as Prioridade | undefined;
    const descricao = pickStr("descricao");
    const observacoes = pickStr("observacoes");
    const alvo_tipoStr = pickStr("alvo_tipo", "alvoTipo");
    const alvo_tipo = ((): AlvoTipo | undefined => {
      const up = (alvo_tipoStr || "").toUpperCase();
      return up === "VEICULO" || up === "PECA" ? (up as AlvoTipo) : undefined;
    })();
    const pecaid = pickNum("pecaid", "pecaId");

    const patch: Record<string, unknown> = {};
    if (setorid !== undefined) patch.setorid = setorid;
    if (prioridade !== undefined) patch.prioridade = prioridade || "NORMAL";
    if (descricao !== undefined) patch.descricao = descricao;
    if (observacoes !== undefined) patch.observacoes = observacoes;
    if (alvo_tipo !== undefined) patch.alvo_tipo = alvo_tipo;
    if (pecaid !== undefined) patch.pecaid = pecaid;

    if (Object.keys(patch).length) {
      const upd_res = await supabase.from("ordemservico").update(patch).eq("id", osId);
      if (upd_res.error) throw upd_res.error;
    }

    // Substituição do checklist (fluxo legado)
    if (Array.isArray(body.checklist)) {
      const antigos_res = await supabase
        .from("checklist")
        .select("id")
        .eq("ordemservicoid", osId);
      if (antigos_res.error) throw antigos_res.error;

      const ids = (antigos_res.data ?? []).map((r: any) => r.id as number);
      if (ids.length) {
        const delImgs_res = await supabase.from("imagemvistoria").delete().in("checklistid", ids);
        if (delImgs_res.error) throw delImgs_res.error;
      }

      const delCk_res = await supabase.from("checklist").delete().eq("ordemservicoid", osId);
      if (delCk_res.error) throw delCk_res.error;

      for (const it of body.checklist) {
        const ins_res = await supabase
          .from("checklist")
          .insert({
            ordemservicoid: osId,
            item: String(it?.item || "").slice(0, 255),
            status: sanitizeCkStatus(it?.status),
            observacao: it?.observacao ?? null,
          })
          .select("id")
          .single();
        if (ins_res.error) throw ins_res.error;

        const checklistid = ins_res.data.id as number;
        const imagens = Array.isArray(it?.imagens) ? it.imagens : [];
        const imgs = imagens
          .map((img: any) => ({
            checklistid,
            url: String(img?.url || "").trim(),
            descricao: img?.descricao ?? null,
          }))
          .filter((x: any) => x.url.length > 0);

        if (imgs.length) {
          const insImgs_res = await supabase.from("imagemvistoria").insert(imgs);
          if (insImgs_res.error) throw insImgs_res.error;
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("PUT /api/ordens/[id]", e);
    return NextResponse.json(
      { error: e?.message ?? "Erro ao salvar OS" },
      { status: 500 }
    );
  }
}
