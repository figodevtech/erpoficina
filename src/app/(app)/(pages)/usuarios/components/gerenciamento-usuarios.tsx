// gerenciamento-usuarios.tsx
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
  buscarListasUsuarios,
  buscarUsuarios,
  criarUsuario,
  atualizarUsuario,
  excluirUsuario,
  enviarConviteUsuario,
  definirSenhaUsuario,
  type Usuario,
  type Perfil,
  type Setor,
} from "../lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function GerenciamentoUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [perfis, setPerfis] = useState<Perfil[]>([]);
  const [setores, setSetores] = useState<Setor[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // filtros
  const [q, setQ] = useState("");
  const [perfilFiltro, setPerfilFiltro] = useState<string>("ALL");

  // dialogs principais
  const [openCriar, setOpenCriar] = useState(false);
  const [openEditar, setOpenEditar] = useState(false);
  const [openDetalhes, setOpenDetalhes] = useState(false);
  const [selected, setSelected] = useState<Usuario | null>(null);

  // dialog de definir senha
  const [openSenha, setOpenSenha] = useState(false);
  const [usuarioSenha, setUsuarioSenha] = useState<Usuario | null>(null);
  const [senha, setSenha] = useState("");
  const [senhaConfirm, setSenhaConfirm] = useState("");
  const [savingSenha, setSavingSenha] = useState(false);

  // dialog de confirmação de exclusão
  const [openExcluir, setOpenExcluir] = useState(false);
  const [usuarioExcluir, setUsuarioExcluir] = useState<Usuario | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      setErro(null);
      const [lookup, users] = await Promise.all([buscarListasUsuarios(), buscarUsuarios()]);
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

  // abre o dialog de confirmação
  const onDelete = (id: string | number) => {
    const alvo = usuarios.find((u) => String(u.id) === String(id)) ?? null;
    if (!alvo) return;
    setUsuarioExcluir(alvo);
    setOpenExcluir(true);
  };

  const confirmarExclusao = async () => {
    if (!usuarioExcluir) return;
    try {
      setExcluindo(true);
      await excluirUsuario(usuarioExcluir.id);
      toast.success("Usuário removido.");
      setOpenExcluir(false);
      setUsuarioExcluir(null);
      await loadAll();
    } catch (e: any) {
      toast.error(e?.message ?? "Falha ao remover usuário.");
    } finally {
      setExcluindo(false);
    }
  };

  // criar/editar
  const handleCreate = async (payload: {
    nome: string;
    email: string;
    perfilid?: number | null;
    setorid?: number | null;
    ativo?: boolean;
  }) => {
    try {
      await criarUsuario(payload);
      toast.success("Usuário criado.");
      setOpenCriar(false);
      await loadAll();
    } catch (e: any) {
      toast.error(e?.message ?? "Falha ao criar usuário.");
    }
  };

  const handleUpdate = async (
    id: string | number,
    payload: { nome: string; email: string; perfilid?: number | null; setorid?: number | null; ativo?: boolean }
  ) => {
    try {
      await atualizarUsuario(id, payload);
      toast.success("Usuário atualizado.");
      setOpenEditar(false);
      setSelected(null);
      await loadAll();
    } catch (e: any) {
      toast.error(e?.message ?? "Falha ao atualizar usuário.");
    }
  };

  // enviar convite
  const handleEnviarConvite = async (u: Usuario) => {
    try {
      await enviarConviteUsuario(u.id);
      toast.success(`Convite enviado para ${u.email}.`);
    } catch (e: any) {
      toast.error(e?.message ?? "Falha ao enviar convite.");
    }
  };

  // abrir dialog de definir senha
  const handleAbrirSenha = (u: Usuario) => {
    setUsuarioSenha(u);
    setSenha("");
    setSenhaConfirm("");
    setOpenSenha(true);
  };

  // salvar senha
  const handleSalvarSenha = async () => {
    if (!usuarioSenha) return;
    const s = senha.trim();
    const c = senhaConfirm.trim();

    if (!s || s.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (s !== c) {
      toast.error("As senhas não conferem.");
      return;
    }

    try {
      setSavingSenha(true);
      await definirSenhaUsuario(usuarioSenha.id, s);
      toast.success("Senha atualizada com sucesso.");
      setOpenSenha(false);
      setUsuarioSenha(null);
      setSenha("");
      setSenhaConfirm("");
    } catch (e: any) {
      toast.error(e?.message ?? "Falha ao definir senha.");
    } finally {
      setSavingSenha(false);
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
        onEnviarConvite={handleEnviarConvite}
        onDefinirSenha={handleAbrirSenha}
      />

      {/* Dialogs de CRUD */}
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

      {/* 🔐 Dialog Definir Senha */}
      <Dialog
        open={openSenha}
        onOpenChange={(v) => {
          setOpenSenha(v);
          if (!v) {
            setUsuarioSenha(null);
            setSenha("");
            setSenhaConfirm("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Definir senha</DialogTitle>
            <DialogDescription>
              {usuarioSenha
                ? `Definir ou redefinir a senha para o usuário ${usuarioSenha.nome} (${usuarioSenha.email}).`
                : "Definir ou redefinir a senha do usuário."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="senha">Nova senha</Label>
              <Input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="senhaConfirm">Confirmar senha</Label>
              <Input
                id="senhaConfirm"
                type="password"
                value={senhaConfirm}
                onChange={(e) => setSenhaConfirm(e.target.value)}
                placeholder="Repita a senha"
              />
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={savingSenha}
              onClick={() => {
                setOpenSenha(false);
              }}
            >
              Cancelar
            </Button>
            <Button type="button" onClick={handleSalvarSenha} disabled={savingSenha}>
              {savingSenha && (
                <span className="mr-2 h-4 w-4 animate-spin border-2 border-t-transparent rounded-full" />
              )}
              Salvar senha
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 🗑️ Dialog Confirmar Exclusão */}
      <Dialog
        open={openExcluir}
        onOpenChange={(v) => {
          setOpenExcluir(v);
          if (!v) {
            setUsuarioExcluir(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir usuário</DialogTitle>
            <DialogDescription>
              {usuarioExcluir
                ? `Tem certeza que deseja excluir o usuário "${usuarioExcluir.nome}"? Esta ação não poderá ser desfeita. O usuário será removido do sistema e não terá mais acesso.`
                : "Esta ação não poderá ser desfeita. O usuário será removido do sistema e não terá mais acesso."}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={excluindo}
              onClick={() => {
                setOpenExcluir(false);
              }}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={excluindo}
              onClick={confirmarExclusao}
            >
              {excluindo && (
                <span className="mr-2 h-4 w-4 animate-spin border-2 border-t-transparent rounded-full" />
              )}
              Excluir usuário
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
