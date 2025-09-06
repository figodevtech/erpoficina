// app/api/debug/admin/route.ts
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
export async function GET() {
  try {
    const a = await supabaseAdmin.from("perfil").select("id").limit(1);
    const b = await supabaseAdmin.from("setor").select("id").limit(1);
    if (a.error) throw a.error;
    if (b.error) throw b.error;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
