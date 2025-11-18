"use client";

import { useState } from "react";
import type { Perfil, Setor } from "../lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  perfis: Perfil[];
  setores: Setor[];
  onCreate: (payload: {
    nome: string;
    email: string;
    perfilid?: number | null;
    setorid?: number | null;
    ativo?: boolean;
  }) => void | Promise<void>;
};

export function CriarUsuarioDialog({ open, onOpenChange, perfis, setores, onCreate }: Props) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [perfilid, setPerfilid] = useState<string>("");
  const [setorid, setSetorid] = useState<string>("");
  const [ativo, setAtivo] = useState(true);
  const [saving, setSaving] = useState(false);

  const canSave = nome.trim() && email.trim();

  const handleSave = async () => {
    if (!canSave || saving) return;
    setSaving(true);
    try {
      await onCreate({
        nome: nome.trim(),
        email: email.trim(),
        perfilid: perfilid ? Number(perfilid) : null,
        setorid: setorid ? Number(setorid) : null,
        ativo,
      });
      // limpa
      setNome("");
      setEmail("");
      setPerfilid("");
      setSetorid("");
      setAtivo(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !saving && onOpenChange(v)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo usuário</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nome</Label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome completo" />
          </div>
          <div className="space-y-1.5">
            <Label>E-mail</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@dominio.com" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Perfil</Label>
              <Select value={perfilid} onValueChange={setPerfilid}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
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

            <div className="space-y-1.5">
              <Label>Setor</Label>
              <Select value={setorid} onValueChange={setSetorid}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
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
            
            <div className="space-y-1.5">
              <Label htmlFor="ativo">Ativo</Label>
              <Switch id="ativo" checked={ativo} onCheckedChange={setAtivo} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={!canSave || saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando…
                </>
              ) : (
                "Salvar"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
