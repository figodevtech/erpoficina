export type NFSeEmitirParams = {
  referencia: string;
  natureza_operacao?: number | string;
  optante_simples_nacional?: boolean;
  regime_especial_tributacao?: number | string;
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
    iss_retido: boolean | string;
    item_lista_servico: string;
    codigo_tributario_municipio?: string;
    codigo_cnae?: string;
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

    const payload: any = {
      data_emissao: new Date().toISOString(),
      prestador: params.prestador,
      tomador: params.tomador,
      servico: params.servico,
    };

    if (params.natureza_operacao !== undefined) payload.natureza_operacao = params.natureza_operacao;
    if (params.optante_simples_nacional !== undefined) payload.optante_simples_nacional = params.optante_simples_nacional;
    if (params.regime_especial_tributacao !== undefined) payload.regime_especial_tributacao = params.regime_especial_tributacao;

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
      let msg = json?.mensagem || json?.codigo || "Erro ao emitir NFS-e";
      const errosArr = json?.erros || (json ? [json] : []);
      
      if (errosArr.length > 0) {
        const errorDetails = errosArr.map((e: any) => e.mensagem || e.codigo || JSON.stringify(e)).join(" | ");
        msg = errorDetails.includes(msg) ? errorDetails : `${msg}: ${errorDetails}`;
      }

      return {
        ok: false,
        message: msg,
        erros: errosArr,
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

  async cancelar(referencia: string, justificativa?: string) {
    if (!this.token) throw new Error("FOCUS_NFE_API_TOKEN não configurado.");

    const url = `${this.apiUrl}/v2/nfse/${referencia}`;

    const options: RequestInit = {
      method: "DELETE",
      headers: {
        Authorization: this.getAuthHeader(),
      },
    };

    if (justificativa) {
      options.headers = {
        ...options.headers,
        "Content-Type": "application/json",
      };
      options.body = JSON.stringify({ justificativa });
    }

    const res = await fetch(url, options);

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
