// lib/supabaseAdmin.ts
import { createClient } from "@supabase/supabase-js";

if (typeof window !== "undefined") {
  throw new Error("supabaseAdmin só pode ser importado no servidor");
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url) throw new Error("[supabaseAdmin] NEXT_PUBLIC_SUPABASE_URL ausente (.env.local)");
if (!serviceKey) throw new Error("[supabaseAdmin] SUPABASE_SERVICE_ROLE_KEY ausente (.env.local)");
if (!serviceKey.startsWith("eyJ")) {
  console.warn("[supabaseAdmin] WARNING: SERVICE_ROLE não parece um JWT (não inicia com 'eyJ').");
}

export const supabaseAdmin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
