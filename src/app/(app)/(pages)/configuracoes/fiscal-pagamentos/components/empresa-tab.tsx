"use client";

import type { UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Info } from "lucide-react";

type Empresa = {
  empresaId: number;
  cnpj: string;
  razaosocial: string;
  nomefantasia?: string;
  inscricaoestadual?: string;
  inscricaomunicipal?: string;
  endereco: string;
  codigomunicipio: string;
  regimetributario: "SIMPLES_NACIONAL" | "LUCRO_PRESUMIDO" | "LUCRO_REAL";
  ambiente: "HOMOLOGACAO" | "PRODUCAO";
};

type FormValues = {
  empresa: Empresa;
  nfe: any;
  nfse: any;
  pagamentos: any;
};

type Props = {
  register: UseFormRegister<FormValues>;
  setValue: UseFormSetValue<FormValues>;
  watch: UseFormWatch<FormValues>;
};

export function EmpresaTab({ register, setValue, watch }: Props) {
  // Controla os selects com RHF (garante refletir o que veio do backend)
  const regTrib = watch("empresa.regimetributario") || "SIMPLES_NACIONAL";
  const ambiente = watch("empresa.ambiente") || "HOMOLOGACAO";

  return (
    <Card className="border-border bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <CardContent className="p-5 sm:p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-1">
            <Label className="mb-2 block">CNPJ</Label>
            <Input {...register("empresa.cnpj")} placeholder="Apenas números" inputMode="numeric" />
            <p className="text-[11px] text-muted-foreground mt-1">Somente dígitos</p>
          </div>
          <div className="sm:col-span-2">
            <Label className="mb-2 block">Razão social</Label>
            <Input {...register("empresa.razaosocial")} />
          </div>

          <div>
            <Label className="mb-2 block">Nome fantasia</Label>
            <Input {...register("empresa.nomefantasia")} />
          </div>
          <div>
            <Label className="mb-2 block">Inscrição Estadual</Label>
            <Input {...register("empresa.inscricaoestadual")} placeholder="Apenas números" />
          </div>
          <div>
            <Label className="mb-2 block">Inscrição Municipal</Label>
            <Input {...register("empresa.inscricaomunicipal")} placeholder="Apenas números" />
          </div>

          <div>
            <Label className="mb-2 block">Regime tributário</Label>
            <Select
              value={regTrib}
              onValueChange={(v: any) => setValue("empresa.regimetributario", v, { shouldDirty: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SIMPLES_NACIONAL">Simples Nacional</SelectItem>
                <SelectItem value="LUCRO_PRESUMIDO">Lucro Presumido</SelectItem>
                <SelectItem value="LUCRO_REAL">Lucro Real</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="sm:col-span-2">
            <Label className="mb-2 block">Endereço</Label>
            <Textarea {...register("empresa.endereco")} rows={2} />
          </div>

          <div>
            <Label className="mb-2 block">Código do Município (IBGE)</Label>
            <Input {...register("empresa.codigomunicipio")} placeholder="7 dígitos" inputMode="numeric" />
            <p className="text-[11px] text-muted-foreground mt-1">Ex.: João Pessoa/PB — 2507507</p>
          </div>

          <div>
            <Label className="mb-2 block">Ambiente</Label>
            <Select
              value={ambiente}
              onValueChange={(v: any) => setValue("empresa.ambiente", v, { shouldDirty: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HOMOLOGACAO">Homologação</SelectItem>
                <SelectItem value="PRODUCAO">Produção</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-lg border p-3 text-sm">
          <Info className="h-4 w-4 mt-0.5 text-primary" />
          Para emissão em João Pessoa/PB, confirme no portal municipal qual é o provedor de NFS-e e as credenciais
          exigidas (usuário/senha, token e/ou certificado A1).
        </div>
      </CardContent>
    </Card>
  );
}
