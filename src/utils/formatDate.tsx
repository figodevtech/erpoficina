export function formatDate(input: string | Date | null | undefined): string {
  if (!input) return "";

  // pegue uma ISO segura
  let iso: string;
  if (input instanceof Date) {
    iso = input.toISOString(); // já é UTC
  } else {
    // string do banco pode vir como "YYYY-MM-DD HH:mm:ss.SSS" (sem Z)
    const s = input.trim();

    // regex casa strings sem fuso, ex: 2025-10-07 00:46:06.576
    const noTz = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(\.\d+)?$/.test(s);

    if (noTz) {
      // assume que é UTC, insere 'T' e 'Z'
      iso = s.replace(" ", "T") + "Z";
    } else {
      // já tem Z/offset ou é ISO válida
      iso = s;
    }
  }

  const dt = new Date(iso);

  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Fortaleza",
    dateStyle: "short",
    timeStyle: "short",
  }).format(dt);
}
