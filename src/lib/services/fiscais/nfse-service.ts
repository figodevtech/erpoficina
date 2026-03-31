export type NFSeEmitirParams = {
  referencia: string;
  prestador: {
    cnpj: string;
    inscricao_municipal: string;
    codigo_municipio: string;
  };
  tomador: {
    cpf?: string;
    cnpj?: string;
    razao_social: string;
    email?: string;
    endereco?: {
      logradouro?: string;
      numero?: string;
      bairro?: string;
      codigo_municipio?: string;
      uf?: string;
      cep?: string;
    };
  };
  servico: {
    aliquota: number;
    discriminacao: string;
    iss_retido: boolean;
    item_lista_servico: string;
    codigo_tributario_municipio?: string;
    valor_servicos: number;
  };
};

export class NFSeService {
  private apiUrl: string;
  private token: string;

  constructor() {
    this.token = process.env.FOCUS_NFE_API_TOKEN || "";
    // Configura ambiente. Se houver var explícita usamos, senão homologacao.
    this.apiUrl =
      process.env.FOCUS_NFE_API_URL ||
      (process.env.NODE_ENV === "production"
        ? "https://api.focusnfe.com.br"
        : "https://homologacao.focusnfe.com.br");
  }

  private getAuthHeader() {
    return `Basic ${Buffer.from(this.token + ":").toString("base64")}`;
  }

  async emitir(params: NFSeEmitirParams) {
    if (!this.token) throw new Error("FOCUS_NFE_API_TOKEN não configurado.");

    const url = `${this.apiUrl}/v2/nfse?ref=${params.referencia}`;

    const payload = {
      data_emissao: new Date().toISOString(),
      prestador: params.prestador,
      tomador: params.tomador,
      servico: params.servico,
    };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: this.getAuthHeader(),
      },
      body: JSON.stringify(payload),
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      return {
        ok: false,
        message: json?.mensagem || json?.codigo || "Erro ao emitir NFS-e",
        erros: json?.erros || (json ? [json] : []),
      };
    }

    return {
      ok: true,
      status: json?.status || "processando_autorizacao",
      referencia: json?.ref,
    };
  }

  async consultar(referencia: string) {
    if (!this.token) throw new Error("FOCUS_NFE_API_TOKEN não configurado.");

    const url = `${this.apiUrl}/v2/nfse/${referencia}`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: this.getAuthHeader(),
      },
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      return {
        ok: false,
        message: json?.mensagem || "Erro ao consultar NFS-e",
        erros: json?.erros || [json],
      };
    }

    return {
      ok: true,
      status: json?.status,
      numero: json?.numero,
      codigo_verificacao: json?.codigo_verificacao,
      url: json?.url,
      caminho_xml_nota_fiscal: json?.caminho_xml_nota_fiscal,
      erros: json?.erros,
    };
  }

  async cancelar(referencia: string) {
    if (!this.token) throw new Error("FOCUS_NFE_API_TOKEN não configurado.");

    const url = `${this.apiUrl}/v2/nfse/${referencia}`;

    const res = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: this.getAuthHeader(),
      },
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      return {
        ok: false,
        message: json?.mensagem || "Erro ao cancelar NFS-e",
        erros: json?.erros || [json],
      };
    }

    return {
      ok: true,
      status: json?.status,
    };
  }
}
