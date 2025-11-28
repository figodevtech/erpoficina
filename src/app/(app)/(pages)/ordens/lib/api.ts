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
  const r = await fetch("/api/tipos/setores", { cache: "no-store" });
  const j = await r.json().catch(() => ({}));

  const items = Array.isArray(j) ? j : j?.items ?? [];

  return items
    .filter((s: any) => s.ativo !== false) // só ativos
    .map((s: any) => ({
      id: Number(s.id),
      nome: String(s.nome ?? ""),
    }));
}

export async function listarResponsaveis(): Promise<{ id: number; nome: string }[]> {
  const r = await fetch("/api/usuarios?role=tecnico", { cache: "no-store" });
  const j = await r.json().catch(() => ({}));
  return j?.items ?? [];
}

export type ChecklistTemplateItem = {
  titulo: string;
  descricao?: string | null;
  obrigatorio?: boolean;
};

export type ChecklistTemplateModel = {
  id: string;
  nome: string;
  itens: ChecklistTemplateItem[];
};

/**
 * Lista modelos de checklist.
 * - onlyAtivos=true => adiciona ?ativos=1 na query
 */
export async function listarChecklistModelos(onlyAtivos: boolean = true): Promise<ChecklistTemplateModel[]> {
  const qs = onlyAtivos ? "?ativos=1" : "";
  const r = await fetch(`/api/checklist-modelos${qs}`, {
    cache: "no-store",
  });
  const j = await r.json().catch(() => ({}));

  const raw = Array.isArray(j) ? j : Array.isArray(j?.items) ? j.items : [];

  return raw.map((t: any) => ({
    id: String(t.id ?? t.uuid ?? ""),
    nome: String(t.nome ?? t.titulo ?? ""),
    itens: Array.isArray(t.itens)
      ? t.itens.map((it: any) => ({
          titulo: String(it.titulo ?? it.nome ?? ""),
          descricao: it.descricao ?? null,
          obrigatorio: it.obrigatorio ?? false,
        }))
      : [],
  }));
}
