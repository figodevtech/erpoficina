"use client";

import type { ChecklistTemplate } from "./types";

type InputTemplate = Omit<ChecklistTemplate, "id" | "criadoEm">;

function normalizeTemplate(row: any): ChecklistTemplate {
  return {
    id: String(row.id),
    nome: row.nome ?? "",
    descricao: row.descricao ?? "",
    categoria: row.categoria ?? "",
    itens: Array.isArray(row.itens) ? row.itens : [],
    // aceita várias chaves comuns de timestamp vindas do backend
    criadoEm:
      row.criadoEm ??
      row.createdat ??
      row.created_at ??
      new Date().toISOString(),
    ativo: row.ativo ?? true,
  };
}

// extrai lista de vários formatos possíveis
function extractArray(j: any): any[] {
  if (Array.isArray(j)) return j;
  if (Array.isArray(j?.items)) return j.items;
  if (Array.isArray(j?.data)) return j.data;
  if (Array.isArray(j?.result)) return j.result;
  if (Array.isArray(j?.rows)) return j.rows;
  return [];
}

// extrai item de vários formatos possíveis
function extractItem(j: any): any {
  return j?.item ?? j?.data ?? j;
}

export async function listarModelos(signal?: AbortSignal) {
  const r = await fetch("/api/checklist-modelos", { cache: "no-store", signal });
  let j: any = null;
  try {
    j = await r.json();
  } catch {
    j = null;
  }
  if (!r.ok) {
    const msg = j?.error || `Falha ao listar modelos (HTTP ${r.status}).`;
    throw new Error(msg);
  }
  const itemsRaw = extractArray(j);
  return itemsRaw.map(normalizeTemplate) as ChecklistTemplate[];
}

export async function criarModelo(payload: InputTemplate) {
  const r = await fetch("/api/checklist-modelos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j?.error || "Falha ao criar modelo.");
  const item = extractItem(j);
  return normalizeTemplate(item);
}

export async function atualizarModelo(id: string, payload: InputTemplate) {
  const r = await fetch(`/api/checklist-modelos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j?.error || "Falha ao atualizar modelo.");
  const item = extractItem(j);
  return normalizeTemplate(item);
}

export async function excluirModelo(id: string) {
  const r = await fetch(`/api/checklist-modelos/${id}`, { method: "DELETE" });
  if (r.status === 204) return true; // No Content
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j?.error || "Falha ao excluir modelo.");
  return true;
}
