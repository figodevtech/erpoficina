"use client"
import { useState } from "react";
import OsTable from "./components/osTable";
import { Ordem } from "../../ordens/types";

export default function AssistentePagamento (){
    const [ordens, setOrdens] = useState<Ordem[]>([])
    const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });
    const [isLoading, setIsloading] = useState(false)
    const handleGetOrdens = async () => {

    }
    return (

    <div className="p-y-4 space-y-4">
        <OsTable
        isLoading={isLoading}
        handleGetOrdens={handleGetOrdens}
        ordens={ordens}
        pagination={pagination}
        />
    </div>

    )
}