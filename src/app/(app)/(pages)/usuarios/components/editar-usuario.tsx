"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";

import type { UsuarioExpandido } from "@/types/usuario";
import type { Setor } from "@/types/setor";
import type { Perfil } from "@/types/perfil";
import type { Permissao } from "@/types/permissao";
import type { EnumPermissoes } from "@/types/enum";

interface Props {
  user: UsuarioExpandido | null;
  setores: Setor[];
  perfis: Perfil[];
  permissoes: Permissao[]; // catálogo (todas)
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: UsuarioExpandido & { permissoes?: string[] }) => Promise<boolean>;
}

export function DialogoEditarUsuario({ user, setores, perfis, permissoes, isOpen, onClose, onSave }: Props) {
  const [editingUser, setEditingUser] = useState<UsuarioExpandido | null>(null);
  const [perfilPerms, setPerfilPerms] = useState<EnumPermissoes[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // inicializa estado quando abrir ou mudar usuário
  useEffect(() => {
    if (user && isOpen) {
      setEditingUser({ ...user });
      setPerfilPerms([...(user.permissoes ?? [])]);
      setError(null);
    }
  }, [user, isOpen]);

  const perfisById = useMemo(() => {
    const m = new Map<number, Perfil>();
    for (const p of perfis) m.set(p.id, p);
    return m;
  }, [perfis]);

  // ------- handlers -------
  const togglePerm = (nome: string, checked: boolean) => {
    const value = nome as EnumPermissoes;
    setPerfilPerms((prev) => (checked ? Array.from(new Set([...prev, value])) : prev.filter((n) => n !== value)));
  };

  const handleSave = async () => {
    if (!editingUser) return;
    setError(null);

    // validação simples
    if (!editingUser.nome?.trim()) {
      setError("Informe o nome.");
      return;
    }
    if (!editingUser.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editingUser.email)) {
      setError("E-mail inválido.");
      return;
    }
    if (!editingUser.perfil?.id) {
      setError("Selecione um perfil.");
      return;
    }
    if (!editingUser.setor?.id && !(editingUser as any).setorid && !(editingUser as any).setorId) {
      setError("Selecione um setor.");
      return;
    }

    setSaving(true);
    const ok = await onSave({ ...editingUser, permissoes: perfilPerms });
    setSaving(false);

    if (ok) onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
          <DialogDescription>Atualize dados, perfil e permissões (herdadas do perfil).</DialogDescription>
        </DialogHeader>

        {editingUser ? (
          <Tabs defaultValue="dados">
            <TabsList>
              <TabsTrigger value="dados">Dados</TabsTrigger>
              <TabsTrigger value="permissoes">Permissões do Perfil</TabsTrigger>
            </TabsList>

            {/* Aba: Dados */}
            <TabsContent value="dados" className="space-y-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Nome</Label>
                <Input
                  className="col-span-3"
                  value={editingUser.nome}
                  onChange={(e) => setEditingUser({ ...editingUser, nome: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">E-mail</Label>
                <Input
                  className="col-span-3"
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Perfil</Label>
                <Select
                  value={editingUser.perfil?.id ? String(editingUser.perfil.id) : ""}
                  onValueChange={(val) => {
                    const id = Number(val);
                    const p = perfisById.get(id);
                    if (!p) return;
                    setEditingUser({
                      ...editingUser,
                      perfil: { id: p.id, nome: p.nome },
                    });
                    // opcional: ao trocar de perfil, você pode limpar/redefinir permissões
                    // setPerfilPerms([]);
                  }}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione um perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    {perfis.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Setor</Label>
                <Select
                  value={
                    editingUser.setor?.id
                      ? String(editingUser.setor.id)
                      : (editingUser as any).setorId
                      ? String((editingUser as any).setorId)
                      : (editingUser as any).setorid
                      ? String((editingUser as any).setorid)
                      : ""
                  }
                  onValueChange={(val) => {
                    const id = Number(val);
                    const s = setores.find((x) => x.id === id);
                    if (!s) return;
                    setEditingUser({
                      ...editingUser,
                      setor: { id: s.id, nome: s.nome },
                      // mantemos compat com handlers que leem setorId
                      ...(editingUser as any),
                      setorId: s.id,
                    } as any);
                  }}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione um setor" />
                  </SelectTrigger>
                  <SelectContent>
                    {setores.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            {/* Aba: Permissões do Perfil */}
            <TabsContent value="permissoes" className="space-y-2">
              <p className="text-sm text-muted-foreground">
                As permissões selecionadas serão aplicadas ao <b>perfil</b> deste usuário. Isso impacta todos que usam o
                mesmo perfil.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {permissoes.map((perm) => (
                  <label key={perm.id} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={perfilPerms.includes(perm.nome)}
                      onCheckedChange={(c) => togglePerm(perm.nome, Boolean(c))}
                    />
                    <span>{perm.nome}</span>
                  </label>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-sm text-muted-foreground">Selecione um usuário para editar.</div>
        )}

        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving || !editingUser}>
            {saving ? "Salvando..." : "Salvar alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
