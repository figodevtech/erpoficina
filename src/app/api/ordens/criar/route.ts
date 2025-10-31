import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

/** SOMENTE os enums do banco */
type DBChecklistStatus = "OK" | "ALERTA" | "FALHA";
type DBAlvo = "VEICULO" | "PECA";
type DBPrioridade = "BAIXA" | "NORMAL" | "ALTA";

type Payload = {
  setorid: number | null;
  veiculoid: number | null; // vínculo direto (opcional)
  descricao: string | null;
  observacoes: string | null;
  checklistTemplateId: string | null;
  prioridade?: DBPrioridade;
  cliente:
    | { id: number }
    | { nome: string; documento: string; telefone?: string | null; email?: string | null };

  alvo?: {
    tipo: DBAlvo;
    veiculo?: {
      placa?: string | null;
      modelo?: string | null;
      marca?: string | null;
      ano?: number | null;
      cor?: string | null;
      kmatual?: number | null;
    };
    peca?: { nome: string; descricao?: string | null };
  };

  checklist: Array<{ item: string; status?: DBChecklistStatus | string | null | undefined }>;
};

function onlyDigits(s: string) {
  return (s || "").replace(/\D+/g, "");
}
function deduzTipoPessoa(documento: string): "FISICA" | "JURIDICA" {
  const d = onlyDigits(documento);
  return d.length === 14 ? "JURIDICA" : "FISICA";
}
function toDbChecklistStatusOrNull(v: unknown): DBChecklistStatus | null {
  const t = String(v ?? "").trim().toUpperCase();
  if (t === "OK" || t === "ALERTA" || t === "FALHA") return t as DBChecklistStatus;
  return null;
}
function normPrioridade(v: any): DBPrioridade {
  const t = String(v ?? "").trim().toUpperCase();
  return t === "BAIXA" || t === "ALTA" ? (t as DBPrioridade) : "NORMAL";
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
    const prioridade = normPrioridade(body.prioridade);

    // ========= Resolve cliente =========
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

    // ========= Resolve alvo (veículo/peça) =========
    let alvo_tipo: DBAlvo = "VEICULO";
    let veiculoid: number | null = body?.veiculoid ? Number(body.veiculoid) : null;
    let pecaid: number | null = null;

    // ids criados nesta chamada (para possível rollback)
    let createdVeiculoId: number | null = null;
    let createdPecaId: number | null = null;

    const alvo = body?.alvo;
    if (!alvo) {
      // Sem alvo explícito: se não houver veiculoid, não sabemos como cumprir constraints
      if (!veiculoid) {
        return NextResponse.json(
          { error: "Informe o 'alvo' (VEICULO/PECA). Quando VEICULO, selecione um veículo ou informe placa, modelo e marca." },
          { status: 400 }
        );
      }
      alvo_tipo = "VEICULO";
    } else if (alvo.tipo === "VEICULO") {
      alvo_tipo = "VEICULO";

      // Se não veio veiculoid, tenta criar usando placa única
      if (!veiculoid) {
        const placa = (alvo.veiculo?.placa || "").trim();
        const modelo = (alvo.veiculo?.modelo || "").trim();
        const marca = (alvo.veiculo?.marca || "").trim();
        // No schema, placa é NOT NULL UNIQUE -> exigimos placa, e sugerimos modelo/marca
        if (!placa) {
          return NextResponse.json(
            { error: "Para alvo VEICULO sem vínculo, informe ao menos a PLACA (modelo/marca recomendados)." },
            { status: 400 }
          );
        }

        // Tenta reaproveitar por placa
        const { data: vExist, error: eFindV } = await supabaseAdmin
          .from("veiculo")
          .select("id, clienteid")
          .eq("placa", placa)
          .maybeSingle();
        if (eFindV) throw eFindV;

        if (vExist?.id) {
          veiculoid = vExist.id;
        } else {
          const { data: vNew, error: eVNew } = await supabaseAdmin
            .from("veiculo")
            .insert({
              clienteid,
              placa,
              modelo: modelo || "—",
              marca: marca || "—",
              ano: alvo.veiculo?.ano ?? null,
              cor: (alvo.veiculo?.cor || null) as any,
              kmatual: alvo.veiculo?.kmatual ?? null,
            })
            .select("id")
            .single();
          if (eVNew) throw eVNew;
          veiculoid = vNew.id;
          createdVeiculoId = vNew.id;
        }
      }
      pecaid = null;
    } else if (alvo.tipo === "PECA") {
      alvo_tipo = "PECA";

      const nome = (alvo.peca?.nome || "").trim();
      if (!nome) {
        return NextResponse.json({ error: "Para alvo PECA, informe o nome da peça." }, { status: 400 });
      }

      const { data: pNew, error: eP } = await supabaseAdmin
        .from("peca")
        .insert({
          clienteid,
          veiculoid: veiculoid || null,
          titulo: nome,
          descricao: (alvo.peca?.descricao || null) as any,
        })
        .select("id")
        .single();
      if (eP) throw eP;

      pecaid = pNew.id;
      createdPecaId = pNew.id;
      veiculoid = null; // para PECA mantemos veiculoid nulo na OS (coerente)
    } else {
      return NextResponse.json({ error: "alvo.tipo inválido" }, { status: 400 });
    }

    // ========= Cria OS =========
    const checklistModeloId =
      body?.checklistTemplateId && /^\d+$/.test(String(body.checklistTemplateId))
        ? Number(body.checklistTemplateId)
        : null;

    const { data: os, error: eOS } = await supabaseAdmin
      .from("ordemservico")
      .insert({
        clienteid,
        veiculoid,               // pode ser null se alvo for PECA
        pecaid,                  // setado se alvo for PECA
        alvo_tipo,               // "VEICULO" | "PECA"
        usuariocriadorid,
        setorid,
        prioridade,
        descricao: body.descricao || null,
        observacoes: body.observacoes || null,
        checklist_modelo_id: checklistModeloId,
      })
      .select("id")
      .single();
    if (eOS) throw eOS;

    const osId = os.id as number;

    // ========= Checklist =========
    const reqItens = Array.isArray(body.checklist) ? body.checklist : [];
    // Se vieram itens, apenas insere os marcados (OK/ALERTA/FALHA).
    const itens = reqItens
      .filter((x) => x?.item && typeof x.item === "string")
      .map((x) => {
        const status = toDbChecklistStatusOrNull(x.status);
        if (!status) return null; // ignorar não marcados
        return {
          ordemservicoid: osId,
          item: String(x.item).trim(),
          status, // enum válido
          observacao: null,
        };
      })
      .filter(Boolean) as Array<{ ordemservicoid: number; item: string; status: DBChecklistStatus; observacao: null }>;

    if (itens.length) {
      const { error: eCheck } = await supabaseAdmin.from("checklist").insert(itens);
      if (eCheck) {
        // compensação: apaga tudo que foi criado nesta chamada
        await supabaseAdmin.from("ordemservico").delete().eq("id", osId);
        if (createdPecaId) await supabaseAdmin.from("peca").delete().eq("id", createdPecaId);
        if (createdVeiculoId) await supabaseAdmin.from("veiculo").delete().eq("id", createdVeiculoId);
        throw eCheck;
      }
    }

    return NextResponse.json({ id: osId }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/ordens/criar", err);
    return NextResponse.json({ error: err?.message || "Falha ao criar OS" }, { status: 500 });
  }
}
