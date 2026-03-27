export function createCliSiTefProvider(config) {
  return {
    name: "clisitef",
    async health() {
      const ready = Boolean(config.sitef.ip && config.sitef.store && config.sitef.terminal);

      return {
        ok: ready,
        ready,
        reason: ready
          ? null
          : "Configure TEF_AGENT_SITEF_IP, TEF_AGENT_SITEF_STORE e TEF_AGENT_SITEF_TERMINAL.",
      };
    },
    async capabilities() {
      return {
        methods: ["credit", "debit", "pix"],
        cancelSupported: true,
        integrationMode: "interactive",
      };
    },
    async createPayment() {
      throw new Error(
        "Provider CliSiTef ainda não implementado. É necessário integrar a biblioteca oficial da TEF house no agente local."
      );
    },
    async getPayment() {
      return null;
    },
    async cancelPayment() {
      throw new Error(
        "Cancelamento CliSiTef ainda não implementado. É necessário integrar a biblioteca oficial da TEF house."
      );
    },
  };
}
