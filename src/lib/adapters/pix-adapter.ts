export type PixConfig = {
  provider: string; // stone / banco
  chave: string;
  clientId?: string;
  clientSecret?: string;
  webhookUrl?: string;
  expiracaoSegundos?: number;
};

export class PixAdapter {
  constructor(private cfg: PixConfig) {}

  async gerarQrCode(valor: number, descricao?: string) {
    // TODO: chamar PSP para criar cobrança (devolvendo payload BR Code + imagem/URL)
    return {
      brcode: "0002012633...5204000053039865406...",
      qrImageUrl: "https://psp.example/qr/abc.png",
      expiraEm: new Date(Date.now() + (this.cfg.expiracaoSegundos || 1800) * 1000).toISOString(),
      txid: "TX123",
    };
  }

  verificarWebhook(payload: any, header: string) {
    // TODO: validar assinatura do PSP
    return true;
  }
}
