// hooks/useUsuarios.ts
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface Permissao {
  id: number;
  nome: string;
  descricao: string | null;
}

export interface Perfil {
  id: number;
  nome: string;
  descricao: string | null;
  permissoes: Permissao[];
}

export interface Setor {
  id: number;
  nome: string;
}

export interface Usuario {
  id: string;
  email: string;
  nome: string;
  setor?: Setor | null;
  createdat: string;
  updatedat: string;
  perfil?: Perfil | null;
}

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [setores, setSetores] = useState<Setor[]>([]);
  const [permissoes, setPermissoes] = useState<Permissao[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsuarios = async () => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("usuario")
      .select(`
        id,
        email,
        nome,
        setorid,
        createdat,
        updatedat,
        perfil:perfilid (
          id,
          nome,
          descricao,
          perfilpermissao (
            permissao (
              id,
              nome,
              descricao
            )
          )
        ),
        setor (
          id,
          nome
        )
      `);

    if (error) {
      console.error("Erro ao carregar usuários:", error);
      setError("Erro ao carregar usuários");
      setUsuarios([]);
    } else {
      const formatted = data.map((u: any) => ({
        ...u,
        perfil: u.perfil
          ? {
              ...u.perfil,
              permissoes: u.perfil.perfilpermissao?.map(
                (pp: any) => pp.permissao
              ),
            }
          : null,
      }));
      setUsuarios(formatted);
    }

    setLoading(false);
  };

  const fetchSetores = async () => {
    const { data, error } = await supabase.from("setor").select("id, nome");

    if (error) {
      console.error("Erro ao carregar setores:", error);
    } else {
      setSetores(data || []);
    }
  };

  const fetchPermissoes = async () => {
    const { data, error } = await supabase.from("permissao").select("id, nome, descricao");

    if (error) {
      console.error("Erro ao carregar permissões:", error);
    } else {
      setPermissoes(data || []);
    }
  };

  useEffect(() => {
    fetchUsuarios();
    fetchSetores();
    fetchPermissoes();
  }, []);

  const updateUser = async (id: string, updatedData: Partial<Usuario>) => {
    // Remover campos que não devem ser atualizados diretamente (como relacionamentos complexos)
    const { perfil, setor, ...dataToUpdate } = updatedData;
    const updatePayload: any = { ...dataToUpdate };

    if (perfil?.id) {
      updatePayload.perfilid = perfil.id;
    }

    if (setor?.id) {
      updatePayload.setorid = setor.id;
    }

    const { error } = await supabase.from("usuario").update(updatePayload).eq("id", id);

    if (error) {
      console.error("Erro ao atualizar usuário:", error);
      return false;
    }

    fetchUsuarios();
    return true;
  };

  const createUser = async (newUser: Omit<Usuario, "id" | "createdat" | "updatedat"> & { password: string }) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: newUser.email,
      password: newUser.password,
    });

    if (authError || !authData.user) {
      console.error("Erro ao criar usuário no auth:", authError);
      return false;
    }

    const id = authData.user.id;

    const insertPayload: any = {
      id,
      email: newUser.email,
      nome: newUser.nome,
    };

    if (newUser.perfil?.id) {
      insertPayload.perfilid = newUser.perfil.id;
    }

    if (newUser.setor?.id) {
      insertPayload.setorid = newUser.setor.id;
    }

    const { error } = await supabase.from("usuario").insert(insertPayload);

    if (error) {
      console.error("Erro ao inserir usuário na tabela:", error);
      return false;
    }

    fetchUsuarios();
    return true;
  };

  return { usuarios, setores, permissoes, loading, error, updateUser, createUser };
}