import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const osId = Number(id);

    if (!Number.isFinite(osId) || osId <= 0) {
      return NextResponse.json(
        { ok: false, message: "ID da OS inválido." },
        { status: 400 }
      );
    }

    // Busca serviços da OS
    const { data: os, error } = await supabaseAdmin
      .from("ordemservico")
      .select(`
        id,
        osservico (
          id,
          quantidade,
          valorunitario,
          servico (
            id,
            nome,
            codigomunicipal
          )
        )
      `)
      .eq("id", osId)
      .single();

    if (error || !os) {
      return NextResponse.json(
        { ok: false, message: "Erro ao buscar serviços da OS." },
        { status: 404 }
      );
    }

    // Busca Notas Fiscais de Serviço vinculadas a esta OS para verificar o status
    const { data: notas } = await supabaseAdmin
      .from("nfse")
      .select("id, referencia, status, erros")
      .eq("ordemservicoid", osId);

    // Mescla os dados para identificar quais serviços já foram emitidos
    const servicosMapeados = os.osservico.map((item: any) => {
      // Procura se tem alguma nota com a referencia terminando / contendo o ID do serviço
      // O padrão que criamos é OS_{os.id}_SRV_{item.id}_{timestamp}
      const refPattern = `OS_${os.id}_SRV_${item.id}_`;
      const notaGerada = notas?.find((n: any) => n.referencia?.startsWith(refPattern));

      return {
        ...item,
        notaFiscalStatus: notaGerada ? notaGerada.status : null,
        notaFiscalId: notaGerada ? notaGerada.id : null,
        notaFiscalErros: notaGerada ? notaGerada.erros : null,
      };
    });

    return NextResponse.json({ ok: true, servicos: servicosMapeados });
  } catch (e: any) {
    console.error("[GET /api/nfse/de-os/servicos]", e);
    return NextResponse.json({ ok: false, message: "Erro inesperado." }, { status: 500 });
  }
}
