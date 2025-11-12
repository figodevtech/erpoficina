"use client";

import { useState } from "react";
import { Status } from "../types";
import { Button } from "@/components/ui/button";
import { Download, LoaderCircle } from "lucide-react";

type Props = {
  search?: string | null;
  status?: Status;
};

export function ExportCustomersButton({ search, status }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    try {
      setLoading(true);

      const qp = new URLSearchParams();
      if (search) qp.set("search", search);
      if (status) qp.set("status", status);
      // opcional: ajustar o tamanho do chunk via query
      // qp.set("chunk", "2000");

      const res = await fetch(`/api/customers/export?${qp.toString()}`, {
        method: "GET",
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({} as any));
        throw new Error(err?.error || "Falha ao exportar");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `clientes_${status || "TODOS"}.xlsx`;
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
      size={"sm"}
      variant={"outline"}
      className="hover:cursor-pointer"
      title="Exportar todos os clientes do filtro atual em Excel"
    >
      {loading ? (<>
      
        <LoaderCircle className="mr-2 h-4 w-4 animate-spin"/>  Exportando...
      </>
      ) : (
      <>
      <Download className="mr-2 h-4 w-4" /> Exportar
      </>
      )}
    </Button>
  );
}
