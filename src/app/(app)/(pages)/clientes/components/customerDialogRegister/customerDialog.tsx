"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import EditContent from "./editContent";
import { Customer } from "../../types";
import RegisterContent from "./registerContent";
import { useState } from "react";

interface CustomerDialogProps{
customerId?: number
}


export function CustomerDialog({customerId}: CustomerDialogProps) {
  const [selectedCustomer, setselectedCustomer] = useState<Customer | undefined>(undefined)


  return (
    <Dialog>
      <DialogTrigger  asChild>
        <Button className="hover:cursor-pointer">
          <Plus className="h-4 w-4 mr-2" />
          Novo Cliente
        </Button>
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
