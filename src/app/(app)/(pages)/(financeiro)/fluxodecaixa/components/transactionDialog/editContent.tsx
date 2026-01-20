// EditContent.tsx

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
  Metodo_pagamento,
  Tipo_transacao,
  Transaction,
  TransactionCustomer,
} from "../../types";
import { formatCpfCnpj } from "../../utils";
import { Switch } from "@/components/ui/switch";
import { Info } from "lucide-react";
import { useCategoriasTransacao } from "../../hooks/use-categoria-transacao";
import { toast } from "sonner";

interface EditContentProps {
  selectedTransactionId: number | undefined;
  selectedCustomer: TransactionCustomer | undefined;
  setSelectedCustomer: (value: TransactionCustomer | undefined) => void;
}

/**
 * Aqui eu padronizo o "data" do form como Date, independente do tipo original em Transaction.
 * Assim você aplica a MESMA lógica do RegisterContent sem precisar mexer nos types globais.
 */
type TransactionForm = Omit<Transaction, "data"> & { data?: Date };

function parseLocalDateTime(value: string): Date | undefined {
  // value: "YYYY-MM-DDTHH:mm"
  if (!value) return undefined;
  const [dataParte, horaParte] = value.split("T");
  if (!dataParte || !horaParte) return undefined;

  const [y, m, d] = dataParte.split("-").map(Number);
  const [hh, mm] = horaParte.split(":").map(Number);

  if (!y || !m || !d) return undefined;
  if (hh == null || mm == null) return undefined;

  return new Date(y, m - 1, d, hh, mm, 0, 0); // LOCAL TIME (sem shift de fuso)
}

function toIsoMinuteString(date: Date | undefined) {
  if (!date) return "";
  const pad = (n: number) => String(n).padStart(2, "0");

  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  return `${y}-${m}-${d}T${hh}:${mm}`;
}

function nowIsoMinute() {
  return toIsoMinuteString(new Date());
}

function toDateFromApi(value: unknown): Date | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value;

  if (typeof value === "string") {
    // se vier com timezone (Z ou +hh:mm), pode usar Date direto
    const temTimezone =
      value.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(value);

    if (temTimezone) return new Date(value);

    // se vier "YYYY-MM-DDTHH:mm" (sem timezone), parse local
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)) {
      return parseLocalDateTime(value.slice(0, 16));
    }

    // fallback
    const d = new Date(value);
    return isNaN(d.getTime()) ? undefined : d;
  }

  return undefined;
}

