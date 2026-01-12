"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";

type Props = {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  disabled?: boolean;
};

export function CampoPreco({ value, onChange, min = 0, disabled }: Props) {
  const [raw, setRaw] = React.useState<string>(Number.isFinite(value) ? value.toFixed(2) : "0.00");

  React.useEffect(() => {
    setRaw(Number.isFinite(value) ? value.toFixed(2) : "0.00");
  }, [value]);

  const commit = React.useCallback(() => {
    const normalized = raw.replace(",", ".");
    const n = Number(normalized);

    if (!Number.isFinite(n)) {
      setRaw(Number.isFinite(value) ? value.toFixed(2) : "0.00");
      return;
    }

    const clamped = Math.max(min, n);
    onChange(clamped);
    setRaw(clamped.toFixed(2));
  }, [raw, min, onChange, value]);

  return (
    <div className="relative inline-flex w-[120px]">
      <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
        R$
      </span>

      <Input
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
        }}
        inputMode="decimal"
        className="h-8 pl-8 pr-2 text-right tabular-nums"
        disabled={disabled}
      />
    </div>
  );
}
