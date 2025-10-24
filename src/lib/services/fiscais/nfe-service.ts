export type NFeItem = {
  tipo: "PRODUTO";
  descricao: string;
  ncm?: string;
  cfop?: string;
  csosn?: string;
  cest?: string | null;
  unidade: string;
  quantidade: number;
  valorUnit: number;
  aliquotas?: { icms?: number; ipi?: number; pis?: number; cofins?: number };
};

export type NFeEmitirParams = {
  empresaId: number;
  numero: string; // ou gerar
  serie: string;
  naturezaOperacao: string;
  cliente: {
    cpfcnpj: string;
    nome: string;
    endereco?: string;
    codigomunicipio?: string;
  };
  itens: NFeItem[];
  total: number;
};

export class NFeService {
  async emitir(params: NFeEmitirParams) {
    // TODO: integrar com emissor/SDK/WS do seu estado
    // Retornar chave, número, série, protocolo, XML
    return {
      ok: true,
      numero: params.numero,
      serie: params.serie,
      chave: "NFe3519...XYZ",
      protocolo: "1234567890",
      xml: "<NFe>...</NFe>",
    };
  }
}
