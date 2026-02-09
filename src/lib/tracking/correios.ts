import type { TrackingEvent, TrackingResult } from "./types";

function firstString(v: any): string | null {
  if (v == null) return null;
  if (typeof v === "string") return v;
  return null;
}

function coalesceString(...vals: any[]): string | null {
  for (const v of vals) {
    const s = firstString(v);
    if (s && s.trim()) return s.trim();
  }
  return null;
}

function tryParseDateToIso(v: any): string | null {
  const s = coalesceString(v);
  if (!s) return null;

  // Accept ISO or "YYYY-MM-DD HH:mm:ss" or similar.
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) return d.toISOString();

  // Try "DD/MM/YYYY HH:mm" (common pt-BR).
  const m = /^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/.exec(s);
  if (m) {
    const dd = Number(m[1]);
    const mm = Number(m[2]);
    const yyyy = Number(m[3]);
    const HH = Number(m[4] ?? 0);
    const MI = Number(m[5] ?? 0);
    const SS = Number(m[6] ?? 0);
    const d2 = new Date(Date.UTC(yyyy, mm - 1, dd, HH, MI, SS));
    if (!Number.isNaN(d2.getTime())) return d2.toISOString();
  }

  return null;
}

function normalizeEvent(raw: any): TrackingEvent | null {
  if (!raw || typeof raw !== "object") return null;
  const title = coalesceString(raw.status, raw.title, raw.evento, raw.descricao, raw.description);
  if (!title) return null;

  const at =
    tryParseDateToIso(raw.at) ??
    tryParseDateToIso(raw.date) ??
    tryParseDateToIso(raw.data) ??
    tryParseDateToIso(raw.datetime) ??
    tryParseDateToIso(raw.timestamp);

  const location = coalesceString(raw.location, raw.local, raw.unidade, raw.cidade, raw.uf);
  const details = coalesceString(raw.details, raw.detalhes, raw.comentario, raw.message);

  return { at, title, location, details };
}

function extractEventsFromJson(json: any): TrackingEvent[] {
  const candidates = [
    json?.events,
    json?.eventos,
    json?.tracking?.events,
    json?.tracking?.eventos,
    json?.data?.events,
    json?.data?.eventos,
    json?.resultado?.eventos,
  ];

  for (const cand of candidates) {
    if (Array.isArray(cand)) {
      const normalized = cand.map(normalizeEvent).filter(Boolean) as TrackingEvent[];
      if (normalized.length) return normalized;
    }
  }

  return [];
}

function pickLastEvent(events: TrackingEvent[]): TrackingEvent | null {
  if (!events.length) return null;

  // Sort by timestamp asc when possible; if none, keep original order.
  const sortable = events
    .map((e, idx) => ({ e, idx, t: e.at ? new Date(e.at).getTime() : NaN }))
    .slice();

  const hasAnyTime = sortable.some((x) => Number.isFinite(x.t));
  if (!hasAnyTime) return events[events.length - 1];

  sortable.sort((a, b) => {
    const at = Number.isFinite(a.t) ? a.t : -Infinity;
    const bt = Number.isFinite(b.t) ? b.t : -Infinity;
    if (at !== bt) return at - bt;
    return a.idx - b.idx;
  });
  return sortable[sortable.length - 1]?.e ?? null;
}

function classify(lastTitle: string | null) {
  const t = (lastTitle ?? "").toLowerCase();
  const isDelivered =
    t.includes("entregue") &&
    !t.includes("nao entregue") &&
    !t.includes("não entregue") &&
    !t.includes("aguardando retirada");
  const isOutForDelivery = t.includes("saiu para entrega") || t.includes("saiu p/ entrega");
  return { isDelivered, isOutForDelivery };
}

/**
 * Consulta rastreio via um endpoint HTTP configurÃ¡vel.
 *
 * Configure `CORREIOS_TRACKING_ENDPOINT` no ambiente (exemplos):
 * - https://seu-proxy.com/correios?code={code}
 * - https://seu-proxy.com/correios/{code}
 */
export async function fetchCorreiosTracking(code: string): Promise<TrackingResult> {
  const endpoint = process.env.CORREIOS_TRACKING_ENDPOINT;
  if (!endpoint) {
    throw new Error(
      "CORREIOS_TRACKING_ENDPOINT nao configurado. Configure um endpoint/proxy para consultar o rastreio."
    );
  }

  const enc = encodeURIComponent(code.trim());
  const url = endpoint.includes("{code}")
    ? endpoint.replaceAll("{code}", enc)
    : endpoint.includes("?")
      ? `${endpoint}&code=${enc}`
      : `${endpoint}?code=${enc}`;

  const res = await fetch(url, { method: "GET", headers: { Accept: "application/json" } });
  const contentType = res.headers.get("content-type") || "";

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Falha ao consultar rastreio (${res.status}). ${body.slice(0, 200)}`);
  }

  if (!contentType.toLowerCase().includes("application/json")) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `Endpoint de rastreio nao retornou JSON (content-type: ${contentType}). Resposta: ${body.slice(0, 200)}`
    );
  }

  const json = await res.json();
  const events = extractEventsFromJson(json);
  const last = pickLastEvent(events);
  const lastEventTitle = last?.title ?? null;
  const lastEventAt = last?.at ?? null;
  const { isDelivered, isOutForDelivery } = classify(lastEventTitle);

  // Keep raw small. This helps debugging without storing huge payloads.
  const raw = typeof json === "object" && json ? { ...json } : json;

  return {
    carrier: "CORREIOS",
    code: code.trim(),
    events,
    lastEventTitle,
    lastEventAt,
    isDelivered,
    isOutForDelivery,
    raw,
  };
}

