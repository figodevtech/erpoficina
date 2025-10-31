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
<<<<<<< HEAD
      .select(`
=======
      .select(
        `
>>>>>>> c39630bc01fead96f807a30748800ba3c4fde926
        id, clienteid, veiculoid, usuariocriadorid, setorid,
        status, statusaprovacao,
        descricao, dataentrada, datasaida, orcamentototal,
        observacoes, createdat, updatedat,
        checklist_modelo_id, prioridade, alvo_tipo, pecaid,
        setor:setorid ( id, nome ),
        cliente:clienteid ( id, tipopessoa, cpfcnpj, nomerazaosocial, email, telefone, cidade, estado ),
        veiculo:veiculoid ( id, placa, modelo, marca, ano, cor, kmatual ),
        peca:pecaid ( id, titulo, descricao, fabricante, modelo, codigo, veiculoid )
      `
      )
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
        .select(
          `
          ordemservicoid, produtoid, quantidade, precounitario, subtotal,
          produto:produtoid (
            id, titulo, descricao, precovenda, unidade, ncm, cfop,
            referencia, fabricante, fornecedor, grupo
          )
        `
        )
        .eq("ordemservicoid", osId)
        .order("produtoid", { ascending: true }),

      // Serviços
      supabaseAdmin
        .from("osservico")
        .select(
          `
          ordemservicoid, servicoid, quantidade, precounitario, subtotal, idusuariorealizador,
          servico:servicoid ( id, codigo, descricao, precohora, itemlistaservico )
        `
        )
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
        .select(
          `
          id, ordemservicoid, metodo, valor, status,
          provider_tx_id, nsu, autorizacao, bandeira, parcelas,
          comprovante, criado_em, atualizado_em
        `
        )
        .eq("ordemservicoid", osId)
        .order("id", { ascending: true }),

      // Notas fiscais da OS
      supabaseAdmin
        .from("notafiscal")
        .select(
          `
          id, ordemservicoid, tipo, numero, serie,
          dataemissao, xml, protocolo, status, createdat, updatedat
        `
        )
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
        .select(
          `
          id, descricao, valor, data, metodopagamento, categoria, tipo,
          cliente_id, banco_id, nomepagador, cpfcnpjpagador, ordemservicoid,
          created_at, updated_at
        `
        )
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
    const { data: pays, error: pErr } = await supabaseAdmin.from("pagamento").select("id").eq("ordemservicoid", osId);
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

/* ===========================
 * PUT /api/ordens/[id]
 * Atualizar dados básicos + alvo (VEICULO|PECA)
 * =========================== */
// src/app/api/ordens/[id]/route.ts (apenas o handler PUT)
export async function PUT(req: NextRequest, ctx: { params: MaybePromise<Params> }) {
  try {
    await requireOSAccess();

    const { id } = await resolveParams(ctx.params);
    const osId = Number(id);
    if (!Number.isFinite(osId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const body = (await req.json().catch(() => ({}))) as {
      setorid?: number | null;
      prioridade?: "BAIXA" | "NORMAL" | "ALTA" | null;
      descricao?: string | null;
      observacoes?: string | null;

      // aceitamos os dois nomes
      checklistTemplateId?: string | null;
      checklist_modelo_id?: string | null;

      checklist?: Array<{ item: string; status: "PENDENTE" | "OK" | "FALHA" }>;

      alvo?:
        | {
            tipo: "VEICULO";
            veiculoid?: number | null;
            veiculo?: {
              placa?: string | null;
              modelo?: string | null;
              marca?: string | null;
              ano?: number | null;
              cor?: string | null;
              kmatual?: number | null;
            } | null;
          }
        | {
            tipo: "PECA";
            peca: { id?: number | null; nome: string; descricao?: string | null; veiculoid?: number | null };
          };

      // atualizar dados do cliente já vinculado (modo avulso)
      cliente?:
        | { id: number } // ignoramos troca de cliente
        | { nome: string; documento: string; telefone?: string | null; email?: string | null };
    };

    // Carrega OS atual
    const { data: atual, error: exErr } = await supabaseAdmin
      .from("ordemservico")
      .select("id, clienteid, veiculoid, pecaid, observacoes, checklist_modelo_id")
      .eq("id", osId)
      .maybeSingle();
    if (exErr) throw exErr;
    if (!atual) return NextResponse.json({ error: "OS não encontrada" }, { status: 404 });

    // Helpers p/ Observações (remove e insere a linha 'Alvo: ...')
    const stripAlvoLine = (s?: string | null) => (s || "").replace(/^Alvo: .*$/gim, "").trim();
    const addAlvoLine = (obs: string, line: string | null) => {
      const base = (obs || "").trim();
      return line ? (base ? `${line}\n${base}` : line) : base;
    };

    // Monta objeto de update básico
    const upd: any = {};
    if ("setorid" in body) upd.setorid = body.setorid ?? null;
    if ("prioridade" in body) upd.prioridade = body.prioridade ?? null;
    if ("descricao" in body) upd.descricao = (body.descricao ?? "") || null;

    // Observações: começamos removendo a antiga linha "Alvo: ..."
    let novasObs = stripAlvoLine("observacoes" in body ? body.observacoes : atual.observacoes);

    // ========== CLIENTE (avulso): atualiza o cliente já vinculado ==========
    if (body.cliente && "id" in body.cliente === false) {
      const nome = (body.cliente as any).nome?.trim();
      const documento = (body.cliente as any).documento?.trim();
      const telefone = (body.cliente as any).telefone ?? null;
      const email = (body.cliente as any).email ?? null;

      if (!nome || !documento) {
        return NextResponse.json({ error: "Para atendimento avulso, nome e documento são obrigatórios." }, { status: 400 });
      }

      const { error: upCliErr } = await supabaseAdmin
        .from("cliente")
        .update({
          nomerazaosocial: nome,
          cpfcnpj: documento,
          telefone,
          email,
        })
        .eq("id", atual.clienteid);
      if (upCliErr) throw upCliErr;
    }

    // ========== ALVO ==========
    if (body.alvo?.tipo === "VEICULO") {
      upd.alvo_tipo = "VEICULO";
      upd.pecaid = null;

      let veiculoId: number | null = body.alvo.veiculoid ?? atual.veiculoid ?? null;

      // Se veio dados do veículo no payload, atualiza/cria
      const v = body.alvo.veiculo || null;
      const temDadosLivres =
        !!(v?.placa?.trim() || v?.modelo?.trim() || v?.marca?.trim() || v?.ano || v?.cor?.trim() || v?.kmatual);

      if (temDadosLivres) {
        const fields = {
          placa: v?.placa?.trim() || null,
          modelo: v?.modelo?.trim() || null,
          marca: v?.marca?.trim() || null,
          ano: v?.ano ?? null,
          cor: v?.cor?.trim() || null,
          kmatual: v?.kmatual ?? null,
          clienteid: atual.clienteid,
        };

        if (veiculoId) {
          const { error: upVErr } = await supabaseAdmin.from("veiculo").update(fields).eq("id", veiculoId);
          if (upVErr) throw upVErr;
        } else {
          // cria novo se não houver veiculoid e há dados suficientes
          if (!fields.modelo && !fields.placa) {
            return NextResponse.json(
              { error: "Informe ao menos Modelo ou Placa para criar o veículo." },
              { status: 400 }
            );
          }
          const { data: novoV, error: inVErr } = await supabaseAdmin
            .from("veiculo")
            .insert(fields)
            .select("id")
            .single();
          if (inVErr) throw inVErr;
          veiculoId = novoV.id;
        }
      }

      upd.veiculoid = veiculoId ?? null;

      const alvoLine =
        veiculoId || temDadosLivres
          ? `Alvo: VEÍCULO${v?.modelo ? ` | Modelo: ${v.modelo}` : ""}${v?.placa ? ` | Placa: ${v.placa}` : ""}`
          : "Alvo: VEÍCULO";
      novasObs = addAlvoLine(novasObs, alvoLine);
    }

    if (body.alvo?.tipo === "PECA") {
      const nome = (body.alvo.peca?.nome || "").trim();
      if (!nome) return NextResponse.json({ error: "Nome da peça é obrigatório" }, { status: 400 });

      const desc = (body.alvo.peca?.descricao || "").trim() || null;
      const veicId = body.alvo.peca?.veiculoid ?? null;

      let pecaId = body.alvo.peca?.id ?? atual.pecaid ?? null;

      if (pecaId) {
        const { error: upErr } = await supabaseAdmin
          .from("peca")
          .update({ titulo: nome, descricao: desc, veiculoid: veicId })
          .eq("id", pecaId);
        if (upErr) throw upErr;
      } else {
        const { data: nova, error: inErr } = await supabaseAdmin
          .from("peca")
          .insert({ clienteid: atual.clienteid, veiculoid: veicId, titulo: nome, descricao: desc })
          .select("id")
          .single();
        if (inErr) throw inErr;
        pecaId = nova.id;
      }

      upd.alvo_tipo = "PECA";
      upd.pecaid = pecaId;
      upd.veiculoid = null;

      const alvoLine = `Alvo: PEÇA | Nome: ${nome}${desc ? ` | Desc.: ${desc}` : ""}`;
      novasObs = addAlvoLine(novasObs, alvoLine);
    }

    // Observações: seta por último se veio no body ou se mexemos no alvo
    if ("observacoes" in body || body.alvo) {
      upd.observacoes = novasObs || null;
    }

    // Template do checklist
    const novoModeloId = body.checklistTemplateId ?? body.checklist_modelo_id ?? null;
    if (typeof novoModeloId !== "undefined") {
      upd.checklist_modelo_id = novoModeloId;
    }

    // Aplica update da OS
    if (Object.keys(upd).length > 0) {
      const { error: updErr } = await supabaseAdmin.from("ordemservico").update(upd).eq("id", osId);
      if (updErr) throw updErr;
    }

    // Checklist (upsert item-a-item; não apagamos para não perder imagens antigas)
    if (Array.isArray(body.checklist)) {
      // valida payload
      const sane = body.checklist
        .filter((c) => (c?.item || "").trim().length > 0)
        .map((c) => ({
          item: c.item.trim(),
          status: (c.status || "PENDENTE") as "PENDENTE" | "OK" | "FALHA",
        }));

      // pega já existentes
      const { data: existentes, error: ckErr } = await supabaseAdmin
        .from("checklist")
        .select("id, item")
        .eq("ordemservicoid", osId);
      if (ckErr) throw ckErr;

      const byItem = new Map<string, number>();
      (existentes || []).forEach((r) => byItem.set(r.item, r.id));

      // upsert simples: update se existe, insert se não existe
      for (const c of sane) {
        const exId = byItem.get(c.item);
        if (exId) {
          const { error } = await supabaseAdmin.from("checklist").update({ status: c.status }).eq("id", exId);
          if (error) throw error;
        } else {
          const { error } = await supabaseAdmin
            .from("checklist")
            .insert({ ordemservicoid: osId, item: c.item, status: c.status });
          if (error) throw error;
        }
      }

      // Se você quiser “sumir” com itens removidos do modelo:
      // em vez de deletar (risco de perder imagens), apenas define como PENDENTE:
      const vivos = new Set(sane.map((c) => c.item));
      for (const r of existentes || []) {
        if (!vivos.has(r.item)) {
          const { error } = await supabaseAdmin.from("checklist").update({ status: "PENDENTE" }).eq("id", r.id);
          if (error) throw error;
        }
      }
    }

    return NextResponse.json({ ok: true, id: osId });
  } catch (err: any) {
    return httpError(err, "Erro ao atualizar OS");
  }
}
