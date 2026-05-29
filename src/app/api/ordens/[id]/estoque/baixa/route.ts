// src/app/api/ordens/[id]/estoque/baixa/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  buscarModoBaixaEstoqueOS,
  consumirEstoqueOS,
  mensagemEstoqueInsuficienteOS,
} from "@/lib/ordens/estoque-os";

type Params = { id: string };

export async function POST(_req: NextRequest, context: { params: Promise<Params> }) {
  try {
    const { id } = await context.params;

    const osId = Number(id);
    if (!Number.isFinite(osId)) {
      return NextResponse.json({ error: "OS invalida" }, { status: 400 });
    }

    const modoBaixa = await buscarModoBaixaEstoqueOS();
    if (modoBaixa !== "EXECUCAO") {
      return NextResponse.json(
        { error: "A baixa manual de estoque da OS so esta disponivel no modo Baixa na Execucao." },
        { status: 409 }
      );
    }

    const baixa = await consumirEstoqueOS(osId);
    if (!baixa.ok) {
      return NextResponse.json(
        {
          error: mensagemEstoqueInsuficienteOS(baixa.faltantes),
          itens: baixa.faltantes,
        },
        { status: 409 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[POST] /api/ordens/[id]/estoque/baixa", err);
    return NextResponse.json(
      { error: err?.message ?? "Erro inesperado ao dar baixa" },
      { status: 500 }
    );
  }
}
