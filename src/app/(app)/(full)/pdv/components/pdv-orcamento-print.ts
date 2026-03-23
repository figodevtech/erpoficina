"use client";

export const PDV_ORCAMENTO_STORAGE_PREFIX = "pdv-orcamento-print:";

export type PdvOrcamentoPrintItem = {
  id: number;
  titulo: string;
  quantity: number;
  precovenda: number;
  subtotal: number;
  grupo?: string;
};

export type PdvOrcamentoPrintCustomer = {
  id: number;
  nomerazaosocial: string;
  cpfcnpj?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  endereconumero?: string;
  enderecocomplemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
};

export type PdvOrcamentoPrintData = {
  createdAt: string;
  discountType: "FIXO" | "PORCENTAGEM" | null;
  discountInput: number;
  discountAmount: number;
  subtotal: number;
  total: number;
  customer: PdvOrcamentoPrintCustomer | null;
  items: PdvOrcamentoPrintItem[];
};
