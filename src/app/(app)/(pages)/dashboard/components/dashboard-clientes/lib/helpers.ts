export function percentualDe(valor: number, total: number) {
  return total ? Math.round((valor / total) * 100) : 0;
}

export function taxaCrescimento(atual: number, anterior: number) {
  if (!anterior && !atual) return 0;
  if (!anterior) return 100;
  return Math.round(((atual - anterior) / anterior) * 100);
}

export function formatarRotuloMes(ym: string) {
  const [yStr = "", mStr = ""] = ym.split("-");
  const ano = Number(yStr);
  const mes = Number(mStr);

  const indiceMes = Number.isFinite(mes) && mes >= 1 && mes <= 12 ? mes - 1 : 0;
  const anoValido = Number.isFinite(ano) ? ano : new Date().getFullYear();

  const d = new Date(anoValido, indiceMes, 1);
  return d.toLocaleDateString(undefined, { month: "short", year: "2-digit" });
}

export function topUfs(byUF: Record<string, number>, limite = 8) {
  return Object.entries(byUF)
    .map(([uf, count]) => ({ uf, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limite);
}
