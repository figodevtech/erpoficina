export type Permissao = {
  id: number;
  nome: string;
  descricao?: string | null;
};

export type Perfil = {
  id: number;
  nome: string;
  descricao?: string | null;
  permissoes: Permissao[];
};
