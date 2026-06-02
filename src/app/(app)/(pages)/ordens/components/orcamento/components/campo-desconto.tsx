"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { TipoDesconto } from "../tipos";

type CampoDescontoProps = {
  tipo?: TipoDesconto | null;
  valor?: number | null;
  onTipoChange: (tipo: TipoDesconto | null) => void;
  onValorChange: (valor: number) => void;
  className?: string;
  selectClassName?: string;
  inputClassName?: string;
};

export function CampoDesconto({
  tipo,
  valor,
  onTipoChange,
  onValorChange,
  className,
  selectClassName,
  inputClassName,
}: CampoDescontoProps) {
  const temDesconto = Boolean(tipo);
  const valorInput = temDesconto && Number(valor ?? 0) > 0 ? String(valor) : "";
  const isPorcentagem = tipo === "PORCENTAGEM";

  return (
    <div className={className ?? "grid grid-cols-[112px_112px] gap-2"}>
      <Select
        value={tipo ?? "NONE"}
        onValueChange={(value) => {
          const next = value === "NONE" ? null : (value as TipoDesconto);
          onTipoChange(next);
          if (!next) onValorChange(0);
        }}
      >
        <SelectTrigger className={selectClassName ?? "h-8"}>
          <SelectValue placeholder="Sem desconto" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="NONE">Sem</SelectItem>
          <SelectItem value="FIXO">Fixo</SelectItem>
          <SelectItem value="PORCENTAGEM">%</SelectItem>
        </SelectContent>
      </Select>

      <div className="relative">
        {temDesconto && !isPorcentagem ? (
          <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            R$
          </span>
        ) : null}
        <Input
          type="number"
          min={0}
          max={isPorcentagem ? 100 : undefined}
          step="0.01"
          inputMode="decimal"
          disabled={!temDesconto}
          value={valorInput}
          placeholder={temDesconto ? "0" : "-"}
          onChange={(event) => {
            const raw = event.target.value.trim().replace(",", ".");
            onValorChange(raw ? Number(raw) : 0);
          }}
          className={[
            inputClassName ?? "h-8",
            temDesconto && !isPorcentagem ? "pl-8" : "",
            isPorcentagem ? "pr-7" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        />
        {isPorcentagem ? (
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            %
          </span>
        ) : null}
      </div>
    </div>
  );
}
