"use client";

import type { Usuario } from "../lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  usuario: Usuario | null;
};

export function DetalhesUsuarioDialog({ open, onOpenChange, usuario }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Detalhes do usuário</DialogTitle>
          <DialogDescription>Informações básicas do usuário selecionado.</DialogDescription>
        </DialogHeader>

        {!usuario ? (
          <div className="text-sm text-muted-foreground">Selecione um usuário para visualizar.</div>
        ) : (
          <div className="space-y-3 text-sm">
            <div>
              <div className="text-[11px] uppercase text-muted-foreground">Nome</div>
              <div className="font-medium">{usuario.nome}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase text-muted-foreground">E-mail</div>
              <div className="font-medium break-words">{usuario.email}</div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <div className="text-[11px] uppercase text-muted-foreground">Perfil</div>
                <div>{usuario.perfil ? <Badge variant="outline">{usuario.perfil.nome}</Badge> : "—"}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase text-muted-foreground">Setor</div>
                <div>{usuario.setor ? <Badge variant="secondary">{usuario.setor.nome}</Badge> : "—"}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase text-muted-foreground">Status</div>
                <div>
                  {usuario.ativo ? (
                    <Badge variant="default">Ativo</Badge>
                  ) : (
                    <Badge variant="destructive">Inativo</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
