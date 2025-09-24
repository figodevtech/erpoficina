"use client";

import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export function OrdensHeader({ onNovaOS }: { onNovaOS: () => void }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
      <div>
        <h1 className="text-2xl font-bold">Ordens de Serviço</h1>
        <p className="text-muted-foreground">Crie, acompanhe e finalize OS</p>
      </div>
      <Button onClick={onNovaOS} className="self-start sm:self-auto">
        <PlusCircle className="h-4 w-4 mr-2" />
        Nova OS
      </Button>
    </div>
  );
}
