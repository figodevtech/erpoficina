"use client";

import type {
  UseFormGetValues,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import type { FormValues } from "../types";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

function parseCSV(value: string): string[] {
  return (value || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
function toCSV(arr?: string[]) {
  return Array.isArray(arr) ? arr.join(", ") : "";
}

export function PagamentosTab({
  register,
  setValue,
  watch,
  getValues,
}: {
  register: UseFormRegister<FormValues>;
  setValue: UseFormSetValue<FormValues>;
  watch: UseFormWatch<FormValues>;
  getValues: UseFormGetValues<FormValues>;
}) {
  const cartaoOn = !!watch("pagamentos.cartao.habilitado");
  const pixOn = !!watch("pagamentos.pix.habilitado");
  const dinOn = !!watch("pagamentos.dinheiro.habilitado");

  return (
    <Card className="border-border bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <CardContent className="p-5 sm:p-6 space-y-8">
        {/* CARTÃO */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Cartão (crédito/débito)</h3>
              <p className="text-sm text-muted-foreground">Integração com adquirente (ex.: Stone).</p>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm">Habilitar</Label>
              <Switch
                checked={cartaoOn}
                onCheckedChange={(v) => setValue("pagamentos.cartao.habilitado", v)}
              />
            </div>
          </div>

          <div className={cn("grid grid-cols-1 sm:grid-cols-3 gap-4", !cartaoOn && "opacity-60 pointer-events-none")}>
            <div>
              <Label className="mb-2 block">Provider</Label>
              <Select
                value={watch("pagamentos.cartao.provider")}
                onValueChange={(v: any) => setValue("pagamentos.cartao.provider", v)}
              >
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="stone">Stone</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2 block">Merchant ID</Label>
              <Input {...register("pagamentos.cartao.merchantId")} placeholder="MID da loja" />
            </div>

            <div>
              <Label className="mb-2 block">API Key</Label>
              <Input {...register("pagamentos.cartao.apiKey")} placeholder="Chave de API" />
            </div>

            <div>
              <Label className="mb-2 block">Captura automática</Label>
              <div className="flex h-10 items-center rounded-md border px-3">
                <Switch
                  checked={!!watch("pagamentos.cartao.capturaAutomatica")}
                  onCheckedChange={(v) => setValue("pagamentos.cartao.capturaAutomatica", v)}
                />
                <span className="ml-2 text-sm text-muted-foreground">Capturar sem etapa manual</span>
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Parcelas máx.</Label>
              <Input
                type="number"
                min={1}
                {...register("pagamentos.cartao.parcelasMax", {
                  valueAsNumber: true,
                  onChange: (e) => setValue("pagamentos.cartao.parcelasMax", Number(e.target.value || 1)),
                })}
              />
            </div>

            <div>
              <Label className="mb-2 block">Webhooks (cartão)</Label>
              <Input {...register("pagamentos.cartao.webhookUrl")} placeholder="URL para eventos de cartão" />
            </div>

            <div className="sm:col-span-3">
              <Label className="mb-2 block">Terminal IDs (separados por vírgula)</Label>
              <Input
                placeholder="ex.: TID001, TID002"
                defaultValue={toCSV(getValues("pagamentos.cartao.terminalIds"))}
                onBlur={(e) => setValue("pagamentos.cartao.terminalIds", parseCSV(e.target.value))}
              />
            </div>
          </div>
        </section>

        {/* PIX */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Pix</h3>
              <p className="text-sm text-muted-foreground">Cobranças via Pix (PSP da Stone ou banco).</p>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm">Habilitar</Label>
              <Switch
                checked={pixOn}
                onCheckedChange={(v) => setValue("pagamentos.pix.habilitado", v)}
              />
            </div>
          </div>

          <div className={cn("grid grid-cols-1 sm:grid-cols-3 gap-4", !pixOn && "opacity-60 pointer-events-none")}>
            <div>
              <Label className="mb-2 block">Provider</Label>
              <Select
                value={watch("pagamentos.pix.provider")}
                onValueChange={(v: any) => setValue("pagamentos.pix.provider", v)}
              >
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="stone">Stone</SelectItem>
                  <SelectItem value="banco">Banco</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2 block">Chave Pix</Label>
              <Input {...register("pagamentos.pix.chave")} placeholder="CPF/CNPJ/E-mail/Chave aleatória" />
            </div>

            <div>
              <Label className="mb-2 block">Expiração (segundos)</Label>
              <Input
                type="number"
                min={60}
                {...register("pagamentos.pix.expiracaoSegundos", {
                  valueAsNumber: true,
                  onChange: (e) => setValue("pagamentos.pix.expiracaoSegundos", Number(e.target.value || 1800)),
                })}
              />
            </div>

            <div>
              <Label className="mb-2 block">Client ID</Label>
              <Input {...register("pagamentos.pix.clientId")} placeholder="(opcional)" />
            </div>

            <div>
              <Label className="mb-2 block">Client Secret</Label>
              <Input {...register("pagamentos.pix.clientSecret")} placeholder="(opcional)" />
            </div>

            <div>
              <Label className="mb-2 block">Webhooks (Pix)</Label>
              <Input {...register("pagamentos.pix.webhookUrl")} placeholder="URL para eventos de Pix" />
            </div>
          </div>
        </section>

        {/* DINHEIRO */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Dinheiro</h3>
              <p className="text-sm text-muted-foreground">Recebimentos em espécie no caixa.</p>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm">Habilitar</Label>
              <Switch
                checked={dinOn}
                onCheckedChange={(v) => setValue("pagamentos.dinheiro.habilitado", v)}
              />
            </div>
          </div>
        </section>

        <div className="flex items-start gap-2 rounded-lg border p-3 text-sm">
          <Info className="h-4 w-4 mt-0.5 text-primary" />
          Para cartão/Pix, garanta que o <span className="font-medium">webhook</span> esteja público e configurado no provedor,
          para receber confirmações de pagamento.
        </div>
      </CardContent>
    </Card>
  );
}
