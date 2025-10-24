"use client";

import type { UseFormRegister, UseFormSetValue } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Info } from "lucide-react";

type NFSecfg = {
  provedor: string;
  inscricaoMunicipal?: string;
  serieRPS?: string;
  usuario?: string;
  senha?: string;
  token?: string;
  certificadoA1Base64?: string;
  senhaCertificado?: string;
};

type FormValues = {
  empresa: any;
  nfe: any;
  nfse: NFSecfg;
  pagamentos: any;
};

export function NFSeTab({
  register,
  setValue,
}: {
  register: UseFormRegister<FormValues>;
  setValue: UseFormSetValue<FormValues>;
}) {
  return (
    <Card className="border-border bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <CardContent className="p-5 sm:p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label className="mb-2 block">Provedor NFS-e</Label>
            <Input {...register("nfse.provedor")} placeholder="Ex.: Betha, Nota JP, Ginfes, etc." />
          </div>
          <div>
            <Label className="mb-2 block">Inscrição Municipal</Label>
            <Input {...register("nfse.inscricaoMunicipal")} placeholder="Apenas números" inputMode="numeric" />
          </div>
          <div>
            <Label className="mb-2 block">Série RPS</Label>
            <Input {...register("nfse.serieRPS")} placeholder="Ex.: 1" />
          </div>

          <div>
            <Label className="mb-2 block">Usuário</Label>
            <Input {...register("nfse.usuario")} />
          </div>
          <div>
            <Label className="mb-2 block">Senha</Label>
            <Input {...register("nfse.senha")} type="password" />
          </div>
          <div>
            <Label className="mb-2 block">Token</Label>
            <Input {...register("nfse.token")} />
          </div>

          <div className="sm:col-span-2">
            <Label className="mb-2 block">Certificado A1 (Base64)</Label>
            <Textarea
              {...register("nfse.certificadoA1Base64")}
              rows={4}
              placeholder="Cole aqui o conteúdo do certificado A1 convertido para Base64"
            />
          </div>
          <div>
            <Label className="mb-2 block">Senha do certificado</Label>
            <Input {...register("nfse.senhaCertificado")} type="password" />
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-lg border p-3 text-sm">
          <Info className="h-4 w-4 mt-0.5 text-primary" />
          Para João Pessoa/PB, confira no portal qual provedor está ativo e quais credenciais são exigidas.
        </div>
      </CardContent>
    </Card>
  );
}
