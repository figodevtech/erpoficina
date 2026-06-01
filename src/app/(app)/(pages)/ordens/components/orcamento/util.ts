export function dinheiro(n: number | string | null | undefined) {
  const v = typeof n === "number" ? n : Number(n ?? 0);
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export const paraNumero = (v: any) =>
  v === null || v === undefined || Number.isNaN(+v) ? 0 : +v;

export type TipoDesconto = "FIXO" | "PORCENTAGEM" | null | undefined;

export function arredondarMoeda(valor: number) {
  return Math.round((Number.isFinite(valor) ? valor : 0) * 100) / 100;
}

export function calcularDescontoAplicado(base: number, tipo: TipoDesconto, desconto: number | null | undefined) {
  const baseSeguro = Math.max(0, paraNumero(base));
  const valor = Math.max(0, paraNumero(desconto));

  if (!tipo || valor <= 0 || baseSeguro <= 0) return 0;
  if (tipo === "PORCENTAGEM") return arredondarMoeda(baseSeguro * (Math.min(valor, 100) / 100));
  return arredondarMoeda(Math.min(valor, baseSeguro));
}

export function calcularTotalComDesconto(base: number, tipo: TipoDesconto, desconto: number | null | undefined) {
  return arredondarMoeda(Math.max(0, paraNumero(base) - calcularDescontoAplicado(base, tipo, desconto)));
}
