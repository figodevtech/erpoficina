// src/app/(app)/(pages)/ordens/components/orcamento/tipos.ts
export type ProdutoBusca = {
  id: number;
  codigo: string;        // usaremos a referência (referencia) como "código"
  descricao: string;
  precounitario: number; // preço de venda
  estoque: number;
};

export type ServicoBusca = {
  id: number;
  codigo: string;
  descricao: string;
  precohora: number;
};

export type ItemProduto = {
  produtoid: number;
  descricao: string;
  quantidade: number;
  precounitario: number;
  subtotal: number;
};

export type ItemServico = {
  servicoid: number;
  descricao: string;
  quantidade: number;
  precounitario: number;
  subtotal: number;
};

export type OrcamentoFormProps = {
  ordemServico: { id: number; numero?: string; cliente?: string; veiculo?: string };
  onTotaisChange?: (tot: { totalProdutos: number; totalServicos: number }) => void;
};

export type OrcamentoFormHandle = {
  salvarOrcamento: () => Promise<void>;
};
