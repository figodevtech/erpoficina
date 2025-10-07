// app/api/equipes/ordens/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type StatusOS = "TODAS" | "ABERTA" | "EM_ANDAMENTO" | "AGUARDANDO_PECA" | "CONCLUIDA" | "CANCELADA";

export async function GET(req: NextRequest) {
  try {
    // sessão e setor do usuário
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const userId = (session.user as any).id as string;
    let setorId: number | null = ((session.user as any)?.setorId as number | null) ?? null;

    if (!setorId) {
      const { data: urow } = await supabaseAdmin
        .from("usuario")
        .select("setorid")
        .eq("id", userId)
        .maybeSingle();
      if (urow?.setorid) setorId = urow.setorid as number;
    }

    if (!setorId) {
      // sem setor: devolve lista vazia mas mantém shape
      return NextResponse.json({ items: [], page: 1, limit: 10, total: 0, totalPages: 1, pageCount: 0 });
    }

    // query params
    const { searchParams } = new URL(req.url);
    const status = (searchParams.get("status") as StatusOS) || "TODAS";
    const q = searchParams.get("q")?.trim() || "";
    const limit = Math.min(Math.max(Number(searchParams.get("limit") ?? 10), 1), 100);
    const page = Math.max(Number(searchParams.get("page") ?? 1), 1);
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // base (IMPORTANTE: inclui prioridade)
    let query = supabaseAdmin
      .from("ordemservico")
      .select(
        `
        id,
        descricao,
        prioridade,
        status,
        dataentrada,
        datasaidaprevista,
        datasaidareal,
        cliente:clienteid ( id, nomerazaosocial ),
        veiculo:veiculoid ( id, placa, modelo, marca ),
        setor:setorid ( id, nome )
      `,
        { count: "exact" }
      )
      .eq("setorid", setorId); // apenas do setor do usuário

    if (status && status !== "TODAS") query = query.eq("status", status);
    if (q) query = query.ilike("descricao", `%${q}%`);

    // ordenação: primeiro por data de entrada (mais antigas primeiro),
    // o destaque de prioridade fica a cargo do client (já faz o "peso").
    const { data, error, count } = await query.order("dataentrada", { ascending: true }).range(from, to);
    if (error) throw error;

    const items = (data ?? []).map((os: any) => ({
      id: os.id as number,
      descricao: (os.descricao as string | null) ?? null,
      prioridade: (os.prioridade as "ALTA" | "NORMAL" | "BAIXA" | null) ?? null,
      status: os.status as Exclude<StatusOS, "TODAS">,
      dataEntrada: (os.dataentrada as string | null) ?? null,
      dataSaidaPrevista: (os.datasaidaprevista as string | null) ?? null,
      dataSaidaReal: (os.datasaidareal as string | null) ?? null,
      cliente: os.cliente ? { id: os.cliente.id as number, nome: os.cliente.nomerazaosocial as string } : null,
      veiculo: os.veiculo
        ? { id: os.veiculo.id as number, placa: os.veiculo.placa as string, modelo: os.veiculo.modelo as string, marca: os.veiculo.marca as string }
        : null,
      setor: os.setor ? { id: os.setor.id as number, nome: os.setor.nome as string } : null,
    }));

    const total = count ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const pageCount = items.length;

    return NextResponse.json({ items, page, limit, total, totalPages, pageCount });
  } catch (err) {
    console.error("GET /api/equipes/ordens", err);
    return NextResponse.json({ error: "Falha ao carregar ordens da equipe" }, { status: 500 });
  }
}
