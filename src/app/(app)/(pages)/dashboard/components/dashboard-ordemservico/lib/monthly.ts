export const STATIC_ZERO_MONTHS = Array.from({ length: 12 }, (_, i) => {
  const month = String(i + 1).padStart(2, "0");
  return `0000-${month}`;
});

export function makeZeroedMonthlyFrom(date: Date, n = 12) {
  const months: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    months.push(ym);
  }
  return months;
}

export const MONTH_ABBR = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export function formatMonthLabel(ym: string) {
  const [yStr, mStr] = ym.split("-");
  const m = Number(mStr);
  if (Number.isFinite(m) && m >= 1 && m <= 12) {
    const monthLabel = MONTH_ABBR[m - 1];
    const shortYear = yStr && /^\d{4}$/.test(yStr) ? yStr.slice(2) : "";
    return shortYear ? `${monthLabel} ${shortYear}` : monthLabel;
  }
  return ym;
}
