"use client"
import { useEffect, useState } from "react";
import OsTable from "./components/vendasTable";
import { Ordem, StatusOS } from "../../ordens/types";
import axios from "axios";
import { VendaComItens } from "../../historicovendas/types";
import VendasTable from "./components/vendasTable";

export default function AssistentePagamentoVendas (){
    const [vendas, setVendas] = useState<VendaComItens[]>([])
    const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });
    const [isLoading, setIsLoading] = useState(false)
    const[search, ] = useState("")
    const [msg, setMsg] = useState("")
    

    const handleGetVendas = async (
      status: StatusOS,
    pageNumber?: number,
    limit?: number,
    search?: string,
  ) => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/venda", {
        params: {
          page: pageNumber || 1,
          limit: limit || pagination.limit,
          q: search || "",
          status: status,
        },
      });
      if (response.status === 200) {
        // console.log(response)
        console.log(response)
        const { data } = response;
        setVendas(data.items);
        setPagination({...pagination, limit:data.limit, page: data.page, totalPages:data.totalPages, total: data.total});
        console.log("Vendas carregadas:", data.items);
      }
    } catch (error) {
      console.log("Erro ao buscar vendas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(()=> {
    handleGetVendas("PAGAMENTO");
  },[])

    return (

    <div className="p-y-4 space-y-4">
        <VendasTable
        search={search}
        isLoading={isLoading}
        handleGetVendas={handleGetVendas}
        vendas={vendas}
        pagination={pagination}
        />
    </div>

    )
}