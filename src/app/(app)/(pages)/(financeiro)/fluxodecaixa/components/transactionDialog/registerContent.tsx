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
import { Info, Upload } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import formatarEmReal from "@/utils/formatarEmReal";
import { set } from "nprogress";

interface RegisterContentProps {
  osId?: number | undefined;
  vendaId?: number | undefined;
  setSelectedTransactionId?: (value: number | undefined) => void;
  newTransaction: NewTransaction;
  setNewTransaction: (value: NewTransaction) => void;
  dialogOpen: boolean | undefined;
  selectedCustomer: TransactionCustomer | undefined;
  setSelectedCustomer: (value: TransactionCustomer | undefined) => void;
  handleGetTransactions?: (pageNumber?: number) => void;
  setOpen?: (value: boolean) => void;
}

export default function RegisterContent({
  setSelectedTransactionId,
  newTransaction,
  setNewTransaction,
  selectedCustomer,
  osId,
  vendaId,
  setSelectedCustomer,
  handleGetTransactions,
  setOpen,
}: RegisterContentProps) {
  const [isCustomerSelectOpen, setIsCustomerSelectOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setIsLoadingBanks] = useState(false);
  const [banks, setBanks] = useState<Banco[]>([]);
  const [isChecked, setIsChecked] = useState(false);
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
  }, [setNewTransaction, selectedCustomer]);

  const handleCreateTransaction = async () => {
    setIsSubmitting(true);
    try {
      const response = await axios.post("/api/transaction/os", {
        newTransaction,
      });

      if (response.status === 201) {
        const created = response.data?.data ?? response.data;

        toast.success("Sucesso!", {
          description: "Transação registrada.",
          duration: 2000,
        });

        // se existir, seta o id (fluxo fora de OS)
        setSelectedTransactionId?.(created?.id);

        // recarrega a lista da OS (quando veio por OS)
        handleGetTransactions?.();

        // fecha SEMPRE que criar
        setOpen?.(false);

        // opcional: limpar o formulário
        setNewTransaction({});
        setSelectedCustomer?.(undefined);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        toast("Erro", {
          description: error.response?.data?.error,
          duration: 2000,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    console.log("nova: ", newTransaction);
  }, [newTransaction]);

  useEffect(() => {
    console.log("osId:", osId);
    console.log("vendaId:", vendaId);

    handleGetBanks();
  }, []);

  useEffect(() => {
    console.log("mudou");
    setNewTransaction({
      ...newTransaction,
      valorLiquido: newTransaction.valor,
    });
    setIsChecked(false);
  }, [, newTransaction.metodopagamento]);

  useEffect(() => {
    if (!isChecked) {
      setNewTransaction({
        ...newTransaction,
        valorLiquido: newTransaction.valor,
      });
    }
  }, [newTransaction.valor]);

  useEffect(() => {
    if (
      newTransaction.tipo === Tipo_transacao.SAQUE ||
      newTransaction.tipo === Tipo_transacao.DEPOSITO
    ) {
      setNewTransaction({
        ...newTransaction,
        pendente: false,
      });
    }
  }, [newTransaction.tipo]);

  return (
    <DialogContent className="h-lvh min-w-screen p-0 overflow-hidden sm:max-w-[1100px] sm:max-h-[850px] sm:w-[95vw] sm:min-w-0">
      <div className="flex h-full min-h-0 flex-col">
        <DialogHeader className="shrink-0 px-6 py-4 border-b-1">
          {osId && <DialogTitle>Nova Transação OS #{osId}</DialogTitle>}
          {vendaId && (
            <DialogTitle>Nova Transação Venda #{vendaId}</DialogTitle>
          )}
          {!osId && !vendaId && <DialogTitle>Nova Transação</DialogTitle>}
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
                {osId || vendaId ? (
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
                    value={newTransaction.tipo || ""}
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
              <div className="space-y-4 w-full">
                <Label>Lançamento futuro</Label>
                <div className="flex felx-row items-center gap-2">
                  <Switch
                    className="hover:cursor-pointer"
                    disabled={
                      newTransaction.tipo === Tipo_transacao.SAQUE ||
                      newTransaction.tipo === Tipo_transacao.DEPOSITO
                        ? true
                        : false
                    }
                    checked={newTransaction.pendente || false}
                    onCheckedChange={(checked) =>
                      setNewTransaction({
                        ...newTransaction,
                        pendente: checked,
                      })
                    }
                  />
                  
                    {newTransaction.tipo === Tipo_transacao.RECEITA && (
                      <div
                        className={`flex flex-row gap-1 items-center text-xs text-muted-foreground ${
                          newTransaction.pendente ? "opacity-100" : "opacity-50"
                        }`}
                      >
                        <Info className="w-3 h-3" />
                        <span>LANÇAMENTO A RECEBER</span>
                      </div>
                    )}
                    {newTransaction.tipo === Tipo_transacao.DESPESA && (
                      <div
                        className={`flex flex-row gap-1 items-center text-xs text-muted-foreground ${
                          newTransaction.pendente ? "opacity-100" : "opacity-50"
                        }`}
                      >
                        <Info className="w-3 h-3" />
                        <span>LANÇAMENTO A PAGAR</span>
                      </div>
                    )}
                  </div>
                </div>

              <div className="space-y-2 w-full col-span-full">
                <Label htmlFor="descricao">Descrição*</Label>
                <Input
                  disabled={osId || vendaId ? true : false}
                  id="descricao"
                  value={newTransaction.descricao || ""}
                  onChange={(e) => handleChange("descricao", e.target.value)}
                  placeholder="Descrição"
                  className="w-full"
                />
              </div>
              <div className="space-y-2 w-full">
                <div className="p-0 m-0 mb-1 flex flex-row justify-between items-center">
                  <Label htmlFor="valor">Valor* </Label>
                  {(newTransaction.tipo === Tipo_transacao.RECEITA ||
                    newTransaction.tipo === Tipo_transacao.SAQUE) && (
                    <div className="flex flex-row gap-2">
                      <span className="text-xs text-muted-foreground">
                        Taxa de recebimento
                      </span>
                      <Switch
                        checked={isChecked}
                        onCheckedChange={() => {
                          setIsChecked(!isChecked);
                          if (!isChecked) {
                            setNewTransaction({
                              ...newTransaction,
                              valorLiquido: newTransaction.valor,
                            });
                          } else {
                            setNewTransaction({
                              ...newTransaction,
                              valorLiquido: newTransaction.valor,
                            });
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
                <ValueInput
                  price={newTransaction.valor || 0}
                  setPrice={(v) => handleChange("valor", v)}
                ></ValueInput>
                {isChecked && (
                  <>
                    <div className="flex flex-row items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Valor líquido recebido:
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Taxa:{" "}
                        {newTransaction.valor && newTransaction.valorLiquido
                          ? formatarEmReal(
                              newTransaction.valor - newTransaction.valorLiquido
                            )
                          : 0}
                      </span>
                    </div>
                    <ValueInput
                      price={newTransaction.valorLiquido || 0}
                      setPrice={(v) => handleChange("valorLiquido", v)}
                    ></ValueInput>
                  </>
                )}
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
                  value={newTransaction.banco_id?.toString() || ""}
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
                  value={newTransaction.metodopagamento || ""}
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
                {osId && (
                  <Select
                    disabled
                    value={newTransaction.categoria}
                    onValueChange={(v) => handleChange("categoria", v)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ORDEM_SERVICO">
                        ORDEM DE SERVIÇO
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
                {vendaId && (
                  <Select
                    disabled
                    value={newTransaction.categoria}
                    onValueChange={(v) => handleChange("categoria", v)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VENDA">VENDA</SelectItem>
                    </SelectContent>
                  </Select>
                )}
                {!osId && !vendaId && (
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
                )}
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
