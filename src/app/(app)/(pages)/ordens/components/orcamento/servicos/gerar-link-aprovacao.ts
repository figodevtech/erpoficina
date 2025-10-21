// Gera um token de aprovação no backend e retorna a URL pública para enviar ao cliente
export async function gerarLinkAprovacaoAPI(osId: number, { expiraEmHoras = 72 } = {}) {
  const r = await fetch(`/api/ordens/${osId}/aprovacao`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ expiraEmHoras }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j?.error || "Falha ao gerar link de aprovação");
  // backend retorna { url, token, expiraEm }
  return j as { url: string; token: string; expiraEm?: string };
}
