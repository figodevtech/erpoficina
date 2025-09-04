"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Edit } from "lucide-react";
import type { UsuarioExpandido } from "@/types/usuario";

interface Props {
  user: UsuarioExpandido | null;
  onEditUser: (user: UsuarioExpandido) => void;
}

export function PainelDetalhesUsuario({ user, onEditUser }: Props) {
  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Selecione um usuário</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Clique em um usuário na tabela para ver os detalhes.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalhes do Usuário</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-xs text-muted-foreground">Nome</Label>
          <div className="font-medium">{user.nome}</div>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">E-mail</Label>
          <div>{user.email}</div>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">Perfil</Label>
          <div className="mt-1">
            <Badge variant="secondary">{user.perfil?.nome ?? "Sem perfil"}</Badge>
          </div>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">Setor</Label>
          <div className="mt-1">
            {user.setor ? (
              <Badge variant="outline">{user.setor.nome}</Badge>
            ) : (
              <span className="text-muted-foreground text-sm">Sem setor</span>
            )}
          </div>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">Permissões (herdadas do perfil)</Label>
          <div className="flex flex-wrap gap-1 mt-1">
            {(user.permissoes ?? []).length ? (
              user.permissoes!.map((p) => (
                <Badge key={p} variant="outline" className="text-xs">
                  {p}
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground text-sm">Sem permissões</span>
            )}
          </div>
        </div>

        {(user as any).createdAt && (
          <div>
            <Label className="text-xs text-muted-foreground">Criado em</Label>
            <div className="text-sm">
              {new Date((user as any).createdAt).toLocaleString()}
            </div>
          </div>
        )}

        <Button className="w-full" onClick={() => onEditUser(user)}>
          <Edit className="h-4 w-4 mr-2" />
          Editar Usuário
        </Button>
      </CardContent>
    </Card>
  );
}
