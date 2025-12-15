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
  newProductData?: Produto | undefined;
  handleSearchFornecedor?: () => void;
  /** Chamado depois que o produto for salvo (create ou update) */
  onAfterSaveProduct?: () => void;
}

const initialNewProduct: Produto = {
  id: 0,
  precovenda: 0,
  status_estoque: Estoque_status.OK,
  unidade: Unidade_medida.UN,
  fornecedor: "DESCONHECIDO",
};

export function ProductDialog({
  productId,
  children,
  isOpen,
  setIsOpen,
  setSelectedProductId,
  newProductData,
  handleSearchFornecedor,
  onAfterSaveProduct,
}: ProductDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isOpen ?? internalOpen;
  const setOpen = setIsOpen ?? setInternalOpen;

  const [, setSelectedProduct] = useState<Produto | undefined>(undefined);
  const [newProduct, setNewProduct] = useState<Produto>(initialNewProduct);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        // sempre sincroniza o estado (controlado ou interno)
        setOpen(nextOpen);

        if (newProductData && nextOpen) {
          setNewProduct({
            ...newProductData,
          });
        }

        if (!nextOpen) {
          setSelectedProductId?.(undefined);
          setSelectedProduct(undefined);
          setNewProduct(initialNewProduct);
        }
      }}
    >
      <DialogTrigger autoFocus={false} asChild>
        {children}
      </DialogTrigger>
      {productId ? (
        <EditContent
          productId={productId}
          onAfterSaveProduct={onAfterSaveProduct}
        />
      ) : (
        <RegisterContent
          handleSearchFornecedor={handleSearchFornecedor}
          setSelectedProductId={setSelectedProductId}
          newProduct={newProduct}
          setNewProduct={setNewProduct}
          // se quiser que o "novo produto" também dispare recarregar,
          // pode usar o mesmo callback:
        />
      )}
    </Dialog>
  );
}
