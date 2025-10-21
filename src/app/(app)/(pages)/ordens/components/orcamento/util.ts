export function dinheiro(n: number | string | null | undefined) {
  const v = typeof n === "number" ? n : Number(n ?? 0);
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export const paraNumero = (v: any) =>
  v === null || v === undefined || Number.isNaN(+v) ? 0 : +v;
