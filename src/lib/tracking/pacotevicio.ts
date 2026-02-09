import type { TrackingEvent, TrackingResult } from "./types";

type PacoteVicioCorreiosEvent = {
  codigo?: string;
  descricao?: string;
  descricaoFrontEnd?: string;
  dtHrCriado?: { date?: string; timezone?: string };
  unidade?: {
    tipo?: string;
    endereco?: { cidade?: string; uf?: string };
  };
  unidadeDestino?: {
    tipo?: string;
    endereco?: { cidade?: string; uf?: string };
  };
  finalizador?: boolean;
};

type PacoteVicioCorreiosResponse = {
  tracking_code?: string;
  service?: string;
  quantidade?: number;
  eventos?: PacoteVicioCorreiosEvent[];
  [k: string]: any;
};

function extractEventos(json: any): PacoteVicioCorreiosEvent[] {
  const candidates = [
    json?.eventos,
    json?.data?.eventos,
    json?.tracking?.eventos,
    json?.resultado?.eventos,
  ];

  for (const c of candidates) {
    if (Array.isArray(c)) return c as PacoteVicioCorreiosEvent[];
  }

  return [];
}

function parsePVDateToIso(v?: string | null): string | null {
  const s = String(v ?? "").trim();
  if (!s) return null;

  // Example: "2025-03-03 23:30:03.000000" (no timezone)
  const m = /^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})(?:\.(\d+))?$/.exec(s);
  if (m) {
    const date = m[1];
    const time = m[2];
    const frac = m[3] ? `.${m[3].slice(0, 3)}` : "";
    // Assume Sao Paulo offset (most Correios events are local time).
    const isoLike = `${date}T${time}${frac}-03:00`;
    const d = new Date(isoLike);
    if (!Number.isNaN(d.getTime())) return d.toISOString();
  }

  const d2 = new Date(s);
  if (!Number.isNaN(d2.getTime())) return d2.toISOString();
  return null;
}

function normalizeEvent(ev: PacoteVicioCorreiosEvent): TrackingEvent | null {
  const titleRaw = (ev.descricaoFrontEnd || ev.descricao || "").toString().trim();
  if (!titleRaw) return null;

  const at = parsePVDateToIso(ev.dtHrCriado?.date ?? null);

  const locCidade = ev.unidade?.endereco?.cidade ?? null;
  const locUf = ev.unidade?.endereco?.uf ?? null;
  const location = [locCidade, locUf].filter(Boolean).join("/") || null;

  const destCidade = ev.unidadeDestino?.endereco?.cidade ?? null;
  const destUf = ev.unidadeDestino?.endereco?.uf ?? null;
  const dest = [destCidade, destUf].filter(Boolean).join("/") || null;

  const details = dest ? `Destino: ${dest}` : null;

  return { at, title: titleRaw, location, details };
}

function pickLast(events: TrackingEvent[]): TrackingEvent | null {
  if (!events.length) return null;
  const sortable = events
    .map((e, idx) => ({ e, idx, t: e.at ? new Date(e.at).getTime() : NaN }))
    .slice();
  const hasAnyTime = sortable.some((x) => Number.isFinite(x.t));
  if (!hasAnyTime) return events[0] ?? null;

  sortable.sort((a, b) => {
    const at = Number.isFinite(a.t) ? a.t : -Infinity;
    const bt = Number.isFinite(b.t) ? b.t : -Infinity;
    if (at !== bt) return bt - at; // desc
    return b.idx - a.idx;
  });
  return sortable[0]?.e ?? null;
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
 * PacoteVicio API (RapidAPI)
 * Endpoint:
 *   GET https://correios-rastreamento-de-encomendas.p.rapidapi.com/correios?tracking_code=AA123...BR&confidence_level=high
 * Headers:
 *   X-RapidAPI-Key: <key>
 *   X-RapidAPI-Host: <host do listing> (apenas se sua assinatura exigir)
 */
export async function fetchPacoteVicioCorreios(trackingCode: string): Promise<TrackingResult> {
  const key = process.env.PACOTEVICIO_RAPIDAPI_KEY;
  if (!key) throw new Error("PACOTEVICIO_RAPIDAPI_KEY nao configurado no ambiente.");

  const baseUrl =
    (process.env.PACOTEVICIO_RAPIDAPI_BASE_URL || "").trim() ||
    "https://correios-rastreamento-de-encomendas.p.rapidapi.com";
  const host =
    (process.env.PACOTEVICIO_RAPIDAPI_HOST || "").trim() ||
    "correios-rastreamento-de-encomendas.p.rapidapi.com";
  const confidence = (process.env.PACOTEVICIO_CONFIDENCE_LEVEL || "high").trim() || "high";

  const code = trackingCode.trim();
  if (!code) throw new Error("Codigo de rastreio vazio.");

  const url = `${baseUrl}/correios?tracking_code=${encodeURIComponent(code)}&confidence_level=${encodeURIComponent(confidence)}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "X-RapidAPI-Key": key,
      // RapidAPI normalmente exige o host do listing; mantemos sempre para bater com o exemplo.
      "X-RapidAPI-Host": host,
    } as any,
  });

  const text = await res.text().catch(() => "");
  if (!res.ok) {
    throw new Error(`Falha ao consultar PacoteVicio (${res.status}): ${text.slice(0, 200)}`);
  }

  let json: PacoteVicioCorreiosResponse;
  try {
    json = text ? (JSON.parse(text) as any) : ({} as any);
  } catch {
    throw new Error(`Resposta da PacoteVicio nao e JSON: ${text.slice(0, 200)}`);
  }

  const rawEvents = extractEventos(json);
  const events = rawEvents.map(normalizeEvent).filter(Boolean) as TrackingEvent[];
  const last = pickLast(events);
  const lastEventTitle = last?.title ?? null;
  const lastEventAt = last?.at ?? null;
  const { isDelivered, isOutForDelivery } = classify(lastEventTitle);

  return {
    carrier: "CORREIOS",
    code,
    events,
    lastEventTitle,
    lastEventAt,
    isDelivered,
    isOutForDelivery,
    raw: json,
  };
}
