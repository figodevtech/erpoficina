import { Button } from "@/components/ui/button";
import { ProductDialog } from "../productDialog/productDialog";

interface HeaderProps {
  selectedProductId?: number | undefined;
  setSelectedProductId?: (value: number | undefined) => void;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}
export default function Header({
  selectedProductId,
  setSelectedProductId,
  isOpen,
  setIsOpen,
}: HeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-balance">
          Controle de Estoque
        </h1>
        <p className="text-muted-foreground text-pretty">
          Gestão completa do inventário de peças e produtos
        </p>
      </div>
      <div className="flex items-center gap-2">
        {/* <Button className="hover:cursor-pointer ">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Produto
                  </Button> */}
        <ProductDialog
          setSelectedProductId={setSelectedProductId}
          productId={selectedProductId}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
        >
          <Button className="hover:cursor-pointer">Novo Produto</Button>
        </ProductDialog>
      </div>
    </div>
  );
}
