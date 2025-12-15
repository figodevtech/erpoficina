"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, XCircle } from "lucide-react";

type Props = {
  nfeId: number;
  status: string;
  /**
   * Callback opcional pra o componente pai (EmissaoNotaDialog)
   * recarregar a lista de NF-e sem dar reload na página toda.
   */
  onAfterCancel?: () => void;
};

export function CancelarNfeButton({ nfeId, status, onAfterCancel }: Props) {
  const [loading, setLoading] = useState(false);

  const statusUpper = (status || "").toUpperCase();
  const disabled = statusUpper !== "AUTORIZADA" || loading;

  async function handleClick() {
    if (statusUpper !== "AUTORIZADA") {
      toast.error("Apenas NF-e AUTORIZADA pode ser cancelada.");
      return;
    }

    const justificativa = window.prompt(
      "Digite a justificativa do cancelamento (mínimo 15 caracteres):"
    );

    if (justificativa == null) return;

    const just = justificativa.trim();
    if (just.length < 15) {
      toast.error("Justificativa deve ter pelo menos 15 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/nfe/cancelar/${nfeId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ justificativa: just }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        const msg =
          data?.message ||
          data?.mensagem ||
          data?.evento?.retorno?.xMotivo ||
          "Falha ao cancelar a NF-e.";
        toast.error(msg);
        return;
      }

      toast.success(
        data.evento?.retorno?.xMotivo ||
          "NF-e cancelada com sucesso."
      );

      if (onAfterCancel) {
        onAfterCancel();
      }
    } catch (e: any) {
      console.error("[CancelarNfeButton] erro inesperado:", e);
      toast.error("Erro inesperado ao cancelar a NF-e.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      size="sm"
      onClick={handleClick}
      disabled={disabled}
      className="size-full flex items-center gap-1 text-xs justify-start px-0 rounded-sm py-2 hover:cursor-pointer not-dark:text-gray-800 bg-red-500/20 hover:bg-red-900 group hover:text-white transition-all"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Cancelando...
        </>
      ) : (
        <>
          <XCircle className="h-4 w-4" />
          Cancelar NF-e
        </>
      )}
    </Button>
  );
}
