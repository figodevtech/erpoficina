"use client";

import type React from "react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import RegisterContent from "./registerContent";
import { ReactNode, useState } from "react";
import { Estoque_status, Produto, Unidade_medida } from "../../types";
import EditContent from "./editContent";

interface ProductDialogProps {
  productId?: number | undefined;
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

  const [, setSelectedProduct] = useState<Produto | undefined>(
    undefined
  );
  const [newProduct, setNewProduct] = useState<Produto>({
    id: 0,
    precovenda: 0,
    status_estoque: Estoque_status.OK,
    unidade: Unidade_medida.UN,
    fornecedor: "DESCONHECIDO",
  });
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        // sempre sincroniza o estado (controlado ou interno)
        setOpen(nextOpen);

        if (!nextOpen) {
          setSelectedProductId?.(undefined);
          setSelectedProduct(undefined);
          setNewProduct({
            id: 0,
            precovenda: 0,
            status_estoque: Estoque_status.OK,
            unidade: Unidade_medida.UN,
            fornecedor: "DESCONHECIDO",
          });
        }
      }}
    >
      <DialogTrigger autoFocus={false} asChild>
        {children}
      </DialogTrigger>
      {productId ? (
        <EditContent productId={productId} />
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
