import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronLeftIcon, ChevronRightIcon, ChevronsLeft, ChevronsRight } from "lucide-react";

export default function FinancialTable() {
    return (
        <Card className="px-2">
            <CardHeader>
                <CardTitle className="text-lg font-medium">Tabela Financeira</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex flex-col justify-between min-h-[300px]">
                <Table className=" text-xs">
                    <TableHeader>
                        <TableRow className="font-bold">
                            <TableCell className="">Data</TableCell>
                            <TableCell>Descrição</TableCell>
                            <TableCell className="text-right">Valor</TableCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow className="">
                            <TableCell>
                                01/06/2024</TableCell>
                            <TableCell>Venda de Produto A</TableCell>
                            <TableCell className="text-right cursor-pointer" >R$ 5.000,00</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>01/06/2024</TableCell>
                            <TableCell>Compra de Produto A</TableCell>
                            <TableCell className="text-right cursor-pointer">R$ 3.000,00</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
                <div className="flex items-center mt-4 justify-between">
          <div className="text-xs text-muted-foreground mr-2 flex flex-nowrap">
            {/* <span>{pagination.limit * (pagination.page - 1) + 1}</span> -{" "} */}
            {/* <span>
              {pagination.limit * (pagination.page - 1) +
                (pagination.pageCount || 0)}
            </span> */}
          </div>
          <div className="flex items-center justify-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              className="hover:cursor-pointer"
            //   onClick={() =>
            //     handleGetProducts(1, pagination.limit, search, status)
            //   }
            //   disabled={pagination.page === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="hover:cursor-pointer"
            //   onClick={() =>
            //     handleGetProducts(pagination.page - 1, pagination.limit, search)
            //   }
            //   disabled={pagination.page === 1}
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <span className="text-xs font-medium text-nowrap">
              {/* Página {pagination.page} de {pagination.totalPages || 1} */}
            </span>
            <Button
              className="hover:cursor-pointer"
              variant="outline"
              size="icon"
            //   onClick={() =>
            //     handleGetProducts(
            //       pagination.page + 1,
            //       pagination.limit,
            //       search,
            //       status
            //     )
            //   }
            //   disabled={
            //     pagination.page === pagination.totalPages ||
            //     pagination.totalPages === 0
            //   }
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
            <Button
              className="hover:cursor-pointer"
              variant="outline"
              size="icon"
            //   onClick={() =>
            //     handleGetProducts(
            //       pagination.totalPages,
            //       pagination.limit,
            //       search,
            //       status
            //     )
            //   }
            //   disabled={
            //     pagination.page === pagination.totalPages ||
            //     pagination.totalPages === 0
            //   }
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
          <div>
            <Select>
              <SelectTrigger className="hover:cursor-pointer ml-2">
                {/* <SelectValue placeholder={pagination.limit}></SelectValue> */}
              </SelectTrigger>
              <SelectContent className="">
                <SelectItem className="hover:cursor-pointer" value="20">
                  {/* {pagination.limit} */}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
            </CardContent>
        </Card>
    )
}