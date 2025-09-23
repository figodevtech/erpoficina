"use client";

import type React from "react";
import { ReactNode, useEffect, useState } from "react";
import axios from "axios";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import EditContent from "./editContent";
import RegisterContent from "./registerContent";
import { Customer } from "../../types";

interface CustomerDialogProps {
  customerId?: number;
  children?: ReactNode;
  isOpen?: boolean;
  setIsOpen?: (value: boolean) => void;
  setSelectedCustomerId?: (value: number | undefined) => void;
}

export function CustomerDialog({
  customerId,
  children,
  isOpen,
  setIsOpen,
  setSelectedCustomerId,
}: CustomerDialogProps) {
  // estado interno caso o componente não seja controlado por props
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isOpen ?? internalOpen;
  const setOpen = setIsOpen ?? setInternalOpen;

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const handleGetCustomer = async (id: number) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/customers/${id}`);
      if (response.status === 200) {
        const { data } = response;
        setSelectedCustomer(data.data);
        // console.log("Cliente carregado:", data.data);
      }
    } catch (error) {
      console.log("Erro ao buscar cliente:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Busca o cliente sempre que o dialog abrir e existir um customerId
  useEffect(() => {
    if (open && customerId) {
      handleGetCustomer(customerId);
    }
  }, [open, customerId]);

  return (
    <Dialog
    
      open={open}
      onOpenChange={(nextOpen) => {
        // sempre sincroniza o estado (controlado ou interno)
        setOpen(nextOpen);

        if (!nextOpen) {
          setSelectedCustomerId?.(undefined);
          setSelectedCustomer(undefined);
        }
      }}
    >
      <DialogTrigger
      autoFocus={false}
      asChild>{children}</DialogTrigger>

        {customerId ? (
          <EditContent customerId={customerId}  />
        ) : (
          <RegisterContent />
        )}
    </Dialog>
  );
}
