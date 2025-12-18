"use client";

import * as React from "react";
import type { StatusCliente } from "../lib/types";
import { COR_STATUS } from "../lib/status";

export default function IndicadorResumo({
  label,
  valor,
  icone: Icone,
  corStatus,
}: {
  label: string;
  valor: number | string;
  icone?: React.ComponentType<{ className?: string }>;
  corStatus?: StatusCliente;
}) {
  return (
    <div className="rounded-lg border p-2 sm:rounded-xl sm:p-2.5 md:p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground sm:text-sm">{label}</p>
        {Icone ? <Icone className="h-3.5 w-3.5 text-muted-foreground sm:h-4 sm:w-4" /> : null}
      </div>
      <div className="mt-1 text-lg font-semibold tracking-tight sm:text-xl md:text-2xl">{valor}</div>
      {corStatus && <div className="mt-1.5 h-1 w-full rounded-full sm:mt-2 sm:h-1.5" style={{ background: COR_STATUS[corStatus] }} aria-hidden />}
    </div>
  );
}
