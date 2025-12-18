"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, LoaderCircle } from "lucide-react";

// Ajuste se já tiver esse tipo em algum lugar do seu projeto:
type ProductStatus = "OK" | "CRITICO" | "BAIXO" | "TODOS";

type Props = {
  search?: string | null;
  status?: ProductStatus;
  chunk?: number; // opcional: para ajustar o bloco no servidor
  className?: string;
  filename?: string; // opcional: força o nome do arquivo
};

export function BotaoExportarProdutos({
  search,
  status = "TODOS",
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
      size="sm"
      variant="outline"
      className={className}
      title="Exportar todos os produtos do filtro atual em Excel"
    >
      {loading ? (
        <>
          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          Exportando...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </>
      )}
    </Button>
  );
}
