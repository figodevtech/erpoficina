"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Package } from "lucide-react";
import RegisterContent from "./registerContent";
import { ReactNode, useState } from "react";
import { Estoque_status, Produto, Unidade_medida } from "../types";

interface ProductDialogProps {
  productId?: number;
  children?: ReactNode;
  isOpen?: boolean;
  setIsOpen?: (value: boolean) => void;
  setSelectedProductId?: (value: number | undefined) => void;
}

export function ProductDialog({
  productId,
  children,
  isOpen,
  setIsOpen,
  setSelectedProductId,
}: ProductDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isOpen ?? internalOpen;
  const setOpen = setIsOpen ?? setInternalOpen;

  const [selectedProduct, setSelectedProduct] = useState<Produto | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState(false);
  const [newProduct, setNewProduct] = useState<Produto>({
    id: 0,
    precovenda: 0,
    status_estoque: Estoque_status.OK,
    unidade: Unidade_medida.UN,
  });
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      {productId ? (
        <></>
      ) : (
        <RegisterContent
          setSelectedProductId={setSelectedProductId}
          newProduct={newProduct}
          setNewProduct={setNewProduct}
        />
      )}
    </Dialog>
  );
}
