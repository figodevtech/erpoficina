"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

import type { UsuarioExpandido } from "@/types/usuario";
import type { Setor } from "@/types/setor";
import type { Perfil } from "@/types/perfil";
import type { Permissao } from "@/types/permissao";
import type { EnumPermissoes } from "@/types/enum";

import { TabelaUsuarios } from "./tabela-usuarios";
import { DialogoCriarUsuario } from "./criar-usuario";
import { DialogoEditarUsuario } from "./editar-usuario";
import { PainelDetalhesUsuario } from "./detalhes-usuario";

export default function PaginaGerenciamentoUsuarios() {
  const [usuarios, setUsuarios] = useState<UsuarioExpandido[]>([]);
  const [setores, setSetores] = useState<Setor[]>([]);
  const [perfis, setPerfis] = useState<Perfil[]>([]);
  const [permissoes, setPermissoes] = useState<Permissao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedUser, setSelectedUser] = useState<UsuarioExpandido | null>(null);
  const [editingUser, setEditingUser] = useState<UsuarioExpandido | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const loadAuxLists = useCallback(async () => {
    const res = await fetch("/api/users/lookup", { cache: "no-store" });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error || "Falha ao carregar listas auxiliares");
    setSetores(json.setores as Setor[]);
    setPermissoes(json.permissoes as Permissao[]);
    setPerfis(json.perfis as Perfil[]);
  }, []);

  const loadUsers = useCallback(async () => {
    const res = await fetch("/api/users", { cache: "no-store" });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error || "Falha ao carregar usuários");
    setUsuarios(json.users as UsuarioExpandido[]);
  }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([loadUsers(), loadAuxLists()]);
    } catch (e: any) {
      setError(e.message ?? "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }, [loadUsers, loadAuxLists]);

  useEffect(() => { reload(); }, [reload]);

  const filteredUsers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return usuarios;
    return usuarios.filter((u) => {
      const perfilNome = u.perfil?.nome ?? "";
      const setorNome = u.setor?.nome ?? "";
      return (
        u.nome.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        perfilNome.toLowerCase().includes(q) ||
        setorNome.toLowerCase().includes(q)
      );
    });
  }, [usuarios, searchTerm]);

  const handleCreateUser = useCallback(
    async (payload: { nome: string; email: string; perfilId?: number; perfilNome?: string; setorId?: number }) => {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) { setError(json?.error || "Erro ao criar usuário"); return false; }
      setUsuarios(json.users);
      return true;
    },
    []
  );

  const handleEditUser = (user: UsuarioExpandido) => {
    setEditingUser(user);
    setIsEditOpen(true);
  };

  const handleSaveUser = useCallback(
    async (updated: UsuarioExpandido & { permissoes?: EnumPermissoes[] }) => {
      const setorId = updated.setor?.id ?? updated.setorId ?? updated.setorid ?? null;
      const body: any = {
        nome: updated.nome,
        email: updated.email,
        setorId,
        permissoes: updated.permissoes ?? [],
      };
      if (updated.perfil?.id) body.perfilId = updated.perfil.id;
      else if (updated.perfil?.nome) body.perfilNome = updated.perfil.nome;

      const res = await fetch(`/api/users/${updated.id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) { setError(json?.error || "Erro ao salvar usuário"); return false; }
      setUsuarios(json.users);
      return true;
    },
    []
  );

  const handleDeleteUser = useCallback(async (user: UsuarioExpandido) => {
    if (!confirm(`Remover ${user.nome}? Essa ação não pode ser desfeita.`)) return false;
    const res = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) { setError(json?.error || "Erro ao remover usuário"); return false; }
    setUsuarios(json.users);
    if (selectedUser?.id === user.id) setSelectedUser(null);
    return true;
  }, [selectedUser]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Usuários</CardTitle>
            <CardDescription>Gerencie usuários, perfis e permissões (herdadas do perfil).</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 mb-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, e-mail, perfil ou setor"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <DialogoCriarUsuario
                setores={setores}
                perfis={perfis}
                onCreateUser={async ({ nome, email, perfilId, perfilNome, setorId }) => {
                  const ok = await handleCreateUser({ nome, email, perfilId, perfilNome, setorId });
                  if (ok) setSelectedUser(null);
                  return ok;
                }}
              />
              <Button variant="outline" onClick={reload} disabled={loading}>Atualizar</Button>
            </div>

            {error && <div className="text-sm text-red-500 mb-2">{error}</div>}
            {loading ? (
              <div className="text-sm text-muted-foreground">Carregando…</div>
            ) : (
              <TabelaUsuarios
                usuarios={filteredUsers}
                selectedUser={selectedUser}
                onSelectUser={setSelectedUser}
                onEditUser={handleEditUser}
                onDeleteUser={handleDeleteUser}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="md:col-span-1">
        <PainelDetalhesUsuario user={selectedUser} onEditUser={handleEditUser} />
      </div>

      <DialogoEditarUsuario
        user={editingUser}
        setores={setores}
        perfis={perfis}
        permissoes={permissoes}
        isOpen={isEditOpen}
        onClose={() => { setIsEditOpen(false); setEditingUser(null); }}
        onSave={async (user) => {
          const ok = await handleSaveUser(user);
          if (ok) { setIsEditOpen(false); setEditingUser(null); }
          return ok;
        }}
      />
    </div>
  );
}
