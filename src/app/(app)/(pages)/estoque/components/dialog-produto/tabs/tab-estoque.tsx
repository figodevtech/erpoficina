"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { TabsContent } from "@/components/ui/tabs";
import { Produto } from "../../../types";
import { onlyDigits } from "../lib/utils";

type Props = {
  mode: "create" | "edit";
  produto: Produto;
  onChange: (field: keyof Produto, value: any) => void;
};

export function TabEstoque({ mode, produto, onChange }: Props) {
  return (
    <TabsContent value="Estoque" className="h-full min-h-0 overflow-auto dark:bg-muted-foreground/5 px-6 py-10 space-y-2">
      <div className="h-full min-h-0 overflow-auto rounded-md px-4 py-8 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="estoque">{mode === "edit" ? "Estoque (Qtd) *" : "Estoque Inicial (Qtd) *"}</Label>
            <Input
              disabled={mode === "edit"}
              id="estoque"
              value={(produto as any).estoque || ""}
              onChange={(e) => onChange("estoque" as any, onlyDigits(e.target.value))}
              placeholder="0"
              inputMode="numeric"
              maxLength={9}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="estoqueminimo">Estoque Mínimo *</Label>
            <Input
              id="estoqueminimo"
              value={(produto as any).estoqueminimo || ""}
              onChange={(e) => onChange("estoqueminimo" as any, onlyDigits(e.target.value))}
              placeholder="0"
              inputMode="numeric"
              maxLength={9}
            />
          </div>
        </div>

        <Separator />

        <div className="text-xs text-muted-foreground">
          <span>Regra de estoque:</span>
          <ul className="mt-2 list-disc list-inside">
            <li>
              <strong>OK:</strong> Estoque acima do estoque mínimo.
            </li>
            <li>
              <strong>BAIXO:</strong> Estoque igual ou abaixo do estoque mínimo.
            </li>
            <li>
              <strong>CRÍTICO:</strong> Estoque atingiu a metade do estoque mínimo.
            </li>
            <li>
              <strong>SEM ESTOQUE:</strong> Estoque indisponível.
            </li>
          </ul>
        </div>
      </div>
    </TabsContent>
  );
}
