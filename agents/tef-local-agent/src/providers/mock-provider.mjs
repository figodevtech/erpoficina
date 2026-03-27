import crypto from "node:crypto";

export function createMockProvider(store) {
  return {
    name: "mock",
    async health() {
      return { ok: true };
    },
    async capabilities() {
      return {
        methods: ["credit", "debit", "pix"],
        cancelSupported: true,
      };
    },
    async createPayment(input) {
      const id = crypto.randomUUID();
      const createdAt = new Date().toISOString();
      const payment = {
        id,
        provider: "mock",
        status: "PENDING",
        amount: Number(input.amount),
        method: input.method,
        installments: Number(input.installments ?? 1),
        description: input.description ?? "",
        idempotencyKey: input.idempotencyKey,
        vendaId: input.vendaId ?? null,
        ordemServicoId: input.ordemServicoId ?? null,
        createdAt,
        updatedAt: createdAt,
        nsu: null,
        authorizationCode: null,
        brand: null,
        receiptCustomer: null,
        receiptMerchant: null,
        metadata: input.metadata ?? null,
      };

      store.set(id, payment);

      setTimeout(() => {
        const current = store.get(id);
        if (!current || current.status !== "PENDING") return;

        store.set(id, {
          ...current,
          status: "APPROVED",
          updatedAt: new Date().toISOString(),
          nsu: String(Math.floor(Math.random() * 900000) + 100000),
          authorizationCode: Math.random().toString(36).slice(2, 8).toUpperCase(),
          brand:
            current.method === "credit" || current.method === "debit" ? "VISA" : "PIX",
          receiptCustomer: "COMPROVANTE MOCK CLIENTE",
          receiptMerchant: "COMPROVANTE MOCK LOJA",
        });
      }, 2500);

      return payment;
    },
    async getPayment(id) {
      return store.get(id) ?? null;
    },
    async cancelPayment(id) {
      const current = store.get(id);
      if (!current) return null;
      if (current.status === "APPROVED") {
        const next = {
          ...current,
          status: "CANCELLED",
          updatedAt: new Date().toISOString(),
        };
        store.set(id, next);
        return next;
      }

      const next = {
        ...current,
        status: "CANCELLED",
        updatedAt: new Date().toISOString(),
      };
      store.set(id, next);
      return next;
    },
  };
}
