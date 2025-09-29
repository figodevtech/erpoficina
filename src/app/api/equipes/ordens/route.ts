import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type StatusOS = "TODAS" | "ABERTA" | "EM_ANDAMENTO" | "AGUARDANDO_PECA" | "CONCLUIDA" | "CANCELADA";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // 1) Descobre setor do usuário (sessão -> fallback no banco)
    const userId = (session.user as any).id as string;
    let setorId: number | null =
      ((session.user as any)?.setorId as number | null) ?? null;

    if (!setorId) {
      const { data: urow, error: uerr } = await supabaseAdmin
        .from("usuario")
        .select("setorid")
        .eq("id", userId)
        .maybeSingle();
      if (!uerr && urow?.setorid) {
        setorId = urow.setorid as number;
      }
    }

    // Se não tiver setor, não quebra a UI: devolve lista vazia
    if (!setorId) {
      return NextResponse.json({ items: [], total: 0, totalPages: 1 });
    }

    // 2) Lê query params
    const { searchParams } = new URL(req.url);
    const status = (searchParams.get("status") as StatusOS) || "TODAS";
    const q = searchParams.get("q")?.trim() || "";
    const page = Math.max(1, Number(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || "10")));
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // 3) Monta query base
    let query = supabaseAdmin
      .from("ordemservico")
      .select(
        `
        id,
        descricao,
        status,
        dataentrada,
        datasaidaprevista,
        datasaidareal,
        cliente:clienteid (
          id,
          nomerazaosocial
        ),
        veiculo:veiculoid (
          id,
          placa,
          modelo,
          marca
        ),
        setor:setorid (
          id,
          nome
        )
        `,
        { count: "exact" }
      )
      .eq("setorid", setorId);

    if (status && status !== "TODAS") {
      query = query.eq("status", status);
    }
    if (q) {
      // busca simples na descrição; (se quiser incluir cliente/veículo, criamos uma view depois)
      query = query.ilike("descricao", `%${q}%`);
    }

    const { data, error, count } = await query
      .order("id", { ascending: false })
      .range(from, to);

    if (error) throw error;

    const items = (data ?? []).map((os: any) => ({
      id: os.id as number,
      descricao: (os.descricao as string | null) ?? null,
      status: os.status as Exclude<StatusOS, "TODAS">,
      dataEntrada: (os.dataentrada as string | null) ?? null,
      dataSaidaPrevista: (os.datasaidaprevista as string | null) ?? null,
      dataSaidaReal: (os.datasaidareal as string | null) ?? null,
      cliente: os.cliente
        ? { id: (os.cliente as any).id as number, nome: (os.cliente as any).nomerazaosocial as string }
        : null,
      veiculo: os.veiculo
        ? {
            id: (os.veiculo as any).id as number,
            placa: (os.veiculo as any).placa as string,
            modelo: (os.veiculo as any).modelo as string,
            marca: (os.veiculo as any).marca as string,
          }
        : null,
      setor: os.setor ? { id: (os.setor as any).id as number, nome: (os.setor as any).nome as string } : null,
    }));

    const total = count ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    return NextResponse.json({ items, total, totalPages });
  } catch (err) {
    console.error("GET /api/equipes/ordens", err);
    return NextResponse.json({ error: "Falha ao carregar ordens da equipe" }, { status: 500 });
  }
}
