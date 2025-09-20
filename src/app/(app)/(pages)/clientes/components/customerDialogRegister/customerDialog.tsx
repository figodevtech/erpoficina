"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import EditContent from "./editContent";
import { Customer } from "../../types";
import RegisterContent from "./registerContent";
import { Children, PropsWithChildren, ReactNode, useEffect, useState } from "react";

interface CustomerDialogProps{
customerId?: number
children?: ReactNode
}


export function CustomerDialog({customerId, children}: CustomerDialogProps ) {
  const [selectedCustomer, setselectedCustomer] = useState<Customer | undefined>(undefined)


  useEffect(()=> {
    if(customerId){
      console.log(customerId)
    }
  },[customerId])
  return (
    <Dialog>
      <DialogTrigger  asChild>
        {children}
      </DialogTrigger>
        {selectedCustomer ? (
          <EditContent 
          selectedCustomer={selectedCustomer}
          setselectedCustomer={setselectedCustomer}
          />

        ): (
          <RegisterContent/>
        )}
    </Dialog>
  );
}
