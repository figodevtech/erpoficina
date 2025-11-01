"use client"
import { useEffect, useState } from "react";
import OsTable from "./components/osTable";
import { Ordem, StatusOS } from "../../ordens/types";
import axios from "axios";

export default function AssistentePagamento (){
    const [ordens, setOrdens] = useState<Ordem[]>([])
    const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });
    const [isLoading, setIsLoading] = useState(false)
    const[search, setSearch] = useState("")
    

    const handleGetOrdens = async (
      status: StatusOS,
    pageNumber?: number,
    limit?: number,
    search?: string,
  ) => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/ordens", {
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
        setOrdens(data.items);
        setPagination({...pagination, limit:data.limit, page: data.page, totalPages:data.totalPages, total: data.total});
        console.log("Ordens carregadas:", data.items);
      }
    } catch (error) {
      console.log("Erro ao buscar Ordens:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(()=> {
    handleGetOrdens("PAGAMENTO");
  },[])

    return (

    <div className="p-y-4 space-y-4">
        <OsTable
        search={search}
        isLoading={isLoading}
        handleGetOrdens={handleGetOrdens}
        ordens={ordens}
        pagination={pagination}
        />
    </div>

    )
}