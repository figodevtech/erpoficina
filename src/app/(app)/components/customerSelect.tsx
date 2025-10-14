import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axios from "axios";
import { ReactNode, useEffect, useState } from "react";
import { Customer, Pagination } from "../(pages)/clientes/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeft,
  ChevronsRight,
  Loader,
  Search,
  SendToBack,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface CustomerSelectProps {
  children?: ReactNode;
  OnSelect?: (value: Customer) => void;
  setOpen?: (value: boolean)=> void;
  open?: boolean
}
export default function CustomerSelect({
  children,
  OnSelect,
  setOpen,
  open
}: CustomerSelectProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });
  const [customerItems, setCustomerItems] = useState<Customer[] | []>([]);
  const [search, setSearch] = useState("");
  const handleGetCustomers = async (
    pageNumber?: number,
    limit?: number,
    search?: string
  ) => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/customers", {
        params: {
          page: pageNumber || 1,
          limit: pagination.limit,
          search: search || undefined,
          status: "TODOS",
        },
      });
      if (response.status === 200) {
        // console.log(response)
        const { data } = response;
        setCustomerItems(data.data);
        setPagination(data.pagination);
        console.log("Clientes carregados:", data.data);
      }
    } catch (error) {
      console.log("Erro ao buscar clientes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleGetCustomers();
  }, []);
  useEffect(() => {
    handleGetCustomers(pagination.page, pagination.limit, search);
  }, [search]);

  return (
    <Dialog
    onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="h-lvh min-w-screen max-h-[600px] p-0 overflow-hidden sm:max-w-[500px] sm:max-h-[600px] sm:w-[95vw] sm:min-w-0">
        <div className="flex h-full min-h-0 flex-col">
          <DialogHeader className="shrink-0 px-6 py-4 border-b-1">
            <DialogTitle>Selecione um cliente</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <div className="h-full min-h-0 overflow-auto dark:bg-muted-foreground/5 px-6 py-10 space-y-2">
            <div className="relative w-full mb-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome, email ou telefone..."
                className="pl-10"
              />
            </div>
            <Card>
              <CardHeader className="border-b-2 text-muted-foreground text-xs">
                Resultados: {pagination.total}
              </CardHeader>

              <CardContent className="min-h-[300px] -mt-[24px] px-4 pb-4 pt-0 relative flex flex-col justify-between">
                <div
                  className={`${
                    isLoading && " opacity-100"
                  } transition-all opacity-0 h-0.5 bg-slate-400 w-full overflow-hidden absolute left-0 right-0 top-0`}
                >
                  <div
                    className={`w-1/2 bg-primary h-full  absolute left-0 rounded-lg  -translate-x-[100%] ${
                      isLoading && "animate-slideIn "
                    } `}
                  ></div>
                </div>
                <Table className="text-xs mt-6">
                  <TableHeader>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>NOME</TableCell>
                      <TableCell>TIPO</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customerItems.map((c) => (
                      <TableRow
                        className="hover:cursor-pointer"
                        onClick={() => {
                          if (OnSelect) {
                            OnSelect(c);
                          }
                          if(setOpen){
                            
                            setOpen(false)
                          }
                        }}
                        key={c.id}
                      >
                        <TableCell>{c.id}</TableCell>
                        <TableCell>{c.nomerazaosocial}</TableCell>
                        <TableCell>{c.tipopessoa}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="flex items-center mt-4 justify-between">
                  <div className="text-xs text-muted-foreground flex flex-nowrap">
                    <span>{pagination.limit * (pagination.page - 1) + 1}</span>{" "}
                    -{" "}
                    <span>
                      {pagination.limit * (pagination.page - 1) +
                        (pagination.pageCount || 0)}
                    </span>
                    <span className="ml-1 hidden sm:block">
                      de {pagination.total}
                    </span>
                    <Loader
                      className={`ml-2 w-4 h-full animate-spin transition-all opacity-0 ${
                        isLoading && "opacity-100"
                      }`}
                    />
                  </div>

                  <div className="flex items-center justify-center space-x-1 sm:space-x-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="hover:cursor-pointer"
                      onClick={() =>
                        handleGetCustomers(1, pagination.limit, search)
                      }
                      disabled={pagination.page === 1}
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="hover:cursor-pointer"
                      onClick={() =>
                        handleGetCustomers(
                          pagination.page - 1,
                          pagination.limit,
                          search
                        )
                      }
                      disabled={pagination.page === 1}
                    >
                      <ChevronLeftIcon className="h-4 w-4" />
                    </Button>
                    <span className="text-xs font-medium text-nowrap">
                      Pg. {pagination.page} de {pagination.totalPages || 1}
                    </span>

                    <Button
                      className="hover:cursor-pointer"
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        handleGetCustomers(
                          pagination.page + 1,
                          pagination.limit,
                          search
                        )
                      }
                      disabled={
                        pagination.page === pagination.totalPages ||
                        pagination.totalPages === 0
                      }
                    >
                      <ChevronRightIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      className="hover:cursor-pointer"
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        handleGetCustomers(
                          pagination.totalPages,
                          pagination.limit,
                          search
                        )
                      }
                      disabled={
                        pagination.page === pagination.totalPages ||
                        pagination.totalPages === 0
                      }
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="">
                    <Select>
                      <SelectTrigger className="hover:cursor-pointer ml-2">
                        <SelectValue
                          placeholder={pagination.limit}
                        ></SelectValue>
                      </SelectTrigger>
                      <SelectContent className="">
                        <SelectItem className="hover:cursor-pointer" value="20">
                          {pagination.limit}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
