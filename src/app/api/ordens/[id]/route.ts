export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireOSAccess } from "../../_authz/perms";

type Params = { id: string };

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    await requireOSAccess();

    const { id } = await params;        // 👈 agora precisa de await
    const osId = Number(id);

    const { data: os, error: osErr } = await supabaseAdmin
      .from("ordemservico")
      .select(`
        id, descricao, status, statusaprovacao,
        dataentrada, datasaidaprevista, datasaidareal,
        usuariocriadorid, setorid, clienteid, veiculoid,
        setor:setorid ( id, nome ),
        cliente:clienteid ( id, nomerazaosocial ),
        veiculo:veiculoid ( id, placa, modelo, marca )
      `)
      .eq("id", osId)
      .maybeSingle();

    if (osErr) throw osErr;
    if (!os) return NextResponse.json({ error: "OS não encontrada" }, { status: 404 });

    const { data: itensProduto } = await supabaseAdmin
      .from("osproduto")
      .select(`
        ordemservicoid, produtoid, quantidade, precounitario, subtotal,
        produto:produtoid ( id, codigo, descricao, precounitario, unidade )
      `)
      .eq("ordemservicoid", osId);

    const { data: itensServico } = await supabaseAdmin
      .from("osservico")
      .select(`
        ordemservicoid, servicoid, quantidade, precounitario, subtotal,
        servico:servicoid ( id, codigo, descricao, precohora )
      `)
      .eq("ordemservicoid", osId);

    const { data: checklist } = await supabaseAdmin
      .from("checklist")
      .select("id, item, status, observacao, createdat")
      .eq("ordemservicoid", osId)
      .order("id");

    return NextResponse.json({
      os,
      itensProduto: itensProduto ?? [],
      itensServico: itensServico ?? [],
      checklist: checklist ?? [],
    });
  } catch (e: any) {
    const status = e?.statusCode ?? (/não autenticado|unauth/i.test(e?.message) ? 401 : 500);
    return NextResponse.json({ error: e?.message ?? "Erro ao carregar OS" }, { status });
  }
}
