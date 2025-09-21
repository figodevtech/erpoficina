"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import EditContent from "./editContent";
import { Customer } from "../../types";
import RegisterContent from "./registerContent";
import { Children, PropsWithChildren, ReactNode, useEffect, useState } from "react";
import axios from "axios";

interface CustomerDialogProps{
customerId?: number
children?: ReactNode
}


export function CustomerDialog({customerId, children}: CustomerDialogProps ) {
  const [selectedCustomer, setselectedCustomer] = useState<Customer | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false);


  useEffect(()=> {
    if(customerId){
      console.log(customerId)
    }
  },[customerId])


  const handleGetCustomer = async (
    customerId: number
  ) => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/customers/" + customerId);
      
      if (response.status === 200) {
        // console.log(response)
        const { data } = response;
        setselectedCustomer(data.data);
        console.log("Cliente carregados:", data.data);
      }
    } catch (error) {
      console.log("Erro ao buscar clientes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(()=> {
    if(customerId){

      handleGetCustomer(customerId);
    }
  },[])

  return (
    <Dialog>
      <DialogTrigger  asChild>
        {children}
      </DialogTrigger>
    
        {customerId ? (
          <EditContent 
          customerId={customerId}
          />

        ): (
          <RegisterContent/>
        )}
    </Dialog>
  );
}
