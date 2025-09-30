import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

/** SOMENTE os enums do banco */
type DBChecklistStatus = "PENDENTE" | "OK" | "ALERTA" | "FALHA";

type Payload = {
  setorid: number | null;
  veiculoid: number | null;
  descricao: string | null;
  observacoes: string | null;
  checklistTemplateId: string | null;
  cliente:
    | { id: number }
    | { nome: string; documento: string; telefone?: string | null; email?: string | null };
  checklist: Array<{ item: string; status?: DBChecklistStatus | string | null | undefined }>;
};

function onlyDigits(s: string) {
  return (s || "").replace(/\D+/g, "");
}
function deduzTipoPessoa(documento: string): "FISICA" | "JURIDICA" {
  const d = onlyDigits(documento);
  return d.length === 14 ? "JURIDICA" : "FISICA";
}
/** Valida/normaliza para o enum do banco */
function normStatus(v: unknown): DBChecklistStatus {
  const t = String(v ?? "").trim().toUpperCase();
  if (t === "OK" || t === "ALERTA" || t === "FALHA" || t === "PENDENTE") return t as DBChecklistStatus;
  return "PENDENTE";
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const usuariocriadorid = (session?.user as any)?.id as string | undefined;
    if (!usuariocriadorid) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = (await req.json()) as Payload;

    if (!body?.setorid) {
      return NextResponse.json({ error: "setorid é obrigatório" }, { status: 400 });
    }

    const setorid = Number(body.setorid);
    const veiculoid = body?.veiculoid ? Number(body.veiculoid) : null;
    const checklistModeloId =
      body?.checklistTemplateId && /^\d+$/.test(String(body.checklistTemplateId))
        ? Number(body.checklistTemplateId)
        : null;

    // Resolve cliente (reaproveita por documento; cria se necessário)
    let clienteid: number | null = null;

    if ("id" in body.cliente && typeof body.cliente.id === "number") {
      clienteid = body.cliente.id;
    } else {
      const nome = (body.cliente as any)?.nome?.trim();
      const documento = onlyDigits((body.cliente as any)?.documento || "");
      if (!nome || !documento) {
        return NextResponse.json({ error: "Dados de cliente inválidos" }, { status: 400 });
      }
      const tipopessoa = deduzTipoPessoa(documento);

      const { data: ja, error: eJa } = await supabaseAdmin
        .from("cliente")
        .select("id")
        .eq("cpfcnpj", documento)
        .limit(1)
        .maybeSingle();
      if (eJa) throw eJa;

      if (ja?.id) {
        clienteid = ja.id;
      } else {
        const { data: novo, error: eNovo } = await supabaseAdmin
          .from("cliente")
          .insert({
            tipopessoa,
            cpfcnpj: documento,
            nomerazaosocial: nome,
            email: (body.cliente as any)?.email || null,
            telefone: (body.cliente as any)?.telefone || null,
          })
          .select("id")
          .single();
        if (eNovo) throw eNovo;
        clienteid = novo.id;
      }
    }

    // Cria OS (defaults de status/data no banco)
    const { data: os, error: eOS } = await supabaseAdmin
      .from("ordemservico")
      .insert({
        clienteid,
        veiculoid,
        usuariocriadorid,
        setorid,
        descricao: body.descricao || null,
        observacoes: body.observacoes || null,
        checklist_modelo_id: checklistModeloId,
      })
      .select("id")
      .single();
    if (eOS) throw eOS;
    const osId = os.id as number;

    // Checklist — grava diretamente os enums do banco
    const itens = (Array.isArray(body.checklist) ? body.checklist : [])
      .filter((x) => x?.item && typeof x.item === "string")
      .map((x) => ({
        ordemservicoid: osId,
        item: x.item.trim(),
        status: normStatus(x.status),
        observacao: null,
      }));

    if (itens.length) {
      const { error: eCheck } = await supabaseAdmin.from("checklist").insert(itens);
      if (eCheck) throw eCheck;
    }

    return NextResponse.json({ id: osId }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/ordens/criar", err);
    return NextResponse.json({ error: "Falha ao criar OS" }, { status: 500 });
  }
}
