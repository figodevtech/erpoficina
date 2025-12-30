// src/app/(app)/(pages)/ordens/components/orcamento/orcamento-dialog.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Link as LinkIcon } from "lucide-react";
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
  onGerarLinkAprovacao,
}: OrcamentoDialogProps) {
  const formRef = useRef<OrcamentoFormHandle | null>(null);

  const [totalProdutos, setTotalProdutos] = useState(0);
  const [totalServicos, setTotalServicos] = useState(0);
  const totalGeral = totalProdutos + totalServicos;

  const [salvando, setSalvando] = useState(false);
  const [gerandoLink, setGerandoLink] = useState(false);

  // NOVO: loading inicial dos dados do orçamento (itens da OS)
  const [carregandoDados, setCarregandoDados] = useState(false);

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
    () => ({
      id: osSelecionada?.id ?? 0,
      numero,
      cliente: clienteNome || undefined,
      veiculo: veiculoStr || undefined,
    }),
    [osSelecionada, numero, clienteNome, veiculoStr]
  );

  // Ao abrir/trocar OS, assume "carregando" até o form avisar que terminou
  useEffect(() => {
    if (!open) return;
    if (!ordemServico.id) return;
    setCarregandoDados(true);
  }, [open, ordemServico.id]);

  const busy = salvando || gerandoLink || carregandoDados;

  async function handleSalvar() {
    if (busy) return;
    setSalvando(true);
    try {
      if (onSalvarOrcamento) {
        await onSalvarOrcamento(); // importante: se falhar, deve dar throw para NÃO fechar
      } else {
        await formRef.current?.salvarOrcamento(); // com a mudança abaixo, dá throw em erro
      }

      onOpenChange(false); // fecha ao salvar com sucesso
    } finally {
      setSalvando(false);
    }
  }

  async function handleGerarLink() {
    if (!onGerarLinkAprovacao) return;
    if (busy) return;

    setGerandoLink(true);
    try {
      // salva antes de gerar link
      if (onSalvarOrcamento) {
        await onSalvarOrcamento();
      } else {
        await formRef.current?.salvarOrcamento();
      }

      await onGerarLinkAprovacao();
      // opcional: pode fechar aqui também, se quiser:
      // onOpenChange(false);
    } finally {
      setGerandoLink(false);
    }
  }

  return (
    <DialogShell
      open={open}
      onOpenChange={(v) => {
        if (busy) return; // impede fechar enquanto carrega/salva/gera link
        onOpenChange(v);
      }}
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
            <Button variant="outline" onClick={handleSalvar} className="bg-transparent" disabled={busy}>
              {salvando ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando…
                </>
              ) : (
                "Salvar orçamento"
              )}
            </Button>

            {onGerarLinkAprovacao && (
              <Button onClick={handleGerarLink} disabled={busy}>
                {gerandoLink ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando link…
                  </>
                ) : (
                  <>
                    <LinkIcon className="mr-2 h-4 w-4" />
                    Salvar & gerar link
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="relative">
        {(carregandoDados || salvando || gerandoLink) && (
          <div className="flex items-center justify-center bg-background/70">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {salvando ? "Salvando orçamento..." : "Carregando orçamento..."}
              </span>
            </div>
          </div>
        )}

        <OrcamentoForm
          ref={formRef}
          ordemServico={ordemServico}
          onLoadingChange={setCarregandoDados}
          onTotaisChange={({ totalProdutos, totalServicos }) => {
            setTotalProdutos(totalProdutos || 0);
            setTotalServicos(totalServicos || 0);
          }}
        />
      </div>
    </DialogShell>
  );
}
