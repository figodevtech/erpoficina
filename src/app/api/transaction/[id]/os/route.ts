// src/app/api/transacoes/[id]/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type Params = { params: Promise<{ id: string }> };

/** Converte monetário (string/number) para centavos inteiros */
function toCents(v: any): number {
  if (v == null) return 0;
  if (typeof v === "number") return Math.round(v * 100);
  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

/** Lê e valida o :id da rota */
async function parseId(ctx: Params) {
  const { id: idParam } = await ctx.params;
  const id = Number((idParam ?? "").trim());
  if (!id) throw new Error("ID inválido.");
  return id;
}

// Ajuste se seus literais do enum forem diferentes
const STATUS_CONCLUIDO = "CONCLUIDO";
const STATUS_CONCLUIDA = "CONCLUIDA"; // caso exista no seu enum
const STATUS_PAGAMENTO = "PAGAMENTO";

/* ========================= DELETE ========================= */
export async function DELETE(_: Request, ctx: Params) {
  try {
    const id = await parseId(ctx);

    // 1) Buscar a transação para obter OS e tipo
    const { data: tx, error: txErr } = await supabaseAdmin
      .from("transacao")
      .select("id, ordemservicoid, tipo")
      .eq("id", id)
      .maybeSingle();

    if (txErr) {
      return NextResponse.json(
        { error: "Erro ao buscar transação." },
        { status: 500 }
      );
    }
    if (!tx) {
      return NextResponse.json(
        { error: "Transação não encontrada." },
        { status: 404 }
      );
    }

    const osId: number | null =
      tx?.ordemservicoid != null ? Number(tx.ordemservicoid) : null;
    const isReceita =
      typeof tx?.tipo === "string" && tx.tipo.toUpperCase() === "RECEITA";

    // 2) Deletar a transação
    const { error: delErr } = await supabaseAdmin
      .from("transacao")
      .delete()
      .eq("id", id);

    if (delErr) {
      return NextResponse.json(
        { error: "Erro ao deletar transação." },
        { status: 500 }
      );
    }

    // 3) Se era RECEITA vinculada a OS, revalidar status da OS após a exclusão
    if (osId && isReceita) {
      // 3.1 Orçamento e status atuais
      const { data: os, error: osErr } = await supabaseAdmin
        .from("ordemservico")
        .select("id, orcamentototal, status")
        .eq("id", osId)
        .maybeSingle();

      if (!osErr && os && os.orcamentototal != null) {
        const orcCents = toCents(os.orcamentototal);

        if (orcCents > 0) {
          // 3.2 Soma das RECEITAS restantes
          const { data: receitas, error: recErr } = await supabaseAdmin
            .from("transacao")
            .select("valor")
            .eq("ordemservicoid", osId)
            .eq("tipo", "RECEITA");

          if (!recErr) {
            const somaCents =
              receitas?.reduce((acc, t) => acc + toCents(t.valor), 0) ?? 0;

            const statusAtual = String(os.status ?? "").toUpperCase();
            const estavaConcluida =
              statusAtual === STATUS_CONCLUIDO ||
              statusAtual === STATUS_CONCLUIDA;

            // 3.3 Se estava concluída e a soma ficou menor que o orçamento → volta para PAGAMENTO
            if (estavaConcluida && somaCents < orcCents) {
              const { error: updErr } = await supabaseAdmin
                .from("ordemservico")
                .update({
                  status: STATUS_PAGAMENTO,
                  updatedat: new Date().toISOString(),
                })
                .eq("id", osId);

              if (updErr) {
                // Não invalida o DELETE; apenas loga
                console.error(
                  "Falha ao reabrir OS para PAGAMENTO após deletar transação:",
                  updErr
                );
              }
            }
          } else {
            console.error("Erro ao somar receitas da OS após delete:", recErr);
          }
        }
      } else if (osErr) {
        console.error("Erro ao buscar OS após delete:", osErr);
      }
    }

    // Sucesso sem corpo
    return new NextResponse(null, { status: 204 });
  } catch (e: any) {
    const msg = e?.message ?? "Erro ao deletar transação.";
    const status = msg.includes("ID inválido") ? 400 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
