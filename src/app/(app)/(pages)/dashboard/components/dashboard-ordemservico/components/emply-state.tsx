"use client";

export default function EmptyState() {
  return (
    <div
      role="status"
      className="flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-lg border p-6 text-center text-sm text-muted-foreground"
    >
      Nenhuma OS encontrada ainda. Crie ordens para ver os gráficos aqui.
    </div>
  );
}
