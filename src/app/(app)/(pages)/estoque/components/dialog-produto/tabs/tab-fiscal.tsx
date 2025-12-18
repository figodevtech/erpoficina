"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TabsContent } from "@/components/ui/tabs";
import { Produto } from "../../../types";
import { onlyDigits } from "../lib/utils";
import { CSOSN_OPTIONS, CST_OPTIONS, CST_PIS_OPTIONS } from "../lib/options-fiscais";

type Props = {
  produto: Produto;
  onChange: (field: keyof Produto, value: any) => void;
};

export function TabFiscal({ produto, onChange }: Props) {
  return (
    <TabsContent value="Fiscal" className="h-full min-h-0 overflow-auto dark:bg-muted-foreground/5 px-6 py-10 space-y-2">
      <div className="h-full min-h-0 overflow-auto rounded-md px-4 py-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ncm">NCM</Label>
            <Input
              id="ncm"
              value={(produto as any).ncm || ""}
              onChange={(e) => onChange("ncm" as any, onlyDigits(e.target.value))}
              placeholder="00000000"
              inputMode="numeric"
              maxLength={8}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cfop">CFOP</Label>
            <Input
              id="cfop"
              value={(produto as any).cfop || ""}
              onChange={(e) => onChange("cfop" as any, onlyDigits(e.target.value))}
              placeholder="5102"
              inputMode="numeric"
              maxLength={4}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="csosn">CSOSN</Label>
            <Select value={(produto as any).csosn || "Selecione"} onValueChange={(v) => onChange("csosn" as any, v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem className="hover:cursor-pointer" value="Selecione">
                  Selecione
                </SelectItem>
                {CSOSN_OPTIONS.map((c) => (
                  <SelectItem className="hover:cursor-pointer" key={c.cod} value={c.cod}>
                    {c.cod} - {c.desc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="cst">CST</Label>
            <Select value={(produto as any).cst || "Selecione"} onValueChange={(v) => onChange("cst" as any, v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem className="hover:cursor-pointer" value="Selecione">
                  Selecione
                </SelectItem>
                {CST_OPTIONS.map((c) => (
                  <SelectItem className="hover:cursor-pointer" key={c.cod} value={c.cod}>
                    {c.cod} - {c.desc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cest">CEST</Label>
            <Input
              id="cest"
              value={(produto as any).cest || ""}
              onChange={(e) => onChange("cest" as any, onlyDigits(e.target.value))}
              placeholder="0000000"
              inputMode="numeric"
              maxLength={7}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="aliquotaicms">Alíquota ICMS (%)</Label>
            <Input
              id="aliquotaicms"
              value={(produto as any).aliquotaicms || ""}
              onChange={(e) => onChange("aliquotaicms" as any, e.target.value)}
              placeholder="18,00"
              inputMode="decimal"
              type="number"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cst_pis">CST PIS</Label>
            <Select
              value={(produto as any).cst_pis || "Selecione"}
              onValueChange={(v) => onChange("cst_pis" as any, v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem className="hover:cursor-pointer" value="Selecione">
                  Selecione
                </SelectItem>
                {CST_PIS_OPTIONS.map((c) => (
                  <SelectItem className="hover:cursor-pointer" key={c.cod} value={c.cod}>
                    {c.cod} - {c.desc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="aliquota_pis">Alíquota PIS (%)</Label>
            <Input
              id="aliquota_pis"
              value={(produto as any).aliquota_pis || ""}
              onChange={(e) => onChange("aliquota_pis" as any, e.target.value)}
              placeholder="1,65"
              inputMode="decimal"
              type="number"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cst_cofins">CST COFINS</Label>
            <Select
              value={(produto as any).cst_cofins || "Selecione"}
              onValueChange={(v) => onChange("cst_cofins" as any, v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem className="hover:cursor-pointer" value="Selecione">
                  Selecione
                </SelectItem>
                {CST_PIS_OPTIONS.map((c) => (
                  <SelectItem className="hover:cursor-pointer" key={c.cod} value={c.cod}>
                    {c.cod} - {c.desc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="aliquota_cofins">Alíquota COFINS (%)</Label>
            <Input
              id="aliquota_cofins"
              value={(produto as any).aliquota_cofins || ""}
              onChange={(e) => onChange("aliquota_cofins" as any, e.target.value)}
              placeholder="7,60"
              inputMode="decimal"
              type="number"
            />
          </div>
        </div>
      </div>
    </TabsContent>
  );
}
