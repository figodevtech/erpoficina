"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

import { TabelaUsuarios } from "./tabela-usuarios";
import { CriarUsuarioDialog } from "./criar-usuario";
import { EditarUsuarioDialog } from "./editar-usuario";
import { DetalhesUsuarioDialog } from "./detalhes-usuario";

import {
  fetchLookup,
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  type Usuario,
  type Perfil,
  type Setor,
} from "../lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function GerenciamentoUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [perfis, setPerfis] = useState<Perfil[]>([]);
  const [setores, setSetores] = useState<Setor[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // filtros
  const [q, setQ] = useState("");
  const [perfilFiltro, setPerfilFiltro] = useState<string>("ALL"); // 👈 sentinel

  // dialogs
  const [openCriar, setOpenCriar] = useState(false);
  const [openEditar, setOpenEditar] = useState(false);
  const [openDetalhes, setOpenDetalhes] = useState(false);
  const [selected, setSelected] = useState<Usuario | null>(null);

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      setErro(null);
      const [lookup, users] = await Promise.all([fetchLookup(), fetchUsers()]);
      setPerfis(lookup.perfis);
      setSetores(lookup.setores);
      setUsuarios(users);
    } catch (e: any) {
      setErro(e?.message ?? "Falha ao carregar usuários");
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();

    let base = usuarios;

    if (term) {
      base = base.filter((u) => {
        const perfilNome = u.perfil?.nome ?? "";
        const setorNome = u.setor?.nome ?? "";
        return (
          u.nome?.toLowerCase().includes(term) ||
          u.email?.toLowerCase().includes(term) ||
          perfilNome.toLowerCase().includes(term) ||
          setorNome.toLowerCase().includes(term)
        );
      });
    }

    // 👇 aplica filtro só quando for diferente de "ALL"
    if (perfilFiltro !== "ALL") {
      const pid = Number(perfilFiltro);
      base = base.filter((u) => {
        const idNorm = u.perfilid ?? u.perfil?.id ?? null;
        return idNorm === pid;
      });
    }

    return base;
  }, [usuarios, q, perfilFiltro]);

  // ações
  const onNew = () => setOpenCriar(true);

  const onEdit = (u: Usuario) => {
    setSelected(u);
    setOpenEditar(true);
  };

  const onView = (u: Usuario) => {
    setSelected(u);
    setOpenDetalhes(true);
  };

  const onDelete = async (id: string | number) => {
    try {
      await deleteUser(id);
      toast.success("Usuário removido.");
      await loadAll();
    } catch (e: any) {
      toast.error(e?.message ?? "Falha ao remover usuário.");
    }
  };

  // criar/editar
  const handleCreate = async (payload: { nome: string; email: string; perfilid?: number | null; setorid?: number | null }) => {
    try {
      await createUser(payload);
      toast.success("Usuário criado.");
      setOpenCriar(false);
      await loadAll();
    } catch (e: any) {
      toast.error(e?.message ?? "Falha ao criar usuário.");
    }
  };

  const handleUpdate = async (
    id: string | number,
    payload: { nome: string; email: string; perfilid?: number | null; setorid?: number | null }
  ) => {
    try {
      await updateUser(id, payload);
      toast.success("Usuário atualizado.");
      setOpenEditar(false);
      setSelected(null);
      await loadAll();
    } catch (e: any) {
      toast.error(e?.message ?? "Falha ao atualizar usuário.");
    }
  };

  return (
    <>
      {/* Barra: busca + filtro de perfil */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="h-4 w-4 text-muted-foreground absolute left-2 top-1/2 -translate-y-1/2" />
          <Input
            className="pl-8"
            placeholder="Buscar por nome, e-mail, perfil ou setor"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <Select value={perfilFiltro} onValueChange={setPerfilFiltro}>
          <SelectTrigger className="w-[220px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos os perfis</SelectItem>
            {perfis.map((p) => (
              <SelectItem key={p.id} value={String(p.id)}>
                {p.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <TabelaUsuarios
        items={filtered}
        loading={loading}
        error={erro}
        onReload={loadAll}
        onNew={onNew}
        onEdit={onEdit}
        onView={onView}
        onDelete={onDelete}
      />

      {/* Dialogs */}
      <CriarUsuarioDialog
        open={openCriar}
        onOpenChange={setOpenCriar}
        perfis={perfis}
        setores={setores}
        onCreate={handleCreate}
      />

      <EditarUsuarioDialog
        open={openEditar}
        onOpenChange={(v) => {
          setOpenEditar(v);
          if (!v) setSelected(null);
        }}
        usuario={selected}
        perfis={perfis}
        setores={setores}
        onSave={handleUpdate}
      />

      <DetalhesUsuarioDialog
        open={openDetalhes}
        onOpenChange={(v) => {
          setOpenDetalhes(v);
          if (!v) setSelected(null);
        }}
        usuario={selected}
      />
    </>
  );
}
