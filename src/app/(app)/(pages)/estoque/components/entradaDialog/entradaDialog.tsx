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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";

interface EntradaDialogProps {
  children?: React.ReactNode;
  isOpen?: boolean;
  setIsOpen?: (value: boolean)=> void
  productId: number
}
export default function EntradaDialog({ children, isOpen, setIsOpen, productId }: EntradaDialogProps) {
  const [newQtd, setNewQtd] = useState(0);
  return (
    <Drawer open={isOpen} onOpenChange={(nextOpen)=>{
      if(!nextOpen){
        setNewQtd(0)
      }
    }}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent onDoubleClick={(e) => e.stopPropagation()}>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle></DrawerTitle>
            <DrawerDescription></DrawerDescription>
          </DrawerHeader>
          <div className="p-4 pb-0 flex flex-col gap-6">
            <div className="flex flex-col items-center justify-center space-x-2 gap-2 px-4">
              <Label>Quantidade:</Label>
              
              <div className=" w-full flex items-center justify-center relative">
              <input
                onChange={(e) => setNewQtd(Number(e.target.value))}
                value={newQtd.toString()}
                className="border-none focus:border-none focus:outline-none text-center font-sans font-bold text-[50px]"
              />
              <div
                onClick={() => {
                  if (newQtd > 0) {
                    setNewQtd(newQtd - 1);
                  }
                }}
                className="bg-muted p-1 hover:cursor-pointer rounded-full absolute z-10 right-full top-1/2"
              >
                <Minus />
              </div>
              <div
                onClick={() => setNewQtd(newQtd + 1)}
                className="bg-muted p-1 hover:cursor-pointer rounded-full absolute z-10 left-full top-1/2"
              >
                <Plus />
              </div>
              </div>
                
            </div>
            <div className="flex flex-col items-center justify-center space-x-2 gap-2 px-4">
              <Label>Fornecedor:</Label>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione"></SelectValue>
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
