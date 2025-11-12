export type NFSeItem = {
  tipo: "SERVICO";
  descricao: string;
  codigoMunicipal: string;
  itemLista: string;
  aliquotaISS: number;
  quantidade: number;
  valorUnit: number;
};

export type NFSeEmitirParams = {
  empresaId: number;
  rpsNumero?: string;
  rpsSerie?: string;
  cliente: {
    cpfcnpj: string;
    nome: string;
    endereco?: string;
    codigomunicipio?: string;
  };
  itens: NFSeItem[];
  total: number;
};

export class NFSeService {
  async emitir() {
    // TODO: integrar com provedor municipal (Ginfes/WebISS/Betha/etc)
    return {
      ok: true,
      numero: "12345",
      codigoVerificacao: "ABCD-1234",
      xml: "<NFSe>...</NFSe>",
      pdfUrl: null,
    };
  }
}
