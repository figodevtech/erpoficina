import { supabase } from "@/lib/supabase"

export interface Usuario {
  id: string
  email: string
  nome: string
  role: string
  setorId?: number
  setor?: string
  status: string
  createdAt: string
  permissoes: string[]
  sessaoAtiva?: boolean
}

export async function getUsuarios(): Promise<Usuario[]> {
  const { data, error } = await supabase
    .from("Usuario")
    .select(`
      id,
      email,
      nome,
      role,
      setorId,
      status,
      createdAt,
      UsuarioPermissao (
        Permissao ( nome )
      ),
      Setor ( nome )
    `)

  if (error) {
    console.error("Erro ao buscar usuários:", error.message)
    throw new Error("Erro ao carregar usuários")
  }

  return (
    data?.map((u: any) => ({
      id: u.id,
      email: u.email,
      nome: u.nome,
      role: u.role,
      setorId: u.setorId,
      setor: u.Setor?.nome ?? "",
      status: u.status ?? "ATIVO",
      createdAt: u.createdAt,
      permissoes: u.UsuarioPermissao?.map((p: any) => p.Permissao?.nome) || [],
      sessaoAtiva: false, // ajustar quando implementar sessões
    })) || []
  )
}

export async function updateUsuario(id: string, payload: Partial<Usuario>) {
  const { error } = await supabase.from("Usuario").update(payload).eq("id", id)
  if (error) {
    console.error("Erro ao atualizar usuário:", error.message)
    throw new Error("Erro ao atualizar usuário")
  }
}

export async function createUsuario(payload: Partial<Usuario>) {
  const { error } = await supabase.from("Usuario").insert(payload)
  if (error) {
    console.error("Erro ao criar usuário:", error.message)
    throw new Error("Erro ao criar usuário")
  }
}

export async function toggleStatus(id: string, status: string) {
  const novoStatus = status === "ATIVO" ? "BLOQUEADO" : "ATIVO"
  return updateUsuario(id, { status: novoStatus })
}
