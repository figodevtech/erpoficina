export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAgendamentosAccess } from "@/app/api/_authz/perms";
import { AGENDAMENTO_STATUS } from "@/lib/agendamentos";

export async function GET() {
  try {
    await requireAgendamentosAccess();

    const [clientesRes, veiculosRes, ordensRes] = await Promise.all([
      supabaseAdmin
        .from("cliente")
        .select("id, nomerazaosocial, telefone")
        .order("nomerazaosocial")
        .limit(300),
      supabaseAdmin
        .from("veiculo")
        .select("id, clienteid, placa, modelo, marca")
        .order("placa")
        .limit(500),
      supabaseAdmin
        .from("ordemservico")
        .select("id, clienteid, veiculoid, descricao, status")
        .not("status", "in", "(CONCLUIDO,CANCELADO)")
        .order("id", { ascending: false })
        .limit(300),
    ]);

    if (clientesRes.error) throw clientesRes.error;
    if (veiculosRes.error) throw veiculosRes.error;
    if (ordensRes.error) throw ordensRes.error;

    return NextResponse.json({
      clientes: clientesRes.data ?? [],
      veiculos: veiculosRes.data ?? [],
      ordens: ordensRes.data ?? [],
      statuses: AGENDAMENTO_STATUS,
    });
  } catch (e: any) {
    const status = e?.statusCode ?? (/autenticado|permiss/i.test(e?.message) ? 403 : 500);
    return NextResponse.json({ error: e?.message ?? "Erro no lookup de agendamentos" }, { status });
  }
}
