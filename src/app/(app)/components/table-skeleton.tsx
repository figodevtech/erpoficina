"use client";

import { TableRow, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

type ColumnSpec =
  | { cellClass?: string; barClass?: string }
  | [cellClass?: string, barClass?: string];

export default function TableSkeleton({
  rows = 8,
  columns,
}: {
  rows?: number;
  columns: ColumnSpec[];
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={`sk-${i}`}>
          {columns.map((col, idx) => {
            const cellClass = Array.isArray(col) ? col[0] : col.cellClass;
            const barClass = Array.isArray(col) ? col[1] : col.barClass;
            return (
              <TableCell key={`skc-${i}-${idx}`} className={cellClass}>
                <Skeleton className={barClass ?? "h-4 w-24"} />
              </TableCell>
            );
          })}
        </TableRow>
      ))}
    </>
  );
}
