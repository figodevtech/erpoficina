// app/api/customers/status-counter/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

type ClienteRow = { status: 'ATIVO' | 'INATIVO' | 'PENDENTE' | null };

export async function GET() {
  try {
    const listPromise = supabaseAdmin
      .from('cliente')
      .select('status')
      .returns<ClienteRow[]>();

    const totalPromise = supabaseAdmin
      .from('cliente')
      .select('*', { count: 'exact', head: true });

    const [{ data, error }, { count, error: countError }] = await Promise.all([
      listPromise,
      totalPromise,
    ]);

    if (error) throw error;
    if (countError) throw countError;

    const countsByStatus = (data ?? []).reduce<Record<string, number>>(
      (acc, row) => {
        const key = String(row.status ?? 'NULL');
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      },
      { ATIVO: 0, INATIVO: 0, PENDENTE: 0 }
    );

    return NextResponse.json(
      {
        countsByStatus,
        totalClients: count ?? 0,
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
