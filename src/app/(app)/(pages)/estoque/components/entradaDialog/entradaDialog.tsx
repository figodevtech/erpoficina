import { useIsMobile } from "@/app/(app)/hooks/use-mobile";
import { Button } from "@/components/ui/button";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Paperclip } from "lucide-react";
import { useState } from "react";
import ValueInput from "../productDialog/valueInput";

interface EntradaDialogProps {
  children?: React.ReactNode;
  isOpen?: boolean;
  setIsOpen?: (value: boolean) => void;
  productId: number;
  productDescription: string;
  currentQuantity: number;
}

export default function EntradaDialog({
  children,
  isOpen,
  setIsOpen,
  productId,
  currentQuantity,
  productDescription,
}: EntradaDialogProps) {
  const [newQtd, setNewQtd] = useState(0);
  const [value, setValue] = useState(0);
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer
        open={isOpen}
        onOpenChange={(nextOpen) => {
          setIsOpen?.(nextOpen);
          if (!nextOpen) {
            setNewQtd(0);
            setValue(0);
          }
        }}
      >
        <DrawerTrigger asChild>{children}</DrawerTrigger>
        <DrawerContent onDoubleClick={(e) => e.stopPropagation()}>
          <div className="mx-auto w-full max-w-sm">
            <DrawerHeader className="border-b px-4 py-3">
              <DrawerTitle>Entrada de produto</DrawerTitle>
              <DrawerDescription className="flex flex-col gap-1 text-sm">
                <span>{productDescription}</span>
                <span>Em estoque: {currentQuantity}</span>
              </DrawerDescription>
            </DrawerHeader>

            <div className="p-4 space-y-4 relative">
              <Button
                variant={"outline"}
                size="sm"
                className="absolute top-4 right-4 hover:cursor-pointer"
              >
                <Paperclip className="mr-1 h-4 w-4" />
                Anexo
              </Button>

              <div className="space-y-2">
                <Label>Quantidade:</Label>
                <Input
                  className="w-24"
                  type="numeric"
                  value={newQtd}
                  onChange={(e) => setNewQtd(Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label>Valor:</Label>
                <ValueInput price={value} setPrice={setValue} />
              </div>

              <div className="space-y-2">
                <Label>Fornecedor</Label>
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Selecione">Selecione</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DrawerFooter className="flex flex-row gap-2 items-center justify-center">
              <Button className="hover:cursor-pointer">Registrar</Button>
              <DrawerClose asChild>
                <Button className="hover:cursor-pointer" variant="outline">
                  Cancelar
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop (Dialog) permanece igual
  if (!isMobile) {
    return (
      <Dialog
        open={isOpen}
        onOpenChange={(nextOpen) => {
          setIsOpen?.(nextOpen);
          if (!nextOpen) {
            setNewQtd(0);
            setValue(0);
          }
        }}
      >
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="p-0 overflow-hidden">
          <div className="flex h-full min-h-0 flex-col">
            <DialogHeader className="shrink-0 px-6 py-4 border-b-1">
              <DialogTitle>Entrada de produto</DialogTitle>
              <DialogDescription className="flex flex-row items-center justify-between">
                <span>{productDescription}</span>
                <span>Em estoque: {currentQuantity}</span>
              </DialogDescription>
            </DialogHeader>
            <div className="h-full min-h-0 overflow-auto dark:bg-muted-foreground/5 px-6 py-10 space-y-2 relative">
              <Button
                variant={"outline"}
                className="absolute top-5 right-5 hover:cursor-pointer"
              >
                <Paperclip />
                Anexo
              </Button>
              <div className="h-full min-h-0 overflow-auto rounded-md px-4 py-8 space-y-4">
                <div className="space-y-2">
                  <Label>Quantidade:</Label>
                  <Input
                    value={newQtd}
                    onChange={(e) => setNewQtd(Number(e.target.value))}
                    className="w-20"
                    type="numeric"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Valor:</Label>
                  <ValueInput price={value} setPrice={setValue} />
                </div>
                <div className="space-y-2">
                  <Label>Fornecedor</Label>
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Selecione">Selecione</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DialogFooter className="px-6 py-4">
              <div className="flex sm:flex-row gap-3 sm:gap-4">
                <Button className="hover:cursor-pointer">Registrar</Button>
                <DialogClose asChild>
                  <Button className="hover:cursor-pointer" variant="outline">
                    Cancelar
                  </Button>
                </DialogClose>
              </div>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return null;
}
