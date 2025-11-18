"use client";
"use cliente";
import { useEffect, useState } from "react";
import Cards from "./components/cards";
import axios from "axios";
import { VendaStatusMetricsData } from "./types";

function formatMonthFromDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // 0-11 -> 1-12
  return `${year}-${month}`;
}
export default function HistoricoVendas() {
  const [loadingStatusCounter, setLoadingStatusCounter] = useState(false);
  const totalVendas = 0;
  const [data, setData] = useState<VendaStatusMetricsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const date = new Date(); // hoje
  const month = formatMonthFromDate(date);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        setLoadingStatusCounter(true);

        const url = month
          ? `/api/venda/status-counter?month=${month}`
          : `/api/venda/status-counter`;

        const res = await axios.get(url);

        setData(res.data.data); // o payload vem como {data: {...}}
      } catch (err: any) {
        
      } finally {
        setLoadingStatusCounter(false);
      }
    }

    fetchMetrics();
  }, [ ,month]);

  return (
    <div className="mx-auto space-y-6">
      <Cards
        loadingStatusCounter={loadingStatusCounter}
        totalVendas={totalVendas}
        statusCounts={data}
      />
    </div>
  );
}
