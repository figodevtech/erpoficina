import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface CarregamentoProps {
  className?: string;
  message?: string;
}

export function Carregamento({ className, message = "Carregando..." }: CarregamentoProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center min-h-screen",
        className
      )}
    >
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}