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
import axios from "axios";
import {
  Banco,
  Categoria_transacao,
  Metodo_pagamento,
  Tipo_transacao,
  Transaction,
  TransactionCustomer,
} from "../../types";
import { formatCpfCnpj } from "../../utils";

interface EditContentProps {
  selectedTransactionId: number | undefined;
  selectedCustomer: TransactionCustomer | undefined;
  setSelectedCustomer: (value: TransactionCustomer | undefined) => void;
}
export default function EditContent({
  selectedTransactionId,
  selectedCustomer,
  setSelectedCustomer,
}: EditContentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<
    Transaction | undefined
  >(undefined);
  const [isCustomerSelectOpen, setIsCustomerSelectOpen] = useState(false);
  const [, setIsLoadingBanks] = useState(false);
  const [banks, setBanks] = useState<Banco[]>([]);

  const formatForInput = (date?: string | Date) => {
    if (!date) return "";
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };
  const handleChange = (field: keyof Transaction, value: string | number) => {
    if (selectedTransaction) {
      setSelectedTransaction({ ...selectedTransaction, [field]: value });
    }
  };

  const handleGetBanks = async () => {
    setIsLoadingBanks(true);
    try {
      const response = await axios.get("/api/banks", {});
      if (response.status === 200) {
        // console.log(response)
        const { data } = response;
        setBanks(data.data);
        console.log("Bancos carregados:", data.data);
      }
    } catch (error) {
      console.log("Erro ao buscar bancos:", error);
    } finally {
      setIsLoadingBanks(false);
    }
  };
  const handleGetTransaction = async (id: number) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/transaction/${id}`);
      if (response.status === 200) {
        const { data } = response;
        setSelectedTransaction(data.data);
        // console.log("Cliente carregado:", data.data);
      }
    } catch (error) {
      console.log("Erro ao buscar transação:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTransactionId) {
      handleGetTransaction(selectedTransactionId);
      handleGetBanks();
    }
  }, []);

  useEffect(() => {
    if (selectedCustomer && selectedTransaction) {
      setSelectedTransaction({
        ...selectedTransaction,
        cliente_id: selectedCustomer.id,
        nomepagador: selectedCustomer.nome,
        cpfcnpjpagador: selectedCustomer.cpfcnpj,
      });
    }
  }, [selectedCustomer, selectedTransaction]);

  if (isLoading) {
    return (
      <DialogContent className="h-lvh min-w-screen p-0 overflow-hidden sm:max-w-[1100px] sm:max-h-[850px] sm:w-[95vw] sm:min-w-0">
        <DialogHeader className="hidden">
          <DialogTitle></DialogTitle>
        </DialogHeader>
        <div className="flex h-full min-h-0 flex-col justify-center items-center">
          <div className="size-8 border-t-2 border-primary rounded-t-full animate-spin"></div>
          <span className="text-primary">Carregando</span>
        </div>
      </DialogContent>
    );
  }
  if (selectedTransaction) {
    return (
      <DialogContent className="h-lvh min-w-screen p-0 overflow-hidden sm:max-w-[1100px] sm:max-h-[850px] sm:w-[95vw] sm:min-w-0">
        <div className="flex h-full min-h-0 flex-col">
          <DialogHeader className="shrink-0 px-6 py-4 border-b-1">
            <DialogTitle>Transação {selectedTransaction.id}</DialogTitle>
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
                    value={selectedTransaction.tipo}
                    onValueChange={(v) => handleChange("tipo", v)}
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
                    value={selectedTransaction.descricao || ""}
                    onChange={(e) => handleChange("descricao", e.target.value)}
                    placeholder="Descrição"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2 w-full">
                  <Label htmlFor="valor">Valor*</Label>
                  <ValueInput
                    price={selectedTransaction.valor || 0}
                    setPrice={(v) => handleChange("valor", v)}
                  ></ValueInput>
                </div>
                <div className="space-y-2 w-full">
                  <Label htmlFor="data">Data</Label>
                  <Input
                    type="datetime-local"
                    value={formatForInput(selectedTransaction.data)}
                    onChange={(e) => handleChange("data", e.target.value)}
                  />
                </div>
                <div className="space-y-2 w-full">
                  <Label htmlFor="banco">Banco</Label>
                  <Select
                    value={selectedTransaction.banco_id?.toString()}
                    onValueChange={(v) => {
                      const bancoId = Number(v);
                      const b = banks.find((x) => x.id === bancoId);
                      setSelectedTransaction((prev) =>
                        prev
                          ? {
                              ...prev,
                              banco_id: bancoId,
                              banco: b ? { ...prev.banco, ...b } : prev.banco, // opcional
                            }
                          : prev
                      );
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {banks.map((b) => (
                        <SelectItem key={b.id} value={b.id.toString()}>
                          {b.titulo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 w-full">
                  <Label htmlFor="metodopagamento">Método de pagamento</Label>
                  <Select
                    value={selectedTransaction.metodopagamento}
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
                    value={selectedTransaction.categoria}
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
                      setSelectedTransaction({
                        ...selectedTransaction,
                        nomepagador: "",
                        cpfcnpjpagador: "",
                        cliente_id: undefined,
                      });
                      setSelectedCustomer(undefined);
                    }}
                    className="hover:cursor-pointer"
                    variant={"ghost"}
                    size={"sm"}
                  >
                    Remover Cliente
                  </Button>
                ) : (
                  <>
                    <CustomerSelect
                      open={isCustomerSelectOpen}
                      setOpen={setIsCustomerSelectOpen}
                      OnSelect={(c) => {
                        setSelectedCustomer({
                          cpfcnpj: c.cpfcnpj,
                          nome: c.nomerazaosocial,
                          id: c.id,
                        });
                      }}
                    />

                    <Button
                      onClick={() => setIsCustomerSelectOpen(true)}
                      className="hover:cursor-pointer"
                      variant={"outline"}
                      size={"sm"}
                    >
                      Selecionar Cliente
                    </Button>
                  </>
                )}
              </div>
              <div className="space-y-4 grid sm:grid-cols-2 gap-4">
                <div className="space-y-2 w-full">
                  <Label htmlFor="nomepagador">Nome do pagador*</Label>
                  <Input
                    disabled={selectedCustomer ? true : false}
                    id="descricao"
                    value={selectedTransaction.nomepagador || ""}
                    onChange={(e) =>
                      handleChange("nomepagador", e.target.value)
                    }
                    placeholder="Descrição"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2 w-full">
                  <Label htmlFor="nomepagador">CPF/CNPJ do pagador*</Label>
                  <Input
                    disabled={selectedCustomer ? true : false}
                    id="cpfcnpjpagador"
                    maxLength={14}
                    value={
                      formatCpfCnpj(selectedTransaction.cpfcnpjpagador || "") ||
                      ""
                    }
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
              {/* <Button
                type="submit"
                form="register-form"
                // disabled={isSubmitting}
                className="flex-1 text-sm sm:text-base hover:cursor-pointer"
                // onClick={handleCreateTransaction}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Registrar
                  </>
                )}
              </Button> */}
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
}
