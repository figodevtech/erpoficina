import * as React from "react";
import clsx from "clsx";

type Props = {
  rotulo: string;
  valor: string;
  valorNumero?: number;
  Icone?: React.ComponentType<{ className?: string }>;
  destaque?: "positivo" | "negativo";
};

export function KpiFinanceiro({ rotulo, valor, valorNumero, Icone, destaque }: Props) {
  const abs = Math.abs(Number(valorNumero ?? 0));
  const temValor = abs > 0;

  const corBarra = !temValor
    ? "bg-transparent"
    : destaque === "positivo"
    ? "bg-emerald-500/80"
    : destaque === "negativo"
    ? "bg-red-500/80"
    : "bg-muted";

  return (
    <div className="rounded-lg border p-2.5 sm:rounded-xl sm:p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground sm:text-sm">{rotulo}</p>
        {Icone ? <Icone className="h-3.5 w-3.5 text-muted-foreground sm:h-4 sm:w-4" /> : null}
      </div>

      <div className="mt-1 text-lg font-semibold tracking-tight sm:text-xl md:text-2xl">{valor}</div>

      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
        <div
          className={clsx("h-full rounded-full transition-all", corBarra)}
          style={{ width: temValor ? "66%" : "0%" }}
        />
      </div>
    </div>
  );
}
