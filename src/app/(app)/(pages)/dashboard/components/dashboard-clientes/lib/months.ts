export function listarMesesEntre(inicio: Date, fim: Date) {
  const start = new Date(inicio.getFullYear(), inicio.getMonth(), 1);
  const end = new Date(fim.getFullYear(), fim.getMonth(), 1);

  const meses: string[] = [];
  for (let d = new Date(start); d <= end; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) {
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    meses.push(ym);
  }
  return meses;
}
