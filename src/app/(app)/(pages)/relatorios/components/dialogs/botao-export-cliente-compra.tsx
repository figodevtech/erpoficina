"use client";

import axios from "axios";
import React, { useState } from "react";

type FiltrosExport = {
  q?: string;
  status?: string;
  clienteId?: number;
  dateFrom?: string; // "YYYY-MM-DD"
  dateTo?: string;   // "YYYY-MM-DD"
  chunk?: number;
};

function buildQuery(params: FiltrosExport) {
  const sp = new URLSearchParams();

  if (params.q) sp.set("q", params.q);
  if (params.status) sp.set("status", params.status);
  if (params.clienteId != null) sp.set("clienteId", String(params.clienteId));
  if (params.dateFrom) sp.set("dateFrom", params.dateFrom);
  if (params.dateTo) sp.set("dateTo", params.dateTo);
  if (params.chunk != null) sp.set("chunk", String(params.chunk));

  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

function getFilenameFromDisposition(disposition?: string) {
  // Content-Disposition: attachment; filename="arquivo.xlsx"
  if (!disposition) return null;
  const match = disposition.match(/filename\*?=(?:UTF-8''|")?([^";\n]+)"/i) || disposition.match(/filename=([^;\n]+)/i);
  if (!match?.[1]) return null;
  return decodeURIComponent(match[1].replace(/"/g, "").trim());
}

export function BotaoExportHistoricoCompras() {
  const [loading, setLoading] = useState(false);

  // exemplo: você pode receber isso via props ou do seu state/filtros
  const filtros: FiltrosExport = {
    q: "",
    status: "",         // ex: "PAGO" / "ABERTO" etc (seu enum_status_venda)
    clienteId: undefined,
    dateFrom: undefined, // "2025-12-01"
    dateTo: undefined,   // "2025-12-21"
    chunk: 1000,
  };

  async function handleExport() {
    try {
      setLoading(true);

      const url =
        "/api/sales/purchase-history/export" + buildQuery(filtros);

      const res = await axios.get(url, {
        responseType: "blob", // importante pro Excel
      });

      const contentDisposition =
        res.headers["content-disposition"] || res.headers["Content-Disposition"];
      const filename =
        getFilenameFromDisposition(contentDisposition) ||
        `historico_compras_vendas_${new Date().toISOString().replace(/[:.]/g, "-")}.xlsx`;

      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(href);
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.error ?? "Falha ao exportar histórico de compras.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={loading}
      style={{
        padding: "10px 14px",
        borderRadius: 10,
        border: "1px solid #ddd",
        background: loading ? "#f3f3f3" : "white",
        cursor: loading ? "not-allowed" : "pointer",
      }}
    >
      {loading ? "Exportando..." : "Exportar histórico de compras (XLSX)"}
    </button>
  );
}
