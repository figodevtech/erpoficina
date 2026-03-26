"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, Loader2, User } from "lucide-react";
import { BotaoExportVendasUsuario } from "./botao-export-vendas-usuario";
import { cn } from "@/lib/utils";

type UsuarioAtivo = {
  id: string;
  nome: string | null;
  email?: string;
};

function parseYYYYMMDD(value: string) {
  if (!value) return undefined;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function toYYYYMMDD(date?: Date) {
  return date ? format(date, "yyyy-MM-dd") : "";
}

export default function DialogVendasUsuario() {
  const [users, setUsers] = useState<UsuarioAtivo[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoadingUsers(true);
        const response = await fetch("/api/users?ativos=1", { cache: "no-store" });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data?.error || "Falha ao carregar usuários.");
        setUsers(Array.isArray(data?.users) ? data.users : []);
      } catch (error) {
        console.error(error);
        setUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };

    loadUsers();
  }, []);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="h-auto hover:cursor-pointer flex-col items-start justify-start gap-2 p-4 text-left hover:bg-accent hover:text-accent-foreground bg-transparent"
        >
          <div className="flex w-full items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
              <User />
            </div>
            <span className="flex-1 font-medium">Vendas por usuário</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Exporta as vendas realizadas por um usuário no período
          </p>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Exportar vendas por usuário</DialogTitle>
          <DialogDescription>
            Selecione o usuário vendedor e o período do relatório
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 bg-muted/50 p-4 rounded-2xl">
          <div className="space-y-2">
            <Label>Usuário</Label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={loadingUsers ? "Carregando usuários..." : "Selecione um usuário"}
                />
              </SelectTrigger>
              <SelectContent>
                {loadingUsers ? (
                  <div className="px-2 py-3 text-sm text-muted-foreground flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Carregando usuários...
                  </div>
                ) : (
                  users.map((user) => (
                    <SelectItem key={user.id} value={String(user.id)}>
                      {user.nome || user.email || user.id}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Data inicial</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateFrom && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom
                      ? format(parseYYYYMMDD(dateFrom)!, "dd/MM/yyyy")
                      : "Selecionar data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={parseYYYYMMDD(dateFrom)}
                    onSelect={(date) => setDateFrom(toYYYYMMDD(date))}
                    locale={ptBR}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Data final</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateTo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo
                      ? format(parseYYYYMMDD(dateTo)!, "dd/MM/yyyy")
                      : "Selecionar data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={parseYYYYMMDD(dateTo)}
                    onSelect={(date) => setDateTo(toYYYYMMDD(date))}
                    locale={ptBR}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-row items-center">
          <BotaoExportVendasUsuario userId={selectedUserId} dateFrom={dateFrom} dateTo={dateTo}>
            Exportar
          </BotaoExportVendasUsuario>

          <DialogClose asChild>
            <Button className="hover:cursor-pointer">Cancelar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
