import type { ChecklistTemplate } from "./types";

export const categorias = [
  "Inspeção Geral",
  "Motor",
  "Freios",
  "Suspensão",
  "Elétrica",
  "Pneus e Rodas",
  "Carroceria",
  "Interior",
  "Documentação",
  "Outros",
] as const;

export const uid = () => Math.random().toString(36).slice(2, 10);

export const novoTemplateVazio = (): ChecklistTemplate => ({
  id: "",
  nome: "",
  descricao: "",
  categoria: "",
  itens: [],
  criadoEm: new Date().toISOString(),
  ativo: true,
});
