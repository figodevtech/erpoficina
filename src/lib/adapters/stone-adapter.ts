export type StoneCartaoConfig = {
  merchantId: string;
  apiKey: string;
  webhookUrl?: string;
  capturaAutomatica?: boolean;
  parcelasMax?: number;
  terminalIds?: string[];
};

export class StoneAdapter {
  constructor(private cfg: StoneCartaoConfig) {}

  async cobrarCartaoComMaquineta(valor: number, terminalId: string) {
    // TODO: chamar SDK/API da Stone (terminal integration)
    // Exemplo: iniciar transação no terminal selecionado e aguardar callback de sucesso.
    return { ok: true, tid: "TID123", autorizacao: "123456" };
  }

  async cobrarCartaoDigitado(valor: number, numero: string, validade: string, cvv: string, parcelas = 1) {
    // TODO: chamada e-commerce/MOTO
    return { ok: true, tid: "TID999", autorizacao: "654321" };
  }

  verificarAssinaturaWebhook(payload: any, signatureHeader: string) {
    // TODO: validar assinatura HMAC
    return true;
  }
}
