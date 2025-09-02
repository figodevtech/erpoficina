"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Carregamento } from "@/components/carregamento";
import Link from "next/link";

interface User {
  id: string;
  email: string;
  nome: string;
  role: string;
  setorId?: number;
  permissoes: string[];
}

export default function AdminUsuarios() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      const { data, error } = await supabase
        .from("Usuario")
        .select("id, email, nome, role, setorId, permissoes:UsuarioPermissao(permissao:Permissao(nome))");

      if (error) {
        console.error("Erro ao buscar usuários:", error);
        setError("Erro ao carregar usuários.");
      } else {
        const formattedUsers = data?.map((user) => ({
          ...user,
          permissoes: user.permissoes.map((p: any) => p.permissao.nome),
        }));
        setUsers(formattedUsers || []);
      }
      setLoading(false);
    }

    fetchUsers();
  }, []);

  if (loading) {
    return <Carregamento />;
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex justify-between items-center">
                <div>
                  <p className="font-bold">{user.nome}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <p className="text-sm">Role: {user.role}</p>
                  <p className="text-sm">Permissões: {user.permissoes.join(", ")}</p>
                </div>
                <Button asChild>
                  <Link href={`/usuarios/editar/${user.id}`}>Editar</Link>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}