// app/api/customers/status-counter/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

type Row = { status: string | null; count: number };

export async function GET() {
  try {
    const groupPromise = supabaseAdmin
      .from('cliente')
      .select('status, count:id')
      .order('status', { ascending: true })
      .returns<Row[]>();

    // head:true -> não traz linhas, só o cabeçalho com o count
    const totalPromise = supabaseAdmin
      .from('cliente')
      .select('id', { count: 'exact', head: true });

    const [{ data, error }, { count, error: countError }] = await Promise.all([
      groupPromise,
      totalPromise,
    ]);

    if (error) throw error;
    if (countError) throw countError;

    const countsByStatus = Object.fromEntries(
      (data ?? []).map((r) => [String(r.status ?? 'NULL'), Number(r.count ?? 0)])
    );

    return NextResponse.json(
      {
        countsByStatus,            // ex.: { ATIVO: 12, INATIVO: 3, NULL: 1 }
        totalClients: count ?? 0,  // ✅ total da tabela inteira
        raw: data ?? [],
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Erro ao contar clientes por status' },
      { status: 500 }
    );
  }
}
