// types/vendaonline.ts
import type { EnumStatusVendaOnline } from './enum';

export interface VendaOnline {
  id: number;
  clienteid: number;               // FK -> cliente(id)
  status: EnumStatusVendaOnline;   // USER-DEFINED
  valortotal: number;              // numeric
  datavenda?: string | null;       // timestamp
  createdat?: string | null;
  updatedat?: string | null;
}
