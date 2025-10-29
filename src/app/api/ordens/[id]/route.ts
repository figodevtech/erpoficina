// src/app/api/ordens/[id]/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireOSAccess } from "../../_authz/perms";

type Params = { id: string };
type MaybePromise<T> = T | Promise<T>;
async function resolveParams(p: MaybePromise<Params>) {
  return await Promise.resolve(p);
}

function httpError(err: any, fallbackMsg: string, code = 500) {
  const msg = err?.message || fallbackMsg;
  return NextResponse.json({ error: msg }, { status: err?.statusCode || code });
}

/* ===========================
 * GET /api/ordens/[id]
 * =========================== */
export async function GET(_req: NextRequest, ctx: { params: MaybePromise<Params> }) {
  try {
    await requireOSAccess();

    const { id } = await resolveParams(ctx.params);
    const osId = Number(id);
    if (!Number.isFinite(osId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    // OS + joins principais
    const { data: os, error: osErr } = await supabaseAdmin
      .from("ordemservico")
      .select(`
        id, clienteid, veiculoid, usuariocriadorid, setorid,
        status, statusaprovacao,
        descricao, dataentrada, datasaida, orcamentototal,
        observacoes, createdat, updatedat,
        checklist_modelo_id, prioridade, alvo_tipo, pecaid,
        setor:setorid ( id, nome ),
        cliente:clienteid ( id, tipopessoa, cpfcnpj, nomerazaosocial, email, telefone, cidade, estado ),
        veiculo:veiculoid ( id, placa, modelo, marca, ano, cor, kmatual ),
        peca:pecaid ( id, titulo, descricao, fabricante, modelo, codigo, veiculoid )
      `)
      .eq("id", osId)
      .maybeSingle();

    if (osErr) throw osErr;
    if (!os) return NextResponse.json({ error: "OS não encontrada" }, { status: 404 });

    // Carregamentos em paralelo
    const [
      itensProdutoRes,
      itensServicoRes,
      checklistRes,
      pagamentosRes,
      notasFiscaisRes,
      aprovacoesRes,
      transacoesRes,
    ] = await Promise.all([
      // Produtos
      supabaseAdmin
        .from("osproduto")
        .select(`
          ordemservicoid, produtoid, quantidade, precounitario, subtotal,
          produto:produtoid (
            id, titulo, descricao, precovenda, unidade, ncm, cfop,
            referencia, fabricante, fornecedor, grupo
          )
        `)
        .eq("ordemservicoid", osId)
        .order("produtoid", { ascending: true }),

      // Serviços
      supabaseAdmin
        .from("osservico")
        .select(`
          ordemservicoid, servicoid, quantidade, precounitario, subtotal, idusuariorealizador,
          servico:servicoid ( id, codigo, descricao, precohora, itemlistaservico )
        `)
        .eq("ordemservicoid", osId)
        .order("servicoid", { ascending: true }),

      // Checklist (imagens serão anexadas logo abaixo)
      supabaseAdmin
        .from("checklist")
        .select("id, ordemservicoid, item, status, observacao, createdat")
        .eq("ordemservicoid", osId)
        .order("id", { ascending: true }),

      // Pagamentos (eventos serão anexados logo abaixo)
      supabaseAdmin
        .from("pagamento")
        .select(`
          id, ordemservicoid, metodo, valor, status,
          provider_tx_id, nsu, autorizacao, bandeira, parcelas,
          comprovante, criado_em, atualizado_em
        `)
        .eq("ordemservicoid", osId)
        .order("id", { ascending: true }),

      // Notas fiscais da OS
      supabaseAdmin
        .from("notafiscal")
        .select(`
          id, ordemservicoid, tipo, numero, serie,
          dataemissao, xml, protocolo, status, createdat, updatedat
        `)
        .eq("ordemservicoid", osId)
        .order("id", { ascending: true }),

      // Tokens de aprovação
      supabaseAdmin
        .from("osaprovacao")
        .select(`id, ordemservicoid, token, expira_em, usado_em, created_at`)
        .eq("ordemservicoid", osId)
        .order("id", { ascending: true }),

      // Transações vinculadas
      supabaseAdmin
        .from("transacao")
        .select(`
          id, descricao, valor, data, metodopagamento, categoria, tipo,
          cliente_id, banco_id, nomepagador, cpfcnpjpagador, ordemservicoid,
          created_at, updated_at
        `)
        .eq("ordemservicoid", osId)
        .order("id", { ascending: true }),
    ]);

    if (itensProdutoRes.error) throw itensProdutoRes.error;
    if (itensServicoRes.error) throw itensServicoRes.error;
    if (checklistRes.error) throw checklistRes.error;
    if (pagamentosRes.error) throw pagamentosRes.error;
    if (notasFiscaisRes.error) throw notasFiscaisRes.error;
    if (aprovacoesRes.error) throw aprovacoesRes.error;
    if (transacoesRes.error) throw transacoesRes.error;

    const itensProduto = itensProdutoRes.data ?? [];
    const itensServico = itensServicoRes.data ?? [];
    const checklist = checklistRes.data ?? [];
    const pagamentos = pagamentosRes.data ?? [];
    const notasFiscais = notasFiscaisRes.data ?? [];
    const aprovacoes = aprovacoesRes.data ?? [];
    const transacoes = transacoesRes.data ?? [];

    // Imagens do checklist por "checklistid"
    let checklistComImagens = checklist as Array<any>;
    if (checklist.length) {
      const chkIds = checklist.map((c) => c.id);
      const { data: imgs, error: imgsErr } = await supabaseAdmin
        .from("imagemvistoria")
        .select("id, checklistid, url, descricao, createdat")
        .in("checklistid", chkIds)
        .order("id", { ascending: true });

      if (imgsErr) throw imgsErr;

      const byChk: Record<number, any[]> = {};
      (imgs ?? []).forEach((img) => {
        byChk[img.checklistid] = byChk[img.checklistid] || [];
        byChk[img.checklistid].push(img);
      });

      checklistComImagens = checklist.map((c) => ({
        ...c,
        imagens: byChk[c.id] ?? [],
      }));
    }

    // Eventos por pagamento
    let pagamentosComEventos = pagamentos as Array<any>;
    if (pagamentos.length) {
      const payIds = pagamentos.map((p) => p.id);
      const { data: eventos, error: evErr } = await supabaseAdmin
        .from("pagamento_evento")
        .select("id, pagamentoid, tipo, payload, criado_em")
        .in("pagamentoid", payIds)
        .order("id", { ascending: true });

      if (evErr) throw evErr;

      const byPay: Record<number, any[]> = {};
      (eventos ?? []).forEach((ev) => {
        byPay[ev.pagamentoid] = byPay[ev.pagamentoid] || [];
        byPay[ev.pagamentoid].push(ev);
      });

      pagamentosComEventos = pagamentos.map((p) => ({
        ...p,
        eventos: byPay[p.id] ?? [],
      }));
    }

    return NextResponse.json({
      os,
      itensProduto,
      itensServico,
      checklist: checklistComImagens,
      pagamentos: pagamentosComEventos,
      notasFiscais,
      aprovacoes,
      transacoes,
    });
  } catch (err: any) {
    return httpError(err, "Erro ao carregar OS");
  }
}

/* ===========================
 * DELETE /api/ordens/[id]
 * (limpa dependências antes)
 * =========================== */
export async function DELETE(_req: NextRequest, ctx: { params: MaybePromise<Params> }) {
  try {
    await requireOSAccess();

    const { id } = await resolveParams(ctx.params);
    const osId = Number(id);
    if (!Number.isFinite(osId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    // Confirma existência
    const { data: exists, error: exErr } = await supabaseAdmin
      .from("ordemservico")
      .select("id")
      .eq("id", osId)
      .maybeSingle();
    if (exErr) throw exErr;
    if (!exists) return NextResponse.json({ error: "OS não encontrada" }, { status: 404 });

    // Pagamentos + eventos
    const { data: pays, error: pErr } = await supabaseAdmin
      .from("pagamento")
      .select("id")
      .eq("ordemservicoid", osId);
    if (pErr) throw pErr;
    if (pays?.length) {
      const ids = pays.map((p) => p.id);
      const { error: peDel } = await supabaseAdmin.from("pagamento_evento").delete().in("pagamentoid", ids);
      if (peDel) throw peDel;
      const { error: pDel } = await supabaseAdmin.from("pagamento").delete().eq("ordemservicoid", osId);
      if (pDel) throw pDel;
    }

    // Notas
    const { error: nfDel } = await supabaseAdmin.from("notafiscal").delete().eq("ordemservicoid", osId);
    if (nfDel) throw nfDel;

    // Itens
    const { error: ospDel } = await supabaseAdmin.from("osproduto").delete().eq("ordemservicoid", osId);
    if (ospDel) throw ospDel;
    const { error: ossDel } = await supabaseAdmin.from("osservico").delete().eq("ordemservicoid", osId);
    if (ossDel) throw ossDel;

    // Checklist + imagens
    const { data: chks, error: chkIdsErr } = await supabaseAdmin
      .from("checklist")
      .select("id")
      .eq("ordemservicoid", osId);
    if (chkIdsErr) throw chkIdsErr;
    if (chks?.length) {
      const ids = chks.map((c) => c.id);
      const { error: imgDel } = await supabaseAdmin.from("imagemvistoria").delete().in("checklistid", ids);
      if (imgDel) throw imgDel;
      const { error: chkDel } = await supabaseAdmin.from("checklist").delete().eq("ordemservicoid", osId);
      if (chkDel) throw chkDel;
    }

    // Aprovação e transações
    const { error: apDel } = await supabaseAdmin.from("osaprovacao").delete().eq("ordemservicoid", osId);
    if (apDel) throw apDel;
    const { error: trDel } = await supabaseAdmin.from("transacao").delete().eq("ordemservicoid", osId);
    if (trDel) throw trDel;

    // Por fim, a OS
    const { error: osDel } = await supabaseAdmin.from("ordemservico").delete().eq("id", osId);
    if (osDel) throw osDel;

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return httpError(err, "Erro ao excluir OS");
  }
}
