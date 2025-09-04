"use client";

import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { UsuarioExpandido } from "@/types/usuario";

interface Props {
  usuarios: UsuarioExpandido[];
  selectedUser: UsuarioExpandido | null;
  onSelectUser: (user: UsuarioExpandido) => void;
  onEditUser: (user: UsuarioExpandido) => void;
  onDeleteUser?: (user: UsuarioExpandido) => void;
}

export function TabelaUsuarios({
  usuarios,
  selectedUser,
  onSelectUser,
  onEditUser,
  onDeleteUser,
}: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>E-mail</TableHead>
          <TableHead>Perfil</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {usuarios.map((user) => {
          const isSelected = selectedUser?.id === user.id;
          return (
            <TableRow
              key={user.id}
              onClick={() => onSelectUser(user)}
              className={isSelected ? "bg-muted/40" : "cursor-pointer"}
            >
              <TableCell className="font-medium">{user.nome}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge variant="secondary">{user.perfil?.nome ?? "Sem perfil"}</Badge>
              </TableCell>
              <TableCell className="text-right space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  title="Editar"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditUser(user);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>

                {onDeleteUser && (
                  <Button
                    variant="ghost"
                    size="sm"
                    title="Remover"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteUser(user);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
