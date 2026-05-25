export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAgendamentosEdit } from "@/app/api/_authz/perms";
import { buildWhatsappUrl, formatAgendamentoMessage } from "@/lib/agendamentos";
import { buildAppointmentEmailHtml, sendEmail } from "@/lib/email";

type RouteContext = { params: Promise<{ id: string }> };

const SELECT = `
  id,
  clienteid,
  veiculoid,
  usuarioid,
  titulo,
  descricao,
  inicio,
  fim,
  status,
  origem,
  motivorecusa,
  mensagemnotificacao,
  canalnotificacao,
  notificadoat,
  decisaoat,
  decisorusuarioid,
  createdat,
  updatedat,
  cliente:clienteid ( id, nomerazaosocial, telefone, email ),
  veiculo:veiculoid ( id, placa, modelo, marca ),
  usuario:usuarioid ( id, nome )
`;

export async function POST(_req: Request, context: RouteContext) {
  try {
    await requireAgendamentosEdit();
    const { id } = await context.params;
    const agendamentoId = Number(id);
    const session = await auth();

    const { data: atual, error: atualError } = await supabaseAdmin
      .from("agendamento")
      .select("id, inicio, cliente:clienteid ( nomerazaosocial, telefone, email )")
      .eq("id", agendamentoId)
      .single();

    if (atualError) throw atualError;

    const { data: conflito, error: conflitoError } = await supabaseAdmin
      .from("agendamento")
      .select("id")
      .eq("inicio", atual.inicio)
      .neq("id", agendamentoId)
      .not("status", "in", "(RECUSADO,CANCELADO)")
      .maybeSingle();

    if (conflitoError) throw conflitoError;
    if (conflito) {
      return NextResponse.json({ error: "Ja existe agendamento ativo neste horario" }, { status: 409 });
    }

    const cliente = Array.isArray(atual.cliente) ? atual.cliente[0] : atual.cliente;
    const message = formatAgendamentoMessage({
      status: "APROVADO",
      clienteNome: cliente?.nomerazaosocial,
      inicio: atual.inicio,
    });

    const { data, error } = await supabaseAdmin
      .from("agendamento")
      .update({
        status: "AGENDADO",
        motivorecusa: null,
        mensagemnotificacao: message,
        canalnotificacao: cliente?.telefone ? "WHATSAPP" : cliente?.email ? "EMAIL" : null,
        notificadoat: null,
        decisaoat: new Date().toISOString(),
        decisorusuarioid: (session?.user as any)?.id ?? null,
      })
      .eq("id", agendamentoId)
      .select(SELECT)
      .single();

    if (error) throw error;

    const emailResult = await sendEmail({
      to: cliente?.email,
      subject: "Agendamento aprovado",
      text: message,
      html: buildAppointmentEmailHtml({
        title: "Agendamento aprovado",
        statusLabel: "Aprovado",
        statusTone: "approved",
        customerName: cliente?.nomerazaosocial,
        appointmentDate: atual.inicio,
        footerNote: "Aguardamos voce na Alpha Garage PB no horario agendado.",
      }),
    });

    if (emailResult.sent) {
      await supabaseAdmin.from("agendamento").update({ notificadoat: new Date().toISOString() }).eq("id", agendamentoId);
    }

    return NextResponse.json({
      data,
      notificacao: {
        message,
        email: cliente?.email ?? null,
        telefone: cliente?.telefone ?? null,
        whatsappUrl: buildWhatsappUrl(cliente?.telefone, message),
        emailResult,
      },
    });
  } catch (e: any) {
    const status = e?.statusCode ?? (/autenticado|permiss/i.test(e?.message) ? 403 : 500);
    return NextResponse.json({ error: e?.message ?? "Erro ao aprovar agendamento" }, { status });
  }
}
