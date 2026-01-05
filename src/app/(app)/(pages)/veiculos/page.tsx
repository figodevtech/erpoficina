"use client";

import { useEffect, useState } from "react";
import { Pagination, Veiculo } from "./types";
import axios from "axios";
import TabelaVeiculos from "./tabela-veiculos";


export default function EstoquePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });
  const [search, setSearch] = useState("");
  const [selectedTipo, setSelectedTipo] = useState<string | undefined>(undefined);

const handleGetVehicles = async (pageNumber?: number, limit?: number, search?: string, tipo?: string) => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/veiculos", {
        params: {
          page: pageNumber,
          limit,
          search,
          tipo
        },
      })
      setVeiculos(response.data.data);
    } catch (error) {
      
    }finally{
      setIsLoading(false);
    }  
  }
  
  useEffect(() => {
    handleGetVehicles(1, pagination.limit, search, selectedTipo);
  }, [search]);

  useEffect(() => {
    handleGetVehicles(1, pagination.limit, search);
  }, []);


  return (
    <div className="mx-auto space-y-6">
      {/* ✅ Header local removido (há um header global) */}
      

      <TabelaVeiculos
        handleGetVehicles={handleGetVehicles}
        isLoading={isLoading}
        veiculos={veiculos}
        pagination={pagination}
        search={search}
      />
    </div>
  );
}
