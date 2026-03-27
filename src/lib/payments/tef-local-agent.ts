export type TefLocalAgentMethod = "credit" | "debit" | "pix";

export type TefLocalAgentStatus =
  | "PENDING"
  | "AWAITING_CUSTOMER"
  | "PROCESSING"
  | "APPROVED"
  | "DENIED"
  | "CANCELLED"
  | "ERROR";

export type TefLocalAgentPayment = {
  id: string;
  provider: string;
  status: TefLocalAgentStatus | string;
  amount: number;
  method: TefLocalAgentMethod;
  installments: number;
  description?: string;
  idempotencyKey?: string;
  vendaId?: number | null;
  ordemServicoId?: number | null;
  createdAt?: string;
  updatedAt?: string;
  nsu?: string | null;
  authorizationCode?: string | null;
  brand?: string | null;
  receiptCustomer?: string | null;
  receiptMerchant?: string | null;
};

export type StartTefLocalAgentPaymentInput = {
  idempotencyKey: string;
  amount: number;
  method: TefLocalAgentMethod;
  installments?: number;
  description?: string;
  vendaId?: number | null;
  ordemServicoId?: number | null;
  metadata?: Record<string, unknown> | null;
  correlationId?: string;
};

export type TefLocalAgentHealth = {
  ok: boolean;
  provider: string;
  agentVersion: string;
  health?: Record<string, unknown>;
};

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_TEF_AGENT_URL || "http://127.0.0.1:18181";
}

function getHeaders() {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (process.env.NEXT_PUBLIC_TEF_AGENT_TOKEN) {
    headers["X-ERP-Agent-Token"] = process.env.NEXT_PUBLIC_TEF_AGENT_TOKEN;
  }

  return headers;
}

async function parseJson<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error((data as any)?.error || "Falha ao comunicar com o agente TEF.");
  }
  return data as T;
}

export async function tefLocalAgentHealth(): Promise<TefLocalAgentHealth> {
  const response = await fetch(`${getBaseUrl()}/health`, {
    method: "GET",
    headers: getHeaders(),
    cache: "no-store",
  });

  return parseJson<TefLocalAgentHealth>(response);
}

export async function tefLocalAgentStartPayment(
  input: StartTefLocalAgentPaymentInput
): Promise<TefLocalAgentPayment> {
  const response = await fetch(`${getBaseUrl()}/v1/payments`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(input),
  });

  return parseJson<TefLocalAgentPayment>(response);
}

export async function tefLocalAgentGetPayment(id: string): Promise<TefLocalAgentPayment> {
  const response = await fetch(`${getBaseUrl()}/v1/payments/${id}`, {
    method: "GET",
    headers: getHeaders(),
    cache: "no-store",
  });

  return parseJson<TefLocalAgentPayment>(response);
}

export async function tefLocalAgentCancelPayment(id: string): Promise<TefLocalAgentPayment> {
  const response = await fetch(`${getBaseUrl()}/v1/payments/${id}/cancel`, {
    method: "POST",
    headers: getHeaders(),
  });

  return parseJson<TefLocalAgentPayment>(response);
}