export default function EditContent({
  selectedTransactionId,
  selectedCustomer,
  setSelectedCustomer,
}: EditContentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<
    TransactionForm | undefined
  >(undefined);

  const [isCustomerSelectOpen, setIsCustomerSelectOpen] = useState(false);
  const [, setIsLoadingBanks] = useState(false);
  const [banks, setBanks] = useState<Banco[]>([]);
  const { categorias, loadingCategorias, errorCategorias } =
    useCategoriasTransacao();

  const handleChange = (
    field: keyof TransactionForm,
    value: string | number
  ) => {
    setSelectedTransaction((prev) =>
      prev ? { ...prev, [field]: value } : prev
    );
  };

  const handleGetBanks = async () => {
    setIsLoadingBanks(true);
    try {
      const response = await axios.get("/api/banks", {});
      if (response.status === 200) {
        const { data } = response;
        setBanks(data.data);
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

        const t: Transaction = data.data;

        // normaliza "data" para Date no form
        const dataNormalizada = toDateFromApi((t as any).data);

        setSelectedTransaction({
          ...(t as any),
          data: dataNormalizada,
        });
      }
    } catch (error) {
      console.log("Erro ao buscar transação:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // carrega sempre que o ID mudar
  useEffect(() => {
    if (selectedTransactionId) {
      handleGetTransaction(selectedTransactionId);
      handleGetBanks();
    }
  }, [selectedTransactionId]);

  // quando seleciona cliente, atualiza pagador
  useEffect(() => {
    if (!selectedCustomer) return;

    setSelectedTransaction((prev) =>
      prev
        ? {
          ...prev,
          cliente_id: selectedCustomer.id,
          nomepagador: selectedCustomer.nome,
          cpfcnpjpagador: selectedCustomer.cpfcnpj,
        }
        : prev
    );
  }, [selectedCustomer]);

  // se tipo for SAQUE/DEPOSITO, força pendente false (e limpa data por segurança)
  useEffect(() => {
    setSelectedTransaction((prev) => {
      if (!prev) return prev;

      if (
        prev.tipo === Tipo_transacao.SAQUE ||
        prev.tipo === Tipo_transacao.DEPOSITO
      ) {
        if (prev.pendente === false) return prev;
        return { ...prev, pendente: false, data: undefined };
      }

      return prev;
    });
  }, [selectedTransaction?.tipo]);

  // mesma regra do RegisterContent: ao trocar pendente, limpa a data
  useEffect(() => {
    setSelectedTransaction((prev) => (prev ? { ...prev, data: undefined } : prev));
  }, [selectedTransaction?.pendente]);

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

  if (!selectedTransaction) {
    return (
      <DialogContent className="h-lvh min-w-screen p-0 overflow-hidden sm:max-w-[1100px] sm:max-h-[850px] sm:w-[95vw] sm:min-w-0">
        <DialogHeader className="shrink-0 px-6 py-4 border-b-1">
          <DialogTitle>Editar transação</DialogTitle>
          <DialogDescription>Nenhuma transação selecionada.</DialogDescription>
        </DialogHeader>
        <DialogFooter className="px-6 py-4">
          <DialogClose asChild>
            <Button className="hover:cursor-pointer" variant={"outline"}>
              Fechar
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    );
  }

  return (
    <DialogContent className="h-lvh min-w-screen p-0 overflow-hidden sm:max-w-[1100px] sm:max-h-[850px] sm:w-[95vw] sm:min-w-0">
      <div className="flex h-full min-h-0 flex-col">
        <DialogHeader className="shrink-0 px-6 py-4 border-b-1">
          <DialogTitle>Transação #{selectedTransaction.id}</DialogTitle>
          <DialogDescription>
            Preencha dados para editar a transação
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

              <div className="space-y-4 w-full">
                <Label>Lançamento futuro</Label>
                <div className="flex felx-row items-center gap-2">
                  <Switch
                    className="hover:cursor-pointer"
                    disabled={
                      selectedTransaction.tipo === Tipo_transacao.SAQUE ||
                      selectedTransaction.tipo === Tipo_transacao.DEPOSITO
                    }
                    checked={selectedTransaction.pendente || false}
                    onCheckedChange={(checked) =>
                      setSelectedTransaction({
                        ...selectedTransaction,
                        pendente: checked,
                      })
                    }
                  />

                  {selectedTransaction.tipo === Tipo_transacao.RECEITA && (
                    <div
                      className={`flex flex-row gap-1 items-center text-xs text-muted-foreground ${selectedTransaction.pendente
                          ? "opacity-100"
                          : "opacity-50"
                        }`}
                    >
                      <Info className="w-3 h-3" />
                      <span>LANÇAMENTO A RECEBER</span>
                    </div>
                  )}

                  {selectedTransaction.tipo === Tipo_transacao.DESPESA && (
                    <div
                      className={`flex flex-row gap-1 items-center text-xs text-muted-foreground ${selectedTransaction.pendente
                          ? "opacity-100"
                          : "opacity-50"
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
                />
              </div>

              <div className="space-y-2 w-full">
                <Label htmlFor="data">Data</Label>
                <Input
                  type="datetime-local"
                  value={toIsoMinuteString(selectedTransaction.data)}
                  min={selectedTransaction.pendente ? nowIsoMinute() : undefined}
                  max={!selectedTransaction.pendente ? nowIsoMinute() : undefined}
                  onChange={(e) => {
                    const value = e.target.value;
                    const selecionada = value
                      ? parseLocalDateTime(value)
                      : undefined;

                    if (!selecionada) {
                      setSelectedTransaction({
                        ...selectedTransaction,
                        data: undefined,
                      });
                      return;
                    }

                    const agora = new Date();

                    if (
                      !selectedTransaction.pendente &&
                      selecionada.getTime() > agora.getTime()
                    ) {
                      toast.warning(
                        "Ative o pagamento futuro para selecionar uma data futura."
                      );
                      return;
                    }

                    if (
                      selectedTransaction.pendente &&
                      selecionada.getTime() < agora.getTime()
                    ) {
                      toast.warning(
                        "Desative o pagamento futuro para selecionar uma data passada."
                      );
                      return;
                    }

                    setSelectedTransaction({
                      ...selectedTransaction,
                      data: selecionada,
                    });
                  }}
                />
              </div>

              <div className="space-y-2 w-full">
                <Label htmlFor="banco">Banco</Label>
                <Select
                  value={selectedTransaction.banco_id?.toString() || ""}
                  onValueChange={(v) => {
                    const bancoId = Number(v);
                    const b = banks.find((x) => x.id === bancoId);

                    setSelectedTransaction((prev) =>
                      prev
                        ? {
                          ...prev,
                          banco_id: bancoId,
                          banco: b ? { ...(prev as any).banco, ...b } : (prev as any).banco,
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
                  value={selectedTransaction.metodopagamento || ""}
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
                  disabled={loadingCategorias || !!errorCategorias}
                  value={selectedTransaction.categoria}
                  onValueChange={(v) => handleChange("categoria", v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        loadingCategorias
                          ? "Carregando..."
                          : errorCategorias
                            ? "Erro ao carregar"
                            : "Selecione"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((c) => (
                      <SelectItem
                        className="hover:cursor-pointer"
                        key={c.id}
                        value={c.nome}
                      >
                        {c.nome}
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
                  disabled={!!selectedCustomer}
                  id="nomepagador"
                  value={selectedTransaction.nomepagador || ""}
                  onChange={(e) => handleChange("nomepagador", e.target.value)}
                  placeholder="Nome do pagador"
                  className="w-full"
                />
              </div>

              <div className="space-y-2 w-full">
                <Label htmlFor="cpfcnpjpagador">CPF/CNPJ do pagador*</Label>
                <Input
                  disabled={!!selectedCustomer}
                  id="cpfcnpjpagador"
                  maxLength={14}
                  value={
                    formatCpfCnpj(selectedTransaction.cpfcnpjpagador || "") || ""
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
