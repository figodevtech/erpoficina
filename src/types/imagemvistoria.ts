// types/imagemvistoria.ts
export interface ImagemVistoria {
  id: number;
  checklistid: number;       // FK -> checklist(id)
  url: string;
  descricao?: string | null;
  createdat?: string | null;
}
