// src/app/(app)/(pages)/ordens/components/orcamento/orcamento-dialog.tsx
"use client";

import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { DialogShell } from "../dialogs/dialog-shell";
import { OrcamentoForm } from "./orcamento-form";
import type { OrcamentoFormHandle } from "./tipos";

const money = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v) || 0);

export type OrcamentoDialogProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  osSelecionada: any | null;
  onSalvarOrcamento?: () => void | Promise<void>;
  onGerarLinkAprovacao?: () => void | Promise<void>;
};

export function OrcamentoDialog({
  open,
  onOpenChange,
  osSelecionada,
  onSalvarOrcamento,
}: OrcamentoDialogProps) {
  const formRef = useRef<OrcamentoFormHandle | null>(null);

  const [totalProdutos, setTotalProdutos] = useState(0);
  const [totalServicos, setTotalServicos] = useState(0);
  const totalGeral = totalProdutos + totalServicos;

  const [salvando, setSalvando] = useState(false);
  const [gerandoLink, setGerandoLink] = useState(false);

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

  async function handleSalvar() {
    if (salvando || gerandoLink) return;
    setSalvando(true);
    try {
      if (onSalvarOrcamento) {
        await onSalvarOrcamento();
      } else {
        await formRef.current?.salvarOrcamento();
      }
    } finally {
      setSalvando(false);
    }
  }

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
            <Button
              variant="outline"
              onClick={handleSalvar}
              className="bg-transparent"
              // sempre habilitado; só desabilita durante uma ação
              disabled={salvando || gerandoLink}
            >
              {salvando ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando…
                </>
              ) : (
                "Salvar orçamento"
              )}
            </Button>

           
          </div>
        </div>
      }
    >
      <OrcamentoForm
        ref={formRef}
        ordemServico={ordemServico}
        onTotaisChange={({ totalProdutos, totalServicos }) => {
          setTotalProdutos(totalProdutos || 0);
          setTotalServicos(totalServicos || 0);
        }}
      />
    </DialogShell>
  );
}
