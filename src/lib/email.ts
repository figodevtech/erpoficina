type SendEmailParams = {
  to?: string | null;
  subject: string;
  text: string;
  html?: string;
};

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || "Alpha Garage PB <noreply@alphagaragepb.com.br>";

function escapeHtml(value?: string | null) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatAppointmentDate(value?: string | null) {
  if (!value) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(value));
}

export function buildAppointmentEmailHtml(params: {
  title: string;
  statusLabel: string;
  statusTone: "pending" | "approved" | "refused" | "canceled";
  customerName?: string | null;
  appointmentDate?: string | null;
  summary?: string | null;
  reason?: string | null;
  protocol?: string | number | null;
  footerNote?: string;
}) {
  const tone = {
    pending: { color: "#b45309", bg: "#fffbeb", border: "#f59e0b" },
    approved: { color: "#047857", bg: "#ecfdf5", border: "#10b981" },
    refused: { color: "#be123c", bg: "#fff1f2", border: "#f43f5e" },
    canceled: { color: "#475569", bg: "#f8fafc", border: "#94a3b8" },
  }[params.statusTone];

  const appointmentDate = formatAppointmentDate(params.appointmentDate);

  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(params.title)}</title>
  </head>
  <body style="margin:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#111827;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f4f6;padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="background:#111827;padding:24px 28px;">
                <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#f59e0b;font-weight:700;">Alpha Garage PB</div>
                <h1 style="margin:8px 0 0;font-size:24px;line-height:1.25;color:#ffffff;">${escapeHtml(params.title)}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">Ola, <strong>${escapeHtml(params.customerName || "cliente")}</strong>.</p>
                <div style="border-left:5px solid ${tone.border};background:${tone.bg};border-radius:12px;padding:16px 18px;margin:0 0 22px;">
                  <div style="font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:${tone.color};font-weight:700;">Status do agendamento</div>
                  <div style="font-size:22px;line-height:1.3;color:${tone.color};font-weight:700;margin-top:4px;">${escapeHtml(params.statusLabel)}</div>
                </div>
                ${
                  appointmentDate
                    ? `<p style="margin:0 0 10px;font-size:15px;line-height:1.6;"><strong>Data e horario:</strong> ${escapeHtml(appointmentDate)}</p>`
                    : ""
                }
                ${
                  params.summary
                    ? `<p style="margin:0 0 10px;font-size:15px;line-height:1.6;"><strong>Resumo:</strong> ${escapeHtml(params.summary)}</p>`
                    : ""
                }
                ${
                  params.reason
                    ? `<p style="margin:0 0 10px;font-size:15px;line-height:1.6;"><strong>Motivo:</strong> ${escapeHtml(params.reason)}</p>`
                    : ""
                }
                ${
                  params.protocol
                    ? `<p style="margin:0 0 22px;font-size:15px;line-height:1.6;"><strong>Protocolo:</strong> #${escapeHtml(String(params.protocol))}</p>`
                    : ""
                }
                <p style="margin:22px 0 0;font-size:15px;line-height:1.6;color:#374151;">${escapeHtml(
                  params.footerNote || "Qualquer duvida, responda este e-mail ou fale com a nossa equipe pelo WhatsApp.",
                )}</p>
              </td>
            </tr>
            <tr>
              <td style="border-top:1px solid #e5e7eb;padding:18px 28px;background:#f9fafb;color:#6b7280;font-size:12px;line-height:1.5;">
                Esta mensagem foi enviada automaticamente pela Alpha Garage PB.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function sendEmail({ to, subject, text, html }: SendEmailParams) {
  if (!to) {
    return { sent: false, skipped: true, reason: "missing-recipient" };
  }

  if (!RESEND_API_KEY) {
    return { sent: false, skipped: true, reason: "missing-api-key" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to,
      subject,
      text,
      html,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    console.error("[email] Falha ao enviar e-mail:", response.status, body);
    return { sent: false, skipped: false, reason: "resend-error", status: response.status, error: body };
  }

  return { sent: true, skipped: false };
}
