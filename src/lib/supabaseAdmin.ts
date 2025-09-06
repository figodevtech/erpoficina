// lib/supabaseAdmin.ts
import { createClient } from "@supabase/supabase-js";

if (typeof window !== "undefined") {
  throw new Error("supabaseAdmin só pode ser importado no servidor");
}

const urlRaw = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const keyRaw = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

// remove aspas acidentais e espaços/nova linha
const url = urlRaw.trim().replace(/^"|"$/g, "");
const serviceKey = keyRaw.trim().replace(/^"|"$/g, "");

if (!url) throw new Error("[supabaseAdmin] NEXT_PUBLIC_SUPABASE_URL ausente em .env.local");
if (!serviceKey) throw new Error("[supabaseAdmin] SUPABASE_SERVICE_ROLE_KEY ausente em .env.local");

try {
  const [, payloadB64] = serviceKey.split(".");
  if (!payloadB64) {
    console.warn("[supabaseAdmin] Chave não parece JWT (sem payload).");
  } else {
    const json = Buffer.from(payloadB64.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
    const claims = JSON.parse(json);
    if (claims.role !== "service_role") {
      console.warn(`[supabaseAdmin] ALERTA: claim.role = ${claims.role} (esperado: service_role). Você copiou a chave errada?`);
    }
  }
} catch {
  console.warn("[supabaseAdmin] Não foi possível inspecionar o JWT da SERVICE ROLE.");
}

export const supabaseAdmin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
