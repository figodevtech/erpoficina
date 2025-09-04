// types/checklist.ts
import type { EnumStatusChecklist } from './enum';

export interface Checklist {
  id: number;
  ordemservicoid: number;     // FK -> ordemservico(id)
  item: string;
  status: EnumStatusChecklist; // USER-DEFINED
  observacao?: string | null;
  createdat?: string | null;
}
