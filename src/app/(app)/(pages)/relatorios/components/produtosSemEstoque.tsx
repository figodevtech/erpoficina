"use client";
import { Button } from "@/components/ui/button";
import { Boxes, CircleOff } from "lucide-react";

import { useState } from "react";
import { Download, LoaderCircle } from "lucide-react";

// Ajuste se já tiver esse tipo em algum lugar do seu projeto:
type ProductStatus = "OK" | "CRITICO" | "BAIXO" | "TODOS" | "SEM_ESTOQUE";

type Props = {
  search?: string | null;
  status?: ProductStatus;
  chunk?: number; // opcional: para ajustar o bloco no servidor
  className?: string;
  filename?: string; // opcional: força o nome do arquivo
};

export function ProdutosSemEstoque({
  search,
  status = "SEM_ESTOQUE",
  chunk,
  className = "hover:cursor-pointer",
  filename,
}: Props) {
  const [loading, setLoading] = useState(false);
  async function handleExport() {
    try {
      setLoading(true);

      const qp = new URLSearchParams();
      if (search) qp.set("search", search);
      if (status) qp.set("status", status);
      if (chunk) qp.set("chunk", String(chunk));

      const res = await fetch(`/api/products/export?${qp.toString()}`, {
        method: "GET",
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({} as any));
        throw new Error(err?.error || "Falha ao exportar");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const suggested = `produtos_${status || "TODOS"}`;
      const finalName = `${filename || suggested}.xlsx`;

      const a = document.createElement("a");
      a.href = url;
      a.download = finalName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      alert(e.message ?? "Erro ao exportar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
          onClick={handleExport}
      disabled={loading}

      variant="outline"
      className="h-auto hover:cursor-pointer flex-col items-start justify-start gap-2 p-4 text-left hover:bg-accent hover:text-accent-foreground bg-transparent"
    >
      <div className="flex w-full items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-purple-800 not-dark:bg-purple-200">
          <CircleOff />
        </div>
        <span className="flex-1 font-medium">Produtos Sem Estoque </span>
      </div>
      {loading ? (
        <div className="flex flex-row flex-nowrap text-primary text-xs gap-2">

            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            <span>

            Gerando relatório...
            </span>
        </div>
        
      ) : (
        <p className="text-xs text-muted-foreground">
          Itens que precisam de reposição urgente.
        </p>
      )}
    </Button>
  );
}
