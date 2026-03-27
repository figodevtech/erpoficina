import http from "node:http";
import crypto from "node:crypto";
import { loadConfig } from "./config.mjs";
import { createMockProvider } from "./providers/mock-provider.mjs";
import { createCliSiTefProvider } from "./providers/clisitef-provider.mjs";

const config = loadConfig();
const store = new Map();

const provider =
  config.provider === "clisitef"
    ? createCliSiTefProvider(config)
    : createMockProvider(store);

function json(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, X-ERP-Agent-Token",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  });
  res.end(JSON.stringify(body));
}

function unauthorized(res) {
  return json(res, 401, { error: "Token do agente inválido." });
}

function isAuthorized(req) {
  if (!config.token) return true;
  return req.headers["x-erp-agent-token"] === config.token;
}

function normalizeMethod(value) {
  const method = String(value ?? "").toLowerCase();
  return ["credit", "debit", "pix"].includes(method) ? method : null;
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

const server = http.createServer(async (req, res) => {
  try {
    if (!req.url || !req.method) return json(res, 400, { error: "Requisição inválida." });
    if (req.method === "OPTIONS") return json(res, 204, {});
    if (!isAuthorized(req)) return unauthorized(res);

    const url = new URL(req.url, `http://${req.headers.host}`);
    const parts = url.pathname.split("/").filter(Boolean);

    if (req.method === "GET" && url.pathname === "/health") {
      return json(res, 200, {
        ok: true,
        provider: provider.name,
        agentVersion: "0.1.0",
        health: await provider.health(),
      });
    }

    if (req.method === "GET" && url.pathname === "/v1/capabilities") {
      return json(res, 200, {
        provider: provider.name,
        ...(await provider.capabilities()),
      });
    }

    if (req.method === "POST" && url.pathname === "/v1/payments") {
      const body = await readJson(req);
      const amount = Number(body.amount);
      const method = normalizeMethod(body.method);

      if (!body.idempotencyKey) {
        return json(res, 400, { error: "idempotencyKey é obrigatório." });
      }
      if (!Number.isFinite(amount) || amount <= 0) {
        return json(res, 400, { error: "amount deve ser maior que zero." });
      }
      if (!method) {
        return json(res, 400, { error: "method deve ser credit, debit ou pix." });
      }

      const existent = [...store.values()].find(
        (item) => item.idempotencyKey === body.idempotencyKey
      );
      if (existent) return json(res, 200, existent);

      const payment = await provider.createPayment({
        idempotencyKey: body.idempotencyKey,
        vendaId: body.vendaId ?? null,
        ordemServicoId: body.ordemServicoId ?? null,
        amount,
        method,
        installments: Number(body.installments ?? 1),
        description: body.description ?? "",
        metadata: body.metadata ?? null,
        correlationId: body.correlationId ?? crypto.randomUUID(),
      });

      return json(res, 201, payment);
    }

    if (req.method === "GET" && parts[0] === "v1" && parts[1] === "payments" && parts[2]) {
      const payment = await provider.getPayment(parts[2]);
      if (!payment) return json(res, 404, { error: "Transação não encontrada." });
      return json(res, 200, payment);
    }

    if (
      req.method === "POST" &&
      parts[0] === "v1" &&
      parts[1] === "payments" &&
      parts[2] &&
      parts[3] === "cancel"
    ) {
      const payment = await provider.cancelPayment(parts[2]);
      if (!payment) return json(res, 404, { error: "Transação não encontrada." });
      return json(res, 200, payment);
    }

    return json(res, 404, { error: "Rota não encontrada." });
  } catch (error) {
    return json(res, 500, {
      error: error instanceof Error ? error.message : "Erro interno do agente.",
    });
  }
});

server.listen(config.port, config.host, () => {
  console.log(
    `[tef-local-agent] listening on http://${config.host}:${config.port} provider=${provider.name}`
  );
});
