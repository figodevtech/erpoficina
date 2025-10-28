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
  Banco,
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
import { formatCpfCnpj } from "../../utils";
import axios, { isAxiosError } from "axios";
import { toast } from "sonner";
import { Upload } from "lucide-react";

interface RegisterContentProps {
  osId?: number | undefined;
  setSelectedTransactionId?: (value: number | undefined) => void;
  newTransaction: NewTransaction;
  setNewTransaction: (value: NewTransaction) => void;
  dialogOpen: boolean | undefined;
  selectedCustomer: TransactionCustomer | undefined;
  setSelectedCustomer: (value: TransactionCustomer | undefined) => void;
}

export default function RegisterContent({
  setSelectedTransactionId,
  newTransaction,
  setNewTransaction,
  selectedCustomer,
  osId,
  setSelectedCustomer,
}: RegisterContentProps) {
  const [isCustomerSelectOpen, setIsCustomerSelectOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingBanks, setIsLoadingBanks] = useState(false);
  const [banks, setBanks] = useState<Banco[]>([]);
  const handleChange = (
    field: keyof NewTransaction,
    value: string | number
  ) => {
    setNewTransaction({ ...newTransaction, [field]: value });
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

  useEffect(() => {
    if (selectedCustomer) {
      setNewTransaction({
        ...newTransaction,
        nomepagador: selectedCustomer.nome,
        cpfcnpjpagador: selectedCustomer.cpfcnpj,
        cliente_id: selectedCustomer.id,
      });
    }
  }, [, selectedCustomer]);

  const handleCreateTransaction = async () => {
    setIsSubmitting(true);
    try {
      const response = await axios.post("/api/transaction", {
        newTransaction,
      });

      if (response.status === 201 && setSelectedTransactionId) {
        console.log(response.data.data);
        toast("Sucesso!", {
          description: "Transação registrada.",
          duration: 2000,
        });
        setSelectedTransactionId(response.data.id);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        toast("Erro", {
          description: error.response?.data.error,
          duration: 2000,
        });

        console.log(error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    console.log(newTransaction);
  }, [newTransaction]);

  useEffect(() => {
    if(osId){

      setNewTransaction({
        ...newTransaction,
        ordemservicoid: osId,
        tipo: Tipo_transacao.RECEITA,
        categoria: Categoria_transacao.ORDEM_SERVICO
      });
    }
  }, [osId]);

  useEffect(() => {
    console.log("osId:", osId);
    handleGetBanks();
  }, []);
  return (
    <DialogContent className="h-lvh min-w-screen p-0 overflow-hidden sm:max-w-[1100px] sm:max-h-[850px] sm:w-[95vw] sm:min-w-0">
      <div className="flex h-full min-h-0 flex-col">
        <DialogHeader className="shrink-0 px-6 py-4 border-b-1">
          {osId ? 
          <DialogTitle>Nova Transação OS #{osId}</DialogTitle>
        :  
                  <DialogTitle>Nova Transação</DialogTitle>

        }
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
                {osId ? (
                  <Select
                  disabled
                    value={"RECEITA"}
                    onValueChange={(v) => handleChange("tipo", v)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RECEITA">RECEITA</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Select
                    value={newTransaction.tipo}
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
                )}
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
                <Label htmlFor="banco">Banco</Label>
                <Select
                  value={newTransaction.banco_id?.toString()}
                  onValueChange={(v) => handleChange("banco_id", Number(v))}
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
                {osId ? 
                <Select
                disabled
                  value={newTransaction.categoria}
                  onValueChange={(v) => handleChange("categoria", v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="ORDEM_SERVICO" >
                        ORDEM DE SERVIÇO
                      </SelectItem>
                  </SelectContent>
                </Select>
              :

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
              }
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
                    setNewTransaction({
                      ...newTransaction,
                      nomepagador: "",
                      cpfcnpjpagador: "",
                      cliente_id: null,
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
                  maxLength={14}
                  value={
                    formatCpfCnpj(newTransaction.cpfcnpjpagador || "") || ""
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
            <Button
              type="submit"
              form="register-form"
              // disabled={isSubmitting}
              className="flex-1 text-sm sm:text-base hover:cursor-pointer"
              onClick={handleCreateTransaction}
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
