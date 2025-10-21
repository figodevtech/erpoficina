// src/app/(app)/(pages)/ordens/components/orcamento/ganchos/use-carrinho-orcamento.ts
import { useCallback, useEffect, useMemo, useState } from "react";
import { ItemProduto, ItemServico, ProdutoBusca, ServicoBusca } from "../tipos";
import { carregarItensDaOSAPI } from "../servicos/api-orcamento";

const toNum = (v: any) => (v === null || v === undefined || isNaN(+v) ? 0 : +v);

export function useCarrinhoOrcamento(
  osId: number | undefined,
  onTotaisChange?: (tot: { totalProdutos: number; totalServicos: number }) => void
) {
  const [itensProduto, setItensProduto] = useState<ItemProduto[]>([]);
  const [itensServico, setItensServico] = useState<ItemServico[]>([]);

  const totalProdutos = useMemo(() => itensProduto.reduce((acc, it) => acc + toNum(it.subtotal), 0), [itensProduto]);
  const totalServicos = useMemo(() => itensServico.reduce((acc, it) => acc + toNum(it.subtotal), 0), [itensServico]);

  useEffect(() => {
    onTotaisChange?.({ totalProdutos, totalServicos });
  }, [totalProdutos, totalServicos, onTotaisChange]);

  const carregarItensDaOS = useCallback(async () => {
    if (!osId) return;
    const { produtos, servicos } = await carregarItensDaOSAPI(osId);
    setItensProduto(produtos);
    setItensServico(servicos);
  }, [osId]);

  const adicionarProduto = (p: ProdutoBusca) => {
    setItensProduto((prev) => {
      const idx = prev.findIndex((x) => x.produtoid === p.id);
      if (idx >= 0) {
        const novo = [...prev];
        const q = novo[idx].quantidade + 1;
        const pu = novo[idx].precounitario || p.precounitario || 0;
        novo[idx] = { ...novo[idx], quantidade: q, precounitario: pu, subtotal: q * pu };
        return novo;
      }
      const pu = toNum(p.precounitario || 0);
      return [...prev, { produtoid: p.id, descricao: p.descricao, quantidade: 1, precounitario: pu, subtotal: pu }];
    });
  };

  const adicionarServico = (s: ServicoBusca) => {
    setItensServico((prev) => {
      const idx = prev.findIndex((x) => x.servicoid === s.id);
      if (idx >= 0) {
        const novo = [...prev];
        const q = novo[idx].quantidade + 1;
        const pu = novo[idx].precounitario || s.precohora || 0;
        novo[idx] = { ...novo[idx], quantidade: q, precounitario: pu, subtotal: q * pu };
        return novo;
      }
      const pu = toNum(s.precohora || 0);
      return [...prev, { servicoid: s.id, descricao: s.descricao, quantidade: 1, precounitario: pu, subtotal: pu }];
    });
  };

  const atualizarProduto = (i: number, patch: Partial<ItemProduto>) => {
    setItensProduto((prev) => {
      const novo = [...prev];
      const base = { ...novo[i], ...patch };
      const q = toNum(base.quantidade || 1);
      const pu = toNum(base.precounitario || 0);
      base.quantidade = q;
      base.precounitario = pu;
      base.subtotal = q * pu;
      novo[i] = base;
      return novo;
    });
  };

  const atualizarServico = (i: number, patch: Partial<ItemServico>) => {
    setItensServico((prev) => {
      const novo = [...prev];
      const base = { ...novo[i], ...patch };
      const q = toNum(base.quantidade || 1);
      const pu = toNum(base.precounitario || 0);
      base.quantidade = q;
      base.precounitario = pu;
      base.subtotal = q * pu;
      novo[i] = base;
      return novo;
    });
  };

  const removerProduto = (i: number) => setItensProduto((prev) => prev.filter((_, idx) => idx !== i));
  const removerServico = (i: number) => setItensServico((prev) => prev.filter((_, idx) => idx !== i));

  return {
    itensProduto,
    itensServico,
    totalProdutos,
    totalServicos,
    carregarItensDaOS,
    adicionarProduto,
    adicionarServico,
    atualizarProduto,
    atualizarServico,
    removerProduto,
    removerServico,
  };
}
