"use client";

import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function CartaoFeedback({
  variante,
  titulo,
  descricao,
}: {
  variante: "sucesso" | "aviso" | "erro";
  titulo: string;
  descricao?: string;
}) {
  const Icon =
    variante === "sucesso" ? CheckCircle2 : variante === "aviso" ? AlertTriangle : XCircle;

  const tone =
    variante === "sucesso"
      ? "text-emerald-500"
      : variante === "aviso"
      ? "text-amber-500"
      : "text-red-500";

  return (
    <Card className="max-w-md w-full border-border bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60 shadow-sm">
      <CardContent className="p-6 text-center space-y-3">
        <Icon className={cn("h-8 w-8 mx-auto", tone)} />
        <h2 className="text-lg font-semibold">{titulo}</h2>
        {descricao && <p className="text-sm text-muted-foreground">{descricao}</p>}
      </CardContent>
    </Card>
  );
}
