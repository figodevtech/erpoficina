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
  return (["OK", "ALERTA", "FALHA"] as const).includes(up as CkStatus) ? (up as CkStatus) : "OK";
};

/* =========================================
 * GET: OS + setor + peça + checklist (+imagens) + itens + aprovações
 * ========================================= */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
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

    const osRow = (os_res.data as OrdemRow | null);
    if (!osRow) return NextResponse.json({ error: "OS não encontrada" }, { status: 404 });

    // Setor
    const setor_res = await supabase
      .from("setor")
      .select("id, nome, descricao")
      .eq("id", osRow.setorid)
      .maybeSingle();
    if (setor_res.error) throw setor_res.error;
    const setor = setor_res.data as { id: number; nome: string; descricao: string | null } | null;

    // Cliente
    const cli_res = await supabase
      .from("cliente")
      .select("id, nomerazaosocial")
      .eq("id", osRow.clienteid)
      .maybeSingle();
    if (cli_res.error) throw cli_res.error;
    const cliente = cli_res.data as { id: number; nomerazaosocial: string } | null;

    // Veículo
    let veiculo: { id: number; placa: string | null; modelo: string | null; marca: string | null } | null = null;
    if (osRow.veiculoid) {
      const v_res = await supabase
        .from("veiculo")
        .select("id, placa, modelo, marca")
        .eq("id", osRow.veiculoid)
        .maybeSingle();
      if (v_res.error) throw v_res.error;
      if (v_res.data) {
        veiculo = {
          id: v_res.data.id,
          placa: v_res.data.placa ?? null,
          modelo: v_res.data.modelo ?? null,
          marca: v_res.data.marca ?? null,
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
        peca = { id: pc_res.data.id, titulo: pc_res.data.titulo, descricao: pc_res.data.descricao ?? null };
      }
    }

    // Checklist + imagens (com id/createdat)
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
    const imgsMap = new Map<number, Array<{ id: number; url: string; descricao: string | null; createdat: string | null }>>();
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

    // Itens do orçamento — produtos
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

    // Itens do orçamento — serviços
    const serv_res = await supabase
      .from("osservico")
      .select("ordemservicoid, servicoid, quantidade, precounitario, subtotal, servico:servicoid (id, codigo, descricao, precohora)")
      .eq("ordemservicoid", osId);
    if (serv_res.error) throw serv_res.error;

    const itensServico = (serv_res.data ?? []).map((r: any) => ({
      ordemservicoid: osId,
      servicoid: Number(r.servicoid),
      quantidade: toNum(r.quantidade),
      precounitario: toNum(r.precounitario),
      subtotal: toNum(r.subtotal),
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
      (ap_res.data as Array<{ id: number; token: string; expira_em: string | null; usado_em: string | null; created_at: string | null }>) ??
      [];

    // OS agregada no formato que o Dialog espera
    const os = {
      id: osRow.id,
      descricao: osRow.descricao ?? null,
      observacoes: osRow.observacoes ?? null,
      status: osRow.status ?? null,
      statusaprovacao: osRow.statusaprovacao ?? null,
      prioridade: (osRow.prioridade ?? "NORMAL") as Prioridade,
      dataentrada: osRow.dataentrada ?? null,
      datasaidaprevista: null as string | null, // não há no schema — mantemos nulo
      datasaidareal: osRow.datasaida ?? null, // mapeamos datasaida -> datasaidareal
      alvo_tipo: (osRow.alvo_tipo ?? "VEICULO") as AlvoTipo,
      setor: setor ? { id: setor.id, nome: setor.nome } : null,
      cliente: cliente ? { id: cliente.id, nomerazaosocial: cliente.nomerazaosocial } : null,
      veiculo,
      peca,
    };

    // Compat: também manter "orcamento" antigo
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
      })),
    };

    return NextResponse.json(
      { os, itensProduto, itensServico, checklist, aprovacoes, orcamento },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (e: any) {
    console.error("GET /api/ordens/[id]", e);
    return NextResponse.json({ error: e?.message ?? "Erro ao carregar OS" }, { status: 500 });
  }
}

/* =====================================================
 * PUT: atualiza campos básicos + substitui checklist
 * (aceita 'descricao' OU 'descriacao'; 'pecaid' OU 'pecaId')
 * ===================================================== */
export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
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
    const descricao = pickStr("descricao", "descriacao");
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

    // Substituição do checklist (itens + imagens)
    if (Array.isArray(body.checklist)) {
      const antigos_res = await supabase.from("checklist").select("id").eq("ordemservicoid", osId);
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
    return NextResponse.json({ error: e?.message ?? "Erro ao salvar OS" }, { status: 500 });
  }
}

/* =========================================
 * DELETE: apaga anexos, itens, tokens, OS
 * (triggers devolvem estoque quando preciso)
 * ========================================= */
export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const osId = Number(id);
    if (!osId) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

    // existe?
    const exists_res = await supabase.from("ordemservico").select("id").eq("id", osId).maybeSingle();
    if (exists_res.error) throw exists_res.error;
    if (!exists_res.data) return NextResponse.json({ error: "OS não encontrada" }, { status: 404 });

    // checklist: imagens -> itens
    const checks_res = await supabase.from("checklist").select("id").eq("ordemservicoid", osId);
    if (checks_res.error) throw checks_res.error;

    const ckIds = (checks_res.data ?? []).map((c: any) => c.id as number);
    if (ckIds.length) {
      const delImgs_res = await supabase.from("imagemvistoria").delete().in("checklistid", ckIds);
      if (delImgs_res.error) throw delImgs_res.error;

      const delChecks_res = await supabase.from("checklist").delete().eq("ordemservicoid", osId);
      if (delChecks_res.error) throw delChecks_res.error;
    }

    // controle de baixa (se existir)
    const baixa_res = await supabase.from("osproduto_baixa").delete().eq("ordemservicoid", osId);
    if (baixa_res.error && baixa_res.error.code !== "PGRST116") throw baixa_res.error;

    // orçamento (triggers devolvem estoque ao deletar osproduto)
    const delP_res = await supabase.from("osproduto").delete().eq("ordemservicoid", osId);
    if (delP_res.error) throw delP_res.error;

    const delS_res = await supabase.from("osservico").delete().eq("ordemservicoid", osId);
    if (delS_res.error) throw delS_res.error;

    // tokens aprovação
    const tok_res = await supabase.from("osaprovacao").delete().eq("ordemservicoid", osId);
    if (tok_res.error) throw tok_res.error;

    // pagamentos/eventos (tolerante)
    const pays_res = await supabase.from("pagamento").select("id").eq("ordemservicoid", osId);
    if (pays_res.error) throw pays_res.error;

    const payIds = (pays_res.data ?? []).map((p: any) => p.id as number);
    if (payIds.length) {
      const evt_res = await supabase.from("pagamento_evento").delete().in("pagamentoid", payIds);
      if (evt_res.error && evt_res.error.code !== "PGRST116") throw evt_res.error;

      const delPay_res = await supabase.from("pagamento").delete().eq("ordemservicoid", osId);
      if (delPay_res.error && delPay_res.error.code !== "PGRST116") throw delPay_res.error;
    }

    // OS
    const delOS_res = await supabase.from("ordemservico").delete().eq("id", osId);
    if (delOS_res.error) throw delOS_res.error;

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("DELETE /api/ordens/[id]", e);
    return NextResponse.json({ error: e?.message ?? "Erro ao excluir OS" }, { status: 500 });
  }
}
