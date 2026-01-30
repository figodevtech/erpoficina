import { NFeItem } from "@/lib/nfe/types";

export type InvoiceOperationType = "0" | "1"; // 0=Entrada, 1=Saída
export type InvoiceFinality = "1" | "2" | "3" | "4"; // 1=Normal, 2=Complementar, 3=Ajuste, 4=Devolução

export interface InvoicePartnerDTO {
  tipo: "CLIENTE" | "FORNECEDOR";
  id: number;
  documento: string; // CPF ou CNPJ (apenas números)
  razaoSocial: string;
  endereco: {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    codigoMunicipio: string;
    cidade: string;
    uf: string;
    cep: string;
    pais?: string;
    codPais?: string;
  };
  inscricaoEstadual?: string;
  email?: string;
  telefone?: string;
}

export interface CreateInvoiceDTO {
  empresaId: number;
  tipoOperacao: InvoiceOperationType;
  finalidade: InvoiceFinality;
  naturezaOperacao: string; // Ex: "Venda de mercadoria", "Compra para comercialização"
  
  // Origem opcional para rastreabilidade
  origem?: {
    vendaId?: number;
    osId?: number;
    entradaId?: number;
  };

  parceiro: InvoicePartnerDTO;
  itens: NFeItem[];
}

export interface InvoiceDraftResult {
  nfeId: number;
  chaveAcesso?: string | null;
  message: string;
}
