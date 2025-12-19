export type ItemChecklist = {
  id: string;
  titulo: string;
  descricao?: string;
  obrigatorio: boolean;
  categoria: string;
};

export type ChecklistTemplate = {
  id: string;
  nome: string;
  descricao: string;
  categoria: string;
  itens: ItemChecklist[];
  criadoEm: string;   // ISO string (evita mismatch de hidratação)
  ativo: boolean;
};
