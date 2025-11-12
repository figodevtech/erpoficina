"use client";

import type { UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Info } from "lucide-react";

type NFeCfg = {
  serieNFe: string;
  serieNFCe?: string;
  cscHomologacao?: string;
  cscProducao?: string;
  idCSC?: string;
  naturezaOperacao: string;
};

type FormValues = {
  empresa: any;
  nfe: NFeCfg;
  nfse: any;
  pagamentos: any;
};

export function NFeTab({
  register,
}: {
  register: UseFormRegister<FormValues>;
  setValue: UseFormSetValue<FormValues>;
  watch?: UseFormWatch<FormValues>;
}) {
  return (
    <Card className="border-border bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <CardContent className="p-5 sm:p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label className="mb-2 block">Série NF-e</Label>
            <Input {...register("nfe.serieNFe")} placeholder="Ex.: 1" inputMode="numeric" />
          </div>
          <div>
            <Label className="mb-2 block">Série NFC-e</Label>
            <Input {...register("nfe.serieNFCe")} placeholder="Ex.: 1" inputMode="numeric" />
          </div>
          <div>
            <Label className="mb-2 block">ID do CSC</Label>
            <Input {...register("nfe.idCSC")} placeholder="ID do CSC" />
          </div>

          <div className="sm:col-span-3">
            <Label className="mb-2 block">Natureza da operação (NF-e)</Label>
            <Input {...register("nfe.naturezaOperacao")} placeholder="Ex.: Venda de mercadoria" />
          </div>

          <div>
            <Label className="mb-2 block">CSC (Homologação)</Label>
            <Input {...register("nfe.cscHomologacao")} placeholder="Código de Segurança do Contribuinte (HOMOLOGAÇÃO)" />
          </div>
          <div>
            <Label className="mb-2 block">CSC (Produção)</Label>
            <Input {...register("nfe.cscProducao")} placeholder="Código de Segurança do Contribuinte (PRODUÇÃO)" />
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-lg border p-3 text-sm">
          <Info className="h-4 w-4 mt-0.5 text-primary" />
          As séries e a natureza de operação são usadas na emissão de NF-e/NFC-e. Os CSCs ficam guardados em
          <span className="mx-1 font-semibold">empresa.cschomologacao</span> e <span className="mx-1 font-semibold">empresa.cscproducao</span>.
        </div>
      </CardContent>
    </Card>
  );
}
