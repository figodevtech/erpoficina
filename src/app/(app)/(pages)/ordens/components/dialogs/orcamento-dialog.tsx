"use client";

import { useRef, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { DialogShell } from "./dialog-shell";
import { OrcamentoForm } from "../forms/orcamento-form";

const money = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v) || 0);

export type ProdutosServicosDialogProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  osSelecionada: any | null;
  onGerarOrcamento: () => void | Promise<void>;
  onEnviarFinanceiro: () => void | Promise<void>;
};

export function OrcamentoDialog({
  open,
  onOpenChange,
  osSelecionada,
  onGerarOrcamento,
  onEnviarFinanceiro,
}: ProdutosServicosDialogProps) {
  const submitRef = useRef<null | (() => void)>(null);
  const [totalProdutos, setTotalProdutos] = useState(0);
  const [totalServicos, setTotalServicos] = useState(0);
  const totalGeral = totalProdutos + totalServicos;

  const numero = useMemo(
    () => osSelecionada?.numero ?? (osSelecionada?.id != null ? String(osSelecionada.id) : "—"),
    [osSelecionada]
  );
  const clienteNome = useMemo(
    () => (typeof osSelecionada?.cliente === "string" ? osSelecionada.cliente : osSelecionada?.cliente?.nome ?? ""),
    [osSelecionada]
  );
  const veiculoStr = useMemo(() => {
    const v = osSelecionada?.veiculo;
    if (!v) return "";
    if (typeof v === "string") return v;
    const modelo = v?.modelo ?? "";
    const placa = v?.placa ?? "";
    const sep = modelo && placa ? " • " : "";
    return `${modelo}${sep}${placa}`;
  }, [osSelecionada]);

  const ordemServico = useMemo(
    () => ({ id: osSelecionada?.id ?? 0, numero, cliente: clienteNome || undefined, veiculo: veiculoStr || undefined }),
    [osSelecionada, numero, clienteNome, veiculoStr]
  );

  return (
    <DialogShell
      open={open}
      onOpenChange={onOpenChange}
      title={`Orçamento • OS ${numero}`}
      description={[clienteNome, veiculoStr].filter(Boolean).join(" • ")}
      footer={
        <div className="w-full flex flex-col sm:flex-row gap-3 items-end sm:items-center justify-between">
          <div className="text-right sm:text-left">
            <div className="text-xs sm:text-sm text-muted-foreground">Total Geral</div>
            <div className="text-xl sm:text-2xl font-bold">{money(totalGeral)}</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {money(totalProdutos)} em produtos • {money(totalServicos)} em serviços
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onGerarOrcamento} className="bg-transparent" disabled={totalGeral <= 0}>
              Gerar Orçamento
            </Button>
            <Button onClick={onEnviarFinanceiro} disabled={totalGeral <= 0}>
              Enviar ao Financeiro
            </Button>
          </div>
        </div>
      }
    >
      <OrcamentoForm
        ordemServico={ordemServico}
        onGerarOrcamento={onGerarOrcamento}
        onEnviarFinanceiro={onEnviarFinanceiro}
        onTotaisChange={({ totalProdutos, totalServicos }) => {
          setTotalProdutos(totalProdutos || 0);
          setTotalServicos(totalServicos || 0);
        }}
      />
    </DialogShell>
  );
}
