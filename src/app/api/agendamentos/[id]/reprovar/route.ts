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
  solicitante_nome,
  solicitante_cpfcnpj,
  solicitante_telefone,
  solicitante_email,
  createdat,
  updatedat,
  cliente:clienteid ( id, nomerazaosocial, telefone, email ),
  veiculo:veiculoid ( id, placa, modelo, marca ),
  usuario:usuarioid ( id, nome )
`;

export async function POST(req: Request, context: RouteContext) {
  try {
    await requireAgendamentosEdit();
    const { id } = await context.params;
    const agendamentoId = Number(id);
    const session = await auth();
    const body = await req.json().catch(() => ({}));
    const motivo = String(body?.motivo ?? "").trim() || null;

    const { data: atual, error: atualError } = await supabaseAdmin
      .from("agendamento")
      .select("id, inicio, solicitante_nome, solicitante_telefone, solicitante_email, cliente:clienteid ( nomerazaosocial, telefone, email )")
      .eq("id", agendamentoId)
      .single();

    if (atualError) throw atualError;

    const cliente = Array.isArray(atual.cliente) ? atual.cliente[0] : atual.cliente;
    const clienteNome = cliente?.nomerazaosocial ?? atual.solicitante_nome ?? undefined;
    const clienteTelefone = cliente?.telefone ?? atual.solicitante_telefone ?? null;
    const clienteEmail = cliente?.email ?? atual.solicitante_email ?? null;
    const message = formatAgendamentoMessage({
      status: "RECUSADO",
      clienteNome,
      inicio: atual.inicio,
      motivo,
    });

    const { data, error } = await supabaseAdmin
      .from("agendamento")
      .update({
        status: "RECUSADO",
        motivorecusa: motivo,
        mensagemnotificacao: message,
        canalnotificacao: clienteTelefone ? "WHATSAPP" : clienteEmail ? "EMAIL" : null,
        notificadoat: null,
        decisaoat: new Date().toISOString(),
        decisorusuarioid: (session?.user as any)?.id ?? null,
      })
      .eq("id", agendamentoId)
      .select(SELECT)
      .single();

    if (error) throw error;

    const emailResult = await sendEmail({
      to: clienteEmail,
      subject: "Agendamento recusado",
      text: message,
      html: buildAppointmentEmailHtml({
        title: "Agendamento recusado",
        statusLabel: "Recusado",
        statusTone: "refused",
        customerName: clienteNome,
        appointmentDate: atual.inicio,
        reason: motivo,
        footerNote: "Entre em contato com a equipe para combinar uma nova data ou horario.",
      }),
    });

    if (emailResult.sent) {
      await supabaseAdmin.from("agendamento").update({ notificadoat: new Date().toISOString() }).eq("id", agendamentoId);
    }

    return NextResponse.json({
      data,
      notificacao: {
        message,
        email: clienteEmail,
        telefone: clienteTelefone,
        whatsappUrl: buildWhatsappUrl(clienteTelefone, message),
        emailResult,
      },
    });
  } catch (e: any) {
    const status = e?.statusCode ?? (/autenticado|permiss/i.test(e?.message) ? 403 : 500);
    return NextResponse.json({ error: e?.message ?? "Erro ao recusar agendamento" }, { status });
  }
}
