
const JSONH = { "Content-Type": "application/json" };

export async function criarOrdem(payload: any): Promise<{ id: number }> {
  const r = await fetch("/api/ordens/criar", {
    method: "POST",
    headers: JSONH,
    body: JSON.stringify(payload),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j?.error || "Falha ao criar OS");
  return j; // { id }
}

export async function editarOrdem(id: number, payload: any) {
  const r = await fetch(`/api/ordens/${id}`, { method: "PUT", headers: JSONH, body: JSON.stringify(payload) });
  if (!r.ok) throw new Error((await r.json().catch(() => null))?.error || "Falha ao salvar OS");
  return r.json();
}

export async function listarSetores(): Promise<{ id: number; nome: string }[]> {
  const r = await fetch("/api/setores", { cache: "no-store" });
  const j = await r.json().catch(() => ({}));
  return j?.items ?? [];
}

export async function listarResponsaveis(): Promise<{ id: number; nome: string }[]> {
  const r = await fetch("/api/usuarios?role=tecnico", { cache: "no-store" });
  const j = await r.json().catch(() => ({}));
  return j?.items ?? [];
}
