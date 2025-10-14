import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Categoria_transacao,
  Metodo_pagamento,
  NewTransaction,
  Tipo_transacao,
  TransactionCustomer,
} from "../../types";
import ValueInput from "./valueInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import CustomerSelect from "@/app/(app)/components/customerSelect";

interface RegisterContentProps {
  setSelectedTransactionId?: (value: number | undefined) => void;
  newTransaction: NewTransaction;
  setNewTransaction: (value: NewTransaction) => void;
}

export default function RegisterContent({
  setSelectedTransactionId,
  newTransaction,
  setNewTransaction,
}: RegisterContentProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<
    TransactionCustomer | undefined
  >({ cpfcnpj: "234234", nome: "Lucas Rawlison" });
  const handleChange = (
    field: keyof NewTransaction,
    value: string | number
  ) => {
    setNewTransaction({ ...newTransaction, [field]: value });
  };

  useEffect(() => {
    if (selectedCustomer) {
      setNewTransaction({
        ...newTransaction,
        nomepagador: selectedCustomer.nome,
        cpfcnpjpagador: selectedCustomer.cpfcnpj,
      });
    }
  }, [, selectedCustomer]);

  return (
    <DialogContent className="h-lvh min-w-screen p-0 overflow-hidden sm:max-w-[1100px] sm:max-h-[850px] sm:w-[95vw] sm:min-w-0">
      <div className="flex h-full min-h-0 flex-col">
        <DialogHeader className="shrink-0 px-6 py-4 border-b-1">
          <DialogTitle>Nova Transação</DialogTitle>
          <DialogDescription>
            Preencha dados para registrar uma transação
          </DialogDescription>
        </DialogHeader>
        <div className="h-full min-h-0 overflow-auto dark:bg-muted-foreground/5 px-6 py-10 space-y-2">
          <div className="h-full flex flex-col min-h-0 overflow-auto rounded-md px-4 py-8 space-y-4">
            {/* dados da transação */}
            <div className="space-y-4 grid sm:grid-cols-3 gap-4">
              <div className="space-y-2 w-full">
                <Label htmlFor="tipo">Tipo</Label>
                <Select
                  value={newTransaction.tipo}
                  onValueChange={(v) => handleChange("categoria", v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(Tipo_transacao).map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 w-full col-span-full">
                <Label htmlFor="descricao">Descrição*</Label>
                <Input
                  id="descricao"
                  value={newTransaction.descricao || ""}
                  onChange={(e) => handleChange("descricao", e.target.value)}
                  placeholder="Descrição"
                  className="w-full"
                />
              </div>
              <div className="space-y-2 w-full">
                <Label htmlFor="valor">Valor*</Label>
                <ValueInput
                  price={newTransaction.valor || 0}
                  setPrice={(v) => handleChange("valor", v)}
                ></ValueInput>
              </div>
              <div className="space-y-2 w-full">
                <Label htmlFor="data">Data</Label>
                <Input
                  type="datetime-local"
                  onChange={(e) => handleChange("data", e.target.value)}
                ></Input>
              </div>
              <div className="space-y-2 w-full">
                <Label htmlFor="metodopagamento">Método de pagamento</Label>
                <Select
                  value={newTransaction.metodopagamento}
                  onValueChange={(v) => handleChange("metodopagamento", v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(Metodo_pagamento).map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 w-full">
                <Label htmlFor="categoria">Categoria</Label>
                <Select
                  value={newTransaction.categoria}
                  onValueChange={(v) => handleChange("categoria", v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(Categoria_transacao).map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* dados do cliente */}
            <div>
              <span className=" text-xs text-muted-foreground">
                Dados do pagador
              </span>
              <Separator />
            </div>

            <div className="flex justify-end">
              {selectedCustomer ? (
                <Button
                  onClick={() => {
                    handleChange("nomepagador","")
                    handleChange("cpfcnpjpagador","")
                    setSelectedCustomer(undefined)}}
                  className="hover:cursor-pointer"
                  variant={"ghost"}
                  size={"sm"}
                >
                  Remover Cliente
                </Button>
              ) : (
                <CustomerSelect

                OnSelect={(c)=>{console.log(c)}}
                >

                <Button
                  className="hover:cursor-pointer"
                  variant={"outline"}
                  size={"sm"}
                >
                  Selecionar Cliente
                </Button>
                </CustomerSelect>
              )}
            </div>
            <div className="space-y-4 grid sm:grid-cols-2 gap-4">
              <div className="space-y-2 w-full">
                <Label htmlFor="nomepagador">Nome do pagador*</Label>
                <Input
                  disabled={selectedCustomer ? true : false}
                  id="descricao"
                  value={newTransaction.nomepagador || ""}
                  onChange={(e) => handleChange("nomepagador", e.target.value)}
                  placeholder="Descrição"
                  className="w-full"
                />
              </div>
              <div className="space-y-2 w-full">
                <Label htmlFor="nomepagador">CPF/CNPJ do pagador*</Label>
                <Input
                  disabled={selectedCustomer ? true : false}
                  id="cpfcnpjpagador"
                  value={newTransaction.cpfcnpjpagador || ""}
                  onChange={(e) =>
                    handleChange("cpfcnpjpagador", e.target.value)
                  }
                  placeholder="CPF/CNPJ"
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="px-6 py-4">
          <div className="flex sm:flex-row gap-3 sm:gap-4">
            <Button
              type="submit"
              form="register-form"
              // disabled={isSubmitting}
              className="flex-1 text-sm sm:text-base hover:cursor-pointer"
              // onClick={handleUpdateProduct}
            >
              {/* {isSubmitting ? (
                                      <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                        Salvando...
                                      </>
                                    ) : (
                                      <>
                                        <Upload className="h-4 w-4 mr-2" />
        
                                        Salvar
                                      </>
                                    )} */}
              Salvar
            </Button>
            <DialogClose asChild>
              <Button className="hover:cursor-pointer" variant={"outline"}>
                Cancelar
              </Button>
            </DialogClose>
          </div>
        </DialogFooter>
      </div>
    </DialogContent>
  );
}
