"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Setor } from "@/types/setor";
import type { Perfil } from "@/types/perfil";

interface Props {
  setores: Setor[];
  perfis: Perfil[];
  onCreateUser: (payload: {
    nome: string;
    email: string;
    perfilId?: number;   // preferido
    perfilNome?: string; // alternativa
    setorId?: number;
  }) => Promise<boolean>;
}

export function DialogoCriarUsuario({ setores, perfis, onCreateUser }: Props) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [perfilId, setPerfilId] = useState<number | undefined>(undefined);
  const [setorId, setSetorId] = useState<number | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setNome("");
    setEmail("");
    setPerfilId(undefined);
    setSetorId(undefined);
    setError(null);
  };

  const handleCreate = async () => {
    setError(null);

    if (!nome.trim() || !email.trim() || !perfilId || !setorId) {
      setError("Preencha nome, e-mail, perfil e setor.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("E-mail inválido.");
      return;
    }

    setSaving(true);
    const ok = await onCreateUser({
      nome: nome.trim(),
      email: email.trim().toLowerCase(),
      perfilId,
      setorId,
    });
    setSaving(false);

    if (ok) {
      reset();
      setOpen(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (saving) return;     // evita fechar/abrir no meio do save
        setOpen(v);             // <-- agora abre e fecha
        if (!v) reset();        // limpa ao fechar
      }}
    >
      <DialogTrigger asChild>
        <Button>Novo Usuário</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Usuário</DialogTitle>
          <DialogDescription>Crie um usuário vinculando um perfil e um setor.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Nome</Label>
            <Input
              className="col-span-3"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome completo"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">E-mail</Label>
            <Input
              className="col-span-3"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemplo.com"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Perfil</Label>
            <Select
              value={perfilId ? String(perfilId) : ""}
              onValueChange={(v) => setPerfilId(Number(v))}
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
              value={setorId ? String(setorId) : ""}
              onValueChange={(v) => setSetorId(Number(v))}
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

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleCreate} disabled={saving}>
            {saving ? "Criando..." : "Criar Usuário"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
