"use client"
import { useState } from "react";
import Cards from "./components/cards";

export default function HistoricoVendas () {
    const [loadingStatusCounter, setStatusCounter] = useState(false)
    const totalVendas = 0
    const statusCounts = {}
return(
        <div className="mx-auto space-y-6">
            <Cards
            loadingStatusCounter={loadingStatusCounter}    
            totalVendas={totalVendas} 
            statusCounts={statusCounts}       
            />
        </div>
)
}