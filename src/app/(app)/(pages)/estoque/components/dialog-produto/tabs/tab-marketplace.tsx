"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Produto } from "../../../types";

type Props = {
  produto: Produto;
  onChange: (field: keyof Produto, value: any) => void;
};

export function TabMarketplace({ produto, onChange }: Props) {
  const LIMITE_TITULO = 100;
  const LIMITE_DESCRICAO = 300;

  const tituloQtd = (produto.tituloMarketplace || "").length;
  const descricaoQtd = (produto.descricaoMarketplace || "").length;
  return (
    <TabsContent value="MarketPlace" className="h-full min-h-0 overflow-auto dark:bg-muted-foreground/5 px-2 py-3 md:px-6 md:py-10 space-y-2">
      <div className="h-full min-h-0 overflow-auto rounded-md px-4 py-8 space-y-4">
        <div className="flex flex-row gap-2">
          <Label htmlFor="exibirPdv">Exibir no Marketplace:</Label>
          <Switch checked={!!(produto as any).exibirPdv} onCheckedChange={(v) => onChange("exibirPdv" as any, v)} />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="tituloMarketplace">Título no Marketplace *</Label>
            <span
              className={`text-xs ${tituloQtd >= LIMITE_TITULO ? "text-destructive" : "text-muted-foreground"}`}
            >
              {tituloQtd}/{LIMITE_TITULO}
            </span>
          </div>
          <Input
            id="tituloMarketplace"
            value={(produto as any).tituloMarketplace || ""}
            onChange={(e) => onChange("tituloMarketplace" as any, e.target.value)}
            placeholder="Nome comercial / Site"
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="descricaoMarketplace">Descrição no Marketplace</Label>
            <span
              className={`text-xs ${descricaoQtd >= LIMITE_DESCRICAO ? "text-destructive" : "text-muted-foreground"}`}
            >
              {descricaoQtd}/{LIMITE_DESCRICAO}
            </span>
          </div>
          <Textarea
            id="descricaoMarketplace"
            value={(produto as any).descricaoMarketplace || ""}
            onChange={(e) => onChange("descricaoMarketplace" as any, e.target.value)}
            placeholder="Descrição do produto"
          />
        </div>
      </div>
    </TabsContent>
  );
}
