export function formatNumber(n: number) {
  return new Intl.NumberFormat("pt-BR").format(n || 0);
}

export function formatCurrencyBRL(v: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(v || 0);
}

export function formatDurationHours(h: number) {
  if (!h || h <= 0) return "—";
  const hours = Math.floor(h);
  const minutes = Math.round((h - hours) * 60);
  if (hours < 24) return `${hours}h ${minutes}m`;
  const days = Math.floor(hours / 24);
  const remH = hours % 24;
  return `${days}d ${remH}h`;
}
