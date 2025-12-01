"use client";

import { useState, useEffect, type ChangeEvent } from "react";
import { Input } from "@/components/ui/input";

interface ValueInputProps {
  setPrice: (value: number) => void;
  price?: number ;
}

export default function ValueInput({ setPrice, price }: ValueInputProps) {
  // Apenas dígitos (centavos)
  const [digits, setDigits] = useState<string>("");

  // Formata BRL a partir dos dígitos
  const formatBRL = (d: string) => {
    const n = d ? parseInt(d, 10) / 100 : 0;
    return n.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Pai -> Filho (quando price muda externamente)
  useEffect(() => {
    const target = Math.round((price ?? 0) * 100); // centavos
    const current = digits ? parseInt(digits, 10) : 0;
    if (current !== target) {
      setDigits(String(target));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [price]);

  // Change: atualiza dígitos e, se necessário, notifica o pai
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const onlyDigits = e.target.value.replace(/\D/g, "");
    setDigits(onlyDigits);

    const next = onlyDigits ? parseInt(onlyDigits, 10) / 100 : 0;
    if (next !== price) {
      setPrice(next); // guard evita loop
    }
  };


  return (
    <Input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      value={formatBRL(digits)}
      onChange={handleChange}
      // onKeyDown={handleKeyDown}
      className="not-dark:bg-white"
      placeholder="R$ 0,00"
      maxLength={15} // R$ 999.999.999,99
    />
  );
}
